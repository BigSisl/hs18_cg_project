import * as THREE from "three";

// Force full reload on parcel hot module swap
if ((<any>module).hot) {
    (<any>module).hot.dispose(() => window.location.reload())
}


var scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0)
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-5, 3, 5)
camera.lookAt(0, 0, 0)

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

var light = new THREE.HemisphereLight(0xffffff, 0x444444)
light.position.set(0, 20, 0)
scene.add(light)

var dlight = new THREE.DirectionalLight(0xffffff)
dlight.position.set(0, 20, 10)
dlight.castShadow = true
scene.add(dlight)

var mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
)
mesh.receiveShadow = true
mesh.rotation.x = -Math.PI / 2
scene.add(mesh)

var grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
if (grid.material instanceof THREE.Material) {
    grid.material.opacity = 0.2
    grid.material.transparent = true
}
scene.add(grid)

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshPhongMaterial({ color: 0x0000FF });
var cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 2, 0)
cube.castShadow = true
cube.receiveShadow = true
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderer.render(scene, camera);
}
animate();
