import * as THREE from "three";
import { OrbitControls } from "../lib/OrbitControls";
import { TlsOptions } from "tls";
import { WorldCustomShader } from "./WorldCustomShader";
import { Object3D, Vector3 } from "three";
import { WorldModel, UpdateableWorld } from "./WorldModel";

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

class MaxMin<T> {
    readonly max: T;
    readonly min: T;
}

export class Camera extends THREE.PerspectiveCamera {

    private cameraHelper: THREE.CameraHelper;

    private maxDistance: number = 40.0;
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

    constructor(private scene: THREE.Scene, public world: UpdateableWorld) {
        super( 60, 1 * aspect, 1, 100 );

        this.position.set(0, 0, this.maxDistance);
        this.lookAt(0.0,0.0,0.0);

        this.controls = new OrbitControls(this);
        this.controls.enablePan = false;
        this.controls.maxDistance = this.maxDistance;
        this.controls.minDistance = this.minDistance;
        this.controls.maxAzimuthAngle = Infinity;
        this.controls.minAzimuthAngle = -Infinity;
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

    rotateAroundWorldAxisAroundObject(object, axis, radians) {
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

        // old code for Three.JS pre r54:
        //  rotWorldMatrix.multiply(object.matrix);
        // new code for Three.JS r55+:
        rotWorldMatrix.multiply(object.matrix);                // pre-multiply

        object.matrix = rotWorldMatrix;

        // old code for Three.js pre r49:
        // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
        // old code for Three.js pre r59:
        // object.rotation.setEulerFromRotationMatrix(object.matrix);
        // code for r59+:
        object.rotation.setFromRotationMatrix(object.matrix);
    }

    update = (() => {
        var self = this;
        var rad = 1;
        return (delta) => {
            self.distance = self.position.distanceTo(new THREE.Vector3(0,0,0));
            self.controls.zoomSpeed =
                ((self.distance - self.minDistance) / (self.maxDistance - self.minDistance) * (self.speed.max - self.speed.min))
                + self.speed.min;
            if (self.world != null) {
                self.world.updateMappingPosition(self.position);
            }

            var rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationAxis(new Vector3(0,1,0).normalize(), rad * delta );
            self.matrix = self.matrixWorld.multiply(rotationMatrix.multiply(self.matrixWorldInverse));

//            self.rotateOnWorldAxis(new THREE.Vector3(0,1,0), rad * delta);
        }
    })();

}