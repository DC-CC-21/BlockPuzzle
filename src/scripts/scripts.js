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
import {
  ShowTargets,
  HideTargets,
  AnimatePieceMovement,
  CheckCollision,
  DeselectPiece,
  ToggleCube,
} from "./helpers";
import { Piece } from "./Piece";
export const main = async () => {
  // =========== Game Setup =========== //
  // Get the search params
  const searchParams = new URLSearchParams(window.location.search);

  // Get the level id from the search params
  const id = searchParams.get("level");

  // Locate the pieces and their locations from the data by the id
  const piecesObject = data.find((item) => item.id == id).pieces;

  // Get the id of the pieces from the pieces object
  const pieceIds = Object.values(piecesObject).filter((x) => x !== "");

  // ========== HTML Elements ========== //
  const loadingElement = document.getElementById("loading");
  const rxButton = document.querySelector(".rotateIcon.x");
  const ryButton = document.querySelector(".rotateIcon.y");
  const rzButton = document.querySelector(".rotateIcon.z");
  const placeButton = document.querySelector("#place");
  const toggleCube = document.querySelector("#toggleCube");
  const returnPiece = document.querySelector("#returnPiece");
  const removePiece = document.querySelector("#removePiece");

  // ========== Scene Setup ========== //
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

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
  }

  // Initialize the scene, camera, renderer, and controls
  const { scene, camera, renderer, controls, composer } = setupScene();

  // Load the model
  const modelPath = "models";
  const modelScene = await loadModel(
    `${modelPath}/Targets_W_Cube.glb`,
    loadingElement
  );
  scene.add(modelScene.scene);
  const axesHelper = new THREE.AxesHelper(10);

  const pieces = [];
  for (const [index, id] of pieceIds.entries()) {
    const currentLoadingElement = document.createElement("span");
    loadingElement.appendChild(currentLoadingElement);
    const glbPiece = (
      await loadModel(`${modelPath}/Piece${id}.glb`, currentLoadingElement)
    ).scene.children[0];

    const piece = new Piece(glbPiece, axesHelper);
    piece.setPosition(40 + 10 * index, 0, 0);
    pieces.push(piece);
    scene.add(piece);

    // piece.setPosition(40 + 10 * index, 0, 0);
  }
  loadingElement.style.display = "none";

  // Get targets, pieces, and cube
  const targets = getTargets(modelScene.scene);
  // const pieces = getPieces(modelScene.scene);
  const cube = getCube(modelScene.scene);
  window._cube = cube;

  // Set the variable for the current piece
  let currentPiece;

  // ========== Render loop ========== //
  animate();

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
    console.log(intersects);
    if (intersects.length === 0) {
      // If no target or piece is clicked, deselect the current piece and reset the targets
      DeselectPiece(currentPiece);
      HideTargets(targets);
      return;
    } else if (intersectTarget.name === cube[0].name) {
      return;
    }
    // Check if a piece is clicked
    if (intersectTarget.name.toLowerCase().includes("piece")) {
      console.log("Piece Clicked");
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
      currentPiece.setHighlight(true);
      ShowTargets(targets);

      // Remove axes helper from the previous piece
      // currentPiece.axesHelper = axesHelper;
      // currentPiece.add(axesHelper);
      return;
    } // If no piece is clicked, check if a target is clicked
    else if (
      intersectTarget.name.toLowerCase().includes("target") &&
      currentPiece
    ) {
      // Reset the opacity of all targets and set the clicked target to full opacity
      targets.forEach((x) => (x.material.opacity = 0.2));

      // Log the normal of the clicked target's face
      console.log(intersectTarget);

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
        return CheckCollision(currentPiece, pieces, scene);
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
    const currentY = currentPiece.rotation.y < 0;
    const currentX = currentPiece.rotation.x > 0;
    const direction = currentY || currentX ? -1 : 1;
    console.log(currentPiece.rotation, direction);
    // Remove the axes helper from the current piece
    // currentPiece.remove(axesHelper);

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
        return CheckCollision(currentPiece, pieces, scene);
      },
      () => {
        // After placing, deselect the piece, and hide targets
        DeselectPiece(currentPiece);
        HideTargets(targets);
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
        return CheckCollision(currentPiece, pieces, scene);
      },
      () => {
        DeselectPiece();
      }
    );
  }

  window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
};
