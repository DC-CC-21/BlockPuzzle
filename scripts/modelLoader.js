import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import { MeshBVH, MeshBVHHelper } from "three-mesh-bvh";

const loader = new GLTFLoader();

export async function loadModel(url, loadingElement) {
  return new Promise((resolve) => {
    loader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      (xhr) => {
        if (loadingElement) {
          const percent = (xhr.loaded / xhr.total) * 100;
          if (percent === 100) {
            loadingElement.style.display = "none";
          } else {
            loadingElement.textContent = `Loading... ${Math.round(percent)}%`;
          }
        }
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

export function getPieces(scene) {
  return scene.children
    .filter((child) => child.name.toLowerCase().includes("piece"))
    .map((x) => {
      x.children[0].material = x.children[0].material.clone();
      x.children[1].material = x.children[1].material.clone();
      x.originalPosition = x.position.clone();
      x.originalRotation = x.rotation.clone();
      x.targetPosition = null;
      return x;
    });
}
