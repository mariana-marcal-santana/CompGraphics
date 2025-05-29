import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { VRButton } from "three/addons/webxr/VRButton.js";
// import * as Stats from "three/addons/libs/stats.module.js";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras = [];
let scene, camera, renderer, plane;
var terrain, skydome, geometry, mesh;
const materials = new Map(), clock = new THREE.Clock();
var delta;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#262626');

    const ambientLight = new THREE.AmbientLight(0x404040, 1.0); // Soft white light
    scene.add(ambientLight);   

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);   

    createSkydome(0, -5, 0);
    createTerrain(0, -6.7, 0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    'use strict';
    const positions = new Array(new Array(0, 0, -50), // lateral (criação de texturas)
                                new Array(35, 25, 35)); // perspetiva isométrica - projeção ortogonal (cena principal); 

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

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createMaterials() {
    'use strict';
    const loader = new THREE.TextureLoader();
    const texture = loader.load('js/heightmap/heightmap1.png');

    materials.set("skydome", new THREE.MeshPhongMaterial({wireframe: false, side: THREE.DoubleSide }));
    materials.set("terrain", new THREE.MeshPhongMaterial({wireframe: false, side: THREE.DoubleSide, bumpMap: texture, bumpScale: -20, displacementMap: texture, displacementScale: 20}));
}


function createTerrain(x, y, z) {
    'use strict';
    terrain = new THREE.Object3D();
    geometry = new THREE.PlaneGeometry(150, 150, 100, 100);
    
    mesh = new THREE.Mesh(geometry, materials.get("terrain"));

    terrain.add(mesh);
    terrain.rotation.x = 3*Math.PI / 2;
    terrain.position.set(x, y, z);
    scene.add(terrain);
}

function createSkydome(x, y , z) {
    'use strict';

    skydome = new THREE.Object3D();

    geometry = new THREE.SphereGeometry(70, 32, 16, 0, 2 * Math.PI, 0, 0.5 * Math.PI);
    
    mesh = new THREE.Mesh(geometry, materials.get("skydome"));

    skydome.add(mesh);
    skydome.position.set(x, y, z);

    scene.add(skydome);
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

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    renderer.xr.enabled = true;    
    // document.body.appendChild(VRButton.createButton(renderer));

    createMaterials();
    createScene();
    createCameras();

    window.addEventListener("keydown", onKeyDown);
    // window.addEventListener("keyup", onKeyUp);
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

    if (e.key === '1') {
        generateFieldTexture();
    } else if (e.key === '2') {
        generateSkyTexture();
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    
}

function generateFieldTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fundo verde-claro
    ctx.fillStyle = '#82D173';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Flores
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

    applyCanvasTexture(canvas, 'terrain');
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
generateFieldTexture();
generateSkyTexture();
animate();