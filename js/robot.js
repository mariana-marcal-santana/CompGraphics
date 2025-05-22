import * as THREE from "three";

var camera, scene, renderer;

var geometry;

var trailer, trailerBody, robot, head, feet, leg, lArm, rArm;

let rotateHead = false, rotateLeg = false, rotateFeet = false, 
    displaceArms = false, trailerMoveInX = false, trailerMoveInZ = false;

var constHeadIn = 0, constHeadOut = 0, constFeetIn = 0, constFeetOut = 0; 
var constLegIn = 0, constLegOut = 0, constArmIn = 0, constArmOut = 0;
var constLeft = 0, constRight = 0, constUp = 0, constDown = 0;

const materials = new Map(), clock = new THREE.Clock();
const positions = [[0, 0, 100], [100, 0, 0], [0, 150, 0], [300, 300, 300]]
var currentCamera = -1;
var minTruckAABB = new THREE.Vector3(-50, -2.5, -130), maxTruckAABB = new THREE.Vector3(50, 95, 20);

var minTrailerAABB, maxTrailerAABB;

var delta;

function createScene() {
  'use strict';

  scene = new THREE.Scene();
  const axesOrigin = new THREE.Object3D();
  axesOrigin.position.set(0, -105, 0); 
  axesOrigin.add(new THREE.AxesHelper(300)); 
  scene.add(axesOrigin);
  scene.background = new THREE.Color(0xf0f0f0);

  createRobot(0, 15, 0);
  createTrailer(0, 10, -200);
}

function createCameras(i) {
  'use strict';

  if (currentCamera == -1) { // camera inicialization
    camera = new THREE.OrthographicCamera(window.innerWidth / -2.5, window.innerWidth / 2.5,
                window.innerHeight / 2.5, window.innerHeight / -2.5, 1, 1000); 
  }
    
  if (i == currentCamera) return;

  if (i == 3) {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  } 
  else if (currentCamera == 3) {
    camera = new THREE.OrthographicCamera(window.innerWidth / -2.5, window.innerWidth / 2.5,
                window.innerHeight / 2.5, window.innerHeight / -2.5, 1, 1000);
  }

  currentCamera = i;
  camera.position.x = positions[i][0];
  camera.position.y = positions[i][1];
  camera.position.z = positions[i][2];
  camera.lookAt(scene.position);
}


function createMaterials() {
    'use strict';
    
    materials.set("black", new THREE.MeshBasicMaterial({ color: 0x00000, wireframe: false }));
    materials.set("red", new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false }));
    materials.set("blue", new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: false }));
    materials.set("mediumGrey", new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false }));
    materials.set("darkGrey", new THREE.MeshBasicMaterial({ color: 0x504e4e, wireframe: false }));
}

