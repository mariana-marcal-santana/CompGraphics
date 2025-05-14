import * as THREE from "three";

var cameras = [], camera, scene, renderer;

function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
}

function createCameras() {
    'use strict';

    const positions = new Array(new Array(100, 0, 0), // frontal
                                new Array(0, 0, 100), // lateral
                                new Array(0, 150, 0), // topo
                                new Array(500, 500, 500)); // perspetiva

    for (let i = 0; i < 4; i++) {
        if (i == 3) {
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        } else {
            camera = new THREE.OrthographicCamera(window.innerWidth / -5,
                                            window.innerWidth / 5,
                                            window.innerHeight / 5,
                                            window.innerHeight / -5,
                                            1,
                                            1000);
        }

        camera.position.set(positions[i][0], positions[i][1], positions[i][2]);
        camera.lookAt(scene.position);
        cameras.push(camera);
    }
    camera = cameras[0];
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

  createScene();
  createCameras();

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);

  render();
}

init();

// function animate() {
//     'use strict';

//     update();

//     render();
//     requestAnimationFrame(animate);
// }

