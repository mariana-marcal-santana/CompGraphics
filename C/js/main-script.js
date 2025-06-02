import * as THREE from "three";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, camera, renderer;
var terrain, skydome, geometry, mesh;
let ovni, pointLights = [], spotLight, spotTarget;
const clock = new THREE.Clock();
var delta;
let moonMesh;
var ovnimov = false, moveovniR = 0,moveovniL = 0, ovnispeed = 10, numLights = 6;
var isDirectionalLightOn = false, directionalLight;
const radius = 150;
const loader = new THREE.TextureLoader();
const texture = loader.load('js/heightmap/heightmap1.png');

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#ffffff'); 

    //createLights();
    createSkydome();
    createTerrain();
    createMoon();
    createTrees();
    createHouse(-50,15,20);
    createOvni();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    'use strict';
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        2000
    );
    camera.position.set(0, 25, 80);  // moved above and back
    camera.lookAt(0, 0, 0);            // looking at the center
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function toggleDirectionalLight() {
    'use strict';
    if (isDirectionalLightOn) {
        scene.remove(directionalLight);
        moonMesh.material.emissive.setHex(0x000000);
    } 
    else {
        directionalLight = new THREE.DirectionalLight(0xffffff, 4);
        directionalLight.position.copy(moonMesh.position);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        moonMesh.material.emissive.setHex(0xffffff);
    }
    isDirectionalLightOn = !isDirectionalLightOn;
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createTerrain() {
    'use strict';

    terrain = new THREE.Object3D();
   const geometry = new THREE.PlaneGeometry(radius * 2, radius * 2, 256, 256);

    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, bumpMap: texture, bumpScale: 10, 
        displacementMap: texture, displacementScale: 30}));

    terrain.add(mesh);
    terrain.rotation.x = - Math.PI / 2; 
    scene.add(terrain);
}

function createSkydome() {
    'use strict';

    skydome = new THREE.Object3D();
    geometry = new THREE.SphereGeometry(radius, 32, 16, 0, 2 * Math.PI, 0, 0.5 * Math.PI);
    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));

    skydome.add(mesh);
    scene.add(skydome);
}

function createMoon() {
    'use strict';

    const moonGeometry = new THREE.SphereGeometry(4, 64, 64);
    const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x000000 });
    moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

    moonMesh.position.set(50, 45, 0);
    scene.add(moonMesh);
}

function createTrees() {
    'use strict';

    createTree(10, 5, 25, 15, 5);
    createTree(7.5, 10, 10, 15, 10);
    createTree(12.5, 5, 0, 12.5, 30);
    createTree(10, 5, 25, 20, -20);
}

function createTree(height, rotation, x, y, z) {
    'use strict';
    
    const treeGroup = new THREE.Group();

    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0xD2691E });

    const mainTrunkGeometry = new THREE.CylinderGeometry(1, 1, height, 8);
    const mainTrunkMesh = new THREE.Mesh(mainTrunkGeometry, trunkMaterial);
    mainTrunkMesh.position.set(x, y + height / 2, z);
    mainTrunkMesh.rotation.x = 0.15;

    const secondaryTrunkGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.5 * height, 8);
    const secondaryTrunkMesh = new THREE.Mesh(secondaryTrunkGeometry, trunkMaterial);
    secondaryTrunkMesh.position.set(x, y + height / 2, z - 0.25 * height);
    secondaryTrunkMesh.rotation.y = rotation;
    secondaryTrunkMesh.rotation.x = 5;

    const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });

    const mainLeavesGeometry = new THREE.SphereGeometry(0.5 * height, 8, 8);
    const mainLeavesMesh = new THREE.Mesh(mainLeavesGeometry, leavesMaterial);
    mainLeavesGeometry.scale(1, 0.5, 1);
    mainLeavesMesh.position.set(x, y + height, z);

    const secondaryLeavesGeometry = new THREE.SphereGeometry(0.25 * height, 8, 8);
    const secondaryLeavesMesh = new THREE.Mesh(secondaryLeavesGeometry, leavesMaterial);
    secondaryLeavesGeometry.scale(1, 0.5, 1);
    secondaryLeavesMesh.position.set(x, y + 0.65 * height, z - 0.5 * height);
    secondaryLeavesMesh.rotation.y = rotation;

    treeGroup.add(mainTrunkMesh);
    treeGroup.add(secondaryTrunkMesh);
    treeGroup.add(mainLeavesMesh);
    treeGroup.add(secondaryLeavesMesh);

    treeGroup.rotation.y = rotation;

    scene.add(treeGroup);
}

