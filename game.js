// game.js - bagian 1/2

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

function activateCheat() {
  cheatActive = true;
  cheatTimer = 600; // 10 seconds invincibility
  player.setInvincible(600);
}

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