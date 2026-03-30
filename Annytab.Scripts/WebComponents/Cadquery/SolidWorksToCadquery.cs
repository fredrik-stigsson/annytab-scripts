using Org.BouncyCastle.Bcpg.Sig;
using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;

namespace SwCadQueryExporter
{
    [ComVisible(true)]
    public class SwAddin : ISwAddin
    {
        private SldWorks swApp;
        private int cmdIndex = -1;
        private Dictionary<string, string> globalVariables;
        private Dictionary<string, double> resolvedValues;

        public bool ConnectToSW(object ThisSW, int Cookie)
        {
            swApp = (SldWorks)ThisSW;
            swApp.SetAddinCallbackInfo(0, this, Cookie);

            var cmdMgr = swApp.GetCommandManager(Cookie);
            var toolIds = new int[] { 1 };
            var menuInfo = new object[] { "Export to CadQuery" };

            cmdIndex = cmdMgr.AddCommandBar2(this, toolIds, menuInfo,
                (int)swCommandItemType_e.swMenuItem, "CadQuery", "CadQuery",
                (int)swWorkspaceTypes_e.swAllCommands);

            return true;
        }

        public bool DisconnectFromSW()
        {
            if (cmdIndex != -1)
            {
                var cmdMgr = swApp.GetCommandManager(0);
                cmdMgr.RemoveCommandBar(cmdIndex);
            }
            return true;
        }

        public void Command(int CmdID)
        {
            var model = swApp.ActiveDoc as ModelDoc2;
            if (model == null || model.GetType() != (int)swDocumentTypes_e.swDocPART)
            {
                swApp.SendMsgToUser("Please open a part document.");
                return;
            }

            ExportToCadQuery(model);
        }

        private void ExportToCadQuery(ModelDoc2 model)
        {
            string path = Path.ChangeExtension(model.GetPathName(), ".py");
            var sb = new StringBuilder();

            // Load and resolve global variables
            LoadGlobalVariables(model);
            ResolveAllVariables();

            // Write CadQuery file header
            sb.AppendLine("\"\"\"");
            sb.AppendLine($"Auto-generated from SOLIDWORKS: {Path.GetFileName(model.GetPathName())}");
            sb.AppendLine($"Generated: {DateTime.Now}");
            sb.AppendLine("\"\"\"");
            sb.AppendLine();
            sb.AppendLine("import cadquery as cq");
            sb.AppendLine();

            // Write parameters section (global variables)
            sb.AppendLine("# ============================================");
            sb.AppendLine("# PARAMETERS (from SOLIDWORKS Global Variables)");
            sb.AppendLine("# ============================================");

            foreach (var varName in globalVariables.Keys)
            {
                string pyVarName = SanitizeVariableName(varName);
                string expression = ConvertEquationToPython(globalVariables[varName]);

                if (resolvedValues.ContainsKey(varName))
                {
                    sb.AppendLine($"# {varName} = {resolvedValues[varName]} mm");
                }
                sb.AppendLine($"{pyVarName} = {expression}");
            }
            sb.AppendLine();

            // Build the model
            sb.AppendLine("# ============================================");
            sb.AppendLine("# MODEL CONSTRUCTION");
            sb.AppendLine("# ============================================");
            sb.AppendLine();
            sb.AppendLine("def build_model():");
            sb.AppendLine("    \"\"\"Build the SOLIDWORKS model in CadQuery\"\"\"");

            // Start with a workplane
            sb.AppendLine("    result = cq.Workplane(\"XY\")");

            // Process features
            var part = (PartDoc)model;
            var featureMgr = (FeatureManager)part.FeatureManager;
            var feature = (Feature)featureMgr.GetFirstFeature();

            int featureIndex = 0;
            while (feature != null)
            {
                string featureName = feature.Name;
                string featureType = feature.GetTypeName2();

                string cqCode = ConvertFeatureToCadQuery(feature, featureIndex);
                if (!string.IsNullOrEmpty(cqCode))
                {
                    sb.AppendLine($"    # Feature: {featureName} ({featureType})");
                    sb.AppendLine($"    {cqCode}");
                    featureIndex++;
                }
                else
                {
                    sb.AppendLine($"    # SKIPPED: {featureName} ({featureType}) - manual conversion needed");
                }

                feature = (Feature)feature.GetNextFeature();
            }

            sb.AppendLine("    return result");
            sb.AppendLine();

            // Add execution block
            sb.AppendLine("# ============================================");
            sb.AppendLine("# EXPORT");
            sb.AppendLine("# ============================================");
            sb.AppendLine();
            sb.AppendLine("if __name__ == \"__main__\":");
            sb.AppendLine("    model = build_model()");
            sb.AppendLine("    # Export to various formats");
            sb.AppendLine("    cq.exporters.export(model, \"model.step\")");
            sb.AppendLine("    cq.exporters.export(model, \"model.stl\")");
            sb.AppendLine("    # show(model)  # Uncomment to view in CadQuery GUI");

            File.WriteAllText(path, sb.ToString());
            swApp.SendMsgToUser($"Exported to CadQuery: {path}");
        }

