import * as THREE from "three";
import { setupScene } from "./setup";
import Player from "./Player";
import { getCube, getTargets, loadModel } from "./modelLoader";
import { Piece } from "./Piece";
import {
  AnimatePieceMovement,
  CheckCollision,
  DeselectPiece,
  HideTargets,
  ShowTargets,
} from "./helpers";

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
    const gameSetup = setupScene(this.canvas);
    this.renderer = gameSetup.renderer;
    this.scene = gameSetup.scene;
    this.camera = gameSetup.camera;
    this.controls = gameSetup.controls;
    this.composer = gameSetup.composer;
    this.player = new Player(this);
    this.currentPiece = null;
    this.axesHelper = new THREE.AxesHelper(10);
    this.modelPath = "models";
    this.pieces = [];
    this.isClick = false;
  }
  async loadModels(levelSolution, loadingElement) {
    this.levelSolution = levelSolution;
    const pieceCodes = Object.values(levelSolution).sort();

    // ========== Load Cube and Targets ========== //
    // Create and append a loading element for this scene
    const baseLoader = document.createElement("span");
    loadingElement.append(baseLoader);

    // Load the base scene
    const baseScene = (
      await loadModel(`${this.modelPath}/Targets_W_Cube.glb`, baseLoader)
    ).scene;
    this.scene.add(baseScene);

    // Get the cube and the targets
    this.cube = getCube(baseScene);
    window._cube = this.cube;
    this.targets = getTargets(baseScene);

    // Init array to hold pieces
    this.pieces = [];

    // Iterate over the piece codes
    // Index is used for piece placement and id is used to locate the model
    for (const [index, id] of pieceCodes.entries()) {
      // Some values may be empty because they are meant not to load a piece, but that will break the load so we skip loading a model
      if (!id) continue;
      // Add a loading element for this piece
      const currentLoadingElement = document.createElement("span");
      loadingElement.appendChild(currentLoadingElement);

      // Load the piece
      const glbPiece = (
        await loadModel(
          `${this.modelPath}/Piece${id}.glb`,
          currentLoadingElement
        )
      ).scene.children[0];

      // Create the new piece using the loaded glb and append the axis helper
      const piece = new Piece(glbPiece, this.axesHelper);
      piece.setPosition(40 + 10 * index, 0, 0);
      this.pieces.push(piece);
      this.scene.add(piece);
    }
    loadingElement.style.display = "none";
  }
  setupScene(canvas) {
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
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.composer.render();
  }
  selectObject(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects([
      ...this.cube,
      ...this.pieces,
      ...this.targets,
    ]);
    const intersectTarget = intersects?.[0]?.object;

    if (intersects.length === 0) {
      // If no target or piece is clicked, deselect the current piece and reset the targets
      DeselectPiece(this.currentPiece);
      HideTargets(this.targets);
      return;
    } else if (intersectTarget.name === this.cube[0].name) {
      return;
    }
    // Check if a piece is clicked
    if (intersectTarget.name.toLowerCase().includes("piece")) {
      console.log("Piece Clicked");
      // Set the current piece
      this.currentPiece = intersectTarget.parent;

      // Reset the emissive color of the previously selected piece and glow the new piece
      this.pieces.forEach((piece) => {
        piece.setHighlight(false);
      });
      this.currentPiece.setHighlight(true);
      ShowTargets(this.targets);

      // Remove axes helper from the previous piece
      // currentPiece.axesHelper = axesHelper;
      // currentPiece.add(axesHelper);
      return;
    } // If no piece is clicked, check if a target is clicked
    else if (
      intersectTarget.name.toLowerCase().includes("target") &&
      this.currentPiece
    ) {
      // Reset the opacity of all targets and set the clicked target to full opacity
      this.targets.forEach((x) => (x.material.opacity = 0.2));

      const currentTarget = intersectTarget;
      this.currentPiece.targetPosition = currentTarget.position.clone();
      this.currentPiece.targetRotation = currentTarget.rotation.clone();
      currentTarget.material.opacity = 1;

      // Position the current piece at the target's position and rotation
      AnimatePieceMovement(
        this.currentPiece,
        currentTarget.position,
        new THREE.Euler(
          currentTarget.rotation.x,
          currentTarget.rotation.y,
          this.currentPiece.rotation.z
        )
      );
      return;
    }
  }
  placePiece = () => {
    if (this.currentPiece.targetPosition) {
      this.currentPiece.position.copy(this.currentPiece.targetPosition);
    }
    this.currentPiece.targetPosition = this.currentPiece.position.clone();

    // Calculate the size of the current piece
    const boundingBox = new THREE.Box3().setFromObject(this.currentPiece);
    const length = boundingBox.max.x - boundingBox.min.x;
    const width = boundingBox.max.y - boundingBox.min.y;
    const height = boundingBox.max.z - boundingBox.min.z;

    // The direction of the piece's movement is based on its current y rotation
    const currentY = this.currentPiece.rotation.y < 0;
    const currentX = this.currentPiece.rotation.x > 0;
    const direction = currentY || currentX ? -1 : 1;

    // Move the piece based on its dimensions and direction
    const targetPosition = this.currentPiece.position.clone();
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
      this.currentPiece,
      targetPosition,
      new THREE.Euler(
        this.currentPiece.rotation.x,
        this.currentPiece.rotation.y,
        this.currentPiece.rotation.z
      ),
      500,
      () => {
        // While placing, check for collisions
        return CheckCollision(this.currentPiece, this.pieces, this.scene);
      },
      () => {
        // After placing, deselect the piece, and hide targets
        this.currentPiece.setHighlight(false);
        // DeselectPiece(this.currentPiece);

        HideTargets(this.targets);
      }
    );
  };
  handleResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  rotateZ() {
    if (this.currentPiece) {
      this.currentPiece.rotateZ(
        this.duringAnimation.bind(this),
        this.afterAnimation.bind(this)
      );
    }
  }

  duringAnimation() {
    return CheckCollision(this.currentPiece, this.pieces, this.scene);
  }

  afterAnimation() {
    // After placing, deselect the piece, and hide targets
    this.currentPiece.setHighlight(false);
    // DeselectPiece(this.currentPiece);

    HideTargets(this.targets);
  }
}
