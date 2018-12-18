import * as THREE from "three";
import texture from "../../resources/gen/world_satellite.png";
import vertexShader from "../../resources/shaders/world_curvature/VertexShader.glsl";
import fragmentShader from "../../resources/shaders/world_curvature/FragmentShader.glsl";

/**
 * This version uses a custom shader with an
 * extra attriubte, defining, how the sphere surface
 * should flatten in the direction to the camera.
 */
export class WorldCustomShader {

    private sphere: THREE.Mesh;
    private material: THREE.ShaderMaterial;

    constructor(scene: THREE.Scene) {
        var geometry = new THREE.SphereGeometry(15, 32, 32);

        var material = new THREE.MeshPhongMaterial({ color: 0x0000FF });
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                curvature: { type: 'f', value: 1.0 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })
        this.sphere = new THREE.Mesh(geometry, material);

        this.sphere.position.set(0, 0, 0)
        this.sphere.castShadow = true
        this.sphere.receiveShadow = true
        scene.add(this.sphere);
    }

    loadShader() {
        const loader = new THREE.Loader()
    //    loader.load(texture, tex => {
    //        var material = new THREE.MeshPhongMaterial({ map: tex });
    //        this.sphere.material = material
    //    })
    }

    loadTexture() {
        const loader = new THREE.TextureLoader()
        loader.load(texture, tex => {
            var material = new THREE.MeshPhongMaterial({ map: tex });
            this.sphere.material = material
        })
    }

    update = (() => {
        var self = this;
        return (delta) => {
            self.sphere.rotation.y += 0.01 * delta
        }
    })();

}