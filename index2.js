const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const fileInput = document.querySelector("input[type='file']");
const nodesFallTime = 30;

const context = new AudioContext();
const gainNode = context.createGain();
let sourceNode = context.createBufferSource();
let buffer;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

fileInput.addEventListener("change", () => {
  const reader = new FileReader();

  reader.onload = async () => {
    const decodedBuffer = await context.decodeAudioData(reader.result);

    buffer = decodedBuffer;
    sourceNode.buffer = buffer;
    sourceNode.connect(gainNode);
    visualize();
  };
  reader.readAsArrayBuffer(fileInput.files[0]);
});

let x = 0;
let y = 50;
let width = 50;
let height = 50;
let speed = 0;
let lastBeat = 0;
const gameEventQueue = [];

const analyserNode = context.createAnalyser();
analyserNode.fftSize = 64;
analyserNode.connect(context.destination);
gainNode.connect(analyserNode);

const bufferLength = analyserNode.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function visualize() {
  requestAnimationFrame(visualize);

  // Get the frequency data and calculate the bar heights

  analyserNode.getByteTimeDomainData(dataArray);
  const waveform = calculateWaveform(dataArray);
  const rhythm = determineRhythm(waveform);
  generateGameplayEvents(rhythm);

  drawGameplay();
}

function calculateWaveform(dataArray) {
  // Calculate the waveform data
  var waveform = [];

  for (var i = 0; i < dataArray.length; i++) {
    var amplitude = dataArray[i] / 128 - 1;
    waveform.push(amplitude);
  }

  return waveform;
}

function determineRhythm(waveform) {
  // Determine the rhythm of the music
  var rhythm = [];

  for (var i = 0; i < waveform.length; i++) {
    if (waveform[i] > 0 && waveform[i - 1] <= 0) {
      rhythm.push(i);
    }
  }

  return rhythm;
}

// Generate gameplay events based on the rhythm
function generateGameplayEvents(rhythm) {
  for (var i = 0; i < rhythm.length; i++) {
    var beat = rhythm[i];

    // Generate a gameplay event for each beat
    var event = {
      time: beat / context.sampleRate,
      type: "hit",
    };

    // Add the event to the game event queue
    gameEventQueue.push(event);
  }
}

// Draw the game graphics
let fallingRectangles = [];

// Draw the falling rectangles
function drawGameplay() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update the positions of the falling rectangles
  fallingRectangles.forEach((rectangle) => {
    rectangle.y += rectangle.speed;
  });

  // Remove the falling rectangles that are out of bounds
  fallingRectangles = fallingRectangles.filter(
    (rectangle) => rectangle.y < canvas.height
  );

  // Draw the falling rectangles
  fallingRectangles.forEach((rectangle) => {
    ctx.fillStyle = rectangle.color;
    ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  });
}

function generateGameplayEvents(rhythm) {
  for (var i = 0; i < rhythm.length; i++) {
    var beat = rhythm[i];

    // Generate a gameplay event for each beat
    var event = {
      time: beat / context.sampleRate,
      type: "hit",
    };

    // Add the event to the game event queue
    gameEventQueue.push(event);

    // Add a falling rectangle
    const rectangle = {
      x: Math.floor(Math.random() * canvas.width),
      y: 0,
      width: 50,
      height: 50,
      speed: 30 / (beat - lastBeat),
      color: "red",
    };

    fallingRectangles.push(rectangle);
  }

  // Update the last beat time
  lastBeat = rhythm[rhythm.length - 1];
}

// Game loop
function gameLoop() {
  requestAnimationFrame(gameLoop);

  // Analyze the waveform
  analyserNode.getByteTimeDomainData(dataArray);
  var waveform = calculateWaveform(dataArray);
  var rhythm = determineRhythm(waveform);
  generateGameplayEvents(rhythm);

  // Update the game state and graphics based on the events
  // updateGameplay();
  drawGameplay();
}

gameLoop();

startButton.addEventListener("click", () => {
  if (context.state === "suspended") {
    context.resume();
  }

  sourceNode = context.createBufferSource();
  sourceNode.buffer = buffer;
  sourceNode.connect(gainNode);
  visualize();
  sourceNode.start(0);
});

stopButton.addEventListener("click", () => {
  sourceNode.stop();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
