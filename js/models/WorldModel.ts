import { Scene, Mesh, MeshPhongMaterial, BoxGeometry, SphereGeometry } from "three";

export class WorldModel {

    private cube: Mesh;
    constructor(private scene: Scene) {
        var geometry = new SphereGeometry(15, 32, 32);
        var material = new MeshPhongMaterial({ color: 0x0000FF });
        var sphere = new Mesh(geometry, material);
        sphere.position.set(0, 0, 0)
        sphere.castShadow = true
        sphere.receiveShadow = true
        scene.add(sphere);
        this.cube = sphere;
    }

    update() {
        var self = this;
        return (delta: number) => {
            self.cube.rotation.x += 0.01
            self.cube.rotation.y += 0.01
        }
    }

}