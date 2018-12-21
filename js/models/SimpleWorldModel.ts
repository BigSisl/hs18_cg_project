import * as THREE from "three";
import texture from "../../resources/gen/world_satellite.png";
import { WorldModel } from "./WorldModel";

export class SimpleWorldModel implements WorldModel {

    private sphere: THREE.Mesh;
    private material: THREE.MeshPhongMaterial;

    constructor(private scene: THREE.Scene) {
        var geometry = new THREE.SphereGeometry(15, 32, 32);
        var material = new THREE.MeshPhongMaterial({ color: 0x0000FF });
        this.sphere = new THREE.Mesh(geometry, material);

        this.sphere.position.set(0, 0, 0)
        this.sphere.castShadow = true
        this.sphere.receiveShadow = true
        scene.add(this.sphere);
    }

    loadTexture() {
        const loader = new THREE.TextureLoader()
        loader.load(texture, tex => {
            this.material = new THREE.MeshPhongMaterial({ map: tex });
            this.sphere.material = this.material
        })
    }

    load() {
        if (this.material == null) {
            this.loadTexture();
        }
        this.scene.add(this.sphere);
    }

    unload() {
        this.scene.remove(this.sphere);
    }

    update = (() => {
        var self = this;
        return (delta) => {
            self.sphere.rotation.y += 0.001 * delta
        }
    })();

}