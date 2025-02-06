document.addEventListener("DOMContentLoaded", function () {
  // Three.js setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0); // Light gray background
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const container = document.getElementById("canvas-container");

  // Add axes helper
  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);

  // Camera orbit variables
  let radius = 20;
  let theta = Math.PI / 4; // horizontal angle
  let phi = Math.PI / 4; // vertical angle

  function updateCameraPosition() {
    // Convert spherical coordinates to Cartesian
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(0, 0, 0);
  }

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
    if (!isDragging) return;

    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };

    // Update angles
    theta -= deltaMove.x * 0.01;
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi + deltaMove.y * 0.01));

    updateCameraPosition();

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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Add directional lights from different angles
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight1.position.set(5, 5, 5);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
  directionalLight2.position.set(-5, 5, -5);
  scene.add(directionalLight2);

  // Initial camera position
  updateCameraPosition();

  // Add grid helper
  const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
  gridHelper.position.y = 0; // Align with the bottom of the shape
  scene.add(gridHelper);

  // Form elements
  const volumeInput = document.getElementById("volume");
  const shapeSelect = document.getElementById("shapeSelect");

  // Shape parameter containers
  const trapezoidParams = document.getElementById("trapezoidParams");
  const cuboidParams = document.getElementById("cuboidParams");
  const cylinderParams = document.getElementById("cylinderParams");
  const coneParams = document.getElementById("coneParams");

  // Trapezoid elements
  const heightInput = document.getElementById("height");
  const sideAInput = document.getElementById("sideA");
  const sideBInput = document.getElementById("sideB");
  const lengthInput = document.getElementById("length");

  // Cuboid elements
  const cuboidHeightInput = document.getElementById("cuboidHeight");
  const widthInput = document.getElementById("width");
  const depthInput = document.getElementById("depth");

  // Cylinder elements
  const cylinderHeightInput = document.getElementById("cylinderHeight");
  const radiusInput = document.getElementById("radius");

  // Cone elements
  const coneHeightInput = document.getElementById("coneHeight");
  const coneRadiusInput = document.getElementById("coneRadius");

  // Value display elements
  const heightValue = document.getElementById("heightValue");
  const sideAValue = document.getElementById("sideAValue");
  const sideBValue = document.getElementById("sideBValue");
  const lengthValue = document.getElementById("lengthValue");
  const cuboidHeightValue = document.getElementById("cuboidHeightValue");
  const widthValue = document.getElementById("widthValue");
  const depthValue = document.getElementById("depthValue");
  const cylinderHeightValue = document.getElementById("cylinderHeightValue");
  const radiusValue = document.getElementById("radiusValue");
  const coneHeightValue = document.getElementById("coneHeightValue");
  const coneRadiusValue = document.getElementById("coneRadiusValue");
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

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Translate geometry so extrusion is centered at y=0
    geometry.translate(0, 0, -height / 2);
    return geometry;
  }

  function createCylinderGeometry(height, radius) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    geometry.translate(0, 0, 0);
    return geometry;
  }

  function createConeGeometry(height, radius) {
    const geometry = new THREE.ConeGeometry(radius, height, 32);
    geometry.translate(0, 0, 0);
    return geometry;
  }

  function createCuboidGeometry(height, width, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    return geometry;
  }

  function showActiveParams() {
    const shape = shapeSelect.value;
    trapezoidParams.style.display = shape === "trapezoid" ? "block" : "none";
    cuboidParams.style.display = shape === "cuboid" ? "block" : "none";
    cylinderParams.style.display = shape === "cylinder" ? "block" : "none";
    coneParams.style.display = shape === "cone" ? "block" : "none";
  }

  function updateGeometry() {
    const shape = shapeSelect.value;
    const targetVolume = parseFloat(volumeInput.value);
    let volume;

    // Remove existing mesh if it exists
    if (mesh) scene.remove(mesh);

    switch (shape) {
      case "trapezoid": {
        const height = parseFloat(heightInput.value);
        const sideA = parseFloat(sideAInput.value);
        const sideB = parseFloat(sideBInput.value);
        const length = parseFloat(lengthInput.value);

        geometry = createTrapezoidGeometry(height, sideA, sideB, length);
        volume = ((sideA + sideB) / 2) * height * length;
        break;
      }
      case "cuboid": {
        const height = parseFloat(cuboidHeightInput.value);
        const width = parseFloat(widthInput.value);
        const depth = parseFloat(depthInput.value);

        geometry = createCuboidGeometry(height, width, depth);
        volume = width * height * depth;
        break;
      }
      case "cylinder": {
        const height = parseFloat(cylinderHeightInput.value);
        const radius = parseFloat(radiusInput.value);

        geometry = createCylinderGeometry(height, radius);
        volume = Math.PI * radius * radius * height;
        break;
      }
      case "cone": {
        const height = parseFloat(coneHeightInput.value);
        const radius = parseFloat(coneRadiusInput.value);

        geometry = createConeGeometry(height, radius);
        volume = (1 / 3) * Math.PI * radius * radius * height;
        break;
      }
    }

    material = new THREE.MeshPhongMaterial({
      color: 0x3498db,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      shininess: 50,
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    scene.add(mesh);

    currentVolume.textContent = volume.toFixed(2);
    currentVolume.style.color = volume > targetVolume ? "#ff4444" : "#2c3e50";
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
  shapeSelect.addEventListener("change", () => {
    showActiveParams();
    updateGeometry();
  });
  heightInput.addEventListener("input", updateGeometry);
  sideAInput.addEventListener("input", updateGeometry);
  sideBInput.addEventListener("input", updateGeometry);
  lengthInput.addEventListener("input", updateGeometry);
  cuboidHeightInput.addEventListener("input", updateGeometry);
  widthInput.addEventListener("input", updateGeometry);
  depthInput.addEventListener("input", updateGeometry);
  cylinderHeightInput.addEventListener("input", updateGeometry);
  radiusInput.addEventListener("input", updateGeometry);
  coneHeightInput.addEventListener("input", updateGeometry);
  coneRadiusInput.addEventListener("input", updateGeometry);
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

  // Add mouse wheel event for zoom
  container.addEventListener("wheel", (event) => {
    event.preventDefault();
    radius = Math.max(5, Math.min(50, radius + event.deltaY * 0.05));
    updateCameraPosition();
  });
});
