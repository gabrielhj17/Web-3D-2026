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

// Load GLB model
let model;
const loader = new THREE.GLTFLoader();
loader.load('Models/Aventador.glb', function (gltf) {
  model = gltf.scene;

  // Auto-center and scale the model
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // Center the model
  model.position.sub(center);

  // Scale it to fit the view
  const maxDim = Math.max(size.x, size.y, size.z);
  model.scale.setScalar(2 / maxDim);

  scene.add(model);

  // Move camera back enough to see it
  camera.position.z = 1.5;
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (model) {
    model.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}
animate();