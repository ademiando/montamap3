// game.js – bagian 1/3

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
  width = canvas.width = canvas.clientWidth;
  height = canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game constants
const GRAVITY = 0.6;
const FLOOR_Y = height - 50;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 80;
const PLAYER_SPEED = 5;
const JUMP_POWER = 15;
const MAX_FALL_SPEED = 20;

// Input state
const keys = {
  left: false,
  right: false,
  up: false
};

window.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.up = true;
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.up = false;
});

// Player object
class Player {
  constructor() {
    this.x = width / 4;
    this.y = FLOOR_Y - PLAYER_HEIGHT;
    this.vx = 0;
    this.vy = 0;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.onGround = false;
    this.jumpCooldown = 0;
    this.invincibleTimer = 0;
    this.sprite = new Image();
    this.sprite.src = 'https://i.imgur.com/JPZ8VqM.png'; // hiking girl silhouette
  }

  update() {
    // Horizontal movement
    if (keys.left) this.vx = -PLAYER_SPEED;
    else if (keys.right) this.vx = PLAYER_SPEED;
    else this.vx = 0;

    // Jumping
    if (keys.up && this.onGround && this.jumpCooldown <= 0) {
      this.vy = -JUMP_POWER;
      this.onGround = false;
      this.jumpCooldown = 15; // cooldown frames
    }
    if (this.jumpCooldown > 0) this.jumpCooldown--;

    // Apply gravity
    this.vy += GRAVITY;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // Floor collision
    if (this.y + this.height > FLOOR_Y) {
      this.y = FLOOR_Y - this.height;
      this.vy = 0;
      this.onGround = true;
    }

    // Keep player inside canvas horizontally
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > width) this.x = width - this.width;

    // Invincible timer decrease
    if (this.invincibleTimer > 0) this.invincibleTimer--;
  }

  draw() {
    if (this.invincibleTimer > 0) {
      // flicker effect when invincible
      if (Math.floor(this.invincibleTimer / 5) % 2 === 0) return;
    }
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
  }

  setInvincible(frames) {
    this.invincibleTimer = frames;
  }

  isInvincible() {
    return this.invincibleTimer > 0;
  }
}

const player = new Player();

// Rintangan class
class Obstacle {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 'tree', 'rock', 'water'
    this.speed = 4;
    this.sprite = new Image();
    switch (type) {
      case 'tree':
        this.sprite.src = 'https://i.imgur.com/gKPZltU.png';
        break;
      case 'rock':
        this.sprite.src = 'https://i.imgur.com/BdoQGzw.png';
        break;
      case 'water':
        this.sprite.src = 'https://i.imgur.com/0qTu5Bv.png';
        break;
      default:
        this.sprite.src = '';
    }
  }

  update() {
    this.x -= this.speed;
  }

  draw() {
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  collidesWith(player) {
    if (player.isInvincible()) return false;
    return !(player.x > this.x + this.width ||
      player.x + player.width < this.x ||
      player.y > this.y + this.height ||
      player.y + player.height < this.y);
  }
}

// Game variables
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 90; // frames
let score = 0;
let highScore = 0;
let gameOver = false;
let cheatActive = false;
let cheatTimer = 0;

// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, width, height);

  if (!gameOver) {
    // Spawn obstacles
    obstacleTimer++;
    if (obstacleTimer >= obstacleInterval) {
      obstacleTimer = 0;
      spawnObstacle();
      if (obstacleInterval > 45) obstacleInterval -= 0.5; // speed up game gradually
    }

    // Update obstacles
    obstacles.forEach(ob => ob.update());
    obstacles = obstacles.filter(ob => !ob.isOffScreen());

    // Update player
    player.update();

    // Check collisions
    obstacles.forEach(ob => {
      if (ob.collidesWith(player)) {
        if (!player.isInvincible()) {
          gameOver = true;
          if (score > highScore) highScore = score;
        }
      }
    });

    // Update score
    score++;
    drawScore();

    // Draw everything
    obstacles.forEach(ob => ob.draw());
    player.draw();

    // Cheat timer countdown
    if (cheatActive) {
      cheatTimer--;
      if (cheatTimer <= 0) {
        cheatActive = false;
        player.invincibleTimer = 0;
      }
      drawCheatTimer();
    }

  } else {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

function spawnObstacle() {
  const types = ['tree', 'rock', 'water'];
  const type = types[Math.floor(Math.random() * types.length)];
  let height, yPos;

  switch (type) {
    case 'tree':
      height = 100;
      yPos = FLOOR_Y - height;
      break;
    case 'rock':
      height = 60;
      yPos = FLOOR_Y - height;
      break;
    case 'water':
      height = 50;
      yPos = FLOOR_Y - height + 10;
      break;
  }

  const width = height * 0.7;
  const x = width + width + width + width + canvas.width + Math.random() * 200;

  obstacles.push(new Obstacle(x, yPos, width, height, type));
}

function drawScore() {
  ctx.fillStyle = '#1b4332';
  ctx.font = '24px Segoe UI';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 15, 30);

  ctx.textAlign = 'right';
  ctx.fillText('Highscore: ' + highScore, width - 15, 30);
}

function drawCheatTimer() {
  ctx.fillStyle = 'rgba(82, 183, 136, 0.8)';
  ctx.font = '20px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText(`Invincible: ${(cheatTimer / 60).toFixed(1)}s`, width / 2, 60);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#d8f3dc';
  ctx.font = '48px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', width / 2, height / 2 - 30);
  ctx.font = '28px Segoe UI';
  ctx.fillText(`Score: ${score}`, width / 2, height / 2 + 10);
  ctx.fillText(`Highscore: ${highScore}`, width / 2, height / 2 + 50);

  ctx.font = '22px Segoe UI';
  ctx.fillText('Press R to Restart', width / 2, height / 2 + 100);
}

// Restart function
function restartGame() {
  obstacles = [];
  score = 0;
  obstacleInterval = 90;
  gameOver = false;
  player.x = width / 4;
  player.y = FLOOR_Y - PLAYER_HEIGHT;
  player.vx = 0;
  player.vy = 0;
  cheatActive
  
  
cheatActive = false;
  cheatTimer = 0;
  player.setInvincible(0);
}

// Keyboard controls for restart and cheat activation
window.addEventListener('keydown', e => {
  if (e.code === 'KeyR' && gameOver) {
    restartGame();
  }
  if (e.code === 'KeyC' && !gameOver) {
    activateCheat();
  }
});




// game.js – bagian 2/3

function activateCheat() {
  cheatActive = true;
  cheatTimer = 600; // 10 detik (60 FPS x 10)
  player.setInvincible(cheatTimer);
}

// Jalankan game loop pertama kali
gameLoop();

// Background & ground rendering
function drawBackground() {
  // Sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, '#a0d8f7');
  skyGradient.addColorStop(1, '#2874a6');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  // Ground
  ctx.fillStyle = '#4a6f28';
  ctx.fillRect(0, FLOOR_Y, width, height - FLOOR_Y);
}

// Main draw wrapper
function drawAll() {
  drawBackground();
  obstacles.forEach(ob => ob.draw());
  player.draw();
  drawScore();
  if (cheatActive) drawCheatTimer();
  if (gameOver) drawGameOver();
}

// Overriding gameLoop to include background and modular draw
function gameLoop() {
  ctx.clearRect(0, 0, width, height);

  drawBackground();

  if (!gameOver) {
    obstacleTimer++;
    if (obstacleTimer >= obstacleInterval) {
      obstacleTimer = 0;
      spawnObstacle();
      if (obstacleInterval > 45) obstacleInterval -= 0.3; // progressive difficulty
    }

    obstacles.forEach(ob => ob.update());
    obstacles = obstacles.filter(ob => !ob.isOffScreen());

    player.update();

    // Collision detection
    obstacles.forEach(ob => {
      if (ob.collidesWith(player)) {
        if (!player.isInvincible()) {
          gameOver = true;
          if (score > highScore) highScore = score;
        }
      }
    });

    score++;
    drawScore();

    obstacles.forEach(ob => ob.draw());
    player.draw();

    if (cheatActive) {
      cheatTimer--;
      if (cheatTimer <= 0) {
        cheatActive = false;
        player.setInvincible(0);
      }
      drawCheatTimer();
    }

  } else {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

// Initialize game loop
gameLoop();

// Load highscore dari localStorage
let storedHighScore = localStorage.getItem('mountaineerHighScore');
if (storedHighScore) highScore = parseInt(storedHighScore);

// Save highscore ke localStorage jika ada skor baru
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('mountaineerHighScore', highScore);
  }
}

