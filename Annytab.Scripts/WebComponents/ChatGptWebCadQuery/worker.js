import initOpenCascade from "opencascade.js";

let oc;

async function init() {
    const oc = await initOpenCascade({
        locateFile: (file) => `/wasm/${file}`,
    });
}



function shapeToMesh(shape) {
    new oc.BRepMesh_IncrementalMesh(shape, 0.5);

    const vertices = [];
    const indices = [];

    const exp = new oc.TopExp_Explorer(shape, oc.TopAbs_FACE);

    while (exp.More()) {
        const face = oc.TopoDS.Face(exp.Current());
        const loc = new oc.TopLoc_Location();
        const triangulation = oc.BRep_Tool.Triangulation(face, loc);

        if (!triangulation.IsNull()) {
            const nodes = triangulation.Nodes();
            const triangles = triangulation.Triangles();

            const offset = vertices.length / 3;

            for (let i = 1; i <= nodes.Length(); i++) {
                const p = nodes.Value(i);
                vertices.push(p.X(), p.Y(), p.Z());
            }

            for (let i = 1; i <= triangles.Length(); i++) {
                const tri = triangles.Value(i);
                const [a, b, c] = tri.Get();
                indices.push(offset + a - 1, offset + b - 1, offset + c - 1);
            }
        }

        exp.Next();
    }

    return { vertices, indices };
}

class Workplane {
    constructor() {
        this.shape = null;
    }

    box(x, y, z) {
        this.shape = new oc.BRepPrimAPI_MakeBox(x, y, z).Shape();
        return this;
    }

    translate(x, y, z) {
        const trsf = new oc.gp_Trsf();
        trsf.SetTranslation(new oc.gp_Vec(x, y, z));
        const loc = new oc.TopLoc_Location(trsf);
        this.shape = this.shape.Moved(loc);
        return this;
    }

    union(other) {
        this.shape = new oc.BRepAlgoAPI_Fuse(
            this.shape,
            other.shape
        ).Shape();
        return this;
    }
}

self.onmessage = async (e) => {
    if (!oc) await init();

    const { code } = e.data;

    try {
        const fn = new Function("Workplane", code);
        const shape = fn(Workplane);

        const mesh = shapeToMesh(shape);

        self.postMessage({ mesh });
    } catch (err) {
        self.postMessage({ error: err.message });
    }
};
