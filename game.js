const gridSize = 5;
const gridEl = document.getElementById("grid");
const staminaEl = document.getElementById("stamina");
const weatherEl = document.getElementById("weather");
const messageEl = document.getElementById("message");

let player = { x: 0, y: 0 };
let goal = { x: 4, y: 4 };
let stamina = 100;
let weather = "Clear";
let correctPath = [];

function randomWeather() {
  const types = ["Clear", "Rain", "Fog"];
  return types[Math.floor(Math.random() * types.length)];
}

function createGrid() {
  gridEl.innerHTML = "";
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (x === player.x && y === player.y) {
        cell.classList.add("player");
        cell.textContent = "🚶‍♂️";
      } else if (x === goal.x && y === goal.y) {
        cell.classList.add("goal");
        cell.textContent = "🏔️";
      } else if (correctPath.find(p => p.x === x && p.y === y)) {
        cell.classList.add("path");
      }
      gridEl.appendChild(cell);
    }
  }
}

function updateStatus() {
  staminaEl.textContent = stamina;
  weatherEl.textContent = weather;
}

function randomPath() {
  // Hardcoded correct path from (0,0) to (4,4) for now
  return [
    {x:0,y:0}, {x:1,y:0}, {x:2,y:0},
    {x:2,y:1}, {x:2,y:2},
    {x:3,y:2}, {x:4,y:2}, {x:4,y:3}, {x:4,y:4}
  ];
}

function applyWeatherPenalty() {
  if (weather === "Rain") return 15;
  if (weather === "Fog") return 10;
  return 5;
}

function move(dir) {
  if (stamina <= 0) return;
  if (messageEl.textContent) return;

  const dx = { left: -1, right: 1, up: 0, down: 0 };
  const dy = { left: 0, right: 0, up: -1, down: 1 };

  const newX = player.x + dx[dir];
  const newY = player.y + dy[dir];

  if (newX < 0 || newY < 0 || newX >= gridSize || newY >= gridSize) return;

  player.x = newX;
  player.y = newY;

  // Cek apakah ini bagian dari path yang benar
  const isCorrect = correctPath.find(p => p.x === player.x && p.y === player.y);

  if (!isCorrect) {
    stamina -= applyWeatherPenalty() * 2;
  } else {
    stamina -= applyWeatherPenalty();
  }

  if (player.x === goal.x && player.y === goal.y) {
    messageEl.textContent = "🎉 You reached the summit!";
  } else if (stamina <= 0) {
    messageEl.textContent = "💀 You ran out of stamina!";
  }

  createGrid();
  updateStatus();
}

function startGame() {
  player = { x: 0, y: 0 };
  stamina = 100;
  weather = randomWeather();
  correctPath = randomPath();
  messageEl.textContent = "";
  createGrid();
  updateStatus();
}

startGame();
