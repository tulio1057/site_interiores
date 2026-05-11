import * as THREE from 'three';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas   = document.getElementById('threeCanvas');
const wrap     = canvas.parentElement;
const overlay  = document.getElementById('loadingOverlay');
const loadTxt  = document.querySelector('.loading-text');

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled  = true;
renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
renderer.outputColorSpace   = THREE.SRGBColorSpace;
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2118);
scene.fog = new THREE.Fog(0x2a2118, 12, 50);

// Camera
const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 100);
camera.position.set(4, 3, 6);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping  = true;
controls.dampingFactor  = 0.06;
controls.minDistance    = 2;
controls.maxDistance    = 15;
controls.maxPolarAngle  = Math.PI / 2 - 0.05;
controls.target.set(0, 1, 0);

// Lights
scene.add(new THREE.AmbientLight(0xfaf7f2, 0.7));

const dirLight = new THREE.DirectionalLight(0xffe8c0, 1.4);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

scene.add(Object.assign(new THREE.DirectionalLight(0xc4b49a, 0.4), { position: new THREE.Vector3(-5, 2, -5) }));

const pointLight = new THREE.PointLight(0xb8975a, 0.8, 20);
pointLight.position.set(0, 4, 0);
scene.add(pointLight);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x1a150f, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Resize
function resize() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// Load model
const loader = new GLTFLoader();
let currentModel = null;

window.loadModel = function (el) {
  document.querySelectorAll('.project-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');

  overlay.classList.remove('hidden');
  overlay.style.opacity = '1';
  loadTxt.textContent = 'Carregando ambiente...';

  if (currentModel) { scene.remove(currentModel); currentModel = null; }

  loader.load(
    el.dataset.model,
    gltf => {
      currentModel = gltf.scene;
      const box    = new THREE.Box3().setFromObject(currentModel);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      const scale  = 3.5 / Math.max(size.x, size.y, size.z);
      currentModel.scale.setScalar(scale);
      currentModel.position.sub(center.multiplyScalar(scale));
      currentModel.position.y = 0;
      currentModel.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
      scene.add(currentModel);
      controls.target.set(0, 1, 0);
      controls.reset();
      camera.position.set(4, 3, 6);
      overlay.classList.add('hidden');
    },
    xhr => {
      if (xhr.total > 0) loadTxt.textContent = `Carregando... ${Math.round(xhr.loaded / xhr.total * 100)}%`;
    },
    err => {
      console.error('Erro ao carregar modelo:', err);
      loadTxt.textContent = 'Erro ao carregar modelo';
      setTimeout(() => overlay.classList.add('hidden'), 2500);
    }
  );
};

// Auto-load primeiro modelo
window.loadModel(document.querySelector('.project-item.active'));

// Animate
let time = 0;
(function animate() {
  requestAnimationFrame(animate);
  time += 0.005;
  controls.update();
  pointLight.position.x = Math.sin(time) * 2;
  pointLight.intensity  = 0.7 + Math.sin(time * 2) * 0.1;
  renderer.render(scene, camera);
})();
