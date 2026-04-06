import * as THREE from "three";
import initOpenCascade from "/public/wasm/opencascade.full.js";
import opencascadeWasm from "/public/wasm/opencascade.full.wasm?url";

// -------------------- INIT OC --------------------
let oc = null;
let ocReadyPromise = null;

async function initOpenCascadeAsync() {
  if (ocReadyPromise) return ocReadyPromise;
  
  ocReadyPromise = (async () => {
    oc = await initOpenCascade({
      locateFile: () => opencascadeWasm,
    });
    console.log('OpenCascade.js initialized successfully');
    console.log('Available classes:', Object.keys(oc).slice(0, 20));
    return oc;
  })();
  
  return ocReadyPromise;
}

// -------------------- SHAPE → MESH --------------------
async function shapeToMesh(shape) {
    await initOpenCascadeAsync(); // Ensure oc is ready
    
    // Try different mesh constructors
    let meshAlgo;
    
    try {
        meshAlgo = new oc.BRepMesh_IncrementalMesh_3(shape, 0.5);
        console.log('Using BRepMesh_IncrementalMesh_3');
    } catch(e) {
        try {
            meshAlgo = new oc.BRepMesh_IncrementalMesh_2(shape, 0.5);
            console.log('Using BRepMesh_IncrementalMesh_2');
        } catch(e2) {
            try {
                meshAlgo = new oc.BRepMesh_IncrementalMesh_1(shape);
                console.log('Using BRepMesh_IncrementalMesh_1');
            } catch(e3) {
                console.error('No working mesh constructor found:', e3);
                return new THREE.Mesh(
                    new THREE.BoxGeometry(10, 10, 10),
                    new THREE.MeshStandardMaterial({ color: 0x66aaff, wireframe: true })
                );
            }
        }
    }
    
    // Perform meshing
    if (meshAlgo && meshAlgo.Perform) {
        meshAlgo.Perform();
    }
    
    const vertices = [];
    const indices = [];
    
    const exp = new oc.TopExp_Explorer(shape, oc.TopAbs_FACE);
    
    while (exp.More()) {
        const face = oc.TopoDS.Face(exp.Current());
        const loc = new oc.TopLoc_Location();
        
        const triangulation = oc.BRep_Tool.Triangulation(face, loc);
        
        if (triangulation.IsNull()) {
            exp.Next();
            continue;
        }
        
        const nodes = triangulation.Nodes();
        const triangles = triangulation.Triangles();
        
        const offset = vertices.length / 3;
        
        for (let i = 1; i <= nodes.Length(); i++) {
            const p = nodes.Value(i);
            vertices.push(p.X(), p.Y(), p.Z());
        }
        
        for (let i = 1; i <= triangles.Length(); i++) {
            const tri = triangles.Value(i);
            let a, b, c;
            if (tri.Get) {
                [a, b, c] = tri.Get();
            } else if (tri.Value) {
                a = tri.Value(1);
                b = tri.Value(2);
                c = tri.Value(3);
            } else {
                a = tri[0];
                b = tri[1];
                c = tri[2];
            }
            indices.push(offset + a - 1, offset + b - 1, offset + c - 1);
        }
        
        exp.Next();
    }
    
    // Clean up
    if (meshAlgo) meshAlgo.delete();
    exp.delete();
    
    if (vertices.length === 0) {
        console.warn('No vertices generated, returning fallback cube');
        return new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 10),
            new THREE.MeshStandardMaterial({ color: 0x66aaff, wireframe: true })
        );
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: 0x66aaff })
    );
}

// -------------------- CAD API --------------------
class Workplane {
    constructor(shape = null) {
        this.shape = shape;
    }

    async box(width, height, depth, offset = { x: 0, y: 0, z: 0 }) {
        await initOpenCascadeAsync();
        
        let maker;
        
        if (offset.x === 0 && offset.y === 0 && offset.z === 0) {
            // Box centered at origin
            maker = new oc.BRepPrimAPI_MakeBox_2(width, height, depth);
        } else {
            // Box from corner point with offset
            // Use BRepPrimAPI_MakeBox_3 (two points) instead
            const p1 = new oc.gp_Pnt_3(offset.x, offset.y, offset.z);
            const p2 = new oc.gp_Pnt_3(offset.x + width, offset.y + height, offset.z + depth);
            maker = new oc.BRepPrimAPI_MakeBox_3(p1, p2);
        }
        
        this.shape = maker.Shape();
        maker.delete();
        return this;
    }

