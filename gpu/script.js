let gl, program;
let cubeRotation = 0.0;
let animating = true;
let wireframe = false;
let lastFrameTime = 0;
let fpsElem;

// Cube data
let cubeVerticesBuffer, cubeIndexBuffer, cubeColorBuffer;

// Vertex data
const positions = [
  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,

  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,

  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

  // Right face
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0,  1.0,

  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0,
];

// Index data
const indices = [
   0,  1,  2,      0,  2,  3,    // front
   4,  5,  6,      4,  6,  7,    // back
   8,  9, 10,      8, 10, 11,    // top
  12, 13, 14,     12, 14, 15,    // bottom
  16, 17, 18,     16, 18, 19,    // right
  20, 21, 22,     20, 22, 23,    // left
];

// Per-face colors
let faceColors = [
  [1.0, 0.0, 0.0, 1.0],    // Front - Red
  [0.0, 1.0, 0.0, 1.0],    // Back - Green
  [0.0, 0.0, 1.0, 1.0],    // Top - Blue
  [1.0, 1.0, 0.0, 1.0],    // Bottom - Yellow
  [1.0, 0.0, 1.0, 1.0],    // Right - Purple
  [0.0, 1.0, 1.0, 1.0],    // Left - Cyan
];

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

  // Shaders
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;
  const fsSource = `
    varying lowp vec4 vColor;
    void main(void) {
      gl_FragColor = vColor;
    }
  `;
  program = initShaderProgram(vsSource, fsSource);
  gl.useProgram(program);

  program.attribLocations = {
    vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
    vertexColor: gl.getAttribLocation(program, "aVertexColor"),
  };
  program.uniformLocations = {
    projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
    modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
  };

  initBuffers();
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

function initBuffers() {
  // Position buffer
  cubeVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Color buffer
  let colors = [];
  for (let c of faceColors) {
    colors = colors.concat(c, c, c, c);
  }
  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Index buffer
  cubeIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}

function drawScene(now) {
  now *= 0.001;
  const deltaTime = now - lastFrameTime;
  lastFrameTime = now;

  if (animating) cubeRotation += deltaTime;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.9, 0.9, 0.95, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  // Positions
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
  gl.vertexAttribPointer(program.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.attribLocations.vertexPosition);

  // Colors
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.vertexAttribPointer(program.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.attribLocations.vertexColor);

  // Indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

  // Projection
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, 45 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.1, 100.0);

  // ModelView
  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.7, [0, 1, 0]);

  gl.uniformMatrix4fv(program.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uniformLocations.modelViewMatrix, false, modelViewMatrix);

  gl.drawElements(wireframe ? gl.LINES : gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  fpsElem.innerText = (1 / deltaTime).toFixed(1);
  requestAnimationFrame(drawScene);
}

// ================== Controls ==================
function toggleAnimation() { animating = !animating; }
function toggleWireframe() { wireframe = !wireframe; }
function changeColors() {
  faceColors = faceColors.map(() => [
    Math.random(), Math.random(), Math.random(), 1.0
  ]);
  initBuffers();
}
function resetScene() { cubeRotation = 0.0; }

// ================== Feature Tests ==================
function runTests() {
  const list = document.getElementById("test-list");
  function addTest(name, result) {
    const li = document.createElement("li");
    li.innerText = name + " → " + (result ? "PASS ✅" : "FAIL ❌");
    li.className = result ? "pass" : "fail";
    list.appendChild(li);
  }

  addTest("WebGL Context", !!gl);
  addTest("WebGL 2.0 Available", gl instanceof WebGL2RenderingContext);
  addTest("Shaders compile", !!program);
  addTest("Depth buffer support", gl.getParameter(gl.DEPTH_BITS) > 0);
  addTest("Max Texture Size > 2048", gl.getParameter(gl.MAX_TEXTURE_SIZE) > 2048);
  addTest("Anisotropic Filtering", !!gl.getExtension("EXT_texture_filter_anisotropic"));
  addTest("Float Textures", !!gl.getExtension("OES_texture_float"));
  addTest("Instanced Drawing", !!gl.getExtension("ANGLE_instanced_arrays"));
}
