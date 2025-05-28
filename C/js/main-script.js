import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { VRButton } from "three/addons/webxr/VRButton.js";
// import * as Stats from "three/addons/libs/stats.module.js";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, camera, renderer, plane;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

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
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-2, 2, 1, -1, 0.1, 1000);
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 1;
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial();
    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    window.addEventListener('keydown', onKeyDown);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
  //update();

  render();
  requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    if (e.key === '1') {
        generateFieldTexture();
    } else if (e.key === '2') {
        generateSkyTexture();
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {}

function generateFieldTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fundo verde-claro
    ctx.fillStyle = '#82D173';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors = ['white', 'yellow', 'violet', 'lightblue'];

    for (let i = 0; i < 500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    }

    applyCanvasTexture(canvas);
}

function generateSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Degradé azul-escuro para violeta-escuro
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#330033');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Estrelas brancas
    for (let i = 0; i < 500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    }

    applyCanvasTexture(canvas);
}

function applyCanvasTexture(canvas) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    if (plane.material.map) plane.material.map.dispose();
    plane.material.map = texture;
    plane.material.needsUpdate = true;

    render();
}

init();
generateFieldTexture();
animate();