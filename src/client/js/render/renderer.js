import { mat4 } from 'gl-matrix';

import { FS_SOURCE, VS_SOURCE } from './shaders';
import { POSITIONS, INDICES, TEXTURE_COORDINATES, VERTEX_NORMALS } from './block';
import loadTexture from './texture';

export default class Renderer {
  constructor(canvas) {
    this.rotation = 0.0;

    if (!window.WebGLRenderingContext) {
      console.error("Your browser has WebGL disabled. Please consider enabling it!");
      return;
    }

    const gl = this.getContext(canvas);

    if (!gl) {
      console.error("Your browser does not support WebGL! Please consider updating!");
      return;
    }

    this.resizeCanvas(window.innerWidth, window.innerHeight, gl);

    window.addEventListener('resize', () => {
      this.resizeCanvas(window.innerWidth, window.innerHeight, gl);
    });

    const shaderProgram = this.initializeShaderProgram(gl);
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
      }
    };
    const buffers = this.initializeBuffers(gl);

    const texture = loadTexture(gl, "img/stone.png");

    const self = this;
    let then = 0;

    function render(now) {
      now *= 0.001;
      const deltaTime = now - then;
      then = now;

      this.rotation += deltaTime * 1;

      this.drawScene(gl, programInfo, buffers, texture);

      requestAnimationFrame(render.bind(self));
    }

    requestAnimationFrame(render.bind(this));
  }

  resizeCanvas(width, height, gl) {
    this.width = gl.canvas.width = width;
    this.height = gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
  }

  getContext(canvas) {
    return canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('moz-webgl') ||
      canvas.getContext('webkit-3d');
  }

  initializeShaderProgram(gl) {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);

    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(`Unable to initialize the shader program: ${ gl.getProgramInfoLog(shaderProgram) }`);
      return null;
    }

    return shaderProgram;
  }

  loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`An error occured when compiling shaders: ${ gl.getShaderInfoLog(shader) }`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  initializeBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(POSITIONS),
      gl.STATIC_DRAW
    );

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(INDICES),
      gl.STATIC_DRAW
    );

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(TEXTURE_COORDINATES),
      gl.STATIC_DRAW
    );

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(VERTEX_NORMALS),
      gl.STATIC_DRAW
    );

    return {
      position: positionBuffer,
      normal: normalBuffer,
      textureCoord: textureCoordBuffer,
      indices: indexBuffer
    };
  }

  drawScene(gl, programInfo, buffers, texture) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition
      );
    }

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal
      );
    }

    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
      gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord
      );
    }

    gl.useProgram(programInfo.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = this.width / this.height;
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

    mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      [-0.0, 0.0, -6.0]
    );

    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      this.rotation,
      [0, 1, 1]
    );

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );


    gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix
    );

    {
      const vertexCount = 36;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}
