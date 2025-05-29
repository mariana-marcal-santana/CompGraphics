import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { VRButton } from "three/addons/webxr/VRButton.js";
// import * as Stats from "three/addons/libs/stats.module.js";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras = [];
let scene, camera, renderer;
var terrain, skydome, geometry, mesh;
const clock = new THREE.Clock();
var delta;
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
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    'use strict';
    const positions = new Array(new Array(0, 0, 0), // lateral (criação de texturas)
                                new Array(50, 20, 50)); // perspetiva isométrica - projeção ortogonal (cena principal); 

    for (let i = 0; i < 2; i++) {
        if (i == 1) {
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        } else {
            camera = new THREE.OrthographicCamera(window.innerWidth / -50,
                                            window.innerWidth / 50,
                                            window.innerHeight / 50,
                                            window.innerHeight / -50,
                                            1,
                                            1000);
        }

        camera.position.set(positions[i][0], positions[i][1], positions[i][2]);
        camera.lookAt(scene.position);
        cameras.push(camera);
    }
    camera = cameras[1];
 
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function toggleDirectionalLight() {
    'use strict';

    if (isDirectionalLightOn) {
        scene.remove(directionalLight);
    } 
    else {
        directionalLight = new THREE.DirectionalLight(0xffffff, 4);
        directionalLight.position.set(2, 2, 4); 
        directionalLight.castShadow = true;
        scene.add(directionalLight);
    }
    isDirectionalLightOn = !isDirectionalLightOn;
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createTerrain() {
    'use strict';

    terrain = new THREE.Object3D();
    const geometry = new THREE.CircleGeometry(radius, 32);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, bumpMap: texture, bumpScale: -10, 
        displacementMap: texture, displacementScale: 10}));

    terrain.add(mesh);
    terrain.rotation.x = 3 * Math.PI / 2; 
    scene.add(terrain);
}

function createSkydome() {
    'use strict';

    skydome = new THREE.Object3D();
    geometry = new THREE.SphereGeometry(radius, 32, 16, 0, 2 * Math.PI, 0, 0.5 * Math.PI);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ side: THREE.DoubleSide }));

    skydome.add(mesh);
    scene.add(skydome);
}

function createMoon() {
    'use strict';

    const moonGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0xffffff,
        emissiveIntensity: 0.6, side: THREE.DoubleSide });
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

    moonMesh.position.set(40, 35, -30);
    scene.add(moonMesh);
}


//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////
function update() {}

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
    switch (e.keyCode) {}
    if (e.key === '1') {
        generateFieldTexture();
    } else if (e.key === '2') {
        generateSkyTexture();
    } else if (e.key === 'D' || e.key === 'd') {
        console.log('Toggling directional light');
        toggleDirectionalLight();
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    
}

function generateFieldTexture() {
    'use strict';

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#82D173';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors = ['white', 'yellow', 'violet', 'lightblue'];
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random();
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

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
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

    render();
}

init();
animate();