function createHouse(x, y, z) {
    'use strict';

    const houseGroup = new THREE.Group();

    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide });
    // const borderMaterial = new THREE.MeshPhongMaterial({ color: 0x1a66ff, side: THREE.DoubleSide });
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600, side: THREE.DoubleSide });
    const doorWindowMaterial = new THREE.MeshPhongMaterial({ color: 0x3399ff, side: THREE.DoubleSide });

    // Corpo da casa
    const bodyGeometry = new THREE.BoxGeometry(18, 8, 6);
    const bodyMesh = new THREE.Mesh(bodyGeometry, wallMaterial);
    bodyMesh.position.set(0, 4, 0);  
    houseGroup.add(bodyMesh);

    // // Bordado 
    // const borderGeometry = new THREE.BoxGeometry(18, 2, 6);
    // const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
    // borderMesh.position.set(0, 0.5, 0);
    // houseGroup.add(borderMesh);

    // Telhado
    const roofHeight = 4;
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-9, 0);  
    roofShape.lineTo(0, roofHeight);
    roofShape.lineTo(9, 0);
    roofShape.lineTo(-9, 0);

    const extrudeSettings = { depth: 6, bevelEnabled: false };
    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
    roofMesh.position.set(0, 8, -3); 
    houseGroup.add(roofMesh);

    // Porta 
    const doorGeometry = new THREE.PlaneGeometry(3, 4);
    const doorMesh = new THREE.Mesh(doorGeometry, doorWindowMaterial);
    doorMesh.position.set(0, 2, 3.01);
    houseGroup.add(doorMesh);

    // Janelas 
    const windowGeometry = new THREE.PlaneGeometry(2, 2);

    const windowMeshFarLeft = new THREE.Mesh(windowGeometry, doorWindowMaterial);
    windowMeshFarLeft.position.set(-7, 5, 3.01);  
    houseGroup.add(windowMeshFarLeft);

    const windowMeshLeft = new THREE.Mesh(windowGeometry, doorWindowMaterial);
    windowMeshLeft.position.set(-3.5, 5, 3.01);
    houseGroup.add(windowMeshLeft);

    const windowMeshRight = new THREE.Mesh(windowGeometry, doorWindowMaterial);
    windowMeshRight.position.set(3.5, 5, 3.01);
    houseGroup.add(windowMeshRight);

    const windowMeshFarRight = new THREE.Mesh(windowGeometry, doorWindowMaterial);
    windowMeshFarRight.position.set(7, 5, 3.01);
    houseGroup.add(windowMeshFarRight);


    const sideWindow1 = new THREE.Mesh(windowGeometry, doorWindowMaterial);
    sideWindow1.position.set(9.01, 5, 0); 
    sideWindow1.rotation.y = -Math.PI / 2;
    houseGroup.add(sideWindow1);


    houseGroup.position.set(x, y, z);
    houseGroup.rotation.y = Math.PI /8;

    scene.add(houseGroup);
}

