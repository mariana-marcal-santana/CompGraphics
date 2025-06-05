import * as THREE from "three";
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/webxr/VRButton.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, camera, renderer;
let terrain, skydome, shadowing;
let moonMesh, houseGroup, ovni;
let trees = [];
let pointLights = [], spotLight, spotTarget;
let calcLightsOn = true;
let keys = [];
let moveovniR = 0, moveovniL = 0, numLights = 6, moveovniF = 0, moveovniB = 0;
let directionalLight;
let isDirectionalLightOn = false, isSpotLightOn = true, isPointLightsOn = true;
let lightsCounter = 2; // Ovni lights on in inicialization

const materials = {terrain: {}, moon: {}, house: {}, trees: {}, ovni: {}, };
const radius = 150;
const loader = new THREE.TextureLoader();
const texture = loader.load('js/heightmap/heightmap1.png');

/////////////////////
/* CREATE MATERIALS */
/////////////////////
function createMaterials() {
    'use strict';
    materials.terrain = {
        lambert: new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, bumpMap: texture, bumpScale: 10, displacementMap: texture, displacementScale: 30}),
        basic:   new THREE.MeshBasicMaterial(),
        phong:   new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, bumpMap: texture, bumpScale: 10, displacementMap: texture, displacementScale: 30}),
        toon:    new THREE.MeshToonMaterial({ side: THREE.DoubleSide, bumpMap: texture, bumpScale: 10, displacementMap: texture, displacementScale: 30}),
    };

    materials.moon = {
        lambert: new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x000000 }),
        basic:   new THREE.MeshBasicMaterial({ color: 0xffffff }),
        phong:   new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x000000 }),
        toon:    new THREE.MeshToonMaterial({ color: 0xffffff, emissive: 0x000000}),
    };

    materials.house = {
        wall: {
            lambert: new THREE.MeshLambertMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide }),
            basic:   new THREE.MeshBasicMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide }),
            phong:   new THREE.MeshPhongMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide }),
            toon:    new THREE.MeshToonMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide }),
        },
        roof: {
            lambert: new THREE.MeshLambertMaterial({ color: 0xff6600, side: THREE.DoubleSide }),
            basic:   new THREE.MeshBasicMaterial({ color: 0xff6600, side: THREE.DoubleSide }),
            phong:   new THREE.MeshPhongMaterial({ color: 0xff6600, side: THREE.DoubleSide }),
            toon:    new THREE.MeshToonMaterial({ color: 0xff6600, side: THREE.DoubleSide }),
        },
        doorWindow: {
            lambert: new THREE.MeshLambertMaterial({ color: 0x3399ff, side: THREE.DoubleSide }),
            basic:   new THREE.MeshBasicMaterial({ color: 0x3399ff, side: THREE.DoubleSide }),
            phong:   new THREE.MeshPhongMaterial({ color: 0x3399ff, side: THREE.DoubleSide }),
            toon:    new THREE.MeshToonMaterial({ color: 0x3399ff, side: THREE.DoubleSide }),
        }
    };

    materials.trees = {
        trunk: {
            lambert: new THREE.MeshLambertMaterial({ color: 0xD2691E }),
            basic:   new THREE.MeshBasicMaterial({ color: 0xD2691E }),
            phong:   new THREE.MeshPhongMaterial({ color: 0xD2691E }),
            toon:    new THREE.MeshToonMaterial({ color: 0xD2691E }),
        },
        leaves: {
            lambert: new THREE.MeshLambertMaterial({ color: 0x228B22 }),
            basic:   new THREE.MeshBasicMaterial({ color: 0x228B22 }),
            phong:   new THREE.MeshPhongMaterial({ color: 0x228B22 }),
            toon:    new THREE.MeshToonMaterial({ color: 0x228B22 }),
        }
    };

    materials.ovni = {
        body: {
            lambert: new THREE.MeshLambertMaterial({ color: 0x999999 }),
            basic:   new THREE.MeshBasicMaterial({ color: 0x999999 }),
            phong:   new THREE.MeshPhongMaterial({ color: 0x999999 }),
            toon:    new THREE.MeshToonMaterial({ color: 0x999999 }),
        },
        cockpit: {
            lambert: new THREE.MeshLambertMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 }),
            basic:   new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 }),
            phong:   new THREE.MeshPhongMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 }),
            toon:    new THREE.MeshToonMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 }),
        },
        lights: {
            lambert: new THREE.MeshLambertMaterial({ color: 0xffff00 }),
            basic:   new THREE.MeshBasicMaterial({ color: 0xffff00 }),
            phong:   new THREE.MeshPhongMaterial({ color: 0xffff00 }),
            toon:    new THREE.MeshToonMaterial({ color: 0xffff00 }),
        }
    };
}

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.position.set(0, -25, 0);
    scene.background = new THREE.Color('#ffffff'); 

    createSkydome();
    createTerrain();
    createMoon();
    createTrees();
    createHouse(-50,15,20);
    createOvni();
    createDirectionalLight();
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
    camera.position.set(0, 20, 80);  
    camera.lookAt(0, 0, 0);    
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function createDirectionalLight() {
    'use strict';
    directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(60, 60, 0);
}

