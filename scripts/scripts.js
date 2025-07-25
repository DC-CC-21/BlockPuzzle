import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AmbientLight, DirectionalLight } from "./lights";
import { getCube, getPieces, getTargets, loadModel } from "./modelLoader";
import {
  EffectComposer,
  OutputPass,
  RenderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import { data } from "../data";

const searchParams = new URLSearchParams(window.location.search);
const id = searchParams.get("level");
const pieces = data.find((item) => item.id == id).pieces;
const pieceIds = Object.values(pieces).filter((x) => x !== "");
console.log(pieces, pieceIds);

const loadingElement = document.getElementById("loading");
const rxButton = document.querySelector(".rotateIcon.x");
const ryButton = document.querySelector(".rotateIcon.y");
const rzButton = document.querySelector(".rotateIcon.z");
const placeButton = document.querySelector("#place");
const toggleCube = document.querySelector("#toggleCube");
const returnPiece = document.querySelector("#returnPiece");
const removePiece = document.querySelector("#removePiece");

function setupScene() {
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
  document.getElementById("canvas").appendChild(renderer.domElement);

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

(async () => {
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
  }

  // Initialize the scene, camera, renderer, and controls
  const { scene, camera, renderer, controls, composer } = setupScene();

  // Load the model
  const modelScene = await loadModel(
    "./models/Targets_W_Cube.glb",
    loadingElement
  );

  const pieces = [];
  for (const [index, id] of pieceIds.entries()) {
    const piece = (await loadModel(`./models/Piece${id}.glb`, loadingElement))
      .scene.children[0];
    piece.position.set(40 + 10 * index, 0, 0);
    pieces.push(piece);
    scene.add(piece);
  }

  scene.add(modelScene.scene);

  // Get targets, pieces, and cube
  const targets = getTargets(modelScene.scene);
  // const pieces = getPieces(modelScene.scene);
  const cube = getCube(modelScene.scene);

  // Set the variable for the current piece
  let currentPiece;
  const axesHelper = new THREE.AxesHelper(10);

  // ========== Render loop ========== //
  animate();

  // ========== Effects and Helpers ========== //
  function GlowPiece(piece) {
    piece.children[0].material.emissive.set(0xffff00);
    piece.children[0].material.emissiveIntensity = 0.5;
    piece.traverse((child) => {
      if (child.isMesh) {
      }
    });
  }
  function DeselectPiece() {
    if (currentPiece) {
      currentPiece.traverse((child) => {
        if (child.isMesh) {
          child.material.emissive.set(0x000000);
          child.material.emissiveIntensity = 0;
        }
      });
      currentPiece.remove(axesHelper);
      currentPiece = null;
    }
  }
  function ShowTargets() {
    targets.forEach((x) => (x.material.opacity = 0.2));
  }
  function HideTargets() {
    targets.forEach((x) => (x.material.opacity = 0));
  }
  function CheckCollision() {
    // Remove previous debug spheres/arrows
    if (window._debugCorners) {
      window._debugCorners.forEach((sphere) => {
        scene.remove(sphere);
      });
    }
    window._debugCorners = [];

    let collisionDetected = false;
    for (const piece of pieces) {
      if (piece.id === currentPiece.id) continue;

      const meshA = currentPiece.children.find((child) => child.isMesh);
      const { width, length } = PieceDimensions(piece);
      const meshB = piece.children.find((child) => child.isMesh);

      // Define +Z face corners in local space (assuming unit cube centered at origin)
      const half = width / 2.1;
      const offset = half * 0.5;
      const faceCorners = [
        new THREE.Vector3(0, 0, 0), // center
        new THREE.Vector3(-half, -half, 0), // bottom-left
        new THREE.Vector3(half, -half, 0), // bottom-right
        new THREE.Vector3(-half, half, 0), // top-left
        new THREE.Vector3(half, half, 0), // top-right

        // Offset
        new THREE.Vector3(-offset, 0, 0), // bottom-left
        new THREE.Vector3(offset, 0, 0), // bottom-right
        new THREE.Vector3(0, -offset, 0), // top-left
        new THREE.Vector3(0, offset, 0), // top-right
      ];

      // Convert corners to world space
      const worldCorners = faceCorners.map((corner) =>
        meshA.localToWorld(corner.clone())
      );

      // --- Visualization: Add spheres at each worldCorner ---
      worldCorners.forEach((corner, idx) => {
        const sphereGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.copy(corner);
        scene.add(sphere);
        window._debugCorners.push(sphere);

        // Optional: add an ArrowHelper to show the +Z direction
        const zDir = new THREE.Vector3(0, 0, 1)
          .applyQuaternion(meshA.getWorldQuaternion(new THREE.Quaternion()))
          .normalize();
        const arrow = new THREE.ArrowHelper(zDir, corner, 5, 0xff0000);
        scene.add(arrow);
        window._debugCorners.push(arrow);
      });

      // Define direction in local space and convert to world direction
      const zDir = new THREE.Vector3(0, 0, 1);
      meshA.updateMatrixWorld();
      zDir
        .applyQuaternion(meshA.getWorldQuaternion(new THREE.Quaternion()))
        .normalize();

      // Raycasting from each corner
      const raycaster = new THREE.Raycaster();
      raycaster.far = length;
      for (const corner of worldCorners) {
        raycaster.set(corner, zDir);
        const intersects = raycaster.intersectObject(meshB, true);
        if (intersects.length > 0) {
          console.log("Collision detected with piece:", piece);
          intersects.forEach((intersectedPiece) => {
            intersectedPiece.object.material.emissive.set(0xff0000);
            intersectedPiece.object.material.emissiveIntensity = 0.5;
          });
          ToggleCube(0.2);
          collisionDetected = true;
        }
      }
    }
    return collisionDetected ? "stop" : "continue";
  }
  function PieceDimensions(piece) {
    const boundingBox = new THREE.Box3().setFromObject(piece);
    const length = boundingBox.max.x - boundingBox.min.x;
    const width = boundingBox.max.y - boundingBox.min.y;
    const height = boundingBox.max.z - boundingBox.min.z;
    return {
      length: Math.max(length, width, height),
      width: Math.min(length, width, height),
    };
  }
  function AnimatePieceMovement(
    piece,
    targetPosition,
    targetRotation,
    duration = 500,
    during = null,
    after = null
  ) {
    if (!piece) return;
    console.log(during, after);
    const startPosition = piece.position.clone();
    const startRotation = piece.rotation.clone();
    const startTime = performance.now();

    function RotationTo90(rotation) {
      return new THREE.Euler(
        Math.round(rotation.x / (Math.PI / 2)) * (Math.PI / 2),
        Math.round(rotation.y / (Math.PI / 2)) * (Math.PI / 2),
        Math.round(rotation.z / (Math.PI / 2)) * (Math.PI / 2)
      );
    }
    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1); // Normalize to [0, 1]

      // Interpolate position and rotation
      const currentPosition = piece.position.clone();
      const currentRotation = piece.rotation.clone();
      piece.position.lerpVectors(startPosition, targetPosition, t);
      piece.rotation.x = THREE.MathUtils.lerp(
        startRotation.x,
        targetRotation.x,
        t
      );
      piece.rotation.y = THREE.MathUtils.lerp(
        startRotation.y,
        targetRotation.y,
        t
      );
      piece.rotation.z = THREE.MathUtils.lerp(
        startRotation.z,
        targetRotation.z,
        t
      );
      if (during) {
        if (during() === "stop") {
          piece.position.copy(currentPosition);
          piece.rotation.copy(currentRotation);
          piece.rotation.copy(RotationTo90(piece.rotation));
          after();
          return;
        }
      }
      if (t < 1) {
        requestAnimationFrame(animate);
      } else if (after) {
        piece.rotation.copy(RotationTo90(piece.rotation));
        after();
      }
    }
    animate();
  }

  // ========== Event listeners ========== //
  let mouseMoved = false;
  canvas.addEventListener("mousemove", () => {
    mouseMoved = true;
  });
  canvas.addEventListener("mousedown", () => {
    mouseMoved = false;
  });
  canvas.addEventListener("click", clickTarget);
  function clickTarget(event) {
    if (mouseMoved) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([
      ...cube,
      ...pieces,
      ...targets,
    ]);
    const intersectTarget = intersects?.[0]?.object;
    if (intersects.length === 0) {
      // If no target or piece is clicked, deselect the current piece and reset the targets
      DeselectPiece();
      HideTargets();
      return;
    } else if (intersectTarget.name === cube[0].name) {
      return;
    }
    // Check if a piece is clicked
    if (intersectTarget.name.toLowerCase().includes("piece")) {
      // Set the current piece
      currentPiece = intersectTarget.parent;

      // Reset the emissive color of the previously selected piece and glow the new piece
      pieces.forEach((piece) => {
        piece.traverse((child) => {
          if (child.isMesh) {
            child.material.emissive.set(0x000000);
            child.material.emissiveIntensity = 0;
          }
        });
      });
      GlowPiece(currentPiece);
      ShowTargets();

      // Remove axes helper from the previous piece
      currentPiece.add(axesHelper);
      return;
    } // If no piece is clicked, check if a target is clicked
    else if (
      intersectTarget.name.toLowerCase().includes("target") &&
      currentPiece
    ) {
      // Reset the opacity of all targets and set the clicked target to full opacity
      targets.forEach((x) => (x.material.opacity = 0.2));

      const currentTarget = intersectTarget;
      currentPiece.targetPosition = currentTarget.position.clone();
      currentPiece.targetRotation = currentTarget.rotation.clone();
      currentTarget.material.opacity = 1;

      // Position the current piece at the target's position and rotation
      AnimatePieceMovement(
        currentPiece,
        currentTarget.position,
        new THREE.Euler(
          currentTarget.rotation.x,
          currentTarget.rotation.y,
          currentPiece.rotation.z
        )
      );
      return;
    }
  }

  // ---------- Button event listeners ---------- //
  // Rotate button listeners
  rxButton.addEventListener("click", () => {
    if (!currentPiece) return;
    RotatePiece(currentPiece, "x", rxButton);
  });
  ryButton.addEventListener("click", () => {
    if (!currentPiece) return;
    RotatePiece(currentPiece, "y", ryButton);
  });
  rzButton.addEventListener("click", () => {
    if (!currentPiece) return;
    RotatePiece(currentPiece, "z", rzButton);
  });

  function RotatePiece(piece, axis, element) {
    const targetRotation = currentPiece.rotation.clone();
    switch (axis) {
      case "x":
        targetRotation.x += Math.PI / 2;
        break;
      case "y":
        targetRotation.y += Math.PI / 2;
        break;
      case "z":
        targetRotation.z += Math.PI / 2;
        break;
    }
    element.disabled = true;
    AnimatePieceMovement(
      currentPiece,
      currentPiece.position,
      targetRotation,
      200,
      () => {
        return CheckCollision();
      },
      () => {
        element.disabled = false; // Re-enable the button after the animation to prevent multiple clicks that would stack animations
      }
    );
  }

  // Place and toggle cube listeners
  placeButton.addEventListener("click", () => {
    if (currentPiece.targetPosition) {
      currentPiece.position.copy(currentPiece.targetPosition);
    }
    currentPiece.targetPosition = currentPiece.position.clone();
    // Calculate the size of the current piece
    const boundingBox = new THREE.Box3().setFromObject(currentPiece);
    const length = boundingBox.max.x - boundingBox.min.x;
    const width = boundingBox.max.y - boundingBox.min.y;
    const height = boundingBox.max.z - boundingBox.min.z;

    // The direction of the piece's movement is based on its current y rotation
    const direction = currentPiece.rotation.y < 0 ? -1 : 1;

    // Remove the axes helper from the current piece
    currentPiece.remove(axesHelper);

    // Move the piece based on its dimensions and direction
    const targetPosition = currentPiece.position.clone();
    if (Math.max(length, width, height) === length) {
      targetPosition.x -= length * direction;
    }
    if (Math.max(length, width, height) === width) {
      targetPosition.y -= width * direction;
    }
    if (Math.max(length, width, height) === height) {
      targetPosition.z -= height * direction;
    }
    AnimatePieceMovement(
      currentPiece,
      targetPosition,
      new THREE.Euler(
        currentPiece.rotation.x,
        currentPiece.rotation.y,
        currentPiece.rotation.z
      ),
      500,
      () => {
        // While placing, check for collisions
        console.log(currentPiece.targetPosition, currentPiece.position);
        return CheckCollision();
      },
      () => {
        // After placing, deselect the piece, and hide targets
        DeselectPiece();
        HideTargets();
      }
    );
  });

  // Toggle cube opacity
  toggleCube.addEventListener("click", () => {
    const currentOpacity = cube[0].material.opacity;
    if (currentOpacity === 0.2) {
      ToggleCube(1);
    } else {
      ToggleCube(0.2);
    }
  });
  function ToggleCube(opacity) {
    cube[0].material.opacity = opacity;
  }

  // Return piece to original position
  returnPiece.addEventListener("click", () => {
    ReturnPiece(currentPiece);
  });
  function ReturnPiece(piece) {
    if (!piece) return;
    const originalPosition = piece.originalPosition.clone();
    const originalRotation = piece.originalRotation.clone();
    piece.position.copy(originalPosition);
    piece.rotation.copy(originalRotation);
    DeselectPiece();
  }

  // Remove piece from cube
  removePiece.addEventListener("click", () => {
    RemovePiece(currentPiece);
  });
  function RemovePiece(piece) {
    if (!piece || !piece.targetPosition) return;
    console.log(piece.targetPosition, piece.position);
    AnimatePieceMovement(
      piece,
      piece.targetPosition,
      piece.rotation.clone(),
      500,
      () => {
        // While removing, check for collisions
        return CheckCollision();
      },
      () => {
        DeselectPiece();
      }
    );
  }
})();
