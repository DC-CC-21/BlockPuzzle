import React, { useEffect } from "react";
import { main } from "./scripts";
export default function Cube() {
  useEffect(() => {
    main();
  });

  return (
    <>
      <nav>
        <div className="rotateIcons">
          <div className="rotateIcon x">
            <img src="/images/rotate.png" alt="Rotate X" />
            <span>X</span>
          </div>
          <div className="rotateIcon y">
            <img src="/images/rotate.png" alt="Rotate X" />
            <span>Y</span>
          </div>
          <div className="rotateIcon z">
            <img src="/images/rotate.png" alt="Rotate X" />
            <span>Z</span>
          </div>
        </div>
        <div id="buttons">
          <button type="button" id="place">
            PLACE
          </button>
          <button type="button" id="removePiece">
            REMOVE
          </button>
          <button type="button" id="toggleCube">
            Toggle Cube
          </button>
          <button type="button" id="returnPiece">
            Replace
          </button>
        </div>
      </nav>
      <div id="canvas"></div>
      <span id="loading">Loading... %</span>
    </>
  );
}