function addEye(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(1.5, 1.5, 2, 32); 
    var mesh = new THREE.Mesh(geometry, materials.get("mediumGrey"));
    mesh.rotation.x = Math.PI/2 ;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addAntenna(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(2, 2, 10, 10); 
    var mesh = new THREE.Mesh(geometry, materials.get("mediumGrey"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addHead(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(30, 20, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("blue"));
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
    var mesh = new THREE.Mesh(geometry, materials.get("mediumGrey"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addLowerExhaustPipe(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(2.5, 2.5, 30, 15);  
    var mesh = new THREE.Mesh(geometry, materials.get("darkGrey"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addForearm(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 25, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("darkGrey"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}


function addArm(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 40, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("mediumGrey"));
    mesh.position.set(x, 0, 0);

    addUpperExhaustPipe(mesh, obj.position.x > 0 ? x + 2.5 : x - 2.5, y + 20, z); 
    addLowerExhaustPipe(mesh, obj.position.x > 0 ? x + 2.5 : x - 2.5, y , z);
    addForearm(mesh, 0, y - 32.5, z);

    obj.add(mesh);
    robot.add(obj);
}

function addTorso(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(90, 40, 40); 
    var mesh = new THREE.Mesh(geometry, materials.get("red"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addAbdomen(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(50, 20, 40); 
    var mesh = new THREE.Mesh(geometry, materials.get("darkGrey"));
    mesh.position.set(x, y - 1, z);
    obj.add(mesh);
}

function addWheel(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(10, 10, 10, 15);  
    var mesh = new THREE.Mesh(geometry, materials.get("black"));
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWaist(obj, x, y, z) {
    'use strict';

    addWheel(obj, x - 40, y-7.5, z); 
    addWheel(obj, x + 40, y-7.5, z); 

    geometry = new THREE.BoxGeometry(70, 20, 40); 
    var mesh = new THREE.Mesh(geometry, materials.get("mediumGrey"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addFoot(obj, x, y, z) {
    'use strict';
    
    geometry = new THREE.BoxGeometry(35, 20, 30); 
    var mesh = new THREE.Mesh(geometry, materials.get("red"));
    mesh.position.set(x, y, z);
    feet.add(mesh);
    leg.add(feet); 
}

function addLeg(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(30, 80, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("blue"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addThigh(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 30, 20);
    var mesh = new THREE.Mesh(geometry, materials.get("darkGrey"));
    mesh.position.set(x, y-10, z);

    addLeg(mesh, 0, -55, 0); 
    addWheel(mesh, x < 0 ? -20 : 20, -45, 5); 
    addWheel(mesh, x < 0 ? -20 : 20, -70, 5); 
    addFoot(mesh, x, -5, 0); 

    leg.add(mesh);
    obj.add(leg);
}

function createRobot(x, y, z) {
    'use strict';

    robot = new THREE.Object3D();
    robot.userData = {truck: false};

    addWaist(robot, 0, 0, 0); 
    addAbdomen(robot, 0, 21, 0); 
    addTorso(robot, 0, 50, 0); 

    // head
    head = new THREE.Object3D();
    head.position.set(0, 60, 10);

    addHead(robot, 0, 20, 0); 

    // arms
    lArm = new THREE.Object3D();
    lArm.position.set(45, 50, 10);

    rArm = new THREE.Object3D();
    rArm.position.set(-45, 50, 10);

    addArm(lArm, 10, 0, 0); 
    addArm(rArm, -10, 0, 0); 

    // legs
    leg = new THREE.Object3D();
    leg.position.set(0, 10, 0);

    // feet
    feet = new THREE.Object3D();
    feet.position.set(0, -115, 15);

    addThigh(robot, 20, -25, 10); 
    addThigh(robot, -20, -25, 10); 

    scene.add(robot);

    robot.position.set(x, y, z);
}

function addTrailerBody(obj, x, y, z) {
    'use strict';
    geometry = new THREE.BoxGeometry(70, 15, 50);
    var mesh = new THREE.Mesh(geometry, materials.get("darkGrey"));
    mesh.position.set(x, y - 2.5, z);
    obj.add(mesh);

    geometry = new THREE.BoxGeometry(70, 50, 150);
    var mesh = new THREE.Mesh(geometry, materials.get("mediumGrey"));
    mesh.position.set(x, y + 30, z + 50);
    obj.add(mesh);

    geometry = new THREE.BoxGeometry(25, 10, 10);
    var mesh = new THREE.Mesh(geometry, materials.get("darkGrey"));
    mesh.position.set(x, y , z + 120);
    obj.add(mesh);
}

function createTrailer(x, y, z) {
    'use strict';

    trailer = new THREE.Object3D();
    trailer.userData = {connected: false, connecting: false};

    trailerBody = new THREE.Object3D();
    trailerBody.position.set(0, 0, 0);
    addTrailerBody(trailer, 0, 10, 15);

    addWheel(trailer, -40, 0, 0);
    addWheel(trailer, -40, 0, 30);
    addWheel(trailer, 40, 0, 0);
    addWheel(trailer, 40, 0, 30);

    scene.add(trailer);

    trailer.position.set(x, y, z);
    updateTrailerAABB();
}

function updateTrailerAABB() {
    'use strict';
    
    minTrailerAABB = new THREE.Vector3(trailer.position.x - 45, trailer.position.y, trailer.position.z - 10);
    maxTrailerAABB = new THREE.Vector3(trailer.position.x + 45 , trailer.position.y, trailer.position.z + 140);
}

function checkCollisions(){
    'use strict';
    return (maxTruckAABB.x > minTrailerAABB.x && minTruckAABB.x < maxTrailerAABB.x &&
      maxTruckAABB.y > minTrailerAABB.y && minTruckAABB.y < maxTrailerAABB.y &&
      maxTruckAABB.z > minTrailerAABB.z && minTruckAABB.z < maxTrailerAABB.z);
}

function update() {
  'use strict';
  
  delta = clock.getDelta();
  handleRotations(delta);
  
  if (!trailer.userData.connected){
    handleTrailerMovement(delta);
  }
  if(robot.userData.truck && !trailer.userData.connected) { 
    handleCollisions();
  }
  
  if (trailer.userData.connected && (!checkCollisions() || !robot.userData.truck)){
    const worldPosition = new THREE.Vector3();
    trailer.getWorldPosition(worldPosition);
    scene.add(trailer); 
    trailer.position.copy(worldPosition);

    trailer.userData.connected = false;
    trailer.userData.connecting = false;
  }
}

function handleCollisions() {
  'use strict';

  const target = new THREE.Vector3(robot.position.x, robot.position.y - 5, robot.position.z - 175);

  if (trailer.userData.connecting) {
    const speed = 30; 

    const direction = new THREE.Vector3().subVectors(target, trailer.position);
    const distance = direction.length();

    if (distance < 0.1) {
      trailer.userData.connecting = false;
      trailer.userData.connected = true;

      robot.add(trailer);
      trailer.position.set(0, -5, -175); 
    } else {
      direction.normalize();
      trailer.position.addScaledVector(direction, speed * delta);
    }

    return;
  }

  if (checkCollisions()) {
    trailer.userData.connecting = true;
  }
}


function handleTrailerMovement(delta) {
  'use strict';

  if (trailerMoveInX) {
    trailer.position.x = THREE.MathUtils.clamp(trailer.position.x + (constLeft + constRight) * delta * 50, -300, 300);
  }
  if (trailerMoveInZ) {
    trailer.position.z = THREE.MathUtils.clamp(trailer.position.z + (constUp + constDown) * delta * 50, -350, 250);
  }
 
  updateTrailerAABB();
}

function handleRotations(delta) {
  'use strict';

  if (rotateFeet) {
    feet.rotation.x = THREE.MathUtils.clamp(feet.rotation.x + (constFeetIn + constFeetOut) * delta , 0, Math.PI / 2);
  }
  if (rotateLeg) {
    leg.rotation.x = THREE.MathUtils.clamp(leg.rotation.x + (constLegIn + constLegOut) * delta, 0, Math.PI / 2);
  }
  if (rotateHead) {
    head.rotation.x = THREE.MathUtils.clamp(head.rotation.x - (constHeadIn + constHeadOut) * delta, -Math.PI / 2, 0);
  }
  if (displaceArms) {
    lArm.position.x = THREE.MathUtils.clamp(lArm.position.x + (constArmIn + constArmOut) * delta * 25, 25, 45);
    rArm.position.x = THREE.MathUtils.clamp(rArm.position.x - (constArmIn + constArmOut)* delta * 25, -45, -25);
  }
  
  checkTruckMode();
}

function toggleWireframe() {
  'use strict';

  materials.forEach((material) => {
      material.wireframe = !material.wireframe;
    }
  );
}

function checkTruckMode() {
    'use strict';

    robot.userData.truck = head.rotation.x == -Math.PI / 2 &&
                            leg.rotation.x == Math.PI / 2 &&
                            feet.rotation.x == Math.PI / 2 &&
                            lArm.position.x == 25 && rArm.position.x == -25
;
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
      createCameras(0);
      break;
    case 50: //2
      createCameras(1);
      break;
    case 51: //3
      createCameras(2);
      break;
    case 52: //4
      createCameras(3);
      break;
    case 81: // q
      constFeetIn = 1;
      rotateFeet = true;
      break;
    case 65: // a
      constFeetOut = -1;
      rotateFeet = true;
      break;
    case 87: // w
      constLegIn = 1;
      rotateLeg = true;
      break;
    case 83: // s
      constLegOut = -1;
      rotateLeg = true;
      break;
    case 69: //e
      constArmIn = 1;
      displaceArms = true;
      break;
    case 68: // d
      constArmOut = -1;
      displaceArms = true;
      break;
    case 82: // r
      constHeadIn = 1;
      rotateHead = true;
      break;
    case 70: // f
      constHeadOut = -1;
      rotateHead = true;
      break;
    case 37: // left
      constLeft = -1;
      trailerMoveInX = true;
      break;
    case 39: // right
      constRight = 1;
      trailerMoveInX = true;
      break;
    case 38: // up  
      constUp = -1;
      trailerMoveInZ = true;
      break;
    case 40: // down
      constDown = 1;
      trailerMoveInZ = true;
      break;
    case 55: // 7
      toggleWireframe();
      break;
  }
}

function onKeyUp(e) {
  'use strict';

  switch (e.keyCode) {
    case 37: // left
      constLeft = 0;
      trailerMoveInX = false;
      break;
    case 39: // right
      constRight = 0;
      trailerMoveInX = false;
      break;
    case 38: // up
      constUp = 0;
      trailerMoveInZ = false;
      break;
    case 40: // down
      constDown = 0;
      trailerMoveInZ = false;
      break;
    case 81: // q
      constFeetIn = 0;
      rotateFeet = false;
      break;
    case 65: // a
      constFeetOut = 0;
      rotateFeet = false;
      break;
    case 87: // w
      constLegIn = 0;
      rotateLeg = false;
      break;
    case 83: // s
      constLegOut = 0;
      rotateLeg = false;
      break;
    case 69: //e
      constArmIn = 0;
      displaceArms = false;
      break;
    case 68: // d
      constArmOut = 0;
      displaceArms = false;
      break;
    case 82: // r
      constHeadIn = 0;
      rotateHead = false;
      break;
    case 70: // f
      constHeadOut = 0;
      rotateHead = false;
      break;
  }
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
  createCameras(0);

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
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
