import * as THREE from 'https://cdn.skypack.dev/three';

// Embed shader langsung
const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
uniform float time;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec3 pos = position + normal * 0.15 * sin(time * 2.0 + position.y * 10.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;
const fragmentShader = `
precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
uniform float time;
uniform vec2 mouse;
void main() {
  float light = dot(vNormal, normalize(vec3(mouse, 1.0)));
  vec3 base = 0.5 + 0.5 * cos(time + vUv.xyx * 6.0 + vec3(0.0,2.0,4.0));
  vec3 glow = vec3(1.0,0.8,0.6) * smoothstep(0.0,1.0,light);
  vec3 color = mix(base, glow, 0.4);
  gl_FragColor = vec4(color, 1.0);
}`;

let scene, camera, renderer, mesh, uniforms;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  uniforms = {
    time: { value: 0 },
    mouse: { value: new THREE.Vector2(0, 0) }
  };

  const geo = new THREE.SphereGeometry(0.7, 256, 256);
  const mat = new THREE.ShaderMaterial({ 
    vertexShader, 
    fragmentShader, 
    uniforms 
  });

  mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouse);
}

function animate() {
  requestAnimationFrame(animate);
  uniforms.time.value += 0.01;
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function onMouse(e) {
  uniforms.mouse.value.x = (e.clientX / innerWidth) * 2 - 1;
  uniforms.mouse.value.y = -((e.clientY / innerHeight) * 2 - 1);
}

// Jalankan init + animate
init();
animate();
