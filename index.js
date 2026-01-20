import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

// ---------- Scene Setup ----------
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 4000);
camera.position.z = 1200;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// =====================
// PARTICLES
// =====================
const COUNT = 600;
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(COUNT * 3);
const velocities = new Float32Array(COUNT * 3);

for (let i = 0; i < COUNT * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 200;
  velocities[i] = (Math.random() - 0.5) * 300; // fast start
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 3,
  blending: THREE.AdditiveBlending,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// =====================
// TEXT SPRITE
// =====================

function loadFontFamily(name) {
  return document.fonts.load(`300 1em "${name}"`);
}

// — wait for the Google font to load
await loadFontFamily("Darker Grotesque");

function createTextSprite(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const fontSize = 200;
  ctx.font = `300 ${fontSize}px "Darker Grotesque"`;

  const textWidth = ctx.measureText(text).width;

  canvas.width = textWidth + 40;
  canvas.height = fontSize + 40;


  ctx.font = `300 ${fontSize}px "Darker Grotesque"`;
  ctx.fillStyle = "white";
  ctx.fillText(text, 20, fontSize + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(canvas.width * 0.15, canvas.height * 0.15, 1);

  return sprite;
}

const textSprite = createTextSprite(
  "For a moment, we were able to be still"
);
scene.add(textSprite);

/* bottom-left placement (camera-relative)
function updateTextPosition() {
  const v = new THREE.Vector3(-1, -1, 0.5);
  v.unproject(camera);
  v.x += 0;
  v.y += 15;
  textSprite.position.copy(v);
}
updateTextPosition();*/

// =====================
// INTERACTION (LINK)
// =====================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(textSprite);

  if (hits.length > 0) {
    window.open(
      "https://www.youtube.com/watch?v=AexrAvyJjJY",
      "_blank"
    );
  }
});

// =====================
// ANIMATION
// =====================
const slowDown = 0.991;

function animate() {
  requestAnimationFrame(animate);

  const pos = geometry.attributes.position.array;
  let avgSpeed = 0;

  for (let i = 0; i < pos.length; i += 3) {
    pos[i]     += velocities[i] * 0.05;
    pos[i + 1] += velocities[i + 1] * 0.02;
    pos[i + 2] += velocities[i + 2] * 0.02;

    velocities[i]     *= slowDown;
    velocities[i + 1] *= slowDown;
    velocities[i + 2] *= slowDown;

    avgSpeed += Math.abs(velocities[i]);
  }

  avgSpeed /= COUNT;

  // fade text in when motion settles
  if (avgSpeed < 2.3) {
    textSprite.material.opacity = Math.min(
      textSprite.material.opacity + 0.003,
      1
    );
  }

  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

animate();

// =====================
// RESIZE
// =====================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateTextPosition();
});