// UI pause/resume handling
window.addEventListener('keydown', e => {
  if (e.code === 'KeyP') {
    if (gameOver) return;
    isPaused = !isPaused;
    if (!isPaused) gameLoop();
    else drawPauseScreen();
  }
});

function drawPauseScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Paused', width / 2, height / 2);
  ctx.font = '20px Arial';
  ctx.fillText('Press P to Resume', width / 2, height / 2 + 40);
}

// Update gameLoop to handle pause
function gameLoop() {
  if (isPaused) return;

  ctx.clearRect(0, 0, width, height);
  drawBackground();

  if (!gameOver) {
    obstacleTimer++;
    if (obstacleTimer >= obstacleInterval) {
      obstacleTimer = 0;
      spawnObstacle();
      if (obstacleInterval > 45) obstacleInterval -= 0.3;
    }

    obstacles.forEach(ob => ob.update());
    obstacles = obstacles.filter(ob => !ob.isOffScreen());

    player.update();

    obstacles.forEach(ob => {
      if (ob.collidesWith(player)) {
        if (!player.isInvincible()) {
          gameOver = true;
          saveHighScore();
        }
      }
    });

    score++;
    drawScore();

    obstacles.forEach(ob => ob.draw());
    player.draw();

    if (cheatActive) {
      cheatTimer--;
      if (cheatTimer <= 0) {
        cheatActive = false;
        player.setInvincible(0);
      }
      drawCheatTimer();
    }

  } else {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}





// game.js – bagian 3/3

// Power-up object
class PowerUp {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.x = Math.random() * (width - this.width);
    this.y = -this.height;
    this.speed = 4;
    this.type = 'invincible'; // cuma satu tipe cheat untuk sekarang
    this.active = true;
  }

  update() {
    this.y += this.speed;
    if (this.y > height) this.active = false;
  }

  draw() {
    ctx.fillStyle = '#FFD700'; // warna emas
    ctx.beginPath();
    ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('C', this.x + this.width/4, this.y + this.height * 0.7);
  }

  collidesWith(player) {
    return !(player.x > this.x + this.width ||
             player.x + player.width < this.x ||
             player.y > this.y + this.height ||
             player.y + player.height < this.y);
  }
}

// Array power-ups
let powerUps = [];
let powerUpTimer = 0;
let powerUpInterval = 900; // kemunculan tiap 900 frame (15 detik kira2)

// Update spawn power-up
function spawnPowerUp() {
  powerUps.push(new PowerUp());
}

