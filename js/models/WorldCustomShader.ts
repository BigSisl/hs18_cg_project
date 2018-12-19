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

    private mappingPos = new THREE.Vector3( 1, 0, 0 );
    private curvature = 0.0;

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
        if(this.material == null) {
            this.loadTexture()
        }
    }

    unload() {

    }

    setCurvature(curvature: number) {
        this.material.uniforms['uCurvature'].value = curvature;
    }

    getCurvature() {
        return this.material.uniforms['uCurvature'].value;
    }

    loadTexture() {
        const loader = new THREE.TextureLoader()
        loader.load(texture, tex => {
            const basic = THREE.UniformsUtils.clone(THREE.ShaderLib['phong']);
            basic.uniforms.map.value = tex
            basic.uniforms.color = new THREE.Color( 0x00ffff );

            basic.uniforms['uCurvature'] = { value: this.curvature };
            basic.uniforms['uMappingPos'] = { value: this.mappingPos };

            const shader = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: basic.uniforms
            });
            this.material = shader
            this.sphere.material = this.material
        })
    }

    update = (() => {
        var self = this;
        var maximize = true;
        return (delta) => {
            self.sphere.rotation.y += 0.01 * delta

           /* let curvature = self.getCurvature();
            curvature += 0.1 * delta * (maximize ? 1 : -1);
            if(curvature >= 1.0) {
                curvature = 1.0;
                maximize = false;
            } else if(curvature <= 0.0) {
                curvature = 0.0;
                maximize = true;
            } */
            self.setCurvature(0.0);
        }
    })();

}