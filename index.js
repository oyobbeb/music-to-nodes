const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const fileInput = document.querySelector("input[type='file']");
const nodesFallTime = 2500;

const context = new AudioContext();
const gainNode = context.createGain();
let sourceNode = context.createBufferSource();
let buffer;

sourceNode.connect(gainNode);

const canvas = document.querySelector("canvas");
const canvasContext = canvas.getContext("2d");

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

const nodes = [
  { key: 1, amplitude: 0, time: 0, width: 40, height: 40 },
  { key: 2, amplitude: 0, time: 0, width: 40, height: 40 },
  { key: 3, amplitude: 0, time: 0, width: 40, height: 40 },
  { key: 4, amplitude: 0, time: 0, width: 40, height: 40 },
  { key: 5, amplitude: 0, time: 0, width: 40, height: 40 },
  { key: 6, amplitude: 0, time: 0, width: 40, height: 40 },
];

const regions = [
  { x: 0, y: 0, width: canvas.width / 6, height: canvas.height },
  { x: canvas.width / 6, y: 0, width: canvas.width / 6, height: canvas.height },
  {
    x: (canvas.width * 2) / 6,
    y: 0,
    width: canvas.width / 6,
    height: canvas.height,
  },
  {
    x: (canvas.width * 3) / 6,
    y: 0,
    width: canvas.width / 6,
    height: canvas.height,
  },
  {
    x: (canvas.width * 4) / 6,
    y: 0,
    width: canvas.width / 6,
    height: canvas.height,
  },
  {
    x: (canvas.width * 5) / 6,
    y: 0,
    width: canvas.width / 6,
    height: canvas.height,
  },
];

const analyserNode = context.createAnalyser();
analyserNode.fftSize = 64;
analyserNode.connect(context.destination);
gainNode.connect(analyserNode);

function visualize() {
  requestAnimationFrame(visualize);

  // Get the frequency data and calculate the bar heights
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  // analyserNode.getByteTimeDomainData(dataArray);
  analyserNode.getByteFrequencyData(dataArray);
  console.log(analyserNode);

  // Clear the canvas
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the boxes
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const { x, y } = getPosition(node, bufferLength, dataArray);
    canvasContext.fillStyle = "rgb(255, 255, 255)";
    canvasContext.fillRect(
      x - node.width / 2,
      y - node.height / 2,
      node.width,
      node.height
    );
  }
}

function getPosition(node, bufferLength, dataArray) {
  const region = regions[node.key - 1];
  const x = region.x + region.width / 2;
  const startY = 0;
  const endY = canvas.height - node.height / 2;
  const t = (node.key - 1) / (nodes.length - 1);
  const amplitude =
    dataArray[Math.floor((bufferLength / regions.length) * (node.key - 1))];
  const y = lerp(startY, endY, amplitude / 255);
  return { x, y };
}

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

const gainSlider = document.querySelector("#gain-slider");
gainSlider.addEventListener("input", () => {
  gainNode.gain.value = gainSlider.value;
});

const filterTypeSelect = document.querySelector("#filter-type-select");
filterTypeSelect.addEventListener("change", () => {
  const filterNode = context.createBiquadFilter();
  filterNode.type = filterTypeSelect.value;
  filterNode.frequency.value = 1000;
  filterNode.connect(analyserNode);
  gainNode.disconnect();
  gainNode.connect(filterNode);
});

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
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
});