// Update gameLoop bagian power-up
function gameLoop() {
  if (isPaused) return;
  ctx.clearRect(0, 0, width, height);
  drawBackground();

  if (!gameOver) {
    obstacleTimer++;
    powerUpTimer++;

    if (obstacleTimer >= obstacleInterval) {
      obstacleTimer = 0;
      spawnObstacle();
      if (obstacleInterval > 45) obstacleInterval -= 0.3;
    }

    if (powerUpTimer >= powerUpInterval) {
      powerUpTimer = 0;
      spawnPowerUp();
    }

    obstacles.forEach(ob => ob.update());
    obstacles = obstacles.filter(ob => !ob.isOffScreen());

    powerUps.forEach(pu => pu.update());
    powerUps = powerUps.filter(pu => pu.active);

    player.update();

    obstacles.forEach(ob => {
      if (ob.collidesWith(player)) {
        if (!player.isInvincible()) {
          gameOver = true;
          saveHighScore();
        }
      }
    });

    powerUps.forEach((pu, index) => {
      if (pu.collidesWith(player)) {
        cheatActive = true;
        cheatTimer = 300; // 5 detik dengan 60fps
        player.setInvincible(cheatTimer);
        pu.active = false;
      }
    });

    score++;
    drawScore();

    obstacles.forEach(ob => ob.draw());
    powerUps.forEach(pu => pu.draw());
    player.draw();

    if (cheatActive) {
      cheatTimer--;
      if (cheatTimer <= 0) {
        cheatActive = false;
        player.setInvincible(0);
      }
      drawCheatTimer();
    }

  } else {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

function drawCheatTimer() {
  ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.font = '24px Arial';
  ctx.fillText(`Invincible: ${(cheatTimer/60).toFixed(1)}s`, width - 170, 50);
}

class ParallaxLayer {
  constructor(image, speed) {
    this.image = image;
    this.speed = speed;
    this.x = 0;
  }
  update() {
    this.x -= this.speed;
    if (this.x <= -width) this.x = 0;
  }
  draw() {
    ctx.drawImage(this.image, this.x, 0, width, height);
    ctx.drawImage(this.image, this.x + width, 0, width, height);
  }
}

// Load gambar background
const bgLayer1 = new Image();
const bgLayer2 = new Image();
const bgLayer3 = new Image();

bgLayer1.src = 'https://i.ibb.co/3mP1y8W/layer1.png'; // background jauh (gunung)
bgLayer2.src = 'https://i.ibb.co/4Whh1XG/layer2.png'; // background tengah (hutan)
bgLayer3.src = 'https://i.ibb.co/YT7cW1L/layer3.png'; // foreground (pohon dekat)

// Buat layer paralaks
const layers = [
  new ParallaxLayer(bgLayer1, 0.3),
  new ParallaxLayer(bgLayer2, 0.6),
  new ParallaxLayer(bgLayer3, 1.2),
];

// Update dan draw background di gameLoop:
function drawBackground() {
  layers.forEach(layer => {
    layer.update();
    layer.draw();
  });
}

// Inisialisasi audio
const soundJump = new Audio('https://freesound.org/data/previews/331/331912_3248244-lq.mp3');
const soundHit = new Audio('https://freesound.org/data/previews/353/353927_5121236-lq.mp3');
const soundPowerUp = new Audio('https://freesound.org/data/previews/82/82556_1022652-lq.mp3');
const bgMusic = new Audio('https://freesound.org/data/previews/348/348796_6247143-lq.mp3');

bgMusic.loop = true;
bgMusic.volume = 0.15;
bgMusic.play();

// Contoh trigger suara di game event
function playerJump() {
  // logika lompat di sini ...
  soundJump.currentTime = 0;
  soundJump.play();
}

function playerHitObstacle() {
  // logika tabrakan di sini ...
  soundHit.currentTime = 0;
  soundHit.play();
  bgMusic.pause();
}

function activatePowerUp() {
  // logika power-up ...
  soundPowerUp.currentTime = 0;
  soundPowerUp.play();
}

// Game state dasar
let isJumping = false;
let powerUpActive = false;
let powerUpTimer = 0;
let gameOver = false;
let score = 0;

// Kontrol keyboard
document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.code === 'Space' && !isJumping) {
    isJumping = true;
    playerJump();
    jumpStartTime = performance.now();
  }
  if (e.code === 'KeyC' && !powerUpActive) {
    activatePowerUp();
    powerUpActive = true;
    powerUpTimer = 5000; // aktif 5 detik
  }
});

// Fungsi loncat
function playerJump() {
  soundJump.currentTime = 0;
  soundJump.play();
  // logika lompat animasi karakter di game loop nanti
}

// Fungsi power-up
function activatePowerUp() {
  soundPowerUp.currentTime = 0;
  soundPowerUp.play();
  // mungkin set efek visual cheat mode di game loop nanti
}

// Fungsi tabrakan
function playerHitObstacle() {
  soundHit.currentTime = 0;
  soundHit.play();
  bgMusic.pause();
  gameOver = true;
  alert('Game Over! Skor: ' + score);
}

