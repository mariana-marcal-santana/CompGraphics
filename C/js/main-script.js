import * as THREE from "three";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, camera, renderer;
let terrain, skydome, shadowing;
let moonMesh, treeGroup, houseGroup, ovni;
let pointLights = [], spotLight, spotTarget;
let delta;
let ovnimov = false, moveovniR = 0,moveovniL = 0, numLights = 6;
let isDirectionalLightOn = false, directionalLight;

const materials = {terrain: {}, skydome: {}, moon: {}, house: {}, trees: {}, ovni: {}, };
const clock = new THREE.Clock();
const radius = 150;
const loader = new THREE.TextureLoader();
const texture = loader.load('js/heightmap/heightmap1.png');

/////////////////////
/* CREATE MATERIALS */
/////////////////////
function createMaterials() {
    'use strict';

    const commonProps = { side: THREE.DoubleSide };

    materials.moon = {
        lambert: new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x000000 }),
        basic:   new THREE.MeshBasicMaterial({ color: 0xffffff }),
        phong:   new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x000000 }),
        toon:    new THREE.MeshToonMaterial({ color: 0xffffff, emissive: 0x000000}),
    };

    materials.house = {
        wall: {
            lambert: new THREE.MeshLambertMaterial({ color: 0xf0f0f0, ...commonProps }),
            basic:   new THREE.MeshBasicMaterial({ color: 0xf0f0f0, ...commonProps }),
            phong:   new THREE.MeshPhongMaterial({ color: 0xf0f0f0, ...commonProps }),
            toon:    new THREE.MeshToonMaterial({ color: 0xf0f0f0, ...commonProps }),
        },
        roof: {
            lambert: new THREE.MeshLambertMaterial({ color: 0xff6600, ...commonProps }),
            basic:   new THREE.MeshBasicMaterial({ color: 0xff6600, ...commonProps }),
            phong:   new THREE.MeshPhongMaterial({ color: 0xff6600, ...commonProps }),
            toon:    new THREE.MeshToonMaterial({ color: 0xff6600, ...commonProps }),
        },
        doorWindow: {
            lambert: new THREE.MeshLambertMaterial({ color: 0x3399ff, ...commonProps }),
            basic:   new THREE.MeshBasicMaterial({ color: 0x3399ff, ...commonProps }),
            phong:   new THREE.MeshPhongMaterial({ color: 0x3399ff, ...commonProps }),
            toon:    new THREE.MeshToonMaterial({ color: 0x3399ff, ...commonProps }),
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
    scene.background = new THREE.Color('#ffffff'); 

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
    camera.position.set(0, 40, 80);  
    camera.lookAt(0, 0, 0);    
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function toggleDirectionalLight() {
    'use strict';
    if (isDirectionalLightOn) {
        scene.remove(directionalLight);
        if(moonMesh.material != materials.moon.basic)
            moonMesh.material.emissive.setHex(0x000000);
    } 
    else {
        directionalLight = new THREE.DirectionalLight(0xffffff, 4);
        directionalLight.position.copy(moonMesh.position);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        if(moonMesh.material != materials.moon.basic)
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
    
    const terrainMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, bumpMap: texture, bumpScale: 10, 
        displacementMap: texture, displacementScale: 30}));

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

    moonMesh.position.set(50, 45, 0);
    scene.add(moonMesh);
}

function createTrees() {
    'use strict';

    createTree(10, 3, 25, 15, 5);
    createTree(7.5, 12, 20, 25, 10);
    createTree(10, 7.5, -20, 22.5, 50);
    createTree(8, 4.5, 30, 25, -25);
}

