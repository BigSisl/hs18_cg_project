import * as THREE from "three";
import { OrbitControls } from "../lib/OrbitControls";
import { TlsOptions } from "tls";

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

class MaxMin<T> {
    readonly max: T;
    readonly min: T;
}

export class Camera extends THREE.PerspectiveCamera {

    private cameraHelper: THREE.CameraHelper;

    private maxDistance: number = 30.0;
    private minDistance: number = 16.0;
    private curvatureChangeOn: MaxMin<number> = {
        max: 20,
        min: 15
    };

    private distance: number;

    private controls: OrbitControls;

    private speed: MaxMin<number> = {
        max: 0.8,
        min: 0.1
    }

    constructor(private scene: THREE.Scene) {
        super( 60, 1 * aspect, 1, 30 );

        this.position.set(this.maxDistance, 0, 0);
        this.lookAt(0.0,0.0,0.0);

        this.controls = new OrbitControls(this);
        this.controls.enablePan = false;
        this.controls.maxZoom = 1.1;
        this.controls.minZoom = 0.9;
        this.controls.maxDistance = this.maxDistance;
        this.controls.minDistance = this.minDistance;
        this.cameraHelper = new THREE.CameraHelper( this );

        this.scene.add(this);
        this.scene.add(this.cameraHelper);
    }

    public active() {
        this.hideHelper();
        this.controls.enabled = true;
    }

    public disbale() {
        this.showHelper();
        this.controls.enabled = false;
    }

    public showHelper() {
        this.cameraHelper.visible = true;
    }

    public hideHelper() {
        this.cameraHelper.visible = false;
    }

    public getDistance() {
        return this.distance;
    }

    update = (() => {
        var self = this;
        return (delta) => {
            self.distance = self.position.distanceTo(new THREE.Vector3(0,0,0));
            self.controls.zoomSpeed =
                ((self.distance - self.minDistance) / (self.maxDistance - self.minDistance) * (self.speed.max - self.speed.min))
                + self.speed.min;
        }
    })();

}