// Update game loop - contoh sederhana
function gameLoop(timestamp) {
  if (gameOver) return;

  // Update skor
  score += 1;
  document.getElementById('score').textContent = 'Score: ' + score;

  // Update power-up timer
  if (powerUpActive) {
    powerUpTimer -= 16; // asumsikan 60fps ~16ms
    if (powerUpTimer <= 0) {
      powerUpActive = false;
    }
  }

  // Update animasi lompat (simplified)
  if (isJumping) {
    // contoh animasi lompat 1 detik
    if (performance.now() - jumpStartTime > 1000) {
      isJumping = false;
    }
  }

  // Deteksi tabrakan (contoh sederhana, pakai koordinat & rintangan)
  if (!powerUpActive && detectCollision()) {
    playerHitObstacle();
  }

  requestAnimationFrame(gameLoop);
}

function detectCollision() {
  // dummy collision, nanti diganti logic nyata
  // contoh: rintangan jatuh berada di posisi player saat ini
  // return true jika collision detected
  return false;
}

// Mulai game loop
let jumpStartTime = 0;
requestAnimationFrame(gameLoop);

// Game state dasar
let isJumping = false;
let powerUpActive = false;
let powerUpTimer = 0;
let gameOver = false;
let score = 0;

// Kontrol keyboard
document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.code === 'Space' && !isJumping) {
    isJumping = true;
    playerJump();
    jumpStartTime = performance.now();
  }
  if (e.code === 'KeyC' && !powerUpActive) {
    activatePowerUp();
    powerUpActive = true;
    powerUpTimer = 5000; // aktif 5 detik
  }
});

// Fungsi loncat
function playerJump() {
  soundJump.currentTime = 0;
  soundJump.play();
  // logika lompat animasi karakter di game loop nanti
}

// Fungsi power-up
function activatePowerUp() {
  soundPowerUp.currentTime = 0;
  soundPowerUp.play();
  // mungkin set efek visual cheat mode di game loop nanti
}

// Fungsi tabrakan
function playerHitObstacle() {
  soundHit.currentTime = 0;
  soundHit.play();
  bgMusic.pause();
  gameOver = true;
  alert('Game Over! Skor: ' + score);
}

// Update game loop - contoh sederhana
function gameLoop(timestamp) {
  if (gameOver) return;

  // Update skor
  score += 1;
  document.getElementById('score').textContent = 'Score: ' + score;

  // Update power-up timer
  if (powerUpActive) {
    powerUpTimer -= 16; // asumsikan 60fps ~16ms
    if (powerUpTimer <= 0) {
      powerUpActive = false;
    }
  }

  // Update animasi lompat (simplified)
  if (isJumping) {
    // contoh animasi lompat 1 detik
    if (performance.now() - jumpStartTime > 1000) {
      isJumping = false;
    }
  }

  // Deteksi tabrakan (contoh sederhana, pakai koordinat & rintangan)
  if (!powerUpActive && detectCollision()) {
    playerHitObstacle();
  }

  requestAnimationFrame(gameLoop);
}

function detectCollision() {
  // dummy collision, nanti diganti logic nyata
  // contoh: rintangan jatuh berada di posisi player saat ini
  // return true jika collision detected
  return false;
}

// Mulai game loop
let jumpStartTime = 0;
requestAnimationFrame(gameLoop);

document.getElementById('powerup-status').textContent = 'Power-Up: ' + (powerUpActive ? 'ON' : 'OFF');

function restartGame() {
  obstacles = [];
  score = 0;
  obstacleInterval = 90;
  gameOver = false;
  player.x = width / 4;
  player.y = FLOOR_Y - PLAYER_HEIGHT;
  player.vx = 0;
  player.vy = 0;
  cheatActive = false;
  cheatTimer = 0;
  player.setInvincible(0);
}

function activateCheat() {
  cheatActive = true;
  cheatTimer = 300; // 5 detik @60fps
  player.setInvincible(300);
}

window.addEventListener('keydown', e => {
  if (e.code === 'KeyR' && gameOver) {
    restartGame();
  }
  if (e.code === 'KeyC' && !gameOver && !cheatActive) {
    activateCheat();
  }
});