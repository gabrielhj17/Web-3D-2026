let scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false, currentModel = 'Aventador.glb', params, lights;
let loadedModel;
let secondModelMixer, secondModelActions = [];
const loader = new THREE.GLTFLoader();
const assetPath = 'Models/';

const modelTitles = {
  'Aventador.glb': 'Web 3D Motors Bamborghini Baventador',
  'Car.glb':       'Web 3D Motors Family Car',
  'Truck.glb':     'Web 3D Motors Pickup Truck'
};

init();

function init() {
  const canvas = document.getElementById('three-canvas');

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);

  camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(-5, 25, 20);

  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(ambient);

  lights = {};

  lights.spot = new THREE.SpotLight();
  lights.spot.visible = true;
  lights.spot.position.set(0, 20, 0);
  lights.spotHelper = new THREE.SpotLightHelper(lights.spot);
  lights.spotHelper.visible = false;
  scene.add(lights.spotHelper);
  scene.add(lights.spot);

  params = {
    spot: {
      enable: false,
      color: 0xffffff,
      distance: 20,
      angle: Math.PI/2,
      penumbra: 0,
      helper: false,
      moving: false
    }
  }

  const gui = new dat.GUI({ autoPlace: false });
  const guiContainer = document.getElementById('gui-container');
  guiContainer.appendChild(gui.domElement);

  guiContainer.style.position = 'fixed';

  const spot = gui.addFolder('Spot');
  spot.open();
  spot.add(params.spot, 'enable').onChange(value => { 
    lights.spot.visible = value 
  });
  spot.addColor(params.spot, 'color').onChange( 
    value => lights.spot.color = new THREE.Color(value));
  spot.add(params.spot,'distance').min(0).max(20).onChange( value => lights.spot.distance = value);
  spot.add(params.spot,'angle').min(0.1).max(6.28).onChange( value => lights.spot.angle = value );
  spot.add(params.spot,'penumbra').min(0).max(1).onChange( value => lights.spot.penumbra = value );
  spot.add(params.spot, 'helper').onChange(value => lights.spotHelper.visible = value);
  spot.add(params.spot, 'moving');

  const time = clock.getElapsedTime();
  const delta = Math.sin(time)*5;
  if (params.spot.moving) {
    lights.spot.position.x = delta;
    lights.spotHelper.update();
  }

  const light = new THREE.DirectionalLight(0xFFFFFF, 2);
  light.position.set(0, 10, 2);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(1, 2, 0);
  controls.update();

  loader.load(assetPath + 'Aventador.glb', function (gltf) {
    const model = gltf.scene;
    scene.add(model);

    loadedModel = model;

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach(clip => {
      actions.push(mixer.clipAction(clip));
    });
  });

  window.addEventListener('resize', resize, false);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(clock.getDelta());
  renderer.render(scene, camera);
}

// Handle window resize
function resize() {
  const canvas = document.getElementById('three-canvas');
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

// Wireframe button logic
const wireframeBtn = document.getElementById("toggleWireframe");
wireframeBtn.addEventListener('click', function() {
  isWireframe = !isWireframe;
  toggleWireframe(isWireframe);
});

// Wireframe function
function toggleWireframe(enable) {
  scene.traverse(function (object) {
    if (object.isMesh) {
      object.material.wireframe = enable;
    }
  })
}

// Rotation button logic
const rotateBtn = document.getElementById("Rotate");
rotateBtn.addEventListener('click', function() {
  if (loadedModel) {
    const axis = new THREE.Vector3(0, 1, 0);
    const angle = Math.PI / 8; // Rotate 22.5 degrees
    loadedModel.rotateOnAxis(axis, angle);
  } else {
    console.warn('Model not loaded yet');
  }
})

// Function to load second model
function loadModel(modelPath) {
  // Remove the current model if it exists
  if (loadedModel) {
    scene.remove(loadedModel);
  }

  // Load new model
  loader.load(modelPath, function (gltf) {
    const model = gltf.scene;

    // Set model position and add it
    model.position.set(0, 0, 0);
    scene.add(model);

    loadedModel = model;

    // Reset animations
    mixer = new THREE.AnimationMixer(model);
    const animations = gltf.animations;
    actions = [];

    animations.forEach(clip => {
      const action = mixer.clipAction(clip);
      actions.push(action);
    })
  })
}

// Event listener for switch model button
const switchBtn = document.getElementById("switchModel");
switchBtn.addEventListener('click', function () {
  if (currentModel === 'Aventador.glb') {
    currentModel = 'Car.glb';
    loadModel(assetPath + 'Car.glb');
  } else if (currentModel === 'Car.glb') {
    currentModel = 'Truck.glb';
    loadModel(assetPath + 'Truck.glb');
  } else {
    currentModel = 'Aventador.glb';
    loadModel(assetPath + 'Aventador.glb');
  }
  // Update car title
  document.querySelector('.car-title').textContent = modelTitles[currentModel];
});