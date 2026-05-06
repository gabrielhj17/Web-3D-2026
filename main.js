let scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false, 
  currentModel = 'Aventador.glb', params, lights, controls, loadedModel, secondModelMixer, 
  secondModelActions = [], ambientLight, directionalLight, sound, isSpinning = false;
const loader = new THREE.GLTFLoader();
const assetPath = 'Models/';

const modelData = {
  'Aventador.glb': {
    scale: 1,
    position: new THREE.Vector3(0, 1, 0),
    title:       'Web 3D Bamborghini Baventador',
    subtitle:    '2026 Model · Super Sports',
    price:       '£189,900',
    engine:      '6.5L V12',
    horsepower:  '700 hp',
    zeroToSixty: '2.9 sec',
    topSpeed:    '217 mph',
    drivetrain:  'AWD',
    transmission:'7-speed ISR',
    weight:      '1,575 kg',
    colour:      'Cherry Red',
    description: 'The Baventador is the pinnacle of Italian-inspired engineering, combining raw V12 power with a lightweight carbon fibre chassis for an unmatched driving experience.'
  },
  'Car.glb': {
    scale: 2,
    position: new THREE.Vector3(0, 0, 0),
    title:       'Web 3D Family Cruiser',
    subtitle:    '2026 Model · Family Saloon',
    price:       '£32,500',
    engine:      '2.0L Inline-4',
    horsepower:  '180 hp',
    zeroToSixty: '7.8 sec',
    topSpeed:    '130 mph',
    drivetrain:  'FWD',
    transmission:'6-speed Auto',
    weight:      '1,350 kg',
    colour:      'Ghastly Green',
    description: 'The Family Cruiser offers comfort, practicality and reliability for everyday life, with a refined interior and smooth ride quality.'
  },
  'Truck.glb': {
    scale: 2,
    position: new THREE.Vector3(0, 0, 0),
    title:       'Web 3D Pickup Truck',
    subtitle:    '2026 Model · Heavy Duty',
    price:       '£54,000',
    engine:      '3.5L V6 Turbo',
    horsepower:  '400 hp',
    zeroToSixty: '5.5 sec',
    topSpeed:    '118 mph',
    drivetrain:  '4WD',
    transmission:'10-speed Auto',
    weight:      '2,100 kg',
    colour:      'Pretentious Purple',
    description: 'Built for work and adventure, the Pickup Truck delivers serious towing capability and off-road performance without sacrificing daily comfort.'
  }
};

init();

function init() {
  const canvas = document.getElementById('three-canvas');

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);

  camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(-5, 5, 6);

  ambientLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xFFFFFF, 2);
  directionalLight.position.set(0, 10, 2);
  scene.add(directionalLight);

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

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();

  loader.load(assetPath + 'Aventador.glb', function (gltf) {
    const model = gltf.scene;
    const data = modelData['Aventador.glb'];

    model.scale.set(data.scale, data.scale, data.scale);
    model.position.copy(data.position);

    scene.add(model);
    loadedModel = model;

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach(clip => {
      actions.push(mixer.clipAction(clip));
    });
  });

  const listener = new THREE.AudioListener();
  camera.add(listener);

  // Create a sound and attach it to the listener
  sound = new THREE.Audio(listener);

  // Load a sound and set it as the buffer for the audio object
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('Assets/Aventador Sound.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(1.0);
  });

  window.addEventListener('resize', resize, false);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(clock.getDelta());
  
  if (isSpinning && loadedModel) {
    loadedModel.rotation.y += 0.01;
  }
  
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

