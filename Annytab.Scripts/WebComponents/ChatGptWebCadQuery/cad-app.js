import * as monaco from "monaco-editor";
import { Viewer } from "./viewer.js";

export class CadApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
      <style>
        .container { display: flex; height: 100vh; }
        #editor { width: 40%; }
        .viewer { flex: 1; position: relative; }
        canvas { width: 100%; height: 100%; }
        button {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
        }
      </style>

      <div class="container">
        <div id="editor"></div>
        <div class="viewer">
          <button id="run">Run ▶</button>
          <canvas></canvas>
        </div>
      </div>
    `;

        this.worker = new Worker(
            new URL("./worker.js", import.meta.url),
            { type: "module" }
        );
    }

    connectedCallback() {
        this.editor = monaco.editor.create(
            this.shadowRoot.getElementById("editor"),
            {
                value: `
const a = new Workplane().box(10,10,10);
const b = new Workplane().box(10,10,10).translate(5,5,5);
a.union(b);
return a.shape;
        `,
                language: "javascript",
                theme: "vs-dark"
            }
        );

        this.viewer = new Viewer(
            this.shadowRoot.querySelector("canvas")
        );

        this.resize();
        window.addEventListener("resize", () => this.resize());

        this.shadowRoot.getElementById("run").onclick = () =>
            this.run();

        this.worker.onmessage = (e) => {
            if (e.data.error) {
                alert(e.data.error);
            } else {
                this.viewer.setMesh(e.data.mesh);
            }
        };

        this.run();
    }

    resize() {
        const w = this.clientWidth;
        const h = this.clientHeight;
        this.viewer.resize(w, h);
    }

    run() {
        this.worker.postMessage({
            code: this.editor.getValue()
        });
    }
}

customElements.define("cad-app", CadApp);