function toggleDirectionalLight() {
    'use strict';
    if (!isDirectionalLightOn) { 
        scene.remove(directionalLight);
        lightsCounter--;
        if(moonMesh.material != materials.moon.basic)
            moonMesh.material.emissive.setHex(0x000000);
    } 
    else {
        scene.add(directionalLight);
        lightsCounter++;
        if(moonMesh.material != materials.moon.basic)
            moonMesh.material.emissive.setHex(0xffffff);
    }
}

function toggleSpotlight() {
    'use strict';
    if (isSpotLightOn) {
        spotLight.visible = true;
        lightsCounter++;
    }
    else {
        spotLight.visible = false;
        lightsCounter--;
    }
}

function togglePointlight() {
    'use strict';
    if (isPointLightsOn) {
        pointLights.forEach(light => light.visible = true);
        lightsCounter++;
    }
    else {
        pointLights.forEach(light => light.visible = false);
        lightsCounter--;
    }
}
////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createTerrain() {
    'use strict';

    terrain = new THREE.Object3D();
    const geometry = new THREE.PlaneGeometry(radius * 2, radius * 2, 256, 256);
    
    const terrainMesh = new THREE.Mesh(geometry, materials.terrain.phong);

    terrain.add(terrainMesh);
    terrain.rotation.x = - Math.PI / 2; 
    scene.add(terrain);
}

function createSkydome() {
    'use strict';

    skydome = new THREE.Object3D();
    const geometry = new THREE.SphereGeometry(radius, 32, 16, 0, 2 * Math.PI, 0, 0.5 * Math.PI);
    const skydomeMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));

    skydome.add(skydomeMesh);
    scene.add(skydome);
}

function createMoon() {
    'use strict';

    const moonGeometry = new THREE.SphereGeometry(4, 64, 64);
    moonMesh = new THREE.Mesh(moonGeometry, materials.moon.lambert);

    moonMesh.position.set(60, 60, 0);
    scene.add(moonMesh);
}

function createTrees() {
    'use strict';

    createTree(11, 3, 25, 15, 5);
    createTree(7.5, 12, 10, 25, 5);
    createTree(10, 7.5, 0, 27.5, 40);
    createTree(8, 4.5, 15, 20, -20);

    for (const tree of trees)
        scene.add(tree);
}

