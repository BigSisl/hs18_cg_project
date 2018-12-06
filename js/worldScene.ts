import * as THREE from "three";

export class WorldScene {

    private clock = new THREE.Clock();
    private callbacks: Function[] = []

    constructor(
        private scene : THREE.Scene,
        private camera: THREE.Camera,
    ) { }

    public addUpdate(callback: (delta: number) => void) {
        this.removeUpdate(callback);
        this.callbacks.push(callback);
    }

    public removeUpdate(callback: (delta: number) => void) {
        let index = this.callbacks.indexOf(callback);
        if(index >= 0) {
            delete this.callbacks[index];
        }
    }

    public draw() {
        var delta = this.clock.getDelta()
        this.callbacks.forEach((value) => {
            value(delta);
        });
    }

    public setDevEnvironment() {
        var light = new THREE.HemisphereLight(0xffffff, 0x444444)
        light.position.set(0, 20, 0)
        this.scene.add(light)

        var dlight = new THREE.DirectionalLight(0xffffff)
        dlight.position.set(0, 20, 10)
        dlight.castShadow = true
        this.scene.add(dlight)

        var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2000, 2000),
            new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
        )
        mesh.receiveShadow = true
        mesh.rotation.x = -Math.PI / 2
        this.scene.add(mesh)

        var grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
        if (grid.material instanceof THREE.Material) {
            grid.material.opacity = 0.2
            grid.material.transparent = true
        }
        this.scene.add(grid)
    }

}