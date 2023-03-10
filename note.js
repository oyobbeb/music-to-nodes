const audioContext = new AudioContext();
const source = audioContext.createBufferSource();
const gainNode = audioContext.createGain();

const notes = [
  {
    time: 4,
    key: "a",
    color: "red",
    startPosition: 0,
    positionY: 0,
  },
  {
    time: 4,
    key: "s",
    color: "blue",
    startPosition: 0,
    positionY: 0,
  },
  {
    time: 5,
    key: "d",
    color: "yellow",
    startPosition: 0,
    positionY: 0,
  },
  {
    time: 6,
    key: "j",
    color: "black",
    startPosition: 0,
    positionY: 0,
  },
  {
    time: 4,
    key: "k",
    color: "purple",
    startPosition: 0,
    positionY: 0,
  },
  {
    time: 5,
    key: "l",
    color: "white",
    startPosition: 0,
    positionY: 0,
  },
];

const gainSlider = document.querySelector("#gain-slider");
gainSlider.addEventListener("input", () => {
  gainNode.gain.value = gainSlider.value;
});

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const keys = ["a", "s", "d", "j", "k", "l"];
const COLUMN_RGB_COLORS = ["255, 87, 34", "0, 188, 212", "246, 215, 67"];
const MILISECOND = 1000;

const height = canvas.height;
const columnWidth = canvas.width / keys.length;
const noteHeight = 20;

const speed = 300;
let time = 0;
let positionY = 0;
let positionX;

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const fileInput = document.querySelector("input[type='file']");

let decodedBuffer;

fileInput.addEventListener("change", () => {
  const reader = new FileReader();

  reader.onload = async () => {
    decodedBuffer = await audioContext.decodeAudioData(reader.result);

    source.buffer = decodedBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
  };

  reader.readAsArrayBuffer(fileInput.files[0]);
});

startButton.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  if (audioContext.state === "running") {
    return;
  }

  setTimeout(() => {
    source.start(0);
  }, 3000);

  updateNotes();
});

stopButton.addEventListener("click", () => {
  // cancelAnimationFrame(updateNotes);
  source.stop();
});

let delta = Date.now();

function updateNotes() {
  const now = Date.now();

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  time += (now - delta) / MILISECOND;

  console.log(time);

  const visibleNotes = notes.filter((note) => note.time <= time);
  renderNotes(now, delta, visibleNotes);
  requestAnimationFrame(updateNotes);

  delta = now;
}

function renderNotes(now, delta, notes) {
  notes.forEach((note) => {
    if (note.time <= time) {
      update(now, delta, note);
    }
  });
}

function update(now, delta, note) {
  const diffTimeBetweenAnimationFrame = (now - delta) / MILISECOND;

  note.positionY += diffTimeBetweenAnimationFrame * speed;

  console.log("positionY:", note.positionY);

  render(note);
}

function render(note) {
  const sideBorderWidth = 2;

  if (note.key === "a") {
    positionX = columnWidth * 0;
  }

  if (note.key === "s") {
    positionX = columnWidth * 1;
  }

  if (note.key === "d") {
    positionX = columnWidth * 2;
  }

  if (note.key === "j") {
    positionX = columnWidth * 3;
  }

  if (note.key === "k") {
    positionX = columnWidth * 4;
  }

  if (note.key === "l") {
    positionX = columnWidth * 5;
  }

  ctx.fillStyle = `${note.color}`;
  ctx.fillRect(
    positionX,
    note.startPosition + note.positionY,
    columnWidth - sideBorderWidth * 2,
    noteHeight
  );
}
