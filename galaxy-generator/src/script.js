import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Base
 */
// Debug
const gui = new GUI({
  width: 360,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

//Galaxy
const parameters = {
  count: 150000,
  size: 0.01,
  radius: 5,
  branches: 4,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
  coreSize: 0.5,
  coreConcentration: 2,
  rotationSpeed: 0.05,
};

let geometry = null;
let material = null;
let points = null;
let backgroundStars = null;

const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const scales = new Float32Array(parameters.count);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  // Colores adicionales para más realismo
  const colorCore = new THREE.Color("#ffffff"); // Blanco para el núcleo
  const colorBlue = new THREE.Color("#4a9eff"); // Estrellas jóvenes azules
  const colorYellow = new THREE.Color("#ffeb99"); // Estrellas amarillas

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Distribución más realista: más estrellas en el centro
    let radius;
    const isCore = Math.random() < 0.3; // 30% de estrellas en el núcleo

    if (isCore) {
      // Núcleo denso
      radius =
        Math.pow(Math.random(), parameters.coreConcentration) *
        parameters.coreSize;
    } else {
      // Disco galáctico
      radius =
        parameters.coreSize +
        Math.pow(Math.random(), 0.7) *
          (parameters.radius - parameters.coreSize);
    }

    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    const thicknessFactor = Math.exp((-radius / parameters.radius) * 2);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius *
      thicknessFactor *
      0.3; // Más plano

    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    let finalColor;
    const distanceFromCenter = radius / parameters.radius;

    if (isCore) {
      // Núcleo: predominantemente blanco/amarillo
      finalColor = colorCore.clone();
      finalColor.lerp(colorInside, Math.random() * 0.3);
    } else {
      // Brazos: mezcla de colores
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, distanceFromCenter);

      // Agregar variación con estrellas azules y amarillas
      const colorVariation = Math.random();
      if (colorVariation < 0.15) {
        finalColor = colorBlue.clone();
        finalColor.lerp(mixedColor, 0.5);
      } else if (colorVariation < 0.3) {
        finalColor = colorYellow.clone();
        finalColor.lerp(mixedColor, 0.6);
      } else {
        finalColor = mixedColor;
      }
    }

    colors[i3] = finalColor.r;
    colors[i3 + 1] = finalColor.g;
    colors[i3 + 2] = finalColor.b;

    // Tamaños variables: estrellas más grandes en el centro
    scales[i] = Math.random() * (isCore ? 2.0 : 1.0);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    alphaMap: createStarTexture(),
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
};

// Función para crear textura de estrella
const createStarTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");

  // Crear gradiente radial para estrella
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.3)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// Generar campo de estrellas de fondo
const generateBackgroundStars = () => {
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 10000;
  const starsPositions = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;
    // Estrellas en una esfera grande
    const radius = 20 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    starsPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    starsPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starsPositions[i3 + 2] = radius * Math.cos(phi);
  }

  starsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starsPositions, 3)
  );

  const starsMaterial = new THREE.PointsMaterial({
    size: 0.015,
    sizeAttenuation: true,
    color: "#ffffff",
    transparent: true,
    opacity: 0.8,
    alphaMap: createStarTexture(),
  });

  backgroundStars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(backgroundStars);
};

generateBackgroundStars();

generateGalaxy();

gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "radius")
  .min(0.1)
  .max(20)
  .step(0.1)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "branches")
  .min(1)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "spin")
  .min(0)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);
gui
  .add(parameters, "coreSize")
  .min(0.1)
  .max(2)
  .step(0.1)
  .name("Core Size")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "coreConcentration")
  .min(1)
  .max(5)
  .step(0.1)
  .name("Core Density")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "rotationSpeed")
  .min(0)
  .max(0.5)
  .step(0.01)
  .name("Rotation Speed");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Fondo oscuro para resaltar la galaxia
renderer.setClearColor("#050510");

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Rotar la galaxia lentamente
  if (points) {
    points.rotation.y = elapsedTime * parameters.rotationSpeed;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
