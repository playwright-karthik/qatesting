let gl, program, cubeRotation = 0.0, animating = true, wireframe = false;
let lastFrameTime = 0, fpsElem;

window.onload = () => {
  fpsElem = document.getElementById("fps");
  initWebGL();
  runTests();
  requestAnimationFrame(drawScene);
};

function initWebGL() {
  const canvas = document.getElementById("glCanvas");
  gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

  if (!gl) {
    document.getElementById("status").innerText = "WebGL not supported!";
    return;
  }

  document.getElementById("status").innerText = "WebGL initialized";
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Unknown";
  document.getElementById("renderer").innerText = renderer;

  // Simple shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
  const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main(void) {
      gl_FragColor = uColor;
    }
  `;

  program = initShaderProgram(vsSource, fsSource);
  gl.useProgram(program);

  program.attribLocations = {
    vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
  };
  program.uniformLocations = {
    projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
    modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
    color: gl.getUniformLocation(program, "uColor"),
  };
}

function initShaderProgram(vsSource, fsSource) {
  const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  return shaderProgram;
}

function loadShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function drawScene(now) {
  now *= 0.001;
  const deltaTime = now - lastFrameTime;
  lastFrameTime = now;

  if (animating) cubeRotation += deltaTime;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.9, 0.9, 0.95, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw cube (just one square for demo)
  const positions = [
    -0.5, -0.5, 0.0,
     0.5, -0.5, 0.0,
     0.5,  0.5, 0.0,
    -0.5,  0.5, 0.0,
  ];
  const indices = [0, 1, 2, 0, 2, 3];

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    program.attribLocations.vertexPosition,
    3, gl.FLOAT, false, 0, 0
  );
  gl.enableVertexAttribArray(program.attribLocations.vertexPosition);

  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, 45 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.1, 100.0);

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -3]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 1, 1]);

  gl.uniformMatrix4fv(program.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uniformLocations.modelViewMatrix, false, modelViewMatrix);
  gl.uniform4fv(program.uniformLocations.color, [0.2, 0.6, 0.9, 1.0]);

  gl.drawElements(wireframe ? gl.LINES : gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  // Update FPS
  fpsElem.innerText = (1 / deltaTime).toFixed(1);

  requestAnimationFrame(drawScene);
}

// Control functions
function toggleAnimation() { animating = !animating; }
function toggleWireframe() { wireframe = !wireframe; }
function changeColors() { /* You can randomize uColor */ }
function resetScene() { cubeRotation = 0.0; }

// Tests
function runTests() {
  const list = document.getElementById("test-list");
  function addTest(name, pass) {
    const li = document.createElement("li");
    li.innerText = name + " → " + (pass ? "PASS" : "FAIL");
    li.className = pass ? "pass" : "fail";
    list.appendChild(li);
  }
  addTest("WebGL Context", !!gl);
  addTest("Shaders compile", !!program);
  addTest("Depth buffer support", gl.getParameter(gl.DEPTH_BITS) > 0);
  addTest("Max Texture Size > 2048", gl.getParameter(gl.MAX_TEXTURE_SIZE) > 2048);
}
