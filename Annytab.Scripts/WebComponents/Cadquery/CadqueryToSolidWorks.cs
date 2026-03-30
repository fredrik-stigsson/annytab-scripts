using Microsoft.Win32;
using Org.BouncyCastle.Bcpg.Sig;
using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;
using SwCadQueryExporter;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Numerics;
using System.Reflection.Emit;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;

namespace SwCadQueryImporter
{
    [ComVisible(true)]
    public class SwAddin : ISwAddin
    {
        private SldWorks swApp;
        private int cmdIndex = -1;
        private Dictionary<string, double> parameters;
        private ModelDoc2 activeModel;

        public bool ConnectToSW(object ThisSW, int Cookie)
        {
            swApp = (SldWorks)ThisSW;
            swApp.SetAddinCallbackInfo(0, this, Cookie);

            var cmdMgr = swApp.GetCommandManager(Cookie);
            var toolIds = new int[] { 1, 2, 3 };
            var menuInfo = new object[] {
                "Import CadQuery File...",
                "Import from Clipboard",
                "Configure CadQuery Parser"
            };

            cmdIndex = cmdMgr.AddCommandBar2(this, toolIds, menuInfo,
                (int)swCommandItemType_e.swMenuItem, "CadQuery Importer",
                "Import CadQuery models as native SOLIDWORKS features",
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
            switch (CmdID)
            {
                case 1:
                    ImportFromFile();
                    break;
                case 2:
                    ImportFromClipboard();
                    break;
                case 3:
                    ShowConfiguration();
                    break;
            }
        }

        private void ImportFromFile()
        {
            var openFileDialog = new OpenFileDialog
            {
                Title = "Select CadQuery Python File",
                Filter = "Python files (*.py)|*.py|CadQuery files (*.cq)|*.cq|All files (*.*)|*.*",
                Multiselect = false
            };

            if (openFileDialog.ShowDialog() != DialogResult.OK)
                return;

            string scriptContent = File.ReadAllText(openFileDialog.FileName);
            ProcessCadQueryScript(scriptContent, openFileDialog.FileName);
        }

        private void ImportFromClipboard()
        {
            string clipboardText = Clipboard.GetText();
            if (string.IsNullOrEmpty(clipboardText))
            {
                swApp.SendMsgToUser("Clipboard is empty");
                return;
            }

            ProcessCadQueryScript(clipboardText, "clipboard_import");
        }

        private void ProcessCadQueryScript(string script, string sourceName)
        {
            try
            {
                // Parse the CadQuery script
                var parsedScript = ParseCadQueryScript(script);

                if (parsedScript.HasErrors)
                {
                    swApp.SendMsgToUser($"Parse errors:\n{string.Join("\n", parsedScript.Errors)}");
                    return;
                }

                // Show parameter dialog
                if (!ShowParameterDialog(parsedScript.Parameters))
                    return;

                // Create new part document
                activeModel = swApp.NewDocument(
                    swApp.GetDocumentTemplate((int)swDocumentTypes_e.swDocPART, "", 0, 0, 0),
                    0, 0, 0);

                if (activeModel == null)
                {
                    swApp.SendMsgToUser("Failed to create new part");
                    return;
                }

                // Build the model using SOLIDWORKS API
                BuildModelFromCadQuery(parsedScript);

                swApp.SendMsgToUser($"Successfully imported from {sourceName}");
            }
            catch (Exception ex)
            {
                swApp.SendMsgToUser($"Error: {ex.Message}");
                Debug.WriteLine(ex.StackTrace);
            }
        }

        private CadQueryParseResult ParseCadQueryScript(string script)
        {
            var result = new CadQueryParseResult();
            result.Parameters = new List<Parameter>();
            result.Operations = new List<CadQueryOperation>();

            var lines = script.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);

            // First pass: extract parameters
            foreach (var line in lines)
            {
                // Match variable assignments: name = value
                var paramMatch = Regex.Match(line, @"^(\w+)\s*=\s*([\d\.]+)\s*(?:#.*)?$");
                if (paramMatch.Success)
                {
                    result.Parameters.Add(new Parameter
                    {
                        Name = paramMatch.Groups[1].Value,
                        Value = double.Parse(paramMatch.Groups[2].Value),
                        OriginalLine = line
                    });
                }

                // Match extrude operations
                var extrudeMatch = Regex.Match(line, @"\.extrude\(([^)]+)\)");
                if (extrudeMatch.Success)
                {
                    result.Operations.Add(new CadQueryOperation
                    {
                        Type = "extrude",
                        Parameters = extrudeMatch.Groups[1].Value,
                        Line = line
                    });
                }

                // Match box operations
                var boxMatch = Regex.Match(line, @"\.box\(([^)]+)\)");
                if (boxMatch.Success)
                {
                    result.Operations.Add(new CadQueryOperation
                    {
                        Type = "box",
                        Parameters = boxMatch.Groups[1].Value,
                        Line = line
                    });
                }

                // Match hole operations
                var holeMatch = Regex.Match(line, @"\.hole\(([^)]+)\)");
                if (holeMatch.Success)
                {
                    result.Operations.Add(new CadQueryOperation
                    {
                        Type = "hole",
                        Parameters = holeMatch.Groups[1].Value,
                        Line = line
                    });
                }

                // Match fillet operations
                var filletMatch = Regex.Match(line, @"\.fillet\(([^)]+)\)");
                if (filletMatch.Success)
                {
                    result.Operations.Add(new CadQueryOperation
                    {
                        Type = "fillet",
                        Parameters = filletMatch.Groups[1].Value,
                        Line = line
                    });
                }
            }

            if (result.Operations.Count == 0)
                result.Errors.Add("No CadQuery operations found in script");

            return result;
        }

