document.addEventListener("DOMContentLoaded", function () {
  // Three.js setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const container = document.getElementById("canvas-container");

  // Variables for rotation handling
  let isDragging = false;
  let previousMousePosition = {
    x: 0,
    y: 0,
  };

  // Add mouse/touch event listeners for rotation
  container.addEventListener("mousedown", startDragging);
  container.addEventListener("mousemove", drag);
  container.addEventListener("mouseup", stopDragging);
  container.addEventListener("mouseleave", stopDragging);

  // Touch events
  container.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDragging(e.touches[0]);
  });
  container.addEventListener("touchmove", (e) => {
    e.preventDefault();
    drag(e.touches[0]);
  });
  container.addEventListener("touchend", stopDragging);

  function startDragging(event) {
    isDragging = true;
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function drag(event) {
    if (!isDragging || !mesh) return;

    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };

    mesh.rotation.y += deltaMove.x * 0.01;
    mesh.rotation.x += deltaMove.y * 0.01;

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function stopDragging() {
    isDragging = false;
  }

  // Set renderer size and add to container
  function updateRendererSize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
  }
  updateRendererSize();
  container.appendChild(renderer.domElement);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Camera position
  camera.position.set(15, 15, 15);
  camera.lookAt(0, 0, 0);

  // Add grid helper
  const gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);

  // Form elements
  const volumeInput = document.getElementById("volume");
  const heightInput = document.getElementById("height");
  const sideAInput = document.getElementById("sideA");
  const sideBInput = document.getElementById("sideB");
  const lengthInput = document.getElementById("length");

  // Value display elements
  const heightValue = document.getElementById("heightValue");
  const sideAValue = document.getElementById("sideAValue");
  const sideBValue = document.getElementById("sideBValue");
  const lengthValue = document.getElementById("lengthValue");
  const currentVolume = document.getElementById("currentVolume");

  // Geometry variables
  let geometry;
  let material;
  let mesh;

  function createTrapezoidGeometry(height, sideA, sideB, length) {
    const shape = new THREE.Shape();

    // Define trapezoid shape
    shape.moveTo(-sideA / 2, -length / 2);
    shape.lineTo(sideA / 2, -length / 2);
    shape.lineTo(sideB / 2, length / 2);
    shape.lineTo(-sideB / 2, length / 2);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: height,
      bevelEnabled: false,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  function updateGeometry() {
    const height = parseFloat(heightInput.value);
    const sideA = parseFloat(sideAInput.value);
    const sideB = parseFloat(sideBInput.value);
    const length = parseFloat(lengthInput.value);

    // Remove existing mesh if it exists
    if (mesh) scene.remove(mesh);

    // Create new geometry
    geometry = createTrapezoidGeometry(height, sideA, sideB, length);
    material = new THREE.MeshPhongMaterial({
      color: 0x3498db,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, height / 2, 0);
    scene.add(mesh);

    // Calculate and update volume
    const volume = ((sideA + sideB) / 2) * height * length;
    currentVolume.textContent = volume.toFixed(2);

    // Update slider values display
    heightValue.textContent = height.toFixed(1);
    sideAValue.textContent = sideA.toFixed(1);
    sideBValue.textContent = sideB.toFixed(1);
    lengthValue.textContent = length.toFixed(1);
  }

  function updateSliderConstraints() {
    const targetVolume = parseFloat(volumeInput.value);
    const height = parseFloat(heightInput.value);
    const length = parseFloat(lengthInput.value);

    const maxSide = (2 * targetVolume) / (height * length);

    sideAInput.max = maxSide;
    sideBInput.max = maxSide;
  }

  // Add event listeners
  heightInput.addEventListener("input", updateGeometry);
  sideAInput.addEventListener("input", updateGeometry);
  sideBInput.addEventListener("input", updateGeometry);
  lengthInput.addEventListener("input", updateGeometry);
  volumeInput.addEventListener("input", updateSliderConstraints);

  // Handle window resize
  window.addEventListener("resize", updateRendererSize);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  // Initial setup
  updateGeometry();
  animate();
});
