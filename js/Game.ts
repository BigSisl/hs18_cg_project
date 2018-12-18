import * as THREE from "three";
import { WorldScene } from "./worldScene";
import { SimpleWorldModel } from "./models/SimpleWorldModel";
import { OrbitControls } from "./lib/OrbitControls";
import { WorldModel } from "./models/WorldModel";
import { WorldCustomShader } from "./models/WorldCustomShader";

export class Game {

    camera: THREE.Camera;
    scene: THREE.Scene;
    world: WorldScene;
    renderer: THREE.Renderer;
    orbitControls: OrbitControls;

    activeWorld: WorldModel = null;

    constructor() {
        this.scene = this.setupScene();
        this.camera = this.setupCamera();

        this.renderer = this.setupRenderer();
        document.body.appendChild(this.renderer.domElement);

        this.orbitControls = this.setupOrbitControls(this.camera, this.renderer);

        this.world = new WorldScene(
            this.scene,
            this.camera
        );

        this.world.setDevEnvironment();

        this.load(new WorldCustomShader(this.scene));

        this.camera.position.z = 5;
    }

    load(world: WorldModel) {
        if(this.activeWorld != null) {
            this.world.removeUpdate(world.update);
        }

        world.load()
        this.world.addUpdate(world.update);
    }

    insertShaderWorld() {

    }

    setupOrbitControls(camera: THREE.Camera, render: THREE.Renderer): OrbitControls {
        let controls = new OrbitControls(camera);

        controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 500;

        controls.maxPolarAngle = Math.PI;

        return controls;
    }

    setupScene(): THREE.Scene {
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(0xe0e0e0)
        return scene;
    }

    setupCamera(): THREE.Camera {
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(50, 30, 5)
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

            self.orbitControls.update();

            self.renderer.render(self.scene, self.camera);
        }
        animate();
    }

}