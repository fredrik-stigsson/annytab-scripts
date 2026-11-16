using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Media.Media3D;
using System.Xml.Linq;

// NuGet: SharpGLTF.Core, SixLabors.ImageSharp
using SharpGLTF.Schema2;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.PixelFormats;

public static class ModelToImageConverter
{
    /// <summary>
    /// Konverterar 3DXML, glTF eller GLB till PNG, JPG eller WebP.
    /// Isometrisk vy, vit bakgrund.
    /// </summary>
    public static void Convert(
        string inputPath,
        string outputPath,
        int width,
        int height,
        int quality = 90)
    {
        string ext = Path.GetExtension(inputPath).ToLowerInvariant();
        Model3DGroup model;

        switch (ext)
        {
            case ".3dxml":
                model = Load3DXmlModel(inputPath);
                break;
            case ".gltf":
            case ".glb":
                model = LoadGltfModel(inputPath);
                break;
            default:
                throw new NotSupportedException(
                    $"Informatet '{ext}' stöds inte. Använd .3dxml, .gltf eller .glb.");
        }

        if (model.Children.Count == 0)
            throw new InvalidOperationException("Modellen innehåller ingen renderbar geometri.");

        RenderTargetBitmap bitmap = Render(model, width, height);
        Save(bitmap, outputPath, quality);
    }

    // ==================== 3DXML ====================

    private static Model3DGroup Load3DXmlModel(string path)
    {
        using var zip = ZipFile.OpenRead(path);

        XDocument manifest = null;
        try { manifest = ReadXmlEntry(zip, "Manifest.xml"); } catch { }

        string rootFile = manifest?
            .Descendants()
            .FirstOrDefault(e => e.Name.LocalName == "Root")?
            .Value;

        rootFile ??= zip.Entries
            .Select(e => e.FullName)
            .FirstOrDefault(n =>
                n.EndsWith(".3dxml", StringComparison.OrdinalIgnoreCase)
                && !n.EndsWith("Manifest.xml", StringComparison.OrdinalIgnoreCase));

        if (rootFile == null)
            throw new InvalidDataException("Hittar ingen produktstruktur i 3DXML-arkivet.");

        XDocument productXml = ReadXmlEntry(zip, rootFile);
        var transforms = ParseInstanceTransforms(productXml);

        var group = new Model3DGroup();
        group.Children.Add(new AmbientLight(Colors.White));

        foreach (var entry in zip.Entries.Where(e =>
                     e.FullName.EndsWith(".3DRep", StringComparison.OrdinalIgnoreCase)))
        {
            XDocument repXml = ReadXmlEntry(zip, entry.FullName);
            MeshGeometry3D mesh = ParseRepToMesh(repXml);
            if (mesh == null) continue;

            Color color = ParseColor(repXml) ?? Colors.LightGray;
            var material = new DiffuseMaterial(new SolidColorBrush(color));
            var geometryModel = new GeometryModel3D(mesh, material);

            // Förenklad transformering: applicera första kända matrisen
            var transform = transforms.Values.FirstOrDefault();
            if (transform != null)
                geometryModel.Transform = transform;

            group.Children.Add(geometryModel);
        }

        return group;
    }

