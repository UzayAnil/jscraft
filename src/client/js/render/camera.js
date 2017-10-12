import { glMatrix, mat4, vec3 } from 'gl-matrix';

export default class Camera {
  constructor(position, rotation) {
    this.position = position || vec3.create();
    this.pitch = 0;
    this.yaw = 0;
  }

  getPosition() {
    return this.position;
  }

  getPitch() {
    return this.pitch;
  }

  setPitch(pitch) {
    this.pitch = pitch;
  }

  getYaw() {
    return this.yaw;
  }

  setYaw(yaw) {
    this.yaw = yaw;
  }

  moveForward(distance) {
    const rot1Rad = glMatrix.toRadian(this.yaw);
    this.position[0] -= Math.sin(rot1Rad) * distance;
    this.position[2] -= Math.cos(rot1Rad) * distance;
  }

  moveStrafe(distance) {
    const rot1Rad = glMatrix.toRadian(this.yaw);
    this.position[0] -= Math.cos(rot1Rad) * distance;
    this.position[2] += Math.sin(rot1Rad) * distance;
  }

  moveFly(distance) {
    this.position[1] += distance;
  }

  modifyModelViewMatrix(modelViewMatrix) {
    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      glMatrix.toRadian(-this.pitch),
      [1, 0, 0]
    );
    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      glMatrix.toRadian(-this.yaw),
      [0, 1, 0]
    );
    mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      [-this.position[0], -this.position[1], -this.position[2]]
    );
  }
}
