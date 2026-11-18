import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

const loader = new GLTFLoader();

export async function loadModel(url, loadingElement) {
  const name = url.split("/").pop();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      (xhr) => {
        if (loadingElement) {
          const percent = (xhr.loaded / xhr.total) * 100;
          if (percent >= 100) {
            // loadingElement.style.display = "none";
          } else {
            loadingElement.textContent = `Loading ${name}... ${Math.round(
              percent
            )}%`;
          }
        }
      },
      (error) => {
        console.log(`Failed to load ${url}`);
        reject(error);
      }
    );
  });
}

export function getTargets(scene) {
  return scene.children
    .filter((child) => child.name.toLowerCase().includes("target"))
    .map((x) => {
      // Override material because otherwise changing the opacity alters every target because the material is shared
      x.material = new THREE.MeshBasicMaterial({
        opacity: 0.2,
        transparent: true,
      });
      return x;
    });
}

export function getCube(scene) {
  return scene.children
    .filter((child) => child.name.toLowerCase().includes("cube"))
    .map((x) => {
      x.material = x.material.clone();
      x.material.transparent = true;

      return x;
    });
}
