// controls.js
// Encapsulates camera controls (WASD, pointer lock) for Three.js scenes
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export function setupPointerLockControls(camera, rendererDomElement) {
    const controls = new PointerLockControls(camera, rendererDomElement);
    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    instructions.addEventListener('click', function () {
        controls.lock();
    });

    controls.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    });

    controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    });

    const onKeyDown = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return {
        controls,
        getMoveState: () => ({ moveForward, moveBackward, moveLeft, moveRight })
    };
}
