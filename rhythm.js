const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const fileInput = document.querySelector("input[type='file']");

const audioContext = new AudioContext();
const gainNode = audioContext.createGain();
let sourceNode = audioContext.createBufferSource();
let buffer;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let squares = [];

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

fileInput.addEventListener("change", () => {
  const reader = new FileReader();

  reader.onload = async () => {
    const decodedBuffer = await audioContext.decodeAudioData(reader.result);

    buffer = decodedBuffer;
    sourceNode.buffer = buffer;
    analyserNode.connect(audioContext.destination);
    createSquares();
    updateSquares();
  };

  reader.readAsArrayBuffer(fileInput.files[0]);
});

const frequencyRanges = [
  { minFrequency: 20, maxFrequency: 200 },
  { minFrequency: 200, maxFrequency: 400 },
  { minFrequency: 400, maxFrequency: 600 },
  { minFrequency: 600, maxFrequency: 800 },
  { minFrequency: 800, maxFrequency: 1000 },
  { minFrequency: 1000, maxFrequency: 20000 },
];
const squareVelocities = [5, 10, 15, 20, 25, 30];
const MAX_SQUARE_VELOCITY = 50;
const MID_SQUARE_VELOCITY = 25;
const MIN_SQUARE_VELOCITY = 10;

const analyserNode = audioContext.createAnalyser();
analyserNode.connect(audioContext.destination);
gainNode.connect(analyserNode);

function createSquares() {
  squares = frequencyRanges.map((range, i) => {
    const frequencyRangeData = new Uint8Array(255);
    analyserNode.getByteFrequencyData(frequencyRangeData);

    return {
      x: Math.floor(Math.random() * 6) * (canvas.width / 6),
      y: -50,
      width: 100,
      height: 50,
      velocity: MID_SQUARE_VELOCITY,
      frequencyRange: range,
    };
  });
}

function updateSquares() {
  // Get the frequency data for the audio signal
  const frequencyData = new Uint8Array(255);
  analyserNode.getByteFrequencyData(frequencyData);

  // Set the velocity of each square based on the amplitude of its frequency range
  squares.forEach((square, i) => {
    const frequencyRangeData = frequencyData.slice(
      square.frequencyRange.minFrequency,
      square.frequencyRange.maxFrequency
    );
    const amplitude =
      frequencyRangeData.reduce((a, b) => a + b, 0) / frequencyRangeData.length;
    square.velocity = (amplitude / 255) * MIN_SQUARE_VELOCITY;
  });

  // Update the position of each square based on its velocity
  squares.forEach((square) => {
    square.y += square.velocity;
    if (square.y > canvas.height) {
      square.y = 0;
      square.x = Math.floor(Math.random() * 6) * (canvas.width / 6);
    }
  });

  // Draw the squares on the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  squares.forEach((square) => {
    ctx.fillStyle = "red";
    ctx.fillRect(square.x, square.y, square.width, square.height);
  });

  // Call this function again on the next animation frame
  requestAnimationFrame(updateSquares);
}

startButton.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = buffer;
  sourceNode.connect(gainNode);
  updateSquares();
  sourceNode.start(0);
});

stopButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sourceNode.stop();
});
