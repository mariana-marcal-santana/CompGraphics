import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';


  

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    const front_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const side_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    side_camera.position.set(10, 0, 0); // Right side of the scene
    side_camera.lookAt(0, 0, 0); // Look at the origin


    const top_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    top_camera.position.set(0, 10, 0); // Above the scene
    top_camera.lookAt(0, 0, 0); // Look at the origin

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add head
    const head_geometry = new THREE.BoxGeometry();
    const head_material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const head = new THREE.Mesh(head_geometry, head_material);
    scene.add(head);

    // Add torso
    const torso_geometry = new THREE.BoxGeometry();
    const torso_material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const torso = new THREE.Mesh(torso_geometry, torso_material);
    torso.position.y = -1.25; // Position torso below head
    torso.scale.set(3, 1, 2); // Scale torso to be taller
    scene.add(torso);

    // Add abdomen
    const abdomen_geometry = new THREE.BoxGeometry();
    const abdomen_material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const abdomen = new THREE.Mesh(abdomen_geometry, abdomen_material);
    abdomen.position.y = -2.25; // Position torso below head
    abdomen.scale.set(1.5, 1, 2); // Scale torso to be taller
    scene.add(abdomen);

    // Add a light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    // Position camera
    
    front_camera.position.z = 5;

    renderer.render(scene, front_camera);

    // window resize
    window.addEventListener('resize', () => {
      front_camera.aspect = window.innerWidth / window.innerHeight;
      front_camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });