import * as THREE from "three";
import { Game } from "./Game";
import { WEBGL } from "./lib/WebGL"

// Force full reload on parcel hot module swap
if ((<any>module).hot) {
    (<any>module).hot.dispose(() => window.location.reload())
}


var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var debugCamera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
debugCamera.position.set(-5, 3, 5)
debugCamera.lookAt(0, 0, 0);


if(WEBGL.isWebGLAvailable()) {
    let game = new Game();
    game.animate();
} else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.getElementById('body').appendChild(warning);
}
