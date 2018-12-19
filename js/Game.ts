import * as THREE from "three";
import { WorldScene } from "./worldScene";
import { SimpleWorldModel } from "./models/SimpleWorldModel";
import { OrbitControls } from "./lib/OrbitControls";
import { WorldModel } from "./models/WorldModel";
import { WorldCustomShader } from "./models/WorldCustomShader";
import { Camera } from "./models/Camera";

type KEYS =
    'TOGGLE_CAMERA';


export class Game {

    debugCamera: THREE.Camera;
    worldCamera: Camera;

    scene: THREE.Scene;
    world: WorldScene;
    renderer: THREE.Renderer;
    debugOrbitControls: OrbitControls;

    activeWorld: WorldModel = null;
    activeCamera: THREE.Camera;

    keys: { [K in KEYS]: any; } = {
        TOGGLE_CAMERA: 32
    };

    constructor() {
        this.scene = this.setupScene();
        this.debugCamera = this.setupCamera();

        this.renderer = this.setupRenderer();
        document.body.appendChild(this.renderer.domElement);

        this.debugOrbitControls = this.setupOrbitControls(this.debugCamera, this.renderer);

        this.world = new WorldScene(
            this.scene,
            this.debugCamera
        );

        this.worldCamera = new Camera(this.scene);
        this.world.addUpdate(this.worldCamera.update);

        this.world.setDevEnvironment();

        this.load(new WorldCustomShader(this.scene));

        this.debugCamera.position.z = 5;

        this.toggleCamera();
        this.setupListeners();
    }

    toggleCamera() {
        if(this.activeCamera == this.worldCamera) {
            this.worldCamera.disbale();
            this.debugOrbitControls.enabled = true;
            this.activeCamera = this.debugCamera;
        } else {
            this.debugOrbitControls.enabled = false;
            this.worldCamera.active();
            this.activeCamera = this.worldCamera;
        }
    }

    setupListeners() {
        window.addEventListener("keydown", this.onKeyDown, false);
    }

    load(world: WorldModel) {
        if(this.activeWorld != null) {
            this.world.removeUpdate(world.update);
        }

        world.load()
        this.world.addUpdate(world.update);
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

            self.debugOrbitControls.update();

            self.renderer.render(self.scene, self.activeCamera);
        }
        animate();
    }

    onKeyDown = (() => {
        var self = this;
        return (event: KeyboardEvent): any => {
            console.log(event.keyCode);

            switch(event.keyCode) {
                case self.keys.TOGGLE_CAMERA:
                    self.toggleCamera();
                    break;
            }
        }
    })();

}