import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Viewer {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);

        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.camera.position.set(40, 40, 40);

        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);

        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x404040));

        this.animate = this.animate.bind(this);
        this.animate();
    }

    resize(w, h) {
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    setMesh(data) {
        const { vertices, indices } = data;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({ color: 0x66aaff })
        );

        this.scene.clear();
        this.scene.add(mesh);

        // lights again
        this.scene.add(new THREE.AmbientLight(0x404040));
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        this.scene.add(light);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}