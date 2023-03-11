const audioContext = new AudioContext();
const source = audioContext.createBufferSource();
const gainNode = audioContext.createGain();

// 노래 시작시간 3초 뒤
// samurai 첫 음 시작하는 시간 3.03 ~ 3.04 큰 음은 3.06
// 두번째음 3.75
// note가 canvas 끝에 닿는 시간 처음 입력되는 시간 은 2.5? 2.60 ~ 2.61
const notes = [
  {
    time: 0.6,
    key: "s",
    positionY: 0,
  },
  {
    time: 0.65,
    key: "d",
    positionY: 0,
  },
  {
    time: 1.2,
    key: "f",
    positionY: 0,
  },
  {
    time: 1.25,
    key: "j",
    positionY: 0,
  },
  {
    time: 1.95,
    key: "k",
    positionY: 0,
  },
  {
    time: 2,
    key: "l",
    positionY: 0,
  },
  {
    time: 2.3,
    key: "k",
    positionY: 0,
  },
  {
    time: 2.35,
    key: "l",
    positionY: 0,
  },
  {
    time: 2.95,
    key: "s",
    positionY: 0,
  },
  {
    time: 3,
    key: "d",
    positionY: 0,
  },
  {
    time: 3.25,
    key: "f",
    positionY: 0,
  },
  {
    time: 3.35,
    key: "j",
    positionY: 0,
  },
  {
    time: 3.95,
    key: "s",
    positionY: 0,
  },
  {
    time: 4.05,
    key: "d",
    positionY: 0,
  },
  {
    time: 4.55,
    key: "f",
    positionY: 0,
  },
  {
    time: 4.65,
    key: "j",
    positionY: 0,
  },
  {
    time: 4.95,
    key: "f",
    positionY: 0,
  },
  {
    time: 5.95,
    key: "j",
    positionY: 0,
    height: 40,
  },
];

const gainSlider = document.querySelector("#gain-slider");
gainSlider.addEventListener("input", () => {
  gainNode.gain.value = gainSlider.value;
});

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const keys = ["s", "d", "f", "j", "k", "l"];
const MILISECOND = 1000;

const height = canvas.height;
const columnWidth = canvas.width / keys.length;
const noteHeight = 20;
const speed = 300;
let time = 0;

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const fileInput = document.querySelector("input[type='file']");

let decodedBuffer;
let delta;

function updateNotes() {
  const now = Date.now();

  if (!delta) {
    delta = now;
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  time += (now - delta) / MILISECOND;

  const visibleNotes = notes.filter((note) => note.time <= time);
  renderNotes(now, delta, visibleNotes);
  requestAnimationFrame(updateNotes);

  document.addEventListener("keydown", (e) => {
    if (e.key === "s") {
      console.log(time, "s");
    }

    if (e.key === "d") {
      console.log(time, "d");
    }

    if (e.key === "f") {
      console.log(time, "f");
    }

    if (e.key === "j") {
      console.log(time, "j");
    }

    if (e.key === "k") {
      console.log(time, "k");
    }
    if (e.key === "l") {
      console.log(time, "l");
    }
  });

  delta = now;
}

function renderNotes(now, delta, notes) {
  const notesArray = notes.sort((prev, next) => prev.time - next.time);

  notesArray.forEach((note) => {
    update(now, delta, note);
  });
}

function update(now, delta, note) {
  const diffTimeBetweenAnimationFrame = (now - delta) / MILISECOND;

  note.positionY += diffTimeBetweenAnimationFrame * speed;

  render(note);
}

function render(note) {
  const sideBorderWidth = 2;

  if (note.key === "s") {
    note.positionX = columnWidth * 0;
    note.color = "red";
  }

  if (note.key === "d") {
    note.positionX = columnWidth * 1;
    note.color = "blue";
  }

  if (note.key === "f") {
    note.positionX = columnWidth * 2;
    note.color = "yellow";
  }

  if (note.key === "j") {
    note.positionX = columnWidth * 3;
    note.color = "purple";
  }

  if (note.key === "k") {
    note.positionX = columnWidth * 4;
    note.color = "orange";
  }

  if (note.key === "l") {
    note.positionX = columnWidth * 5;
    note.color = "skyblue";
  }

  ctx.fillStyle = `${note.color}`;
  ctx.fillRect(
    note.positionX,
    note.positionY,
    columnWidth - sideBorderWidth * 2,
    note.height || noteHeight
  );

  if (note.positionY >= height - 20) {
    // console.log(time, "time"); // 캔버스 처음에서 내려오는 길이 계산용
  }
}

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
    console.log(audioContext.state);
    return;
  }

  setTimeout(() => {
    source.start(0);
  }, 3000);

  updateNotes();
});

stopButton.addEventListener("click", () => {
  source.stop();
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
});