        private void LoadGlobalVariables(ModelDoc2 model)
        {
            globalVariables = new Dictionary<string, string>();

            try
            {
                var eqMgr = (EquationMgr)model.GetEquationMgr();
                int eqCount = eqMgr.GetCount();

                for (int i = 0; i < eqCount; i++)
                {
                    string varName = eqMgr.GetName(i);
                    string equation = eqMgr.GetEquation(i);

                    if (!string.IsNullOrEmpty(varName) && !string.IsNullOrEmpty(equation))
                    {
                        equation = CleanEquation(equation);
                        globalVariables[varName] = equation;
                    }
                }
            }
            catch (Exception ex)
            {
                swApp.SendMsgToUser($"Error reading variables: {ex.Message}");
            }
        }

        private string CleanEquation(string equation)
        {
            equation = equation.Trim().Trim('"');
            return equation;
        }

        private void ResolveAllVariables()
        {
            resolvedValues = new Dictionary<string, double>();

            int maxAttempts = 100;
            int attempts = 0;

            while (resolvedValues.Count < globalVariables.Count && attempts < maxAttempts)
            {
                foreach (var kvp in globalVariables)
                {
                    if (resolvedValues.ContainsKey(kvp.Key))
                        continue;

                    double? value = ResolveEquation(kvp.Value);
                    if (value.HasValue)
                    {
                        resolvedValues[kvp.Key] = value.Value;
                    }
                }
                attempts++;
            }
        }

        private double? ResolveEquation(string equation)
        {
            try
            {
                equation = equation.Replace("\"", "");

                foreach (var varName in globalVariables.Keys)
                {
                    if (equation.Contains(varName) && resolvedValues.ContainsKey(varName))
                    {
                        equation = equation.Replace(varName, resolvedValues[varName].ToString());
                    }
                }

                equation = Regex.Replace(equation, @"[a-zA-Z]+", "");

                var table = new System.Data.DataTable();
                var result = table.Compute(equation, "");

                return Convert.ToDouble(result);
            }
            catch
            {
                return null;
            }
        }

        private string ConvertEquationToPython(string equation)
        {
            equation = equation.Replace("\"", "");

            foreach (var varName in globalVariables.Keys)
            {
                string pyName = SanitizeVariableName(varName);
                equation = Regex.Replace(equation, @"\b" + Regex.Escape(varName) + @"\b", pyName);
            }

            equation = Regex.Replace(equation, @"\s*(mm|in|cm|m)\s*", "");

            // Convert ^ to ** for Python exponent
            equation = equation.Replace("^", "**");

            return equation;
        }

        private string SanitizeVariableName(string name)
        {
            string sanitized = name.Replace(" ", "_")
                                   .Replace("@", "")
                                   .Replace("$", "")
                                   .Replace(":", "");

            if (char.IsDigit(sanitized[0]))
                sanitized = "_" + sanitized;

            return sanitized;
        }

        private string ConvertFeatureToCadQuery(Feature feature, int index)
        {
            string featureType = feature.GetTypeName2();

            switch (featureType)
            {
                case "Extrude":
                    return ConvertExtrudeFeature(feature);

                case "CutExtrude":
                    return ConvertCutExtrudeFeature(feature);

                case "Revolve":
                    return ConvertRevolveFeature(feature);

                case "Fillet":
                    return ConvertFilletFeature(feature);

                case "Chamfer":
                    return ConvertChamferFeature(feature);

                case "Hole":
                    return ConvertHoleFeature(feature);

                case "Pattern":
                case "FeaturePattern":
                    return ConvertPatternFeature(feature);

                case "Mirror":
                    return ConvertMirrorFeature(feature);

                default:
                    return null;
            }
        }

        private string ConvertExtrudeFeature(Feature feature)
        {
            try
            {
                var extrudeData = (IExtrudeFeatureData)feature.GetDefinition();
                if (extrudeData != null)
                {
                    double depth = extrudeData.GetDepth();
                    string depthExpr = GetDimensionExpression(feature, "Depth");

                    var sketch = GetSketchFromFeature(feature);
                    if (sketch != null)
                    {
                        var dimensions = GetSketchDimensionsWithEquations(sketch);

                        // CadQuery uses chain syntax
                        if (dimensions.ContainsKey("width") && dimensions.ContainsKey("height"))
                        {
                            string widthExpr = dimensions["width"].Equation;
                            string heightExpr = dimensions["height"].Equation;
                            string depthString = !string.IsNullOrEmpty(depthExpr) ? depthExpr : depth.ToString("F3");

                            return $"result = (result\n" +
                                   $"    .rect({widthExpr}, {heightExpr})\n" +
                                   $"    .extrude({depthString}))";
                        }
                    }
                }
            }
            catch { }

            return null;
        }

