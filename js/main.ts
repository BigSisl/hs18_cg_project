import * as THREE from "three";
import { WorldScene } from "./worldScene";
import { WorldModel } from "./models/WorldModel";

// Force full reload on parcel hot module swap
if ((<any>module).hot) {
    (<any>module).hot.dispose(() => window.location.reload())
}


var scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0)
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-5, 3, 5)
camera.lookAt(0, 0, 0)

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

var world = new WorldScene(
    scene,
    camera
);

world.setDevEnvironment();

let model = new WorldModel(scene);
world.addUpdate(model.update());

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);

    world.draw();

    renderer.render(scene, camera);
}
animate();
