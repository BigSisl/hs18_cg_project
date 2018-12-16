import * as THREE from "three";
import { WorldScene } from "./worldScene";
import { WorldModel } from "./models/WorldModel";
import { Game } from "./Game";
import { WEBGL } from "./lib/WebGL"

// Force full reload on parcel hot module swap
if ((<any>module).hot) {
    (<any>module).hot.dispose(() => window.location.reload())
}

if(WEBGL.isWebGLAvailable()) {
    let game = new Game();
    game.animate();
} else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.getElementById('body').appendChild(warning);
}