        private string ConvertCutExtrudeFeature(Feature feature)
        {
            try
            {
                var cutData = (ICutExtrudeFeatureData)feature.GetDefinition();
                if (cutData != null)
                {
                    double depth = cutData.GetDepth();
                    string depthExpr = GetDimensionExpression(feature, "Depth");
                    string depthString = !string.IsNullOrEmpty(depthExpr) ? depthExpr : depth.ToString("F3");

                    // Cuts use cutThruAll or cutBlind in CadQuery
                    return $"result = result.faces(\">Z\").circle(5).cutBlind({depthString})  # Manual: adjust sketch";
                }
            }
            catch { }

            return null;
        }

        private string ConvertRevolveFeature(Feature feature)
        {
            try
            {
                var revolveData = (IRevolveFeatureData)feature.GetDefinition();
                if (revolveData != null)
                {
                    double angle = revolveData.GetAngle();
                    return $"result = result.revolve({angle:F3}, axisStart=(0,0,0), axisEnd=(0,1,0))  # Needs profile sketch";
                }
            }
            catch { }

            return null;
        }

        private string ConvertFilletFeature(Feature feature)
        {
            try
            {
                var filletData = (IFilletFeatureData)feature.GetDefinition();
                if (filletData != null)
                {
                    double radius = filletData.GetRadius();
                    string radiusExpr = GetDimensionExpression(feature, "Radius");
                    string radiusString = !string.IsNullOrEmpty(radiusExpr) ? radiusExpr : radius.ToString("F3");

                    return $"result = result.fillet({radiusString})";
                }
            }
            catch { }

            return null;
        }

        private string ConvertChamferFeature(Feature feature)
        {
            try
            {
                var chamferData = (IChamferFeatureData)feature.GetDefinition();
                if (chamferData != null)
                {
                    double distance = chamferData.GetDistance();
                    return $"result = result.chamfer({distance:F3})";
                }
            }
            catch { }

            return null;
        }

        private string ConvertHoleFeature(Feature feature)
        {
            // Simple hole - CadQuery has a hole() method
            return $"result = result.faces(\">Z\").hole(5)  # Manual: specify diameter and position";
        }

        private string ConvertPatternFeature(Feature feature)
        {
            // Linear or circular pattern
            return $"# Pattern feature - use .rarray() or .polarArray() in CadQuery";
        }

        private string ConvertMirrorFeature(Feature feature)
        {
            return $"result = result.mirror(mirrorPlane=\"YZ\")  # Manual: specify mirror plane";
        }

        private string GetDimensionExpression(Feature feature, string dimensionName)
        {
            try
            {
                var displayDim = (DisplayDimension)feature.GetFirstDisplayDimension();
                while (displayDim != null)
                {
                    var dimension = (Dimension)displayDim.GetDimension();
                    string name = dimension.GetName();

                    if (name.Contains(dimensionName))
                    {
                        string equation = dimension.GetEquation();
                        if (!string.IsNullOrEmpty(equation))
                        {
                            return ConvertEquationToPython(equation);
                        }
                    }

                    displayDim = (DisplayDimension)feature.GetNextDisplayDimension(displayDim);
                }
            }
            catch { }

            return null;
        }

        private Sketch GetSketchFromFeature(Feature feature)
        {
            try
            {
                // Simplified - actual implementation needs to get the sketch from feature dependencies
                return null;
            }
            catch
            {
                return null;
            }
        }

        private Dictionary<string, DimensionData> GetSketchDimensionsWithEquations(Sketch sketch)
        {
            var dimensions = new Dictionary<string, DimensionData>();

            try
            {
                var displayDim = (DisplayDimension)sketch.GetFirstDisplayDimension();
                while (displayDim != null)
                {
                    var dimension = (Dimension)displayDim.GetDimension();
                    string dimName = dimension.GetName();
                    string equation = dimension.GetEquation();
                    double value = dimension.GetValue();

                    string pyEquation = !string.IsNullOrEmpty(equation) ?
                        ConvertEquationToPython(equation) :
                        value.ToString("F3");

                    string type = "unknown";
                    if (dimName.ToLower().Contains("width")) type = "width";
                    else if (dimName.ToLower().Contains("height")) type = "height";
                    else if (dimName.ToLower().Contains("length")) type = "length";
                    else if (dimName.ToLower().Contains("dia")) type = "diameter";
                    else if (dimName.ToLower().Contains("rad")) type = "radius";

                    dimensions[type] = new DimensionData
                    {
                        Value = value,
                        Equation = pyEquation,
                        Name = dimName
                    };

                    displayDim = (DisplayDimension)sketch.GetNextDisplayDimension(displayDim);
                }
            }
            catch { }

            return dimensions;
        }
    }

    public class DimensionData
    {
        public double Value { get; set; }
        public string Equation { get; set; }
        public string Name { get; set; }
    }
}