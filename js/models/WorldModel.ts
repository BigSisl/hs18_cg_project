import * as THREE from "three";
import texture from "../../resources/gen/world_satellite.png";

export class WorldModel {

    private sphere: THREE.Mesh;

    constructor(scene: THREE.Scene) {
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
            var material = new THREE.MeshPhongMaterial({ map: tex });
            this.sphere.material = material
        })
    }

    update() {
        var self = this;
        return () => {
            self.sphere.rotation.y += 0.01
        }
    }

}