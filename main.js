// Scene setup
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(800, 500);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

// Camera
const camera = new THREE.PerspectiveCamera(75, 800 / 500, 0.1, 1000);
camera.position.z = 5;

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Load models
let model;
const loader = new THREE.GLTFLoader();
const models = {
  aventador: { path: 'Models/Aventador.glb', yOffset: 0   },
  car:        { path: 'Models/car.glb',       yOffset: 0.3 },
  truck:      { path: 'Models/truck.glb',     yOffset: 0.3 }
};


// Load models into scene
function loadModel(path,  yOffset = 0) {
  // Remove existing model from scene
  if (model) scene.remove(model);

  loader.load(path, function (gltf) {
    model = gltf.scene;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    model.scale.setScalar(2 / maxDim);

    model.position.y += yOffset;

    scene.add(model);
    camera.position.z = 2;
  });
}

// Load default model on page start
loadModel(models.aventador.path, models.aventador.yOffset);

// Change models with buttons
window.switchModel = function(key) {
  loadModel(models[key].path, models[key].yOffset);

  document.querySelectorAll('.model-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-model="${key}"]`).classList.add('active');
};

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (model) model.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();