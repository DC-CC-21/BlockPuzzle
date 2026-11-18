import * as THREE from "three";
// ========== Effects and Helpers ========== //
export function ToggleCube(opacity) {
  window._cube[0].material.opacity = opacity;
}

export function DeselectPiece(currentPiece) {
  if (currentPiece) {
    currentPiece.setHighlight(false);
    //   currentPiece.traverse((child) => {
    //     if (child.isMesh) {
    //       child.material.emissive.set(0x000000);
    //       child.material.emissiveIntensity = 0;
    // }
    //   });
    //   currentPiece.axesHelper = null;
    //   currentPiece.remove(currentPiece.axesHelper);
    currentPiece = null;
  }
}
export function ShowTargets(targets) {
  targets.forEach((x) => (x.material.opacity = 0.2));
}
export function HideTargets(targets) {
  targets.forEach((x) => (x.material.opacity = 0));
}
export function CheckCollision(currentPiece, pieces, scene) {
  // Remove previous debug spheres/arrows
  if (window._debugCorners) {
    window._debugCorners.forEach((sphere) => {
      scene.remove(sphere);
    });
  }
  window._debugCorners = [];

  let collisionDetected = false;
  for (const piece of pieces) {
    if (!piece?.id || !currentPiece?.id) continue;
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

export function PieceDimensions(piece) {
  // NOTE: used only in CheckCollision
  const boundingBox = new THREE.Box3().setFromObject(piece);
  const length = boundingBox.max.x - boundingBox.min.x;
  const width = boundingBox.max.y - boundingBox.min.y;
  const height = boundingBox.max.z - boundingBox.min.z;
  return {
    length: Math.max(length, width, height),
    width: Math.min(length, width, height),
  };
}
export function AnimatePieceMovement(
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
