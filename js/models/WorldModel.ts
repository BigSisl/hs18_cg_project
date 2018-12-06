import { Scene, Mesh, MeshPhongMaterial, BoxGeometry } from "three";

export class WorldModel {

    private cube: Mesh;

    constructor(private scene: Scene) {
        var geometry = new BoxGeometry(1, 1, 1);
        var material = new MeshPhongMaterial({ color: 0x0000FF });
        var cube = new Mesh(geometry, material);
        cube.position.set(0, 2, 0)
        cube.castShadow = true
        cube.receiveShadow = true
        scene.add(cube);
        this.cube = cube;
    }

    update() {
        var self = this;
        return (delta: number) => {
            self.cube.rotation.x += 0.01
            self.cube.rotation.y += 0.01
        }
    }

}