    async translate(dx, dy, dz) {
        await initOpenCascadeAsync();
        // Create transformation
        const transform = new oc.gp_Trsf();
        transform.SetTranslation(new oc.gp_Vec_3(dx, dy, dz));
        const mover = new oc.BRepBuilderAPI_Transform(this.shape, transform, true);
        this.shape = mover.Shape();
        mover.delete();
        transform.delete();
        return this;
    }

    async union(other) {
        await initOpenCascadeAsync();
        const fuse = new oc.BRepAlgoAPI_Fuse_3(this.shape, other.shape);
        fuse.Build();
        this.shape = fuse.Shape();
        fuse.delete();
        return this;
    }
}

// -------------------- CAD APP --------------------
class CadApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        
        this.shadowRoot.innerHTML = `
            <style>
                .container {
                    display: flex;
                    height: 100vh;
                    font-family: monospace;
                }
                textarea {
                    width: 40%;
                    padding: 10px;
                    background: #111;
                    color: #0f0;
                    border: none;
                    outline: none;
                }
                .viewer {
                    flex: 1;
                    position: relative;
                }
                canvas {
                    width: 100%;
                    height: 100%;
                    display: block;
                }
                button {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    z-index: 10;
                    padding: 8px 12px;
                    cursor: pointer;
                }
            </style>
            <div class="container">
                <textarea id="editor"></textarea>
                <div class="viewer">
                    <button id="run">Run ▶</button>
                    <canvas></canvas>
                </div>
            </div>
        `;
        
        this.editor = this.shadowRoot.getElementById("editor");
        this.canvas = this.shadowRoot.querySelector("canvas");
        this.runBtn = this.shadowRoot.getElementById("run");
        
        this.editor.value = `
const wp = new Workplane();
const box1 = await new Workplane().box(10, 10, 10);
const box2 = await new Workplane().box(10, 10, 10).translate(5, 5, 5);
await box1.union(box2);
return box1.shape;
`;
        
        // THREE setup
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.camera.position.set(40, 40, 40);
        this.camera.lookAt(0, 0, 0);
        
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x404040));
        
        this.controls = null;
        this.animate = this.animate.bind(this);
    }
    
    async connectedCallback() {
        await initOpenCascadeAsync();
        this.resize();
        window.addEventListener("resize", () => this.resize());
        this.runBtn.onclick = () => this.runCode();
        await this.runCode();
        this.animate();
    }
    
    resize() {
        const w = this.clientWidth;
        const h = this.clientHeight;
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }
    
    async runCode() {
        try {
            // Make Workplane available to eval
            const code = this.editor.value;
            
            // Create an async function to run the code
            const asyncFunc = new Function("Workplane", `
                return (async () => {
                    ${code}
                })();
            `);
            
            const shape = await asyncFunc(Workplane);
            
            if (!shape) {
                console.error("Editor code did not return a shape!");
                return;
            }
            
            // Clear scene except lights
            const toRemove = [];
            this.scene.children.forEach(child => {
                if (!(child instanceof THREE.Light)) {
                    toRemove.push(child);
                }
            });
            toRemove.forEach(child => this.scene.remove(child));
            
            // Convert to Three.js mesh
            const mesh = await shapeToMesh(shape);
            this.scene.add(mesh);
            
            // Center camera on the shape
            if (mesh.geometry.boundingSphere) {
                const center = mesh.geometry.boundingSphere.center;
                const radius = mesh.geometry.boundingSphere.radius;
                this.camera.position.set(center.x + radius * 2, center.y + radius * 2, center.z + radius * 2);
                this.camera.lookAt(center);
            }
            
        } catch (e) {
            console.error(e);
            alert(e.message);
        }
    }
    
    animate() {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define("cad-app", CadApp);

// Initialize everything
initOpenCascadeAsync().catch(console.error);