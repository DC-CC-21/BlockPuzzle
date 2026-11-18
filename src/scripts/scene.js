// import Player from "./Player";
// import { setupScene } from "./setup";

import Game from "./Game";
import { ToggleCube } from "./helpers";
import { data } from "../data";

export async function main() {
  const loadingElement = document.getElementById("loading");
  const canvas = document.getElementById("canvas");
  const rxButton = document.querySelector(".rotateIcon.x");
  const ryButton = document.querySelector(".rotateIcon.y");
  const rzButton = document.querySelector(".rotateIcon.z");
  const placeButton = document.querySelector("#place");
  const toggleCube = document.querySelector("#toggleCube");
  const returnPiece = document.querySelector("#returnPiece");
  const removePiece = document.querySelector("#removePiece");

  const searchParams = new URLSearchParams(window.location.search);
  const levelId = searchParams.get("level");

  const game = new Game(canvas);
  game.animate();
  await game.loadModels(
    data.find((item) => item.id == levelId).pieces,
    loadingElement
  );
  const player = game.player;

  // ========== Event listeners ========== //
  canvas.addEventListener("mousemove", player.cancelClick);
  canvas.addEventListener("mousedown", player.resetClick);
  canvas.addEventListener("click", player.click);

  // ---------- Button event listeners ---------- //
  // Rotate button listeners
  rxButton.addEventListener("click", () => {});
  ryButton.addEventListener("click", () => {});
  rzButton.addEventListener("click", player.rotateZ);

  // Place and toggle cube listeners
  placeButton.addEventListener("click", game.placePiece);

  // Toggle cube opacity
  toggleCube.addEventListener("click", () => {
    if (game.cube[0].material.opacity === 0.2) ToggleCube(1);
    else {
      ToggleCube(0.2);
    }
  });

  // Return piece to original position
  returnPiece.addEventListener("click", () => {});

  // Remove piece from cube
  removePiece.addEventListener("click", () => {});

  window.onresize = function () {
    game.handleResize();
  };
}
