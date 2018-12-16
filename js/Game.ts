import * as THREE from "three";
import { WorldScene } from "./worldScene";
import { WorldModel } from "./models/WorldModel";


export class Game {

    camera: THREE.Camera;
    scene;
    world: WorldScene;
    renderer: THREE.Renderer;

    constructor() {

        this.scene = this.setupScene();
        this.camera = this.setupCamera();

        this.renderer = this.setupRenderer();
        document.body.appendChild(this.renderer.domElement);

        this.world = new WorldScene(
            this.scene,
            this.camera
        );

        this.world.setDevEnvironment();

        let model = new WorldModel(this.scene);
        this.world.addUpdate(model.update());

        this.camera.position.z = 5;
    }

    setupScene(): THREE.Scene {
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(0xe0e0e0)
        return scene;
    }

    setupCamera(): THREE.Camera {
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(-5, 3, 5)
        camera.lookAt(0, 0, 0)
        return camera;
    }

    setupRenderer(): THREE.Renderer {
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        return renderer;
    }

    animate(): void {
        var self = this;
        function animate() {
            requestAnimationFrame(animate);

            self.world.draw();

            self.renderer.render(self.scene, self.camera);
        }
        animate();
    }

}