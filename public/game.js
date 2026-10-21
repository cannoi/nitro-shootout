const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Screens
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('gameover-screen');

// Buttons & Inputs
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const playerNameInput = document.getElementById('player-name');

// HUD
hudScore = document.getElementById('hud-score');
hudDistance = document.getElementById('hud-distance');
hudHealth = document.getElementById('hud-health');

// Mobile controls
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnFire = document.getElementById('btn-fire');

let playerName = 'Driver01';
let gameRunning = false;
let score = 0;
let distance = 0;
let health = 100;

// Player Car
let player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 90,
  width: 40,
  height: 70,
  speed: 5,
  dx: 0
};

let keys = {};
let bullets = [];
let enemies = [];
let obstacles = [];
let roadLines = [];

for (let i = 0; i < 10; i++) {
  roadLines.push({ y: i * 80 });
}

// Event Listeners
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && gameRunning) {
    if (e.code === 'Space') fireBullet();
  }
});

window.addEventListener('keyup', e => {
  keys[e.code] = false;
});

// Mobile events
let leftInterval, rightInterval;
btnLeft.addEventListener('touchstart', () => { keys['ArrowLeft'] = true; });
btnLeft.addEventListener('touchend', () => { keys['ArrowLeft'] = false; });
btnLeft.addEventListener('mousedown', () => { keys['ArrowLeft'] = true; });
btnLeft.addEventListener('mouseup', () => { keys['ArrowLeft'] = false; });

btnRight.addEventListener('touchstart', () => { keys['ArrowRight'] = true; });
btnRight.addEventListener('touchend', () => { keys['ArrowRight'] = false; });
btnRight.addEventListener('mousedown', () => { keys['ArrowRight'] = true; });
btnRight.addEventListener('mouseup', () => { keys['ArrowRight'] = false; });

btnFire.addEventListener('click', () => {
  if (gameRunning) fireBullet();
});

startBtn.addEventListener('click', () => {
  playerName = playerNameInput.value.trim() || 'Driver01';
  startGame();
});

restartBtn.addEventListener('click', () => {
  startGame();
});

menuBtn.addEventListener('click', () => {
  showScreen(startScreen);
});

