// three.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// imports for controls and glTF loader (CDN)
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// new three.js scene
const scene = new THREE.Scene();

// root group that will contain the loaded model; keep a stable pivot at scene origin
const modelRoot = new THREE.Group();
scene.add(modelRoot);

// create new camera with position - angles (aspect set to container below)
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

// keep track on mouse position (used for a small tilt effect)
let mouseX = 0;
let mouseY = 0;

// set object on global variable
let object = null;

// OrbitControls instance
let controls;

// model folder to render
const polyModel = 'low_poly_planet_earth';

// glTF loader
const loader = new GLTFLoader();

loader.load(
  "low_poly_planet_earth/scene.gltf",
  (gltf) => {
  object = gltf.scene;
  modelRoot.add(object);
//pivot set in origin

    // 1 = original
    const scaleFactor = 2; // increase to make globe larger, reduce <1 to shrink
    object.scale.setScalar(scaleFactor);

    // center at origin (recompute after scaling)
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);

  // Material-level brightness notes (per-mesh)
  // - Many glTF materials are PBR (MeshStandardMaterial). The following properties
  //   control how bright or shiny a surface appears:
  //     * material.emissive (adds self-illumination)
  //     * material.emissiveIntensity (multiplies emissive)
  //     * material.color (base albedo)
  //     * material.roughness (lower = shinier, stronger specular highlights)
  //     * material.metalness (influences specular response)
  // - Example: to add a subtle global emissive uplift after load (commented):
  // object.traverse((node) => {
  //   if (node.isMesh && node.material) {
  //     // node.material.emissive = new THREE.Color(0x111111);
  //     // node.material.emissiveIntensity = 0.05;
  //     // node.material.needsUpdate = true;
  //   }
  // });

    // auto-frame in view (recompute bounding sphere after scaling)
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const r = sphere.radius;
    const fov = THREE.MathUtils.degToRad(camera.fov);
    let dist = r / Math.tan(fov / 2);   // formula for distancne
    dist *= .8;                        // distance var, smaller, closer, bigger

    camera.position.set(0, 0, dist);
    camera.near = Math.max(0.01, dist - r * 3);
    camera.far = dist + r * 3;
    camera.updateProjectionMatrix();

    // ensure controls target is centered on the model
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
  },
  (xhr) => {
    if (xhr.total) console.log(`${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
  },
  (err) => console.error("GLTF load error:", err)
);


// renderer and add to the DOM inside #container3D
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // transparent background
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const container = document.getElementById('container3D') || document.body;
// set renderer size to the container's size so the canvas lives inside it
const rawInitialWidth = container.clientWidth || window.innerWidth;
const rawInitialHeight = container.clientHeight || window.innerHeight;

// Attempt to read site's --maxw CSS variable as a maximum canvas width; fallback to 1200px
const rootStyles = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
let parsedMaxW = 1200;
if (rootStyles) {
  const cssMaxW = rootStyles.getPropertyValue('--maxw') || '';
  const px = cssMaxW.trim().match(/(\d+)/);
  if (px && px[1]) parsedMaxW = Number(px[1]);
}
// Set a maximum height based on a reasonable aspect (e.g., 0.7 of max width) but capped
const parsedMaxH = Math.round(parsedMaxW * 0.7) || 800;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
// ensure we never exceed the current window size (keeps canvas inside viewport)
const maxAllowedW = Math.min(parsedMaxW, window.innerWidth || parsedMaxW);
const maxAllowedH = Math.min(parsedMaxH, window.innerHeight || parsedMaxH);
const initialWidth = clamp(rawInitialWidth, 320, maxAllowedW);
const initialHeight = clamp(rawInitialHeight, 240, maxAllowedH);
renderer.setSize(initialWidth, initialHeight);
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

// NOTES: brightness & exposure controls
// - The two primary places that change overall scene brightness are the lights below
//   (AmbientLight and DirectionalLights) and the renderer's toneMapping/exposure.
// - To globally adjust perceived brightness without touching lights, uncomment and tweak:
//   renderer.toneMapping = THREE.ACESFilmicToneMapping; // try ReinhardToneMapping or ACES
//   renderer.toneMappingExposure = 1.0; // >1 brighter, <1 darker
// - Per-material properties (material.emissive, material.color, material.roughness)
//   also significantly affect how bright surfaces look. See material notes near loader.

// now set camera aspect based on the container so view isn't stretched
camera.aspect = initialWidth / initialHeight;
camera.updateProjectionMatrix();

// set how far the camera is from the 3d model
camera.position.z = polyModel === 'low_poly_planet_earth' ? 25 : 500;

// lights
// ===== Brightness-affecting lights =====
// Tip: change the second parameter (intensity) of each light to adjust how much it
// lights the scene. AmbientLight lifts shadowed areas globally; DirectionalLights
// provide hard directional illumination and highlights.
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, polyModel === 'low_poly_planet_earth' ? 1.5 : 1);
scene.add(ambientLight);


// aesthetic front/key light: warm directional light placed front-right-above
// - This acts as a fill or key depending on intensity. Reduce to lessen its effect.
// - Move position closer/farther to change the highlight angle on the model.
const frontLight = new THREE.DirectionalLight(0xfff1e0, 0.4);
frontLight.position.set(2.2, 1.8, 4.5);
frontLight.name = 'frontLight';
scene.add(frontLight);
scene.add(frontLight.target);
frontLight.target.position.set(0,0,0);

// Quick brightness tuning hints:
// - Make shadows lighter by increasing ambient intensity (e.g., 0.2 - 0.6). Too high = flat lighting.
// - Make highlights stronger by increasing directional light intensity or moving the light closer.
// - Change light color to warm (0xffe0bd) or cool (0xddeeff) to affect perceived warmth/brightness.

// controls for camera rotation/ zoom
if (polyModel === 'low_poly_planet_earth') {
    controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // disable zooming with mouse wheel or touch gestures
  controls.enableZoom = false;
  // disable panning so dragging won't move the target around
  controls.enablePan = false;
}

//rotation only via drag (OrbitControls)

// scene render loop (single definition)
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if (controls) controls.update();

    if (object) {
      // gentle auto-rotation only; no hover-based tilting, higher number faster rotation
      object.rotation.y += 0.4 * dt;
    }

  renderer.render(scene, camera);
}

// resize handler
window.addEventListener("resize", () => {
  const rawW = container.clientWidth || window.innerWidth;
  const rawH = container.clientHeight || window.innerHeight;
  // clamp to the lesser of the site's configured maximums and the current window size
  const maxW = Math.min(parsedMaxW, window.innerWidth || parsedMaxW);
  const maxH = Math.min(parsedMaxH, window.innerHeight || parsedMaxH);
  const w = clamp(rawW, 320, maxW);
  const h = clamp(rawH, 240, maxH);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

animate();

container.addEventListener('wheel', (e) => {
  // only block when the pointer is over the 3D container
  e.preventDefault();
}, { passive: false });