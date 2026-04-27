// Scene setup
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(800, 500);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

// Camera
const camera = new THREE.PerspectiveCamera(75, 800 / 500, 0.1, 1000);
camera.position.z = 3;

// 3D box
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Animate
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();