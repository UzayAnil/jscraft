import { glMatrix, mat4, vec3 } from 'gl-matrix';

import Camera from './render/camera';
import Renderer from './render/renderer';

const CAMERA_SPEED = 5;

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.camera = new Camera();
    this.renderer = new Renderer(this.canvas, this.camera);

    this.forwardSpeed = 0;
    this.strafeSpeed = 0;
    this.flySpeed = 0;
    this.deltaPitch = 0;
    this.deltaYaw = 0;

    this.previousTime = 0;

    document.addEventListener('keydown', this.handleKeyboardDownControls.bind(this));
    document.addEventListener('keyup', this.handleKeyboardUpControls.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    canvas.addEventListener('click', () => canvas.requestPointerLock());

    requestAnimationFrame(this.render.bind(this));
  }

  handleKeyboardDownControls(event) {
    switch (event.keyCode) {
      case 87: // w
        this.forwardSpeed = CAMERA_SPEED;
        break;
      case 65: // a
        this.strafeSpeed = CAMERA_SPEED;
        break;
      case 83: // s
        this.forwardSpeed = -CAMERA_SPEED;
        break;
      case 68: // d
        this.strafeSpeed = -CAMERA_SPEED;
        break;
      case 32:
        this.flySpeed = CAMERA_SPEED;
        break;
      case 16:
        this.flySpeed = -CAMERA_SPEED;
        break;
    }
  }

  handleKeyboardUpControls(event) {
    switch (event.keyCode) {
      case 87: // w
        this.forwardSpeed = 0;
        break;
      case 65: // a
        this.strafeSpeed = 0;
        break;
      case 83: // s
        this.forwardSpeed = 0;
        break;
      case 68: // d
        this.strafeSpeed = 0;
        break;
      case 32:
        this.flySpeed = 0;
        break;
      case 16:
        this.flySpeed = 0;
        break;
    }
  }

  handleMouseMove(event) {
    if (document.pointerLockElement === this.canvas) {
      this.deltaPitch -= event.movementY / 2;
      this.deltaYaw -= event.movementX / 2;
    }
  }

  render(now) {
    now *= 0.001;
    const deltaTime = now - this.previousTime;
    this.previousTime = now;

    const camera = this.camera;

    let newPitch = camera.getPitch() + this.deltaPitch;
    let newYaw = camera.getYaw() + this.deltaYaw;

    if (newPitch > 90) {
      newPitch = 90;
    }
    else if (newPitch < -90) {
      newPitch = -90;
    }

    camera.setPitch(newPitch);
    camera.setYaw(newYaw);

    this.deltaPitch = 0;
    this.deltaYaw = 0;

    camera.moveForward(this.forwardSpeed * deltaTime);
    camera.moveStrafe(this.strafeSpeed * deltaTime);
    camera.moveFly(this.flySpeed * deltaTime);

    this.renderer.drawScene();

    requestAnimationFrame(this.render.bind(this));
  }
}
