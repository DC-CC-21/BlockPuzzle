import * as THREE from "three";
import { AnimatePieceMovement } from "./helpers";
export class Piece extends THREE.Group {
  constructor(piece, axesHelper) {
    // Init default behavior
    super();
    this.mainPiece = piece.children[0];
    this.pieceNumber = piece.children[1];
    this.axesHelper = axesHelper;

    // Copy all children to the new object
    for (const child of piece.children.slice()) {
      child.position.set(0, 0, 0);
      this.add(child);
    }

    // Set custom piece properties
    this.init();
  }
  init() {
    this.originalPosition = this.position.clone();
    this.originalRotation = this.rotation.clone();
  }
  setHighlight(on) {
    console.log(this.mainPiece);
    if (!on) {
      this.mainPiece.material.emissiveIntensity = 0;
      this.remove(this.axesHelper);
    } else {
      this.mainPiece.material.emissive.set(0xffff00);
      this.mainPiece.material.emissiveIntensity = 0.5;
      this.add(this.axesHelper);
    }
  }
  returnToStart() {
    this.position.copy(this.originalPosition);
  }
  setPosition(x, y, z) {
    this.position.set(x, y, z);
  }
  rotateZ(during, after) {
    const targetRotation = this.rotation.clone();
    targetRotation.z += Math.PI / 2;
    AnimatePieceMovement(this, this.position, targetRotation, 200, during, after);
    // this.rotation.z += Math.PI / 2;
  }
}
