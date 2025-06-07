// game.js - final versi terintegrasi

const canvas = document.getElementById('gameCanvas');
const ctx   = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
  width  = canvas.width  = canvas.clientWidth;
  height = canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game constants
const GRAVITY        = 0.6;
const FLOOR_Y        = () => height - 50;
const PLAYER_WIDTH   = 50;
const PLAYER_HEIGHT  = 80;
const PLAYER_SPEED   = 5;
const JUMP_POWER     = 15;
const MAX_FALL_SPEED = 20;

// Input state
const keys = { left: false, right: false, up: false };
window.addEventListener('keydown', e => {
  if (e.code==='ArrowLeft'||e.code==='KeyA')           keys.left  = true;
  if (e.code==='ArrowRight'||e.code==='KeyD')          keys.right = true;
  if (e.code==='ArrowUp'||e.code==='KeyW'||e.code==='Space') keys.up    = true;
});
window.addEventListener('keyup',   e => {
  if (e.code==='ArrowLeft'||e.code==='KeyA')           keys.left  = false;
  if (e.code==='ArrowRight'||e.code==='KeyD')          keys.right = false;
  if (e.code==='ArrowUp'||e.code==='KeyW'||e.code==='Space') keys.up    = false;
});

// Game state
let obstacles       = [];
let powerUps        = [];
let obstacleTimer   = 0;
let powerUpTimer    = 0;
let obstacleInterval= 90;
let powerUpInterval = 900;
let score           = 0;
let highScore       = parseInt(localStorage.getItem('mountaineerHighScore')) || 0;
let gameOver        = false;
let isPaused        = false;
let cheatActive     = false;
let cheatTimer      = 0;
let jumpStartTime   = 0;
let isJumping       = false;
let powerUpActive   = false;
let powerUpCount    = 0;

// Audio assets
const soundJump    = new Audio('https://freesound.org/data/previews/331/331912_3248244-lq.mp3');
const soundHit     = new Audio('https://freesound.org/data/previews/353/353927_5121236-lq.mp3');
const soundPowerUp = new Audio('https://freesound.org/data/previews/82/82556_1022652-lq.mp3');
const bgMusic      = new Audio('https://freesound.org/data/previews/348/348796_6247143-lq.mp3');
bgMusic.loop      = true;
bgMusic.volume    = 0.15;
bgMusic.play();

// Parallax layers
class ParallaxLayer {
  constructor(src, speed) {
    this.img   = new Image();
    this.img.src = src;
    this.speed = speed;
    this.x     = 0;
  }
  update() {
    this.x -= this.speed;
    if (this.x <= -width) this.x = 0;
  }
  draw() {
    ctx.drawImage(this.img, this.x, 0, width, height);
    ctx.drawImage(this.img, this.x + width, 0, width, height);
  }
}
const layers = [
  new ParallaxLayer('https://i.ibb.co/3mP1y8W/layer1.png', 0.3),
  new ParallaxLayer('https://i.ibb.co/4Whh1XG/layer2.png', 0.6),
  new ParallaxLayer('https://i.ibb.co/YT7cW1L/layer3.png', 1.2),
];

// Background & ground
function drawBackground() {
  layers.forEach(l => { l.update(); l.draw(); });
  ctx.fillStyle = '#4a6f28';
  ctx.fillRect(0, FLOOR_Y(), width, height - FLOOR_Y());
}

// Player
class Player {
  constructor() {
    this.x       = width/4;
    this.y       = FLOOR_Y() - PLAYER_HEIGHT;
    this.vx      = 0;
    this.vy      = 0;
    this.width   = PLAYER_WIDTH;
    this.height  = PLAYER_HEIGHT;
    this.onGround      = false;
    this.jumpCooldown  = 0;
    this.invincibleTimer = 0;
    this.sprite   = new Image();
    this.sprite.src = 'https://i.imgur.com/JPZ8VqM.png';
  }
  update() {
    // horizontal
    this.vx = keys.left ? -PLAYER_SPEED : keys.right ? PLAYER_SPEED : 0;
    // jump
    if (keys.up && this.onGround && this.jumpCooldown<=0) {
      this.vy = -JUMP_POWER; this.onGround=false; this.jumpCooldown=15;
      soundJump.currentTime=0; soundJump.play();
    }
    if (this.jumpCooldown>0) this.jumpCooldown--;
    // gravity
    this.vy += GRAVITY;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;
    // move
    this.x += this.vx; this.y += this.vy;
    // floor collision
    if (this.y + this.height > FLOOR_Y()) {
      this.y = FLOOR_Y() - this.height; this.vy=0; this.onGround=true;
    }
    // boundaries
    if (this.x<0) this.x=0;
    if (this.x+this.width>width) this.x= width-this.width;
    // invincible timer
    if (this.invincibleTimer>0) this.invincibleTimer--;
  }
  draw() {
    if (this.invincibleTimer>0 && Math.floor(this.invincibleTimer/5)%2===0) return;
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
  }
  setInvincible(f) { this.invincibleTimer=f; }
  isInvincible() { return this.invincibleTimer>0; }
}
const player = new Player();

// Obstacle
class Obstacle {
  constructor(x,y,w,h,type) {
    this.x=x; this.y=y; this.width=w; this.height=h; this.type=type;
    this.speed=4; this.sprite=new Image();
    if(type==='tree') this.sprite.src='https://i.imgur.com/gKPZltU.png';
    if(type==='rock') this.sprite.src='https://i.imgur.com/BdoQGzw.png';
    if(type==='water')this.sprite.src='https://i.imgur.com/0qTu5Bv.png';
  }
  update() { this.x -= this.speed; }
  draw()   { ctx.drawImage(this.sprite,this.x,this.y,this.width,this.height); }
  isOffScreen() { return this.x+this.width<0; }
  collidesWith(p) {
    if(p.isInvincible()) return false;
    return !(p.x>this.x+this.width || p.x+p.width<this.x ||
             p.y>this.y+this.height|| p.y+p.height<this.y);
  }
}