function showScreen(screen) {
  [startScreen, gameScreen, gameOverScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

function startGame() {
  score = 0;
  distance = 0;
  health = 100;
  bullets = [];
  enemies = [];
  obstacles = [];
  player.x = canvas.width / 2 - 20;
  gameRunning = true;
  showScreen(gameScreen);
  requestAnimationFrame(gameLoop);
}

function fireBullet() {
  bullets.push({
    x: player.x + player.width / 2 - 3,
    y: player.y,
    width: 6,
    height: 15,
    speed: 10
  });
}

let spawnTimer = 0;
function update() {
  if (!gameRunning) return;

  // Player movement
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.x -= player.speed;
  }
  if (keys['ArrowRight'] || keys['KeyD']) {
    player.x += player.speed;
  }
  
  // Boundaries
  if (player.x < 40) player.x = 40;
  if (player.x > canvas.width - 40 - player.width) player.x = canvas.width - 40 - player.width;

  // Distance & Score increment
  distance += 1;
  score += 1;

  // Road lines animation
  roadLines.forEach(line => {
    line.y += 6;
    if (line.y > canvas.height) line.y = 0;
  });

  // Spawn enemies & obstacles
  spawnTimer++;
  if (spawnTimer % 45 === 0) {
    let ex = Math.random() * (canvas.width - 120) + 60;
    enemies.push({
      x: ex,
      y: -80,
      width: 40,
      height: 70,
      speed: 3 + Math.random() * 2
    });
  }

  if (spawnTimer % 90 === 0) {
    let ox = Math.random() * (canvas.width - 120) + 60;
    obstacles.push({
      x: ox,
      y: -50,
      width: 35,
      height: 35,
      speed: 4
    });
  }

  // Update Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }

  // Update Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed;
    
    // Collision with player
    if (
      player.x < enemies[i].x + enemies[i].width &&
      player.x + player.width > enemies[i].x &&
      player.y < enemies[i].y + enemies[i].height &&
      player.y + player.height > enemies[i].y
    ) {
      health -= 25;
      enemies.splice(i, 1);
      if (health <= 0) gameOver();
      continue;
    }

    // Collision with bullets
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (
        bullets[j].x < enemies[i].x + enemies[i].width &&
        bullets[j].x + bullets[j].width > enemies[i].x &&
        bullets[j].y < enemies[i].y + enemies[i].height &&
        bullets[j].y + bullets[j].height > enemies[i].y
      ) {
        score += 100;
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        break;
      }
    }

    if (enemies[i] && enemies[i].y > canvas.height) {
      enemies.splice(i, 1);
    }
  }

  // Update Obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].y += obstacles[i].speed;

    if (
      player.x < obstacles[i].x + obstacles[i].width &&
      player.x + player.width > obstacles[i].x &&
      player.y < obstacles[i].y + obstacles[i].height &&
      player.y + player.height > obstacles[i].y
    ) {
      health -= 20;
      obstacles.splice(i, 1);
      if (health <= 0) gameOver();
      continue;
    }

    if (obstacles[i].y > canvas.height) {
      obstacles.splice(i, 1);
    }
  }

  // HUD Update
  hudScore.innerText = score;
  hudDistance.innerText = distance;
  hudHealth.innerText = Math.max(0, health);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Road background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grass shoulders
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 40, canvas.height);
  ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);

  // Road side lines
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(35, 0, 5, canvas.height);
  ctx.fillRect(canvas.width - 40, 0, 5, canvas.height);

  // Center road dashes
  ctx.fillStyle = '#facc15';
  roadLines.forEach(line => {
    ctx.fillRect(canvas.width / 2 - 5, line.y, 10, 40);
  });

  // Draw Bullets
  ctx.fillStyle = '#38bdf8';
  bullets.forEach(b => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // Draw Obstacles (Barrels)
  ctx.fillStyle = '#f97316';
  obstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(o.x + 5, o.y + 5, o.width - 10, o.height - 10);
    ctx.fillStyle = '#f97316';
  });

  // Draw Enemy Cars
  enemies.forEach(e => {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(e.x, e.y, e.width, e.height);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(e.x + 5, e.y + 10, e.width - 10, 15);
    // Headlights
    ctx.fillStyle = '#facc15';
    ctx.fillRect(e.x + 4, e.y + e.height - 5, 6, 4);
    ctx.fillRect(e.x + e.width - 10, e.y + e.height - 5, 6, 4);
  });

  // Draw Player Car
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = '#15803d';
  ctx.fillRect(player.x + 5, player.y + 15, player.width - 10, 20);
  // Windshield
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(player.x + 8, player.y + 10, player.width - 16, 12);
  // Headlights
  ctx.fillStyle = '#facc15';
  ctx.fillRect(player.x + 4, player.y, 6, 5);
  ctx.fillRect(player.x + player.width - 10, player.y, 6, 5);
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  gameRunning = false;
  document.getElementById('final-name').innerText = playerName;
  document.getElementById('final-score').innerText = score;
  document.getElementById('final-distance').innerText = distance;
  showScreen(gameOverScreen);
  saveScore(playerName, score, distance);
  fetchScores();
}

function saveScore(name, scr, dist) {
  fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_name: name, score: scr, distance: dist })
  }).catch(err => console.error(err));
}

function fetchScores() {
  fetch('/api/scores')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('leaderboard-list');
      if (!data.length) {
        list.innerHTML = '<div class="lb-item">Chưa có thành tích</div>';
        return;
      }
      list.innerHTML = data.map((item, idx) => `
        <div class="lb-item">
          <span>#${idx+1} ${escapeHtml(item.player_name)}</span>
          <span><b>${item.score}</b> đ (${item.distance}m)</span>
        </div>
      `).join('');
    })
    .catch(err => {
      document.getElementById('leaderboard-list').innerHTML = '<div class="lb-item">Lỗi tải bảng xếp hạng</div>';
    });
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