    private static Dictionary<string, Transform3D> ParseInstanceTransforms(XDocument productXml)
    {
        var transforms = new Dictionary<string, Transform3D>();

        foreach (var instance in productXml.Descendants()
                     .Where(e => e.Name.LocalName == "Instance3D"))
        {
            var matrixEl = instance.Elements()
                .FirstOrDefault(e => e.Name.LocalName == "RelativeMatrix");
            if (matrixEl == null) continue;

            var values = matrixEl.Value
                .Split(new[] { ' ', ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(double.Parse)
                .ToArray();

            if (values.Length < 12) continue;

            var matrix = new Matrix3D(
                values[0], values[1], values[2], 0,
                values[3], values[4], values[5], 0,
                values[6], values[7], values[8], 0,
                values[9], values[10], values[11], 1);

            string id = instance.Attribute("id")?.Value ?? Guid.NewGuid().ToString();
            transforms[id] = new MatrixTransform3D(matrix);
        }

        return transforms;
    }

    private static MeshGeometry3D ParseRepToMesh(XDocument repXml)
    {
        var vertexBuffer = repXml.Descendants()
            .FirstOrDefault(e => e.Name.LocalName == "VertexBuffer");
        if (vertexBuffer == null) return null;

        var positionsEl = vertexBuffer.Elements()
            .FirstOrDefault(e => e.Name.LocalName == "Positions");
        var normalsEl = vertexBuffer.Elements()
            .FirstOrDefault(e => e.Name.LocalName == "Normals");

        if (positionsEl == null) return null;

        var positions = ParseDoubleList(positionsEl.Value);
        var normals = normalsEl != null ? ParseDoubleList(normalsEl.Value) : null;

        var facesEl = repXml.Descendants()
            .FirstOrDefault(e => e.Name.LocalName == "Faces");
        var faceEl = facesEl?.Elements()
            .FirstOrDefault(e => e.Name.LocalName == "Face");

        if (faceEl == null) return null;

        var indices = ParseIntList(faceEl.Attribute("triangles")?.Value ?? "");
        if (indices.Count < 3) return null;

        var mesh = new MeshGeometry3D();

        for (int i = 0; i < positions.Count; i += 3)
            mesh.Positions.Add(new Point3D(positions[i], positions[i + 1], positions[i + 2]));

        if (normals != null && normals.Count == positions.Count)
            for (int i = 0; i < normals.Count; i += 3)
                mesh.Normals.Add(new Vector3D(normals[i], normals[i + 1], normals[i + 2]));

        foreach (int idx in indices)
            mesh.TriangleIndices.Add(idx);

        return mesh;
    }

    private static Color? ParseColor(XDocument repXml)
    {
        var colorEl = repXml.Descendants()
            .FirstOrDefault(e => e.Name.LocalName == "Color");
        if (colorEl == null) return null;

        byte r = (byte)(double.Parse(colorEl.Attribute("red")?.Value ?? "0.8") * 255);
        byte g = (byte)(double.Parse(colorEl.Attribute("green")?.Value ?? "0.8") * 255);
        byte b = (byte)(double.Parse(colorEl.Attribute("blue")?.Value ?? "0.8") * 255);

        return Color.FromRgb(r, g, b);
    }

    private static XDocument ReadXmlEntry(ZipArchive zip, string entryName)
    {
        var entry = zip.GetEntry(entryName)
                    ?? zip.Entries.FirstOrDefault(e =>
                        string.Equals(e.FullName, entryName, StringComparison.OrdinalIgnoreCase));

        if (entry == null) return null;

        using var stream = entry.Open();
        return XDocument.Load(stream);
    }

    private static List<double> ParseDoubleList(string s) =>
        s.Split(new[] { ' ', ',', ';', '\t', '\n', '\r' },
                StringSplitOptions.RemoveEmptyEntries)
         .Select(double.Parse)
         .ToList();

    private static List<int> ParseIntList(string s) =>
        s.Split(new[] { ' ', ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
         .Select(int.Parse)
         .ToList();

    // ==================== glTF / GLB ====================

    private static Model3DGroup LoadGltfModel(string path)
    {
        // SharpGLTF läser automatiskt .gltf och .glb baserat på filändelsen [reference:2]
        ModelRoot gltf = ModelRoot.Load(path);

        var group = new Model3DGroup();
        group.Children.Add(new AmbientLight(Colors.White));

        foreach (var mesh in gltf.LogicalMeshes)
        {
            foreach (var prim in mesh.Primitives)
            {
                var wpfMesh = new MeshGeometry3D();

                // Positioner
                var positions = prim.GetVertexAccessor("POSITION")?.AsVector3Array();
                if (positions == null) continue;

                foreach (var p in positions)
                    wpfMesh.Positions.Add(new Point3D(p.X, p.Y, p.Z));

                // Normaler (om de finns) [reference:3]
                var normals = prim.GetVertexAccessor("NORMAL")?.AsVector3Array();
                if (normals != null)
                {
                    foreach (var n in normals)
                        wpfMesh.Normals.Add(new Vector3D(n.X, n.Y, n.Z));
                }

                // Index
                var indices = prim.GetIndices();
                if (indices != null)
                {
                    foreach (var i in indices)
                        wpfMesh.TriangleIndices.Add((int)i);
                }

                // Enkel materialhantering
                var material = new DiffuseMaterial(Brushes.LightGray);

                var baseColor = prim.Material?.FindChannel("Base Color");
                if (baseColor != null)
                {
                    var c = baseColor.Value;
                    material = new DiffuseMaterial(new SolidColorBrush(
                        Color.FromRgb(
                            (byte)(c.X * 255),
                            (byte)(c.Y * 255),
                            (byte)(c.Z * 255))));
                }

                group.Children.Add(new GeometryModel3D(wpfMesh, material));
            }
        }

        return group;
    }

    // ==================== Rendering (isometrisk, vit bakgrund) ====================

    private static RenderTargetBitmap Render(Model3DGroup model, int width, int height)
    {
        var viewport = new Viewport3D
        {
            Width = width,
            Height = height,
            Background = Brushes.White // Vit bakgrund
        };

        Rect3D bounds = model.Bounds;
        double size = Math.Max(bounds.SizeX, Math.Max(bounds.SizeY, bounds.SizeZ));
        if (size <= 0) size = 10;

        double d = size * 2;

        viewport.Camera = new OrthographicCamera
        {
            Position = new Point3D(d, d, d),          // Isometrisk riktning (1,1,1)
            LookDirection = new Vector3D(-d, -d, -d),
            UpDirection = new Vector3D(0, 1, 0),
            Width = size * 2.5                         // Marginal runt modellen
        };

        viewport.Children.Add(new ModelVisual3D { Content = model });

        viewport.Measure(new System.Windows.Size(width, height));
        viewport.Arrange(new Rect(0, 0, width, height));

        var rtb = new RenderTargetBitmap(width, height, 96, 96, PixelFormats.Pbgra32);
        rtb.Render(viewport);

        return rtb;
    }

    // ==================== Utdata: PNG, JPG, WebP ====================

    private static void Save(RenderTargetBitmap bitmap, string path, int quality)
    {
        string ext = Path.GetExtension(path).ToLowerInvariant();

        if (ext == ".webp")
        {
            SaveAsWebP(bitmap, path, quality);
            return;
        }

        BitmapEncoder encoder = ext switch
        {
            ".jpg" or ".jpeg" => new JpegBitmapEncoder { QualityLevel = quality },
            ".png" => new PngBitmapEncoder(),
            _ => throw new NotSupportedException(
                $"Utdataformatet '{ext}' stöds inte. Använd .png, .jpg/.jpeg eller .webp.")
        };

        encoder.Frames.Add(BitmapFrame.Create(bitmap));

        using var fs = File.Create(path);
        encoder.Save(fs);
    }

    private static void SaveAsWebP(RenderTargetBitmap bitmap, string path, int quality)
    {
        int w = bitmap.PixelWidth;
        int h = bitmap.PixelHeight;

        var pixels = new byte[w * h * 4];
        bitmap.CopyPixels(pixels, w * 4, 0);

        using var image = SixLabors.ImageSharp.Image.LoadPixelData<Bgra32>(pixels, w, h);

        image.Save(path, new WebpEncoder
        {
            FileFormat = WebpFileFormatType.Lossy, // eller Lossless om du vill
            Quality = quality,
            Method = WebpEncodingMethod.BestQuality
        });
    }
}