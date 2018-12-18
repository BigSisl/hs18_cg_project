import texture from "../../resources/gen/world_satellite.png";
import vertexShader from "../../resources/shaders/world_curvature/VertexShader.glsl";
import fragmentShader from "../../resources/shaders/world_curvature/FragmentShader.glsl";
import { WorldModel } from "./WorldModel";
import * as THREE from "three";

/**
 * This version uses a custom shader with an
 * extra attriubte, defining, how the sphere surface
 * should flatten in the direction to the camera.
 */
export class WorldCustomShader implements WorldModel {

    private sphere: THREE.Mesh;
    private material: THREE.ShaderMaterial;

    constructor(scene: THREE.Scene) {
        var geometry = new THREE.SphereGeometry(15, 32, 32);

        var material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });

        this.sphere = new THREE.Mesh(geometry, this.material);

        this.sphere.position.set(0, 0, 0)
        this.sphere.castShadow = true
        this.sphere.receiveShadow = true
        scene.add(this.sphere);
    }

    load() {
        this.loadTexture()
    }

    unload() {

    }

    loadTexture() {
        const loader = new THREE.TextureLoader()
        loader.load(texture, tex => {
            const basic = THREE.UniformsUtils.clone(THREE.ShaderLib['phong']);
            basic.uniforms.map.value = tex
            basic.uniforms.color = new THREE.Color( 0x00ffff );

            const shader = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: basic.uniforms
            });
            this.material = shader
            this.sphere.material = this.material
        })
    }

    update() {
        var self = this;
        return (delta) => {
            self.sphere.rotation.y += 0.01 * delta
        }
    }

}