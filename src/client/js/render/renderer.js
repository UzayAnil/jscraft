import { mat4 } from 'gl-matrix';

import { FS_SOURCE, VS_SOURCE } from './shaders';
import { POSITIONS, INDICES, TEXTURE_COORDINATES, VERTEX_NORMALS } from './block';
import loadTexture from './texture';
import { createBufferFromArray, setAttribute, loadShader } from './utils';
import Camera from './camera';

export default class Renderer {
  constructor(canvas, camera) {
    this.camera = camera;

    this.gl = this.initializeGL(canvas);

    this.resizeCanvas(this.gl);

    window.addEventListener('resize', () => {
      this.resizeCanvas(this.gl);
    });

    this.shaderProgram = this.initializeShaderProgram(this.gl);
    this.programInfo = {
      program: this.shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
        vertexNormal: this.gl.getAttribLocation(this.shaderProgram, 'aVertexNormal'),
        textureCoord: this.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord')
      },
      uniformLocations: {
        projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
        normalMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uNormalMatrix'),
        modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
        uSampler: this.gl.getUniformLocation(this.shaderProgram, 'uSampler')
      }
    };
    this.buffers = this.initializeBuffers(this.gl);

    this.texture = loadTexture(this.gl, "img/stone.png");
  }

  initializeGL(canvas) {
    if (!window.WebGLRenderingContext) {
      console.error("Your browser has WebGL disabled. Please consider enabling it!");
      return;
    }

    const gl = this.getContext(canvas);

    if (!gl) {
      console.error("Your browser does not support WebGL. Please consider updating!");
      return;
    }

    return gl;
  }

  resizeCanvas(gl) {
    this.width = gl.canvas.width = this.gl.canvas.clientWidth;
    this.height = gl.canvas.height = gl.canvas.clientHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  getContext(canvas) {
    return canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('moz-webgl') ||
      canvas.getContext('webkit-3d');
  }

  initializeShaderProgram(gl) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);

    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(`Unable to initialize the shader program: ${ gl.getProgramInfoLog(shaderProgram) }`);
      return null;
    }

    return shaderProgram;
  }

  initializeBuffers(gl) {
    return {
      position: createBufferFromArray(gl, new Float32Array(POSITIONS)),
      normal: createBufferFromArray(gl, new Uint16Array(INDICES), gl.ELEMENT_ARRAY_BUFFER),
      textureCoord: createBufferFromArray(gl, new Float32Array(TEXTURE_COORDINATES)),
      indices: createBufferFromArray(gl, new Float32Array(VERTEX_NORMALS))
    };
  }

  drawScene() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    setAttribute(
      this.gl,
      3,
      this.gl.FLOAT,
      this.buffers.position,
      this.programInfo.attribLocations.vertexPosition
    );

    setAttribute(
      this.gl,
      3,
      this.gl.FLOAT,
      this.buffers.normal,
      this.programInfo.attribLocations.vertexNormal,
      this.gl.ELEMENT_ARRAY_BUFFER
    );

    setAttribute(
      this.gl,
      2,
      this.gl.FLOAT,
      this.buffers.textureCoord,
      this.programInfo.attribLocations.textureCoord
    );

    this.gl.useProgram(this.programInfo.program);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.indices);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(
      projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar
    );

    const modelViewMatrix = mat4.create();

    this.camera.modifyModelViewMatrix(modelViewMatrix);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );


    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix
    );

    {
      const vertexCount = 36;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}