        private bool ShowParameterDialog(List<Parameter> parameters)
        {
            if (parameters.Count == 0)
                return true;

            var form = new Form
            {
                Text = "CadQuery Parameters",
                Width = 450,
                Height = 300,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                StartPosition = FormStartPosition.CenterParent,
                MaximizeBox = false,
                MinimizeBox = false
            };

            var tablePanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = parameters.Count + 1,
                Padding = new Padding(10),
                AutoScroll = true
            };

            var inputs = new Dictionary<string, NumericUpDown>();

            for (int i = 0; i < parameters.Count; i++)
            {
                var param = parameters[i];
                tablePanel.Controls.Add(new Label
                {
                    Text = param.Name + ":",
                    TextAlign = ContentAlignment.MiddleRight,
                    Margin = new Padding(5)
                }, 0, i);

                var numericUpDown = new NumericUpDown
                {
                    DecimalPlaces = 3,
                    Minimum = -10000,
                    Maximum = 10000,
                    Value = (decimal)param.Value,
                    Width = 150,
                    Increment = 1,
                    Margin = new Padding(5)
                };
                inputs[param.Name] = numericUpDown;
                tablePanel.Controls.Add(numericUpDown, 1, i);
            }

            var infoLabel = new Label
            {
                Text = "Adjust parameters and click OK to generate the model",
                ForeColor = System.Drawing.Color.Gray,
                Dock = DockStyle.Bottom,
                Height = 30,
                TextAlign = ContentAlignment.MiddleCenter
            };

            var okButton = new Button { Text = "Generate Model", DialogResult = DialogResult.OK, Width = 120 };
            var cancelButton = new Button { Text = "Cancel", DialogResult = DialogResult.Cancel, Width = 80 };

            var buttonPanel = new FlowLayoutPanel
            {
                Dock = DockStyle.Bottom,
                Height = 50,
                FlowDirection = FlowDirection.RightToLeft,
                Padding = new Padding(10)
            };
            buttonPanel.Controls.Add(cancelButton);
            buttonPanel.Controls.Add(okButton);

            form.Controls.Add(tablePanel);
            form.Controls.Add(buttonPanel);
            form.Controls.Add(infoLabel);

            if (form.ShowDialog() == DialogResult.OK)
            {
                foreach (var param in parameters)
                {
                    if (inputs.ContainsKey(param.Name))
                        param.Value = (double)inputs[param.Name].Value;
                }
                return true;
            }

            return false;
        }

        private void BuildModelFromCadQuery(CadQueryParseResult parsedScript)
        {
            var part = (PartDoc)activeModel;
            var featureMgr = (FeatureManager)part.FeatureManager;

            // Start a sketch on the front plane
            var sketchMgr = (SketchManager)part.SketchManager;
            var frontPlane = (Plane)part.FeatureManager.GetFirstFeature();

            // Track the current body for boolean operations
            bool hasBaseFeature = false;

            foreach (var operation in parsedScript.Operations)
            {
                switch (operation.Type)
                {
                    case "box":
                        CreateBoxFeature(part, operation, parsedScript.Parameters);
                        hasBaseFeature = true;
                        break;

                    case "extrude":
                        CreateExtrudeFeature(part, operation, parsedScript.Parameters);
                        hasBaseFeature = true;
                        break;

                    case "hole":
                        CreateHoleFeature(part, operation, parsedScript.Parameters);
                        break;

                    case "fillet":
                        CreateFilletFeature(part, operation, parsedScript.Parameters);
                        break;
                }
            }

            // Rebuild and view
            part.ForceRebuild3(true);
            part.ViewZoomtofit2();
        }

