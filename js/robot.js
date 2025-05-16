import * as THREE from "three";

var cameras = [], camera, scene, renderer;

var geometry;

var trailer, trailerBody, robot, head, feet, leg, lArm, rArm;

let rotateHeadIn = false, rotateHeadOut = false, rotateLegIn = false, rotateLegOut = false,
    rotateFeetIn = false, rotateFeetOut = false, displaceArmsIn = false, displaceArmsOut = false;


const materials = new Map(), clock = new THREE.Clock();
var delta;

const duration = 5; // duration (in seconds)
const animationSpeed = 2;

const targetPos = new THREE.Vector3(-95, 30, 0); // final position of the trailer
let displacement;


function createScene() {
  'use strict';

  scene = new THREE.Scene();
  const axesOrigin = new THREE.Object3D();
  axesOrigin.position.set(0, -105, 0); 
  axesOrigin.add(new THREE.AxesHelper(300)); 
  scene.add(axesOrigin);

  scene.background = new THREE.Color(0xf0f0f0);

  createRobot(0, 15, 0);
  createTrailer(0, -105, -150);
}

function createCameras() {
  'use strict';

  const positions = [[0, 0, 100], [100, 0, 0], [0, 150, 0], [300, 300, 300]]

  for (let i = 0; i < 4; i++) {
    if (i == 3) {
      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    } 
    else {
      camera = new THREE.OrthographicCamera(window.innerWidth / -5, window.innerWidth / 5,
                  window.innerHeight / 5, window.innerHeight / -5, 1, 1000);
    }

    camera.position.set(positions[i][0], positions[i][1], positions[i][2]);
    camera.lookAt(scene.position);
    cameras.push(camera);
  }
  camera = cameras[0];
}

function createMaterials() {
    'use strict';
    
    materials.set("trailerPiece", new THREE.MeshBasicMaterial({ color: 0x5a6a6a, wireframe: false }));
    materials.set("trailer", new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false }));
    materials.set("wheel", new THREE.MeshBasicMaterial({ color: 0x00000, wireframe: false }));
    materials.set("torso", new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false }));
    materials.set("abdomen", new THREE.MeshBasicMaterial({ color: 0xa6a6a6, wireframe: false }));
    materials.set("waist", new THREE.MeshBasicMaterial({ color: 0xa6a6a6, wireframe: false }));
    materials.set("arm", new THREE.MeshBasicMaterial({ color: 0x3d0303, wireframe: false }));
    materials.set("forearm", new THREE.MeshBasicMaterial({ color: 0x3d0303, wireframe: false }));
    materials.set("leg", new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: false }));
    materials.set("thigh", new THREE.MeshBasicMaterial({ color: 0xa6a6a6, wireframe: false }));
    materials.set("head", new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: false }));
    materials.set("antenna", new THREE.MeshBasicMaterial({ color: 0x0ae032, wireframe: false }));
    materials.set("eye", new THREE.MeshBasicMaterial({ color: 0xa6a6a6, wireframe: false }));
    materials.set("foot", new THREE.MeshBasicMaterial({ color: 0x0f40ff, wireframe: false }));
    materials.set("pipe", new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false }));
    materials.set("pipeLower", new THREE.MeshBasicMaterial({ color: 0x504e4e, wireframe: false }));
}

