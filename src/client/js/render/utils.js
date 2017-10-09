export function createBufferFromArray(gl, array, type, drawType) {
  type = type || gl.ARRAY_BUFFER;
  drawType = drawType || gl.STATIC_DRAW;

  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, array, drawType);

  return buffer;
}

export function setAttribute(gl, numComponents, type, buffer, attribLocation, normalize = false, stride = 0, offset = 0) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    attribLocation,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(attribLocation);
}

export function loadShader(gl, type, source) {
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
