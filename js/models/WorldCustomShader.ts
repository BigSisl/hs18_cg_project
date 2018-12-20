import texture from "../../resources/gen/world_satellite.png";
import vertexShader from "../../resources/shaders/world_curvature/VertexShader.glsl";
import fragmentShader from "../../resources/shaders/world_curvature/FragmentShader.glsl";
import { WorldModel } from "./WorldModel";
import * as THREE from "three";
import { Vector3 } from "three";

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
//        scene.add(this.addWireframe());
    }

    addWireframe() {
        var wireframe = new THREE.WireframeGeometry( this.sphere.geometry );
        var line = new THREE.LineSegments( wireframe );
        line.material.depthTest = false;
        line.material.opacity = 0.25;
        line.material.transparent = true;
        return line;
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
            basic.uniforms.wireframe = true;

            basic.uniforms['uCurvature'] = { value: this.curvature };
            basic.uniforms['uMappingPos'] = { value: this.mappingPos };
            basic.uniforms['uLookAtMatrix'] = { value: new THREE.Matrix4().lookAt(this.sphere.position, this.mappingPos, this.sphere.up) };
            basic.uniforms['yRotation'] = { value: 0.0 };
            basic.uniforms['xzRotation'] = { value: 0.0 };

            const shader = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: basic.uniforms
            });
            this.material = shader
            this.sphere.material = this.material
        })
    }

    updateMappingPosition(mappingPos: THREE.Vector3) {
        this.mappingPos.copy(mappingPos);
//        this.mappingPos.y = 0;



        var quaternion = this.sphere.quaternion.clone();
        quaternion

        var xzPos = mappingPos.clone();
        var mNormalized = mappingPos.clone().normalize();
        xzPos.y = 0;
        xzPos.normalize();

        // Try using Quaternions
        //var yQuaternion = new THREE.Quaternion();
        //yQuaternion.setFromAxisAngle(xzPos, 0);
        //var mappingQuaternion = new THREE.Quaternion();

        // calculate rotation matrix, so sphere is looking at camera (prevent distortaion)
        this.material.uniforms['uLookAtMatrix'].value = new THREE.Matrix4().lookAt(this.sphere.position, this.mappingPos, new Vector3(0,1,0));

        var xyRot = xzPos.angleTo(new THREE.Vector3(0,0,1));
        if(xzPos.x < 0) {
            xyRot *= -1;
        }

        var yRot = mNormalized.angleTo(xzPos);
        if(xzPos.y > mNormalized.y) {
            yRot *= -1;
        }

        this.material.uniforms['yRotation'].value = yRot;
        this.material.uniforms['xzRotation'].value = xyRot;

        console.log( THREE.Math.radToDeg(xyRot));

        // try to recalculate euler orientation from mat4
        //var mat4: THREE.Matrix4 = this.material.uniforms['uLookAtMatrix'].value;
        //var gradZ = THREE.Math.radToDeg(Math.atan2(mat4.elements[4], mat4.elements[0]));
        //var gradX = THREE.Math.radToDeg(Math.atan2(mat4.elements[9], mat4.elements[10]));
        //var gradY = THREE.Math.radToDeg(Math.atan2(-mat4.elements[8], Math.sqrt(mat4.elements[9]^2 + mat4.elements[10]^2)));
      //   atan(-uLookAtMatrix[3][1], sqrt(exp2(uLookAtMatrix[3][2]) + exp2(uLookAtMatrix[3][3]))
      //  console.log(gradX,  gradY, gradZ);

//        console.log(mat4.elements);
//        console.log();
    }

    update = (() => {
        var self = this;
        var maximize = true;
        return (delta) => {
            self.sphere.rotation.y += 0.00 * delta



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