function addEye(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(1.5, 1.5, 2, 32); 
    var mesh = new THREE.Mesh(geometry, materials.get("eye"));
    mesh.rotation.x = Math.PI/2 ;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addAntenna(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(2, 2, 15, 10); 
    var mesh = new THREE.Mesh(geometry, materials.get("antenna"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addHead(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(30, 20, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("head"));
    mesh.position.set(x, y, z);

    addEye(mesh, 5, 1, 11); 
    addEye(mesh, -5, 1, 11); 

    addAntenna(mesh, 5, 15, 0); 
    addAntenna(mesh, -5, 15, 0); 

    head.add(mesh);
    obj.add(head);
}

function addUpperExhaustPipe(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(2, 2, 20, 15);  
    var mesh = new THREE.Mesh(geometry, materials.get("pipe"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addLowerExhaustPipe(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(2.5, 2.5, 30, 15);  
    var mesh = new THREE.Mesh(geometry, materials.get("pipeLower"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addForearm(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 50, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("forearm"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}


function addArm(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 40, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("arm"));
    mesh.position.set(x, 0, 0);

    addUpperExhaustPipe(mesh, obj.position.x > 0 ? x - 2.5 : x + 2.5, y + 20, z); 
    addLowerExhaustPipe(mesh, obj.position.x > 0 ? x - 2.5 : x + 2.5, y , z);
    addForearm(mesh, 0, y - 45, z);

    mesh.add(obj);
    obj.add(mesh);
    robot.add(obj);
}

function addTorso(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(100, 40, 20); // (4, 4, 7)
    var mesh = new THREE.Mesh(geometry, materials.get("torso"));
    mesh.position.set(x, y, z);
    obj.add(mesh);

    geometry = new THREE.BoxGeometry(40, 40, 20); // (4, 4, 7)
    var mesh = new THREE.Mesh(geometry, materials.get("torso"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addAbdomen(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(50, 18, 20); // (4, 2, 2)
    var mesh = new THREE.Mesh(geometry, materials.get("abdomen"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWheel(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(10, 10, 10, 15);  // (0.75, 1)
    var mesh = new THREE.Mesh(geometry, materials.get("wheel"));
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWaist(obj, x, y, z) {
    'use strict';

    addWheel(obj, x - 40, y, z); // (x, y, z)
    addWheel(obj, x + 40, y, z); // (x, y, z)

    geometry = new THREE.BoxGeometry(70, 25, 20); // (4, 2, 7)
    var mesh = new THREE.Mesh(geometry, materials.get("waist"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addFoot(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(35, 20, 30); // (2, 1, 3)
    var mesh = new THREE.Mesh(geometry, materials.get("foot"));
    mesh.position.set(x < 0 ? x : x, y, z);
    mesh.add(feet);
    feet.add(mesh);
    leg.add(feet);
}

function addLeg(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(30, 70, 20); // (1, 7, 3)
    var mesh = new THREE.Mesh(geometry, materials.get("leg"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addThigh(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 30, 20); // (1, 3, 2)
    var mesh = new THREE.Mesh(geometry, materials.get("thigh"));
    mesh.position.set(x, y, z);

    addLeg(mesh, 0, -50, 0); // (x, y, z)
    addWheel(mesh, x < 0 ? -20 : 20, -45, 0); // (x, y, z)
    addWheel(mesh, x < 0 ? -20 : 20, -70, 0); // (x, y, z)
    addFoot(mesh, x, -90, 5); // (x, y, z)

    mesh.add(leg);
    leg.add(mesh);
    obj.add(leg);
}

function createRobot(x, y, z) {
    'use strict';

    robot = new THREE.Object3D();
    robot.userData = {truck: false};

    addWaist(robot, 0, 0, 10); 
    addAbdomen(robot, 0, 21, 10); 
    addTorso(robot, 0, 50, 10); 

    // head
    head = new THREE.Object3D();
    head.position.set(0, 60, 10);

    addHead(robot, 0, 20, 0); 

    // arms
    lArm = new THREE.Object3D();
    lArm.position.set(45, 50, 10);

    rArm = new THREE.Object3D();
    rArm.position.set(-45, 50, 10);

    addArm(lArm, 15, 0, 0); 
    addArm(rArm, -15, 0, 0); 

    // legs
    leg = new THREE.Object3D();
    leg.position.set(0, -5, 0);

    // feet
    feet = new THREE.Object3D();
    feet.position.set(0, -15, 10);

    addThigh(robot, 20, -10, 10); // (x, y, z)
    addThigh(robot, -20, -10, 10); // (x, y, z)

    scene.add(robot);

    robot.position.set(x, y, z);
}

function addTrailerBody(obj, x, y, z) {
    'use strict';
    geometry = new THREE.BoxGeometry(50, 20, 50);
    var mesh = new THREE.Mesh(geometry, materials.get("trailer"));
    mesh.position.set(x, y, z);
    obj.add(mesh);

    geometry = new THREE.BoxGeometry(50, 20, 150);
    var mesh = new THREE.Mesh(geometry, materials.get("trailer"));
    mesh.position.set(x, y + 15, z + 50);
    obj.add(mesh);

    geometry = new THREE.BoxGeometry(25, 10, 10);
    var mesh = new THREE.Mesh(geometry, materials.get("trailerPiece"));
    mesh.position.set(x, y , z + 120);
    obj.add(mesh);
}

function createTrailer(x, y, z) {
    'use strict';

    trailer = new THREE.Object3D();

    // trailer body
    trailerBody = new THREE.Object3D();
    trailerBody.position.set(0, 0, 0);
    addTrailerBody(trailer, 0, 10, 15);

    addWheel(trailer, -30, 0, 0);
    addWheel(trailer, -30, 0, 30);
    addWheel(trailer, 30, 0, 0);
    addWheel(trailer, 30, 0, 30);

    scene.add(trailer);

    trailer.position.set(x, y+10, z);
}

function onResize() {
  'use strict';

  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
}

function onKeyDown(e) {
  'use strict';

  switch (e.keyCode) {
    case 49: //1
      camera = cameras[0];
      break;
    case 50: //2
      camera = cameras[1];
      break;
    case 51: //3
      camera = cameras[2];
      break;
    case 52: //4
      camera = cameras[3];
      break;
    case 81: // q
      rotateFeetIn = true;
      break;
    case 65: // a
      rotateFeetOut = true;
      break;
    case 87: // w
      rotateLegIn = true;
      break;
    case 83: // s
      rotateLegOut = true;
      break;
    case 69: //e
      displaceArmsIn = true;
      break;
    case 68: // d
      displaceArmsOut = true;
      break;
    case 82: // r
      rotateHeadIn = true;
      break;
    case 70: // f
      rotateHeadOut = true;
      break;
  }
}



function update(){
  'use strict';

  delta = clock.getDelta();

  handleRotations(delta);
}

function handleRotations(delta) {
    'use strict';
    if (rotateFeetIn) {
        feet.rotation.x = THREE.MathUtils.clamp(feet.rotation.x + delta * 5, - Math.PI / 2, 0);
        rotateFeetIn = false;
    }
    if (rotateFeetOut) {
        feet.rotation.x = THREE.MathUtils.clamp(feet.rotation.x - delta * 5, - Math.PI / 2, 0);
        rotateFeetOut = false;
    }
    if (rotateLegIn) {
        leg.rotation.x = THREE.MathUtils.clamp(leg.rotation.x + delta * 5, 0, Math.PI / 2);
        rotateLegIn = false;
    }
    if (rotateLegOut) {
        leg.rotation.x = THREE.MathUtils.clamp(leg.rotation.x - delta * 5, 0, Math.PI / 2);
        rotateLegOut = false;
    }
    if (rotateHeadIn) {
        head.rotation.x = THREE.MathUtils.clamp(head.rotation.x - delta * 5, -Math.PI / 2, 0);
        rotateHeadIn = false;
    }
    if (rotateHeadOut) {
        head.rotation.x = THREE.MathUtils.clamp(head.rotation.x + delta * 5, -Math.PI / 2, 0);
        rotateHeadOut = false;
    }
    if (displaceArmsIn) {
        lArm.position.x = THREE.MathUtils.clamp(lArm.position.x + delta * 50, 25, 45);
        rArm.position.x = THREE.MathUtils.clamp(rArm.position.x - delta * 50, -45, -25);
        displaceArmsIn = false;
    }
    if (displaceArmsOut) {
        lArm.position.x = THREE.MathUtils.clamp(lArm.position.x - delta * 50, 25, 45);
        rArm.position.x = THREE.MathUtils.clamp(rArm.position.x + delta * 50, -45, -25);
        displaceArmsOut = false;
    }
    checkTruckMode();
}

function checkTruckMode() {
    'use strict';

    robot.userData.truck = head.rotation.x == Math.PI / 2 &&
                            leg.rotation.x ==  - Math.PI / 2 &&
                            feet.rotation.x == - Math.PI / 2 &&
                            lArm.position.x == 25 && rArm.position.x == -25;

    // if (!robot.userData.truck) trailer.userData.engaged = false; 
}

function render() {
  'use strict';
  renderer.render(scene, camera);
}

function init() {
  'use strict';

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  clock.start();

  createMaterials();
  createScene();
  createCameras();

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);

  animate(); 
}

init();

function animate() {
  'use strict';
  update();

  render();
  requestAnimationFrame(animate);
}

