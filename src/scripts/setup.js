import * as THREE from "three";
import { DirectionalLight, AmbientLight } from "./lights";
import {
  RenderPass,
  UnrealBloomPass,
  EffectComposer,
  OutputPass,
} from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
export function setupScene(canvas) {
  // Create a new scene
  const scene = new THREE.Scene();

  // Add a perspective camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Create the WebGL renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // Set the size of the renderer to the window size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Set the pixel ratio for high DPI displays
  renderer.setPixelRatio(window.devicePixelRatio);

  // Enable shadows
  renderer.shadowMap.enabled = true;

  // Append the renderer to the document
  canvas.appendChild(renderer.domElement);

  // Bloom effect
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.2,
    0.5,
    0.6
  );
  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  // Add orbit controls for camera movement
  const controls = new OrbitControls(camera, renderer.domElement);

  // Setup the lights
  DirectionalLight(0xffffff, 2, scene);
  AmbientLight(0xffffff, 0.5, scene);

  // Set the camera position
  camera.position.set(50, 50, 50);

  // Return the created elements
  return {
    scene,
    camera,
    renderer,
    controls,
    composer,
  };
}