// PowerUp
class PowerUp {
  constructor() {
    this.width=40; this.height=40;
    this.x=Math.random()*(width-this.width);
    this.y=-this.height; this.speed=4; this.type='invincible'; this.active=true;
  }
  update() {
    this.y+=this.speed; if(this.y>height) this.active=false;
  }
  draw() {
    ctx.fillStyle='#FFD700';
    ctx.beginPath();
    ctx.arc(this.x+this.width/2, this.y+this.height/2, this.width/2,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#000';
    ctx.font='20px Arial';
    ctx.fillText('C', this.x+this.width/4, this.y+this.height*0.7);
  }
  collidesWith(p) {
    return !(p.x>this.x+this.width || p.x+p.width<this.x ||
             p.y>this.y+this.height|| p.y+p.height<this.y);
  }
}

// Spawners
function spawnObstacle() {
  const types=['tree','rock','water'];
  const type=types[Math.floor(Math.random()*types.length)];
  let h, yPos;
  if(type==='tree'){h=100; yPos=FLOOR_Y()-h;}
  if(type==='rock'){h=60; yPos=FLOOR_Y()-h;}
  if(type==='water'){h=50; yPos=FLOOR_Y()-h+10;}
  const w = h*0.7;
  const x = canvas.width + Math.random()*200;
  obstacles.push(new Obstacle(x,yPos,w,h,type));
}
function spawnPowerUp() {
  powerUps.push(new PowerUp());
}

// Draw UI
function drawScore() {
  ctx.fillStyle='#1b4332';
  ctx.font='24px Segoe UI';
  ctx.textAlign='left';
  ctx.fillText('Score: '+score,15,30);
  ctx.textAlign='right';
  ctx.fillText('Highscore: '+highScore, width-15,30);
}
function drawCheatTimer() {
  ctx.fillStyle='rgba(255,215,0,0.7)';
  ctx.font='24px Arial';
  ctx.fillText(`Invincible: ${(cheatTimer/60).toFixed(1)}s`, width-170,50);
}
function drawGameOver() {
  ctx.fillStyle='rgba(0,0,0,0.6)';
  ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#d8f3dc';
  ctx.font='48px Segoe UI';
  ctx.textAlign='center';
  ctx.fillText('Game Over',width/2,height/2-30);
  ctx.font='28px Segoe UI';
  ctx.fillText(`Score: ${score}`,width/2,height/2+10);
  ctx.fillText(`Highscore: ${highScore}`,width/2,height/2+50);
  ctx.font='22px Segoe UI';
  ctx.fillText('Press R to Restart',width/2,height/2+100);
}
function drawPauseScreen() {
  ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#fff'; ctx.font='48px Arial'; ctx.textAlign='center';
  ctx.fillText('Paused',width/2,height/2);
  ctx.font='20px Arial';
  ctx.fillText('Press P to Resume',width/2,height/2+40);
}

// Cheat & Restart
function activateCheat(frames=300) {
  cheatActive=true; cheatTimer=frames; player.setInvincible(frames); soundPowerUp.currentTime=0; soundPowerUp.play();
}
function restartGame() {
  obstacles=[]; powerUps=[]; obstacleInterval=90; powerUpTimer=0;
  score=0; gameOver=false; isPaused=false; cheatActive=false; cheatTimer=0;
  player.x=width/4; player.y=FLOOR_Y()-PLAYER_HEIGHT; player.vx=0; player.vy=0; player.setInvincible(0);
}

// Input for P, R, C
window.addEventListener('keydown', e=>{
  if(e.code==='KeyP' && !gameOver) {
    isPaused=!isPaused;
    if(!isPaused) requestAnimationFrame(gameLoop);
    else drawPauseScreen();
  }
  if(e.code==='KeyR'&&gameOver) restartGame();
  if(e.code==='KeyC'&&!gameOver&&!cheatActive) activateCheat(600);
});

// Main loop
function gameLoop() {
  if(isPaused) return;
  ctx.clearRect(0,0,width,height);
  drawBackground();

  if(!gameOver) {
    // spawn
    obstacleTimer++; if(obstacleTimer>=obstacleInterval){ obstacleTimer=0;spawnObstacle(); if(obstacleInterval>45) obstacleInterval-=0.3; }
    powerUpTimer++;   if(powerUpTimer>=powerUpInterval){ powerUpTimer=0;spawnPowerUp(); }

    // update
    layers.forEach(l=>l.update());
    obstacles.forEach(o=>o.update());
    obstacles=obstacles.filter(o=>!o.isOffScreen());
    powerUps.forEach(p=>p.update());
    powerUps=powerUps.filter(p=>p.active);
    player.update();

    // collisions
    obstacles.forEach(o=>{
      if(o.collidesWith(player)){ soundHit.currentTime=0; soundHit.play(); bgMusic.pause();
        if(!player.isInvincible()){ gameOver=true; if(score>highScore) highScore=score; localStorage.setItem('mountaineerHighScore',highScore); }
      }
    });
    powerUps.forEach(p=>{
      if(p.collidesWith(player)){ activateCheat(300); p.active=false; }
    });

    // score
    score++;
    drawScore();

    // draw all
    obstacles.forEach(o=>o.draw());
    powerUps.forEach(p=>p.draw());
    player.draw();
    if(cheatActive){ cheatTimer--; if(cheatTimer<=0){ cheatActive=false; player.setInvincible(0); } drawCheatTimer(); }

  } else {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

// start
requestAnimationFrame(gameLoop);