import * as THREE from 'https://cdn.skypack.dev/three';

let scene, camera, renderer, mesh, uniforms;

init();
animate();

async function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const [vertexShader, fragmentShader] = await Promise.all([
    fetch('./shaders/vertex.glsl').then(res => res.text()),
    fetch('./shaders/fragment.glsl').then(res => res.text())
  ]);

  uniforms = {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    mouse: { value: new THREE.Vector2(0, 0) }
  };

  const geometry = new THREE.SphereGeometry(0.7, 256, 256);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    wireframe: false
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
}

function animate() {
  requestAnimationFrame(animate);
  uniforms.time.value += 0.01;
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
  uniforms.mouse.value.x = (e.clientX / window.innerWidth) * 2.0 - 1.0;
  uniforms.mouse.value.y = -((e.clientY / window.innerHeight) * 2.0 - 1.0);
}