function createOvni(){
    'use strict';
    ovni =  new THREE.Group();

    const bodyGeometry = new THREE.SphereGeometry(3, 32, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.y = 0.3;
    ovni.add(body);

    const cockpitGeometry = new THREE.SphereGeometry(2.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    ovni.add(cockpit);

    const centerCylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    const centerCylinder = new THREE.Mesh(centerCylinderGeometry, bodyMaterial);
    centerCylinder.position.y = -1;
    ovni.add(centerCylinder);

    const radius = 2.2;
    for (let i = 0; i < numLights; i++) {
        const angle = (i / numLights) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const luzGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const luz = new THREE.Mesh(luzGeometry, new THREE.MeshPhongMaterial({ color: 0xffff00 }));
        luz.position.set(x, -0.8, z);
        ovni.add(luz);

        const pointLight = new THREE.PointLight(0xffffaa, 1, 10);
        pointLight.position.copy(luz.position);
        pointLight.castShadow = false;
        ovni.add(pointLight);
        pointLights.push(pointLight);
    }

    spotLight = new THREE.SpotLight(0xffff00, 3000, 100, Math.PI / 2, 0.5);
    spotLight.position.set(0, -1.5, 0); 
    spotLight.castShadow = true;

    spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, -3, 0); 

    scene.add(spotTarget); 
    spotLight.target = spotTarget;

    ovni.add(spotLight);
    
    ovni.position.set(0, 35, 20);
    ovni.scale.set(1.5, 1.5, 1.5);
    scene.add(ovni);
 
}
//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

function ovni_movement(delta) {
    if(ovnimov){
        ovni.position.x += (moveovniL + moveovniR) * delta * ovnispeed;
    }
    ovni.rotation.y += ovnispeed * delta;

    spotTarget.position.set(ovni.position.x, ovni.position.y - 3, ovni.position.z);
}
////////////
/* UPDATE */
////////////
function update() {
    
}

/////////////
/* DISPLAY */
/////////////
function render() {
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameras();

    generateFieldTexture();
    generateSkyTexture();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

    delta = clock.getDelta();
    
    ovni_movement(delta);
    update(delta);
    // controls.update();
    render();

    //requestAnimationFrame(animate);
    renderer.setAnimationLoop(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

    // renderer.setSize(window.innerWidth, window.innerHeight);

    // if (window.innerHeight > 0 && window.innerWidth > 0) {
    //     camera.aspect = window.innerWidth / window.innerHeight;
    //     camera.updateProjectionMatrix();
    // }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';
    
    if (e.key === '1') {
        generateFieldTexture();
    } 
    else if (e.key === '2') {
        generateSkyTexture();
    } 
    else if (e.key === 'D' || e.key === 'd') {
        toggleDirectionalLight();
    }
    else if (e.key === 'S' || e.key === 's') {
        spotLight.visible = !spotLight.visible;
    }
    else if (e.key === 'P' || e.key === 'p') {
        pointLights.forEach(light => light.visible = !light.visible);
    }
    else if (e.key == 'ArrowLeft'|| e.key === 'arrowLeft') {
        ovnimov= true;
        moveovniL = -1;
    }
    else if (e.key == 'ArrowRight' || e.key === 'arrowRight') {
        ovnimov= true;
        moveovniR = 1;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    'use strict';
    if (e.key == 'ArrowLeft'|| e.key === 'arrowLeft') {
        ovnimov= false;
        moveovniL = 0;
    }
    else if (e.key == 'ArrowRight' || e.key === 'arrowRight') {
        ovnimov= false;
        moveovniR = 0;
    }
}

function generateFieldTexture() {
    'use strict';

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#82D173';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors = ['white', 'yellow', 'violet', 'lightblue'];
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 1 + Math.random() * 2; 
        ctx.beginPath();
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    applyCanvasTexture(canvas, 'terrain');
}

function generateSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, canvas.height * 0.75, 0, canvas.height);
    gradient.addColorStop(0, '#030357');
    gradient.addColorStop(1, '#330033');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random();
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    applyCanvasTexture(canvas, 'skydome');
}

function applyCanvasTexture(canvas, target) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    let mesh;
    if (target === 'terrain') {
        mesh = terrain.children[0];
    } else if (target === 'skydome') {
        mesh = skydome.children[0];
    }

    // Dispose old texture if it exists
    if (mesh.material.map) mesh.material.map.dispose();

    mesh.material.map = texture;
    mesh.material.needsUpdate = true;

    // render();
}

init();
animate();