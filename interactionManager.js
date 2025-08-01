import * as THREE from 'three';
// raycasting and click handling on the scene general
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let cameraRef = null;
let intersectableObjectsRef = [];
let showOverlayCallback = null;

let ignorenextClick = false;

// Removed duplicate and incomplete onClick function

// 1. Check if the next click should be ignored
function onClick(event) {
    const isPointerLocked = !!document.pointerLockElement;
    if (!isPointerLocked) {
        return;
    }
    if (ignorenextClick) {
        ignorenextClick = false;
        return;
    }

    // 2. Calculate mouse position for raycasting
    if (isPointerLocked) {
        mouse.x = 0;
        mouse.y = 0;
    } else {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // 3. Perform raycasting
    raycaster.setFromCamera(mouse, cameraRef);
    const intersects = raycaster.intersectObjects(intersectableObjectsRef);

    // 4. If there are intersections, trigger callback to show overlay
    if (intersects.length > 0) {
        if (showOverlayCallback) {
            showOverlayCallback(intersects[0]);
        } else {
            console.warn('showOverlayCallback is not defined');
        }
    }
}

/**
 * Sets up the interaction manager for raycasting and click events.
 * @param {THREE.Camera} camera
 * @param {THREE.Object3D[]} intersectableObjects
 * @param {function} onIntersect
 */
export function setupInteractionManager(camera, intersectableObjects, onIntersect) {
    cameraRef = camera;
    intersectableObjectsRef = intersectableObjects;
    showOverlayCallback = onIntersect;

    window.addEventListener('mousedown', onClick);
}

/**
 * Ignore the next click event (useful for overlay logic).
 */
export function setIgnoreNextClick() {
    ignorenextClick = true;
}