import * as THREE from "three";

var cameras = [], camera, scene, renderer;

var geometry;

var trailer, trailerBody, robot, head, feet, leg, lArm, rArm;

let rotateHeadIn = false, rotateHeadOut = false, rotateLegIn = false, rotateLegOut = false,
    rotateFeetIn = false, rotateFeetOut = false, displaceArmsIn = false, displaceArmsOut = false,
    trailerMoveLeft = false, trailerMoveRight = false, trailerMoveUp = false, trailerMoveDown = false;

const materials = new Map(), clock = new THREE.Clock();

var minTruckAABB = new THREE.Vector3(-60, -2.5, -127.5), maxTruckAABB = new THREE.Vector3(60, 95, 20);

var minTrailerAABB = new THREE.Vector3(-60, 0, -35);
var maxTrailerAABB = new THREE.Vector3(60, 80, 35);
var truckAABB = new THREE.Box3(minTruckAABB.clone(), maxTruckAABB.clone());

var trailerAABB = new THREE.Box3(minTrailerAABB.clone(), maxTrailerAABB.clone());

var delta;

function createScene() {
  'use strict';

  scene = new THREE.Scene();
  const axesOrigin = new THREE.Object3D();
  axesOrigin.position.set(0, -105, 0); 
  axesOrigin.add(new THREE.AxesHelper(300)); 
  scene.add(axesOrigin);
  var truckBoxHelper = new THREE.Box3Helper(truckAABB, 0xff0000); // red
  scene.add(truckBoxHelper);
  var trailerBoxHelper = new THREE.Box3Helper(trailerAABB, 0x0000ff); // blue
  scene.add(trailerBoxHelper);
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
    var mesh = new THREE.Mesh(geometry, materials.get("eye").clone());
    mesh.rotation.x = Math.PI/2 ;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addAntenna(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(2, 2, 15, 10); 
    var mesh = new THREE.Mesh(geometry, materials.get("antenna").clone());
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
    var mesh = new THREE.Mesh(geometry, materials.get("pipe").clone());
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addLowerExhaustPipe(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(2.5, 2.5, 30, 15);  
    var mesh = new THREE.Mesh(geometry, materials.get("pipeLower").clone());
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addForearm(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 30, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("forearm").clone());
    mesh.position.set(x, y, z);
    obj.add(mesh);
}


function addArm(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 40, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("arm").clone());
    mesh.position.set(x, 0, 0);

    addUpperExhaustPipe(mesh, obj.position.x > 0 ? x - 2.5 : x + 2.5, y + 20, z); 
    addLowerExhaustPipe(mesh, obj.position.x > 0 ? x - 2.5 : x + 2.5, y , z);
    addForearm(mesh, 0, y - 27.5, z);

    obj.add(mesh);
    robot.add(obj);
}

function addTorso(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(100, 40, 40); 
    var mesh = new THREE.Mesh(geometry, materials.get("torso"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addAbdomen(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(50, 18, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("abdomen"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWheel(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(10, 10, 10, 15);  
    var mesh = new THREE.Mesh(geometry, materials.get("wheel").clone());
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWaist(obj, x, y, z) {
    'use strict';

    addWheel(obj, x - 40, y-7.5, z); 
    addWheel(obj, x + 40, y-7.5, z); 

    geometry = new THREE.BoxGeometry(70, 25, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("waist"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addFoot(obj, x, y, z) {
    'use strict';
    
    geometry = new THREE.BoxGeometry(35, 20, 30); 
    var mesh = new THREE.Mesh(geometry, materials.get("foot").clone());
    mesh.position.set(x, y, z);
    feet.add(mesh);
    leg.add(feet); 
}

function addLeg(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(30, 70, 20); 
    var mesh = new THREE.Mesh(geometry, materials.get("leg").clone());
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addThigh(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 40, 20);
    var mesh = new THREE.Mesh(geometry, materials.get("thigh").clone());
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

    addWaist(robot, 0, 0, 10); 
    addAbdomen(robot, 0, 21, 10); 
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

    addArm(lArm, 15, 0, 0); 
    addArm(rArm, -15, 0, 0); 

    // legs
    leg = new THREE.Object3D();
    leg.position.set(0, 7.5, 0);

    // feet
    feet = new THREE.Object3D();
    feet.position.set(0, -112.5, 15);

    addThigh(robot, 20, -10, 10); 
    addThigh(robot, -20, -10, 10); 

    scene.add(robot);

    robot.position.set(x, y, z);
}

function addTrailerBody(obj, x, y, z) {
    'use strict';
    geometry = new THREE.BoxGeometry(70, 20, 50);
    var mesh = new THREE.Mesh(geometry, materials.get("trailer").clone());
    mesh.position.set(x, y, z);
    obj.add(mesh);
2
    geometry = new THREE.BoxGeometry(70, 50, 150);
    var mesh = new THREE.Mesh(geometry, materials.get("trailer").clone());
    mesh.position.set(x, y + 30, z + 50);
    obj.add(mesh);

    geometry = new THREE.BoxGeometry(25, 10, 10);
    var mesh = new THREE.Mesh(geometry, materials.get("trailerPiece").clone());
    mesh.position.set(x, y , z + 120);
    obj.add(mesh);
}

function createTrailer(x, y, z) {
    'use strict';

    trailer = new THREE.Object3D();
    trailer.userData = {connected: false, connecting: false};

    // trailer body
    trailerBody = new THREE.Object3D();
    trailerBody.position.set(0, 0, 0);
    addTrailerBody(trailer, 0, 10, 15);

    addWheel(trailer, -40, 0, 0);
    addWheel(trailer, -40, 0, 30);
    addWheel(trailer, 40, 0, 0);
    addWheel(trailer, 40, 0, 30);

    scene.add(trailer);

    trailer.position.set(x, y+10, z);
    updateTrailerAABB();
}

function updateTrailerAABB() {
    'use strict';
    
    minTrailerAABB = new THREE.Vector3(trailer.position.x - 70 / 2, trailer.position.y - 90 / 2 + 15, trailer.position.z - 150 / 2);
    maxTrailerAABB = new THREE.Vector3(trailer.position.x + 70 / 2 , trailer.position.y + 90 / 2 + 15, trailer.position.z + 150 / 2);
    trailerAABB.setFromObject(trailer);
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
  handleTrailerMovement(delta);

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
  // console.log("colision: " + checkCollisions());
}

function handleCollisions() {
  'use strict';

  const target = new THREE.Vector3(robot.position.x, robot.position.y - 7.5, robot.position.z - 175);

  if (trailer.userData.connecting) {
    const speed = 30; 

    const direction = new THREE.Vector3().subVectors(target, trailer.position);
    const distance = direction.length();

    if (distance < 0.5) {
      trailer.userData.connecting = false;
      trailer.userData.connected = true;

      robot.add(trailer);
      trailer.position.set(0, -7.5, -175); 
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
  if (trailerMoveLeft) {
    trailer.position.x = THREE.MathUtils.clamp(trailer.position.x - delta * 50, -200, 200);
  }
  if (trailerMoveRight) {
    trailer.position.x = THREE.MathUtils.clamp(trailer.position.x + delta * 50, -200, 200); 
  }
  if (trailerMoveUp) {
    trailer.position.y = THREE.MathUtils.clamp(trailer.position.y + delta * 50, -200, 200);
  }
  if (trailerMoveDown) {
    trailer.position.y = THREE.MathUtils.clamp(trailer.position.y - delta * 50, -200, 200);
  }
  updateTrailerAABB();
}

function handleRotations(delta) {
  'use strict';
  if (rotateFeetIn) {
    feet.rotation.x = THREE.MathUtils.clamp(feet.rotation.x + delta , 0, Math.PI / 2);
  }
  if (rotateFeetOut) {
    feet.rotation.x = THREE.MathUtils.clamp(feet.rotation.x - delta, 0, Math.PI / 2);
  }
  if (rotateLegIn) {
    leg.rotation.x = THREE.MathUtils.clamp(leg.rotation.x + delta, 0, Math.PI / 2);
  }
  if (rotateLegOut) {
    leg.rotation.x = THREE.MathUtils.clamp(leg.rotation.x - delta, 0, Math.PI / 2);
  }
  if (rotateHeadIn) {
    head.rotation.x = THREE.MathUtils.clamp(head.rotation.x - delta, -Math.PI / 2, 0);
  }
  if (rotateHeadOut) {
    head.rotation.x = THREE.MathUtils.clamp(head.rotation.x + delta, -Math.PI / 2, 0);
  }
  if (displaceArmsIn) {
    lArm.position.x = THREE.MathUtils.clamp(lArm.position.x + delta * 25, 30, 45);
    rArm.position.x = THREE.MathUtils.clamp(rArm.position.x - delta * 25, -45, -30);
  }
  if (displaceArmsOut) {
    lArm.position.x = THREE.MathUtils.clamp(lArm.position.x - delta * 25, 30, 45);
    rArm.position.x = THREE.MathUtils.clamp(rArm.position.x + delta * 25, -45, -30);
  }
  checkTruckMode();
}

function toggleWireframe() {
  'use strict';
  scene.traverse((object) => {
    if (object.isMesh) {

      if (Array.isArray(material)) {
        material.forEach(mat => {
            mat.wireframe = !mat.wireframe;
        });
      } else {
        material.wireframe = !material.wireframe;
      }
    }
  });
}

function checkTruckMode() {
    'use strict';

    robot.userData.truck = head.rotation.x == -Math.PI / 2 &&
                            leg.rotation.x == Math.PI / 2 &&
                            feet.rotation.x == Math.PI / 2 &&
                            lArm.position.x == 30 && rArm.position.x == -30
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
    case 37: // left
      trailerMoveLeft = true;
      break;
    case 39: // right
      trailerMoveRight = true;
      break;
    case 38: // up  
      trailerMoveUp = true;
      break;
    case 40: // down
      trailerMoveDown = true;
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
      trailerMoveLeft = false;
      break;
    case 39: // right
      trailerMoveRight = false;
      break;
    case 38: // up
      trailerMoveUp = false;
      break;
    case 40: // down
      trailerMoveDown = false;
      break;
    case 81: // q
      rotateFeetIn = false;
      break;
    case 65: // a
      rotateFeetOut = false;
      break;
    case 87: // w
      rotateLegIn = false;
      break;
    case 83: // s
      rotateLegOut = false;
      break;
    case 69: //e
      displaceArmsIn = false;
      break;
    case 68: // d
      displaceArmsOut = false;
      break;
    case 82: // r
      rotateHeadIn = false;
      break;
    case 70: // f
      rotateHeadOut = false;
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
  createCameras();

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

