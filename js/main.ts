import * as THREE from "three";
import { Game } from "./Game";
import { WEBGL } from "./lib/WebGL"
import * as THREE from "three";

// Force full reload on parcel hot module swap
if ((<any>module).hot) {
    (<any>module).hot.dispose(() => window.location.reload())
}

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-5, 3, 5)
camera.lookAt(0, 0, 0);


if(WEBGL.isWebGLAvailable()) {
    let game = new Game();
    game.animate();
} else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.getElementById('body').appendChild(warning);
}