function createTree(height, rotation, x, y, z) {
    'use strict';
    
    treeGroup = new THREE.Group();

    const mainTrunkGeometry = new THREE.CylinderGeometry(1, 1, height, 8);
    const mainTrunkMesh = new THREE.Mesh(mainTrunkGeometry, materials.trees.trunk.lambert);
    mainTrunkMesh.position.set(x, y + height / 2, z);
    mainTrunkMesh.rotation.x = 0.15;

    const secondaryTrunkGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.5 * height, 8);
    const secondaryTrunkMesh = new THREE.Mesh(secondaryTrunkGeometry, materials.trees.trunk.lambert);
    secondaryTrunkMesh.position.set(x, y + height / 2, z - 0.25 * height);
    secondaryTrunkMesh.rotation.y = rotation;
    secondaryTrunkMesh.rotation.x = 5;

    
    const mainLeavesGeometry = new THREE.SphereGeometry(0.5 * height, 8, 8);
    const mainLeavesMesh = new THREE.Mesh(mainLeavesGeometry, materials.trees.leaves.lambert);
    mainLeavesGeometry.scale(1, 0.5, 1);
    mainLeavesMesh.position.set(x, y + height, z);

    const secondaryLeavesGeometry = new THREE.SphereGeometry(0.25 * height, 8, 8);
    const secondaryLeavesMesh = new THREE.Mesh(secondaryLeavesGeometry, materials.trees.leaves.lambert);
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

    houseGroup = new THREE.Group();

    // Corpo da casa
    const wallGeometry = new THREE.BufferGeometry();
    const wallVertices = new Float32Array([
        // Frente
        -9, 0, 3,   9, 0, 3,   9, 8, 3,
        -9, 0, 3,   9, 8, 3,  -9, 8, 3,
        // Direita
        9, 0, -3,   9, 0, 3,   9, 8, 3,
        9, 0, -3,   9, 8, 3,   9, 8, -3,
    ]);
    wallGeometry.setAttribute('position', new THREE.BufferAttribute(wallVertices, 3));
    wallGeometry.computeVertexNormals();
    const wallMesh = new THREE.Mesh(wallGeometry, materials.house.wall.lambert);
    wallMesh.name = "wall";
    houseGroup.add(wallMesh);

    // Telhado
    const roofGeometry = new THREE.BufferGeometry();
    const roofVertices = new Float32Array([
        // Frente
        -9, 8, 3,   9, 8, 3,   0, 12, 3,
        // Direita
         9, 8, -3,   9, 8, 3,   0, 12, 3,
         9, 8, -3,   0, 12, 3,   0, 12, -3,
    ]);
    roofGeometry.setAttribute('position', new THREE.BufferAttribute(roofVertices, 3));
    roofGeometry.computeVertexNormals();
    const roofMesh = new THREE.Mesh(roofGeometry, materials.house.roof.lambert);
    roofMesh.name = "roof";
    houseGroup.add(roofMesh);

    // Porta
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

    // Janelas Frontais
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

    // Janela Lateral
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
    ovni.add(body);

    const cockpitGeometry = new THREE.SphereGeometry(2.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpit = new THREE.Mesh(cockpitGeometry,  materials.ovni.cockpit.lambert);
    ovni.add(cockpit);

    const centerCylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    const centerCylinder = new THREE.Mesh(centerCylinderGeometry, materials.ovni.body.lambert);
    centerCylinder.position.y = -1;
    ovni.add(centerCylinder);

    const radius = 2.2;
    for (let i = 0; i < numLights; i++) {
        const angle = (i / numLights) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const luzGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const luz = new THREE.Mesh(luzGeometry, materials.ovni.lights.lambert);
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
    
    ovni.position.set(0, 40, 20);
    ovni.scale.set(1.5, 1.5, 1.5);
    scene.add(ovni);
 
}

function switchToGouraudShading() {
    if (shadowing == 'Gouraud') 
        return;
    shadowing = 'Gouraud';
    moonMesh.material = materials.moon.lambert;
    for (const key in treeGroup) {
        if (key.includes('Trunk')) 
            treeGroup[key].material = materials.trunk.lambert;
        else if (key.includes('Leaves')) 
            treeGroup[key].material = materials.leaves.lambert;
    }  
    for (const child of houseGroup.children) {
        if (child.name.includes('wall')) 
            child.material = materials.house.wall.lambert;
        else if (child.name.includes('roof')) 
            child.material = materials.house.roof.lambert;
        else if (child.name.includes('door') || child.name.includes('window')) 
            child.material = materials.house.doorWindow.lambert;  
    }
    for (const child of ovni.children) {
        if (child instanceof THREE.Mesh) {
            if (child.geometry instanceof THREE.SphereGeometry) {
                if (child.scale.y === 0.3) 
                    child.material = materials.ovni.body.lambert;
                else if (child.geometry.parameters.phiLength < Math.PI) 
                    child.material = materials.ovni.cockpit.lambert;
                else 
                    child.material = materials.ovni.lights.lambert;
            } else if (child.geometry instanceof THREE.CylinderGeometry) {
                child.material = materials.ovni.body.lambert; 
            }
        }
    }
}
    

function switchToPhongShading() {
    if (shadowing == 'Phong') 
        return;
    shadowing = 'Phong';
    moonMesh.material = materials.moon.phong;
    for (const key in treeGroup) {
        if (key.includes('Trunk')) 
            treeGroup[key].material = materials.trunk.phong;
        else if (key.includes('Leaves')) 
            treeGroup[key].material = materials.leaves.phong;
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
        if (child instanceof THREE.Mesh) {
            if (child.geometry instanceof THREE.SphereGeometry) {
                if (child.scale.y === 0.3) 
                    child.material = materials.ovni.body.phong;
                else if (child.geometry.parameters.phiLength < Math.PI) 
                    child.material = materials.ovni.cockpit.phong;
                else 
                    child.material = materials.ovni.lights.phong;
            } else if (child.geometry instanceof THREE.CylinderGeometry) {
                child.material = materials.ovni.body.phong; 
            }
        }
    }
}

function switchToCartoonShading() {
    if (shadowing == 'Cartoon') 
        return;
    shadowing = 'Cartoon';
    moonMesh.material = materials.moon.toon;
    for (const key in treeGroup) {
        if (key.includes('Trunk')) 
            treeGroup[key].material = materials.trunk.toon;
        else if (key.includes('Leaves')) 
            treeGroup[key].material = materials.leaves.toon;
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
        if (child instanceof THREE.Mesh) {
            if (child.geometry instanceof THREE.SphereGeometry) {
                if (child.scale.y === 0.3) 
                    child.material = materials.ovni.body.toon;
                else if (child.geometry.parameters.phiLength < Math.PI) 
                    child.material = materials.ovni.cockpit.toon;
                else 
                    child.material = materials.ovni.lights.toon;
            } else if (child.geometry instanceof THREE.CylinderGeometry) {
                child.material = materials.ovni.body.toon; 
            }
        }
    }
}

function ovni_movement(delta) {
    if(ovnimov){
        ovni.position.x += (moveovniL + moveovniR) * delta * 10;
    }
    ovni.rotation.y += 5 * delta;

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
    else if (e.key == 'Q' || e.key == 'q') {
        switchToGouraudShading();
    }
    else if (e.key == 'W' || e.key == 'w') {
        switchToPhongShading();
    }
    else if (e.key == 'E' || e.key == 'e') {
        switchToCartoonShading()
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

    if (mesh.material.map) mesh.material.map.dispose();

    mesh.material.map = texture;
    mesh.material.needsUpdate = true;
}

init();
animate();