import * as THREE from "three";
import { SplatMesh } from "@sparkjsdev/spark";
import { setupPointerLockControls } from './controls.js';
import { int } from "three/tsl";
import { clamp } from "three/src/math/MathUtils.js";
import { RGBELoader } from "three/examples/jsm/Addons.js";
import { setupInteractionManager, setIgnoreNextClick } from './interactionManager.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const intersectableObjects = []; // Array to hold objects for raycasting

//resize the renderer
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

// Scene setup
const splatURL = "./scene1.ply";
const scnPlatz = new SplatMesh({ url: splatURL });
scnPlatz.quaternion.set(1, 0, 0, 0);
scnPlatz.position.set(0, -.6, -3);
scene.background = new THREE.Color(0x5568ff);
scene.add(scnPlatz);

// Add a mesh to the scene
const geometry = new THREE.BoxGeometry(1, 1, 1);
const mGreen = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const art1 = new THREE.Mesh(geometry, mGreen);
art1.position.set(0, 0, -5); 
scene.add(art1);
intersectableObjects.push(art1); // Add to raycastable objects

// Add a mesh to the scene
const mBlue = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const art2 = new THREE.Mesh(geometry, mBlue);
art2.position.set(2, 0, -5); 
scene.add(art2);
intersectableObjects.push(art2); // Add to raycastable objects

//--Controls setup (modular)
const { controls, getMoveState } = setupPointerLockControls(camera, renderer.domElement);
scene.add(controls.object);

const clock = new THREE.Clock();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Add a crosshair to the camera
const circleGeometry = new THREE.CircleGeometry(0.1, 32);
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const circle = new THREE.Mesh(circleGeometry, circleMaterial);
circle.position.set(0, 0, -.1); // -.1 unit in front of camera
circle.scale.set(.01, .01, .01); 
camera.add(circle);
scene.add(camera);
// Setup interaction manager for click-based raycasting
setupInteractionManager(camera, intersectableObjects, (intersection) => {
    console.log('[DEBUG] setupInteractionManager callback', intersection);
    showOverlayIframe();
});
console.log('[DEBUG] setupInteractionManager initialized');

// Raycasting setup for pointer lock
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isPointerLocked = false;
let ignorenextClick = false;

// Assuming 'controls' is your instance of PointerLockControls
controls.addEventListener('lock', function () {
    isPointerLocked = true;
});

controls.addEventListener('unlock', function () {
    isPointerLocked = false;
});

let lastCameraState = null;

function showOverlayIframe() {
    console.log('[DEBUG] showOverlayIframe called');
    let iframe = document.getElementById('overlay-iframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'overlay-iframe';
        iframe.src = 'overlay.html';
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.zIndex = '9999';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
    } else {
        iframe.style.display = 'block';
    }
    // Store camera coordinates and rotation
    lastCameraState = {
        position: camera.position.clone(),
        rotation: camera.rotation.clone(),
        quaternion: camera.quaternion.clone(),
        matrix: camera.matrix.clone(),
        matrixWorld: camera.matrixWorld.clone()
    };
    renderer.setAnimationLoop(null);
    // Always release pointer lock 500ms after overlay is shown
    setTimeout(() => {
        if (isPointerLocked && controls.unlock) {
            controls.unlock();
        }
    }, 250);
}

function hideOverlayIframe() {
    const iframe = document.getElementById('overlay-iframe');
    if (iframe) {
        iframe.style.display = 'none';
    }

    //ignore next click
    setIgnoreNextClick();
    //pointer lock click delay
    ignorenextClick = true;
     clock.getDelta();
     //clamp delta
    const delta = clock.getDelta();
    if (delta > 1) {
        clamp(delta, 1/60);
    }
    // Restore camera state if available
    if (lastCameraState) {
        camera.position.copy(lastCameraState.position);
        camera.rotation.copy(lastCameraState.rotation);
        camera.quaternion.copy(lastCameraState.quaternion);
        camera.matrix.copy(lastCameraState.matrix);
        camera.matrixWorld.copy(lastCameraState.matrixWorld);
    }
    // Reset clock to avoid animation stutter
    renderer.setAnimationLoop(animate);
}

window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'close-iframe') {
        hideOverlayIframe();
    }
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement)

//animate function
function animate() {
    // Clamp delta to avoid large jumps (e.g. after tabbing back)
    let delta = clock.getDelta();
    delta = Math.min(delta, 1/60); // Cap at 60 FPS
    const { moveForward, moveBackward, moveLeft, moveRight } = getMoveState();

    velocity.x -= velocity.x * 80 * delta;
    velocity.z -= velocity.z * 80 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    // Raycast from camera center to check intersection with object3d
    mouse.set(0, 0); // Always center for pointer lock
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(intersectableObjects, false);
    if (intersects.length > 0) {
        circle.material.color.set(0x000000);
        circle.scale.set(.03, .03, .03);    // Change to black
    } else {
        circle.material.color.set(0xffffff);
        circle.scale.set(.01, .01, .01); // Change back to white
    }

//      // Log distance from camera to center of scene
//      const cameraDistance = camera.position.length();
//      //make the distance read out every second
//      if (Math.floor(cameraDistance) % 1 === 0) {
//      console.log('Camera distance to center:', cameraDistance.toFixed(2));
//    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);