function createTree(height, rotation, x, y, z) {
    'use strict';
    
    const treeGroup = new THREE.Group();
    
    const mainTrunkGeometry = new THREE.CylinderGeometry(1, 1, height, 8);
    const mainTrunkMesh = new THREE.Mesh(mainTrunkGeometry, materials.trees.trunk.lambert);
    mainTrunkMesh.name = "mainTrunk";
    mainTrunkMesh.position.set(x, y + height / 2, z);
    mainTrunkMesh.rotation.x = 0.15;

    const secondaryTrunkGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.5 * height, 8);
    const secondaryTrunkMesh = new THREE.Mesh(secondaryTrunkGeometry, materials.trees.trunk.lambert);
    secondaryTrunkMesh.name = "secondaryTrunk";
    secondaryTrunkMesh.position.set(x, y + height / 2, z - 0.25 * height);
    secondaryTrunkMesh.rotation.y = rotation;
    secondaryTrunkMesh.rotation.x = 5;

    const mainLeavesGeometry = new THREE.SphereGeometry(0.5 * height, 8, 8);
    const mainLeavesMesh = new THREE.Mesh(mainLeavesGeometry, materials.trees.leaves.lambert);
    mainLeavesMesh.name = "mainLeaves";
    mainLeavesGeometry.scale(1, 0.5, 1);
    mainLeavesMesh.position.set(x, y + height, z);

    const secondaryLeavesGeometry = new THREE.SphereGeometry(0.25 * height, 8, 8);
    const secondaryLeavesMesh = new THREE.Mesh(secondaryLeavesGeometry, materials.trees.leaves.lambert);
    secondaryLeavesMesh.name = "secondaryLeaves";
    secondaryLeavesGeometry.scale(1, 0.5, 1);
    secondaryLeavesMesh.position.set(x, y + 0.65 * height, z - 0.5 * height);
    secondaryLeavesMesh.rotation.y = rotation;

    treeGroup.add(mainTrunkMesh);
    treeGroup.add(secondaryTrunkMesh);
    treeGroup.add(mainLeavesMesh);
    treeGroup.add(secondaryLeavesMesh);

    treeGroup.rotation.y = rotation;

    trees.push(treeGroup);
}

function createHouse(x, y, z) {
    'use strict';

    houseGroup = new THREE.Group();

    // Walls
    const wallGeometry = new THREE.BufferGeometry();
    const wallVertices = new Float32Array([
        // Front
        -9, 0, 3,   9, 0, 3,   9, 8, 3,
        -9, 0, 3,   9, 8, 3,  -9, 8, 3,
        // Right
        9, 0, -3,   9, 0, 3,   9, 8, 3,
        9, 0, -3,   9, 8, 3,   9, 8, -3,
    ]);
    wallGeometry.setAttribute('position', new THREE.BufferAttribute(wallVertices, 3));
    wallGeometry.computeVertexNormals();
    const wallMesh = new THREE.Mesh(wallGeometry, materials.house.wall.lambert);
    wallMesh.name = "wall";
    houseGroup.add(wallMesh);

    // Roof
    const roofGeometry = new THREE.BufferGeometry();
    const roofVertices = new Float32Array([
        // Front
        -9, 8, 3,   9, 8, 3,   0, 12, 3,
        // Right
         9, 8, -3,   9, 8, 3,   0, 12, 3,
         9, 8, -3,   0, 12, 3,   0, 12, -3,
        // Left
        -9, 8, -3,  -9, 8, 3,   0, 12, 3,
        -9, 8, -3,   0, 12, 3,   0, 12, -3
    ]);
    roofGeometry.setAttribute('position', new THREE.BufferAttribute(roofVertices, 3));
    roofGeometry.computeVertexNormals();
    const roofMesh = new THREE.Mesh(roofGeometry, materials.house.roof.lambert);
    roofMesh.name = "roof";
    houseGroup.add(roofMesh);

    // Door
    const doorGeometry = new THREE.BufferGeometry();
    const doorVertices = new Float32Array([
        -1.5, 0, 3.01,  1.5, 0, 3.01,  1.5, 4, 3.01,
        -1.5, 0, 3.01,  1.5, 4, 3.01, -1.5, 4, 3.01,
    ]);
    doorGeometry.setAttribute('position', new THREE.BufferAttribute(doorVertices, 3));
    doorGeometry.computeVertexNormals();
    const doorMesh = new THREE.Mesh(doorGeometry, materials.house.doorWindow.lambert);
    doorMesh.name = "door";
    houseGroup.add(doorMesh);

    // Front Windows
    const createWindow = (xPos, i) => {
        const winGeo = new THREE.BufferGeometry();
        const verts = new Float32Array([
            xPos - 1, 4, 3.01,  xPos + 1, 4, 3.01,  xPos + 1, 6, 3.01,
            xPos - 1, 4, 3.01,  xPos + 1, 6, 3.01,  xPos - 1, 6, 3.01,
        ]);
        winGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
        winGeo.computeVertexNormals();
        const mesh = new THREE.Mesh(winGeo, materials.house.doorWindow.lambert);
        mesh.name = `window-front-${i}`;
        return mesh;
    };
    const positions = [-7, -3.5, 3.5, 7];
    positions.forEach((pos, i) => {
        houseGroup.add(createWindow(pos, i));
    });

    // Side Window
    const sideWindowGeo = new THREE.BufferGeometry();
    const sw = new Float32Array([
        9.01, 4, -1,  9.01, 4, 1,  9.01, 6, 1,
        9.01, 4, -1,  9.01, 6, 1,  9.01, 6, -1,
    ]);
    sideWindowGeo.setAttribute('position', new THREE.BufferAttribute(sw, 3));
    sideWindowGeo.computeVertexNormals();
    const sideWindowMesh = new THREE.Mesh(sideWindowGeo, materials.house.doorWindow.lambert);
    sideWindowMesh.name = "window-side";
    houseGroup.add(sideWindowMesh);

    houseGroup.position.set(x, y, z);
    houseGroup.rotation.y = Math.PI / 8;
    scene.add(houseGroup);
}