        private void CreateBoxFeature(PartDoc part, CadQueryOperation operation, List<Parameter> parameters)
        {
            // Parse box parameters: .box(length, width, height)
            var match = Regex.Match(operation.Parameters, @"([\d\.\w]+)\s*,\s*([\d\.\w]+)\s*,\s*([\d\.\w]+)");
            if (match.Success)
            {
                double length = ResolveParameter(match.Groups[1].Value, parameters);
                double width = ResolveParameter(match.Groups[2].Value, parameters);
                double height = ResolveParameter(match.Groups[3].Value, parameters);

                var sketchMgr = (SketchManager)part.SketchManager;

                // Create sketch on front plane
                var sketch = sketchMgr.InsertSketch(true);
                sketchMgr.CreateCenterRectangle(-width / 2, -length / 2, 0, width / 2, length / 2, 0);

                // Extrude
                var featureMgr = (FeatureManager)part.FeatureManager;
                var extrudeData = featureMgr.FeatureExtrusion2(true, false, false, 0, 0, height, 0, false, false, false, false, 0, 0, false, false, false, false, false, false, false, false, false, false, false, false);

                sketchMgr.InsertSketch(true);
            }
        }

        private void CreateExtrudeFeature(PartDoc part, CadQueryOperation operation, List<Parameter> parameters)
        {
            // Parse extrude parameters
            double height = ResolveParameter(operation.Parameters, parameters);

            var sketchMgr = (SketchManager)part.SketchManager;
            var selectionMgr = (SelectionMgr)part.SelectionManager;

            // Create a new sketch on the top face or plane
            var sketch = sketchMgr.InsertSketch(true);

            // Create a default rectangle (this should come from preceding operations)
            sketchMgr.CreateCenterRectangle(-25, -25, 0, 25, 25, 0);

            var featureMgr = (FeatureManager)part.FeatureManager;
            var extrudeData = featureMgr.FeatureExtrusion2(true, false, false, 0, 0, height, 0, false, false, false, false, 0, 0, false, false, false, false, false, false, false, false, false, false, false, false);

            sketchMgr.InsertSketch(true);
        }

        private void CreateHoleFeature(PartDoc part, CadQueryOperation operation, List<Parameter> parameters)
        {
            // Parse hole diameter
            double diameter = ResolveParameter(operation.Parameters, parameters);

            var featureMgr = (FeatureManager)part.FeatureManager;
            var selectionMgr = (SelectionMgr)part.SelectionManager;

            // Select top face
            // This is simplified - actual implementation needs face selection

            // Create simple hole
            var holeData = (IHoleFeatureData)featureMgr.CreateDefinition((int)swFeatureNameID_e.swFmHole);
            holeData.HoleType = (int)swHoleTypes_e.swHoleType_Simple;
            holeData.HoleDiameter = diameter;
            holeData.HoleDepth = 10;

            var holeFeature = (Feature)featureMgr.CreateFeature(holeData);
        }

        private void CreateFilletFeature(PartDoc part, CadQueryOperation operation, List<Parameter> parameters)
        {
            // Parse fillet radius
            double radius = ResolveParameter(operation.Parameters, parameters);

            var featureMgr = (FeatureManager)part.FeatureManager;

            // Create fillet
            var filletData = (IFilletFeatureData)featureMgr.CreateDefinition((int)swFeatureNameID_e.swFmFillet);
            filletData.FilletType = (int)swFilletType_e.swFilletType_ConstantRadius;
            filletData.SetItemsForFillet2(radius, 0, false, false, false);

            var filletFeature = (Feature)featureMgr.CreateFeature(filletData);
        }

        private double ResolveParameter(string expression, List<Parameter> parameters)
        {
            // Try direct numeric value
            if (double.TryParse(expression, out double value))
                return value;

            // Try parameter lookup
            foreach (var param in parameters)
            {
                if (expression.Contains(param.Name))
                {
                    return param.Value;
                }
            }

            // Try simple arithmetic
            try
            {
                var table = new System.Data.DataTable();
                var result = table.Compute(expression.Replace("**", "^"), "");
                return Convert.ToDouble(result);
            }
            catch
            {
                return 0;
            }
        }

