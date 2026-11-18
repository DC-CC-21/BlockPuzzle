import React, { useEffect, useRef } from "react";
import { main } from "./scene";
// import { main } from "./scripts";

export default function Cube() {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      //   (async () => {
      //     const main = (await import("./scene")).main;
      main();
      //   })();
    }
    // main();
  }, [ref]);

  return (
    <>
      <nav>
        <div className="rotateIcons">
          <div className="rotateIcon x hidden">
            <img src="images/rotate.png" alt="Rotate X" />
            <span>X</span>
          </div>
          <div className="rotateIcon y hidden">
            <img src="images/rotate.png" alt="Rotate X" />
            <span>Y</span>
          </div>
          <div className="rotateIcon z">
            <img src="images/rotate.png" alt="Rotate X" />
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
      <div id="canvas" ref={ref}></div>
      <span id="loading">Loading... %</span>
    </>
  );
}