function createOvni(){
    'use strict';
    ovni =  new THREE.Group();

    const bodyGeometry = new THREE.SphereGeometry(3, 32, 16);
    const body = new THREE.Mesh(bodyGeometry, materials.ovni.body.lambert);
    body.scale.y = 0.3;
    body.name = "ovniBody"
    ovni.add(body);

    const cockpitGeometry = new THREE.SphereGeometry(2.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpit = new THREE.Mesh(cockpitGeometry,  materials.ovni.cockpit.lambert);
    cockpit.name = "ovniCockpit"
    ovni.add(cockpit);

    const centerCylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    const centerCylinder = new THREE.Mesh(centerCylinderGeometry, materials.ovni.body.lambert);
    centerCylinder.position.y = -1;
    centerCylinder.name = "ovniBase"
    ovni.add(centerCylinder);

    const radius = 2.2;
    for (let i = 0; i < numLights; i++) {
        const angle = (i / numLights) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const light = new THREE.Mesh(lightGeometry, materials.ovni.lights.lambert);
        light.position.set(x, -0.8, z);
        light.name = `ovniLight${i}`;
        ovni.add(light);

        const pointLight = new THREE.PointLight(0xffffaa, 1, 10);
        pointLight.position.copy(light.position);
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
    
    ovni.position.set(0, 50, 20);
    ovni.scale.set(1.5, 1.5, 1.5);
    scene.add(ovni);
 
}

function switchToGouraudShading() {
    'use strict';
    terrain.children[0].material = materials.terrain.lambert;
    generateFieldTexture();
    moonMesh.material = materials.moon.lambert;
    
    for (const treeGroup of trees) {
        for (const child of treeGroup.children) {
            if (child.name.includes("Trunk")) 
                child.material = materials.trees.trunk.lambert;
            else if (child.name.includes("Leaves")) 
                child.material = materials.trees.leaves.lambert;
        }
    }
    
    for (const child of houseGroup.children) {
        if (child.name.includes("wall")) 
            child.material = materials.house.wall.lambert;
        else if (child.name.includes("roof")) 
            child.material = materials.house.roof.lambert;
        else if (child.name.includes("door") || child.name.includes("window")) 
            child.material = materials.house.doorWindow.lambert; 
    }

    for (const child of ovni.children) {
        if (child.name.includes("ovniBody") || child.name.includes("ovniBase")) 
            child.material = materials.ovni.body.lambert; 
        else if (child.name.includes("ovniLight")) 
            child.material = materials.ovni.lights.lambert; 
        else if (child.name.includes("ovniCockpit"))
            child.material = materials.ovni.cockpit.lambert; 
    }
}   

function switchToPhongShading() {
    'use strict';
    terrain.children[0].material = materials.terrain.phong;
    generateFieldTexture();
    moonMesh.material = materials.moon.phong;
    
    for (const treeGroup of trees) {
        for (const child of treeGroup.children) {
            if (child.name.includes("Trunk")) 
                child.material = materials.trees.trunk.phong; 
            else if (child.name.includes("Leaves")) 
                child.material = materials.trees.leaves.phong;
        }
    }

    for (const child of houseGroup.children) {
        if (child.name.includes('wall')) 
            child.material = materials.house.wall.phong;
        else if (child.name.includes('roof')) 
            child.material = materials.house.roof.phong;
        else if (child.name.includes('door') || child.name.includes('window')) 
            child.material = materials.house.doorWindow.phong;  
    }
        
    for (const child of ovni.children) {
        if (child.name.includes("ovniBody")|| child.name.includes("ovniBase")) 
            child.material = materials.ovni.body.phong; 
        else if (child.name.includes("ovniLight")) 
            child.material = materials.ovni.lights.phong; 
        else if (child.name.includes("ovniCockpit"))
            child.material = materials.ovni.cockpit.phong; 
    }
}

function switchToCartoonShading() {
    'use strict';
    terrain.children[0].material = materials.terrain.toon;
    generateFieldTexture();
    moonMesh.material = materials.moon.toon;

    for (const treeGroup of trees) {
        for (const child of treeGroup.children) {
            if (child.name.includes("Trunk")) 
                child.material = materials.trees.trunk.toon; 
            else if (child.name.includes("Leaves")) 
                child.material = materials.trees.leaves.toon;
        }
    }
    
    for (const child of houseGroup.children) {
        if (child.name.includes('wall')) 
            child.material = materials.house.wall.toon;
        else if (child.name.includes('roof')) 
            child.material = materials.house.roof.toon;
        else if (child.name.includes('door') || child.name.includes('window')) 
            child.material = materials.house.doorWindow.toon;  
    }        
    
    for (const child of ovni.children) {
        if (child.name.includes("ovniBody")|| child.name.includes("ovniBase")) 
            child.material = materials.ovni.body.toon; 
        else if (child.name.includes("ovniLight")) 
            child.material = materials.ovni.lights.toon; 
        else if (child.name.includes("ovniCockpit"))
            child.material = materials.ovni.cockpit.toon;  
    }   
}

function switchToBasicShading() {
    if (shadowing == 'Basic') 
        return;
    shadowing = 'Basic';
    
    terrain.children[0].material = materials.terrain.basic;
    generateFieldTexture();
    moonMesh.material = materials.moon.basic;

    for (const treeGroup of trees) {
        for (const child of treeGroup.children) {
            if (child.name.includes("Trunk")) 
                child.material = materials.trees.trunk.basic; 
            else if (child.name.includes("Leaves")) 
                child.material = materials.trees.leaves.basic;
        }
    }
    
    for (const child of houseGroup.children) {
        if (child.name.includes('wall')) 
            child.material = materials.house.wall.basic;
        else if (child.name.includes('roof')) 
            child.material = materials.house.roof.basic;
        else if (child.name.includes('door') || child.name.includes('window')) 
            child.material = materials.house.doorWindow.basic;  
    }        
    
    for (const child of ovni.children) {
        if (child.name.includes("ovniBody")|| child.name.includes("ovniBase")) 
            child.material = materials.ovni.body.basic; 
        else if (child.name.includes("ovniLight")) 
            child.material = materials.ovni.lights.basic; 
        else if (child.name.includes("ovniCockpit"))
            child.material = materials.ovni.cockpit.basic;  
    }   
}

function changeLightsCalculation() {
    if (calcLightsOn) // Active to Inactive
        switchToBasicShading();
    else { // Inactive to Active
        if(shadowing == 'Gouraud')
            switchToGouraudShading();
        else if(shadowing == 'Phong')
            switchToPhongShading();
        else if(shadowing == 'Toon')
            switchToCartoonShading();

        if(isDirectionalLightOn)
            toggleDirectionalLight();
        
        if(isSpotLightOn)
            toggleSpotlight();

        if(isPointLightsOn)
            togglePointlight();
    }
    calcLightsOn = !calcLightsOn;
}

////////////
/* UPDATE */
////////////
function update() {
    ovni_movement();
}

function ovni_movement() {
    ovni.position.x += (moveovniL + moveovniR) * 0.4;
    ovni.position.z += (moveovniF + moveovniB) * 0.4;
    
    ovni.rotation.y += 0.1;

    spotTarget.position.set(ovni.position.x, ovni.position.y - 3, ovni.position.z);
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
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild( VRButton.createButton( renderer ) );

    createMaterials();
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
    update();

    render();

    renderer.setAnimationLoop(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict'; 
    if (keys[e.keyCode]) return;

    if (e.key === '1') {
        generateFieldTexture();
    } 
    else if (e.key === '2') {
        generateSkyTexture();
    } 
    else if (e.key === 'D' || e.key === 'd') {
        isDirectionalLightOn = !isDirectionalLightOn;
        if(calcLightsOn)
            toggleDirectionalLight();
    }
    else if (e.key === 'S' || e.key === 's') {
        isSpotLightOn = !isSpotLightOn;
        if(calcLightsOn)
            toggleSpotlight();
    }
    else if (e.key === 'P' || e.key === 'p') {
        isPointLightsOn = !isPointLightsOn;
        if(calcLightsOn)
            togglePointlight();
    }
    else if (e.key == 'ArrowLeft'|| e.key === 'arrowLeft') {
        moveovniL = -1;
    }
    else if (e.key == 'ArrowRight' || e.key === 'arrowRight') {
        moveovniR = 1;
    }
    else if (e.key == 'ArrowUp' || e.key === 'arrowUp') {
        moveovniF = 1;
    }
    else if (e.key == 'ArrowDown' || e.key === 'arrowDown') {
        moveovniB = -1;
    }
    else if ((e.key == 'Q' || e.key == 'q') && shadowing != 'Gouraud') {
        shadowing = 'Gouraud'
        if(calcLightsOn)
            switchToGouraudShading();
    }
    else if (e.key == 'W' || e.key == 'w' && shadowing != 'Phong') {
        shadowing = 'Phong'
        if(calcLightsOn)
            switchToPhongShading();
    }
    else if (e.key == 'E' || e.key == 'e' && shadowing != 'Toon') {
        shadowing = 'Toon'
        if(calcLightsOn)
            switchToCartoonShading();  
    }
    else if ((e.key == 'R' || e.key == 'r') && lightsCounter == 0) {
        changeLightsCalculation();
    }
    keys[e.keyCode] = true;
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    'use strict';
    keys[e.keyCode] = false;

    if (e.key == 'ArrowLeft'|| e.key === 'arrowLeft') {
        moveovniL = 0;
    }
    else if (e.key == 'ArrowRight' || e.key === 'arrowRight') {
        moveovniR = 0;
    }
    else if (e.key == 'ArrowUp' || e.key === 'arrowUp') {
        moveovniF = 0;
    }
    else if (e.key == 'ArrowDown' || e.key === 'arrowDown') {
        moveovniB = 0;
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

    if (mesh.material.map) mesh.material.map.dispose();

    mesh.material.map = texture;
    mesh.material.needsUpdate = true;
}

init();
animate();