        private void ShowConfiguration()
        {
            var form = new Form
            {
                Text = "CadQuery Importer Configuration",
                Width = 500,
                Height = 400,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                StartPosition = FormStartPosition.CenterParent
            };

            var tabControl = new TabControl { Dock = DockStyle.Fill };

            // General settings tab
            var generalTab = new TabPage("General Settings");
            var generalPanel = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, Padding = new Padding(10) };

            var pythonPathLabel = new Label { Text = "Python Path:", TextAlign = ContentAlignment.MiddleRight };
            var pythonPathBox = new TextBox { Text = GetPythonPath(), Width = 250 };
            var browseButton = new Button { Text = "Browse..." };
            browseButton.Click += (s, e) =>
            {
                var dialog = new OpenFileDialog { Filter = "Python.exe|python.exe", Title = "Select Python Executable" };
                if (dialog.ShowDialog() == DialogResult.OK)
                    pythonPathBox.Text = dialog.FileName;
            };

            generalPanel.Controls.Add(pythonPathLabel, 0, 0);
            generalPanel.Controls.Add(pythonPathBox, 1, 0);
            generalPanel.Controls.Add(browseButton, 2, 0);

            var autoParamLabel = new Label { Text = "Auto-extract parameters:", TextAlign = ContentAlignment.MiddleRight };
            var autoParamCheck = new CheckBox { Checked = true };
            generalPanel.Controls.Add(autoParamLabel, 0, 1);
            generalPanel.Controls.Add(autoParamCheck, 1, 1);

            generalTab.Controls.Add(generalPanel);
            tabControl.TabPages.Add(generalTab);

            // Feature mapping tab
            var mappingTab = new TabPage("Feature Mapping");
            var mappingText = new TextBox
            {
                Dock = DockStyle.Fill,
                Multiline = true,
                Font = new System.Drawing.Font("Consolas", 9),
                Text = @"# CadQuery to SOLIDWORKS feature mapping
box -> BossExtrude
extrude -> BossExtrude
hole -> HoleWizard
fillet -> Fillet
chamfer -> Chamfer
cut -> CutExtrude"
            };
            mappingTab.Controls.Add(mappingText);
            tabControl.TabPages.Add(mappingTab);

            var okButton = new Button { Text = "Save", DialogResult = DialogResult.OK, Dock = DockStyle.Bottom, Height = 30 };
            form.Controls.Add(tabControl);
            form.Controls.Add(okButton);

            if (form.ShowDialog() == DialogResult.OK)
            {
                SaveConfiguration("python_path", pythonPathBox.Text);
                SaveConfiguration("auto_extract_params", autoParamCheck.Checked.ToString());
                SaveConfiguration("feature_mapping", mappingText.Text);
            }
        }

        private string GetPythonPath()
        {
            string savedPath = LoadConfiguration("python_path");
            if (!string.IsNullOrEmpty(savedPath) && File.Exists(savedPath))
                return savedPath;

            // Try to find Python in common locations
            string[] commonPaths = {
                @"C:\Python39\python.exe",
                @"C:\Python310\python.exe",
                @"C:\Users\" + Environment.UserName + @"\AppData\Local\Programs\Python\Python39\python.exe",
                @"C:\Users\" + Environment.UserName + @"\AppData\Local\Programs\Python\Python310\python.exe",
                @"C:\ProgramData\Anaconda3\python.exe"
            };

            foreach (var path in commonPaths)
            {
                if (File.Exists(path))
                    return path;
            }

            return "python";
        }

        private void SaveConfiguration(string key, string value)
        {
            var regKey = Registry.CurrentUser.CreateSubKey(@"Software\SwCadQueryImporter");
            regKey.SetValue(key, value);
            regKey.Close();
        }

        private string LoadConfiguration(string key)
        {
            var regKey = Registry.CurrentUser.OpenSubKey(@"Software\SwCadQueryImporter");
            string value = regKey?.GetValue(key) as string;
            regKey?.Close();
            return value;
        }
    }

    public class CadQueryParseResult
    {
        public List<Parameter> Parameters { get; set; } = new List<Parameter>();
        public List<CadQueryOperation> Operations { get; set; } = new List<CadQueryOperation>();
        public List<string> Errors { get; set; } = new List<string>();
        public bool HasErrors => Errors.Count > 0;
    }

    public class CadQueryOperation
    {
        public string Type { get; set; }
        public string Parameters { get; set; }
        public string Line { get; set; }
    }

    public class Parameter
    {
        public string Name { get; set; }
        public double Value { get; set; }
        public string OriginalLine { get; set; }
    }
}