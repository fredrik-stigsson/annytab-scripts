// cadquery-editor.js - A Web Component for CadQuery editing with live preview
class CadQueryEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.serverUrl = this.getAttribute('server-url') || 'http://localhost:5000';
        this.currentModel = null;
        this.previewDebounceTimer = null;

        this.render();
        this.attachEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .editor-container {
          display: flex;
          flex: 1;
          min-height: 0;
          gap: 10px;
          padding: 10px;
        }
        
        .code-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        
        .preview-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #1a1a2e;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .toolbar {
          padding: 8px;
          background: #f0f0f0;
          border-bottom: 1px solid #ccc;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        textarea {
          flex: 1;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 14px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          resize: none;
          background: #1e1e1e;
          color: #d4d4d4;
          tab-size: 4;
        }
        
        textarea:focus {
          outline: none;
          border-color: #4a90e2;
        }
        
        button {
          padding: 6px 12px;
          background: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        button:hover {
          background: #357abd;
        }
        
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .status {
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 4px;
          background: #e8e8e8;
        }
        
        .status.error {
          background: #ffebee;
          color: #c62828;
        }
        
        .status.success {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status.loading {
          background: #fff3e0;
          color: #ef6c00;
        }
        
        #preview-canvas {
          flex: 1;
          width: 100%;
          background: #1a1a2e;
        }
        
        .error-output {
          background: #ffebee;
          color: #c62828;
          padding: 10px;
          margin: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          max-height: 200px;
          overflow: auto;
          display: none;
        }
        
        .param-panel {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        .param-input {
          display: inline-block;
          margin: 5px 10px 5px 0;
        }
        
        .param-input label {
          font-size: 12px;
          margin-right: 5px;
        }
        
        .param-input input {
          width: 80px;
          padding: 4px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
      </style>
      
      <div class="toolbar">
        <button id="run-btn">▶ Run Preview</button>
        <button id="export-stl-btn">📥 Export STL</button>
        <button id="export-step-btn">📥 Export STEP</button>
        <button id="clear-btn">🗑 Clear</button>
        <div id="status" class="status">Ready</div>
      </div>
      
      <div class="editor-container">
        <div class="code-panel">
          <div class="param-panel" id="param-panel" style="display: none;">
            <h3>Parameters</h3>
            <div id="param-inputs"></div>
          </div>
          <textarea id="code-editor" spellcheck="false"></textarea>
        </div>
        <div class="preview-panel">
          <div id="preview-container" style="flex: 1; position: relative;">
            <canvas id="preview-canvas"></canvas>
          </div>
        </div>
      </div>
      <div id="error-output" class="error-output"></div>
    `;
    }

    attachEventListeners() {
        const runBtn = this.shadowRoot.getElementById('run-btn');
        const exportStlBtn = this.shadowRoot.getElementById('export-stl-btn');
        const exportStepBtn = this.shadowRoot.getElementById('export-step-btn');
        const clearBtn = this.shadowRoot.getElementById('clear-btn');
        const editor = this.shadowRoot.getElementById('code-editor');

        // Set default example code
        editor.value = this.getDefaultCode();

        runBtn.addEventListener('click', () => this.previewCode());
        exportStlBtn.addEventListener('click', () => this.exportModel('stl'));
        exportStepBtn.addEventListener('click', () => this.exportModel('step'));
        clearBtn.addEventListener('click', () => this.clearPreview());

        // Auto-preview on Ctrl+Enter
        editor.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.previewCode();
            }
        });

        // Debounced auto-preview (optional)
        editor.addEventListener('input', () => {
            if (this.previewDebounceTimer) clearTimeout(this.previewDebounceTimer);
            this.previewDebounceTimer = setTimeout(() => this.previewCode(), 1500);
        });
    }

    getDefaultCode() {
        return `# CadQuery Parametric Model
# Press Ctrl+Enter to preview

import cadquery as cq

# Parameters - edit these values
length = 50.0
width = 30.0
height = 20.0
hole_diameter = 8.0
fillet_radius = 2.0

# Create the base block
result = (cq.Workplane("XY")
    .box(length, width, height)
    .faces(">Z")
    .workplane()
    .hole(hole_diameter)
    .edges("|Z")
    .fillet(fillet_radius))

# Add a counterbore on top
result = (result.faces(">Z")
    .workplane()
    .cboreHole(6.0, 10.0, 4.0))

show_object(result)`;
    }

    async previewCode() {
        const editor = this.shadowRoot.getElementById('code-editor');
        const code = editor.value;
        const statusDiv = this.shadowRoot.getElementById('status');
        const errorDiv = this.shadowRoot.getElementById('error-output');

        if (!code.trim()) {
            statusDiv.textContent = 'No code to preview';
            return;
        }

        statusDiv.textContent = 'Running preview...';
        statusDiv.className = 'status loading';
        errorDiv.style.display = 'none';

        try {
            // Send code to CadQuery server
            const response = await fetch(`${this.serverUrl}/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Preview failed');
            }

            const data = await response.json();
            this.currentModel = data.model;

            // Render the model using Three.js
            await this.renderModel(data.modelData);

            statusDiv.textContent = 'Preview ready';
            statusDiv.className = 'status success';

            // Extract and display parameters from code
            this.extractParameters(code);

        } catch (error) {
            console.error('Preview error:', error);
            statusDiv.textContent = 'Error';
            statusDiv.className = 'status error';
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    }

    async renderModel(modelData) {
        // Ensure Three.js is loaded
        if (!window.THREE) {
            await this.loadThreeJS();
        }

        const canvas = this.shadowRoot.getElementById('preview-canvas');
        const container = this.shadowRoot.getElementById('preview-container');

        // Clean up existing scene
        if (this.scene) {
            this.scene.dispose();
        }

        // Setup Three.js scene
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(50, 50, 50);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 2, 1);
        this.scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0x888888, 0.5);
        backLight.position.set(-1, 1, -1);
        this.scene.add(backLight);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(100, 20, 0x888888, 0x444444);
        this.scene.add(gridHelper);

        // Add axes helper
        const axesHelper = new THREE.AxesHelper(25);
        this.scene.add(axesHelper);

        // Load and add the model
        if (modelData && modelData.geometry) {
            const loader = new THREE.BufferGeometryLoader();
            const geometry = loader.parse(modelData.geometry);
            const material = new THREE.MeshStandardMaterial({
                color: 0x4a90e2,
                metalness: 0.7,
                roughness: 0.3,
                transparent: true,
                opacity: 0.9
            });
            const mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);
        }

        // Animation loop
        const animate = () => {
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
                requestAnimationFrame(animate);
            }
        };
        animate();

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newWidth, newHeight);
        });
        resizeObserver.observe(container);
    }

    loadThreeJS() {
        return new Promise((resolve, reject) => {
            if (window.THREE) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                // Also load OrbitControls
                const controlsScript = document.createElement('script');
                controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
                controlsScript.onload = resolve;
                controlsScript.onerror = reject;
                document.head.appendChild(controlsScript);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    extractParameters(code) {
        // Simple regex to find variable assignments at the top of the code
        const paramRegex = /^(\w+)\s*=\s*([\d\.]+)/gm;
        const params = [];
        let match;

        while ((match = paramRegex.exec(code)) !== null) {
            params.push({ name: match[1], value: parseFloat(match[2]) });
        }

        if (params.length > 0) {
            const paramPanel = this.shadowRoot.getElementById('param-panel');
            const paramInputs = this.shadowRoot.getElementById('param-inputs');
            paramPanel.style.display = 'block';
            paramInputs.innerHTML = params.map(p => `
        <div class="param-input">
          <label>${p.name}:</label>
          <input type="number" value="${p.value}" step="1" data-param="${p.name}">
        </div>
      `).join('');

            // Add event listeners to param inputs
            paramInputs.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const paramName = input.dataset.param;
                    const newValue = parseFloat(input.value);
                    const editor = this.shadowRoot.getElementById('code-editor');
                    const currentCode = editor.value;

                    // Update the parameter value in the code
                    const updatedCode = currentCode.replace(
                        new RegExp(`^(${paramName}\\s*=\\s*)[\\d\\.]+`, 'm'),
                        `$1${newValue}`
                    );
                    editor.value = updatedCode;
                });
            });
        }
    }

    async exportModel(format) {
        if (!this.currentModel) {
            this.previewCode();
            return;
        }

        try {
            const response = await fetch(`${this.serverUrl}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.currentModel,
                    format: format
                })
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `model.${format}`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export error:', error);
            const statusDiv = this.shadowRoot.getElementById('status');
            statusDiv.textContent = `Export failed: ${error.message}`;
            statusDiv.className = 'status error';
        }
    }

    clearPreview() {
        if (this.scene) {
            while (this.scene.children.length > 0) {
                this.scene.remove(this.scene.children[0]);
            }
            // Re-add helpers
            const gridHelper = new THREE.GridHelper(100, 20, 0x888888, 0x444444);
            const axesHelper = new THREE.AxesHelper(25);
            this.scene.add(gridHelper);
            this.scene.add(axesHelper);
        }

        const statusDiv = this.shadowRoot.getElementById('status');
        statusDiv.textContent = 'Preview cleared';
        statusDiv.className = 'status';
    }
}

// Register the web component
customElements.define('cadquery-editor', CadQueryEditor);