// Function to load model
function loadModel(modelPath) {
  // Remove the current model if it exists
  if (loadedModel) {
    scene.remove(loadedModel);
  }

  const modelKey = modelPath.replace(assetPath, '');
  const data = modelData[modelKey];

  // Load new model
  loader.load(modelPath, function (gltf) {
    const model = gltf.scene;

    // Get the scale for this model
    model.scale.set(data.scale, data.scale, data.scale);
    model.position.copy(data.position);

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

// Update car specs panel when model changed
function updateInfoPanel(modelKey) {
  const data = modelData[modelKey];
  if (!data) return;

  document.querySelector('.info-title').textContent       = data.title;
  document.querySelector('.info-subtitle').textContent    = data.subtitle;
  document.querySelector('.info-price').textContent       = data.price;
  document.querySelector('.info-description').textContent = data.description;

  const values = document.querySelectorAll('.spec-value');
  values[0].textContent = data.engine;
  values[1].textContent = data.horsepower;
  values[2].textContent = data.zeroToSixty;
  values[3].textContent = data.topSpeed;
  values[4].textContent = data.drivetrain;
  values[5].textContent = data.transmission;
  values[6].textContent = data.weight;
  values[7].textContent = data.colour;
}

// Event listener for switch model button
const switchBtn = document.getElementById("switchModel");
switchBtn.addEventListener('click', function () {
  isSpinning = false;
  sound.stop();
  // Switch model
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

  // Update button text based on new model
  if (currentModel === 'Aventador.glb') {
    playModelAnimationBtn.textContent = 'See it Driving';
  } else {
    playModelAnimationBtn.textContent = 'Spin Model';
  }

  // Update car title and specs
  document.querySelector('.car-title').textContent = modelData[currentModel].title;
  updateInfoPanel(currentModel);
});

// Camera view buttons
// Set active camera button
function setActiveCamBtn(activeId) {
  ['camFront', 'camSide', 'camTop', 'camDefault'].forEach(id => {
    document.getElementById(id).classList.remove('cam-active');
  });
  document.getElementById(activeId).classList.add('cam-active');
}
// Front view
document.getElementById('camFront').addEventListener('click', function () {
  camera.position.set(0, 2, 10);
  controls.target.set(0, 1, 0);
  controls.update();
  setActiveCamBtn('camFront');
});

// Side view
document.getElementById('camSide').addEventListener('click', function () {
  camera.position.set(10, 2, 0);
  controls.target.set(0, 1, 0);
  controls.update();
  setActiveCamBtn('camSide');
});

// Top view
document.getElementById('camTop').addEventListener('click', function () {
  camera.position.set(0, 12, 0);
  controls.target.set(0, 0, 0);
  controls.update();
  setActiveCamBtn('camTop');
});

// Default view
document.getElementById('camDefault').addEventListener('click', function () {
  camera.position.set(-5, 5, 6);
  controls.target.set(0, 1, 0);
  controls.update();
  setActiveCamBtn('camDefault');
});

// Spotlight toggle
document.getElementById('toggleSpot').addEventListener('click', function () {
  lights.spot.visible = !lights.spot.visible;
  params.spot.enable = lights.spot.visible;
  this.textContent = lights.spot.visible ? 'Spotlight: ON' : 'Spotlight: OFF';
  this.classList.toggle('light-on', lights.spot.visible);
  this.classList.toggle('light-off', !lights.spot.visible);
});

// Ambient toggle
document.getElementById('toggleAmbient').addEventListener('click', function () {
  ambientLight.visible = !ambientLight.visible;
  this.textContent = ambientLight.visible ? 'Ambient: ON' : 'Ambient: OFF';
  this.classList.toggle('light-on', ambientLight.visible);
  this.classList.toggle('light-off', !ambientLight.visible);
});

// Directional toggle
document.getElementById('toggleDirectional').addEventListener('click', function () {
  directionalLight.visible = !directionalLight.visible;
  this.textContent = directionalLight.visible ? 'Directional: ON' : 'Directional: OFF';
  this.classList.toggle('light-on', directionalLight.visible);
  this.classList.toggle('light-off', !directionalLight.visible);
});

const playModelAnimationBtn = document.getElementById("playAnimation");
playModelAnimationBtn.addEventListener('click', function () {
  if (actions.length > 0) {
    actions.forEach(action => {
      action.reset();
      action.setLoop(THREE.LoopOnce); // Play animation once 
      action.clampWhenFinished = true; // Stop animating at last fram 
      action.play();
    });
    // Play sound alongside animation
    if (sound.isPlaying) sound.stop();
    sound.play();
  } else {
    isSpinning = !isSpinning;
    this.textContent = isSpinning ? 'Stop Spinning' : 'Spin Model';
  }
});