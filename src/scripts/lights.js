import * as THREE from "three";

export function AmbientLight(color, intensity, scene) {
  // Create an ambient light with the specified color and intensity
  const ambientLight = new THREE.AmbientLight(color, intensity);
  ambientLight.position.set(5, 10, 7.5);

  // Add it to the scene.
  scene.add(ambientLight);

  // Return the created ambient light
  return ambientLight;
}

export function DirectionalLight(color, intensity, scene) {
  // Create a directional light with the specified color and intensity
  const directionalLight = new THREE.DirectionalLight(color, intensity);
  directionalLight.position.set(5, 10, 7.5);

  directionalLight.castShadow = true;

  // Add it to the scene
  scene.add(directionalLight);

  // Return the created directional light
  return directionalLight;
}
