(() => {
  const W = window.innerWidth;
  const H = window.innerHeight;

  const PLAYER_W = 32;
  const PLAYER_H = 48;
  const GRAVITY = 1000;

  const MAX_STAMINA = 100;
  const STAM_DEC = 10;       // per detik jika naik tanpa pijakan
  const STAM_REC = 5;        // per detik jika diam/di atas lereng

  const ITEM_REC = 30;       // pemulihan stamina saat ambil item
  const OBI_INT = 1500;      // interval spawn obstacle (ms)
  const OBI_SZ = 24;         // diameter obstacle
  const ITEM_SZ = 20;        // diameter item

  const SEG_H = 120;         // tinggi tiap segmen lereng
  const INIT_SEGS = 10;      // jumlah segmen awal

  let game;
  let best = 0;              // catatan High Score

  window.onload = () => {
    game = new Phaser.Game({
      type: Phaser.AUTO,
      width: W,
      height: H,
      parent: 'game-container',
      backgroundColor: '#87ceeb',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: GRAVITY },
          debug: false
        }
      },
      scene: [MenuScene, PlayScene]
    });
    window.focus();
  };

  class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: 'MenuScene' });
    }
    create() {
      // Sembunyikan semua UI non‐menu
      selectAll('#hud, #btn-pause, #mobile-controls, #overlay-pause, #overlay-gameover')
        .forEach(e => e.classList.add('hidden'));

      // Tampilkan overlay Menu Utama
      document.getElementById('overlay-menu').classList.remove('hidden');

      // Tombol Start
      document.getElementById('btn-start').onclick = () => {
        document.getElementById('overlay-menu').classList.add('hidden');
        this.scene.start('PlayScene');
      };

      // Tombol Settings
      document.getElementById('btn-settings').onclick = () => {
        document.getElementById('overlay-menu').classList.add('hidden');
        document.getElementById('overlay-settings').classList.remove('hidden');
      };

      // Tombol Credits
      document.getElementById('btn-credits').onclick = () => {
        document.getElementById('overlay-menu').classList.add('hidden');
        document.getElementById('overlay-credits').classList.remove('hidden');
      };

      // Tombol Back Settings
      document.getElementById('btn-back-settings').onclick = () => {
        document.getElementById('overlay-settings').classList.add('hidden');
        document.getElementById('overlay-menu').classList.remove('hidden');
      };

      // Tombol Back Credits
      document.getElementById('btn-back-credits').onclick = () => {
        document.getElementById('overlay-credits').classList.add('hidden');
        document.getElementById('overlay-menu').classList.remove('hidden');
      };
    }
  }

  class PlayScene extends Phaser.Scene {
    constructor() {
      super({ key: 'PlayScene' });
    }
    create() {
      // Tampilkan HUD, tombol pause, kontrol mobile
      document.getElementById('hud').classList.remove('hidden');
      document.getElementById('btn-pause').classList.remove('hidden');
      document.getElementById('mobile-controls').classList.remove('hidden');

      // Simpan referensi DOM ke this.ui
      this.ui = {
        hudHeight: document.getElementById('hud-height'),
        hudBest: document.getElementById('hud-best'),
        hudStamina: document.getElementById('hud-stamina'),
        stamFill: document.getElementById('stamina-fill')
      };

      // Pastikan overlay pause + gameover tersembunyi
      document.getElementById('overlay-pause').classList.add('hidden');
      document.getElementById('overlay-gameover').classList.add('hidden');

      // Tombol Pause
      document.getElementById('btn-pause').onclick = () => {
        if (!this.paused) {
          this.paused = true;
          document.getElementById('overlay-pause').classList.remove('hidden');
          this.physics.world.pause();
        }
      };
      // Tombol Resume
      document.getElementById('btn-resume').onclick = () => {
        this.paused = false;
        document.getElementById('overlay-pause').classList.add('hidden');
        this.physics.world.resume();
      };
      // Tombol Menu (dari overlay pause)
      document.getElementById('btn-mainmenu').onclick = () => {
        document.getElementById('overlay-pause').classList.add('hidden');
        this.scene.start('MenuScene');
      };
      // Tombol Restart (dari overlay gameover)
      document.getElementById('btn-restart').onclick = () => {
        document.getElementById('overlay-gameover').classList.add('hidden');
        this.scene.restart();
      };
      // Tombol Main Menu (dari overlay gameover)
      document.getElementById('btn-mainmenu-2').onclick = () => {
        document.getElementById('overlay-gameover').classList.add('hidden');
        this.scene.start('MenuScene');
      };

      // Inisialisasi state
      this.paused = false;
      this.stamina = MAX_STAMINA;
      this.heightScore = 0;
      this.gameOver = false;

      // Buat grup untuk segmen lereng, obstacle, dan item
      this.segs = this.add.group();
      this.obstacles = this.physics.add.group();
      this.items = this.physics.add.group();
      this.player = null;

      // Atur batas physics world dan kamera
      this.physics.world.setBounds(0, -5000, W, 5000 + H);
      this.cameras.main.setBounds(0, -5000, W, 5000 + H);

      this.createBackground();
      this.createSlope();
      this.createPlayer();

      // Setup collider & overlap
      this.physics.add.collider(this.player, this.segs);
      this.physics.add.collider(this.obstacles, this.segs, o => o.body.setVelocityY(0));
      this.physics.add.collider(this.items, this.segs, i => i.body.setVelocityY(0));
      this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
      this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

      // Input keyboard
      this.cursors = this.input.keyboard.createCursorKeys();
      // Input mobile (touch)
      this.setupMobile();

      // Kamera mengikuti pemain
      this.cameras.main.startFollow(this.player, true, 0.5, 0.5, 0, H * 0.3);

      // Timer spawn obstacle & item
      this.time.addEvent({ delay: OBI_INT, callback: this.spawnObstacle, callbackScope: this, loop: true });
      this.time.addEvent({ delay: OBI_INT * 3, callback: this.spawnItem, callbackScope: this, loop: true });
    }

    update(_, dt) {
      if (this.paused || this.gameOver) return;

      // Gerak horizontal (keyboard atau mobile)
      let vx = 0;
      if (this.cursors.left.isDown || this.moveLeft) vx = -200;
      else if (this.cursors.right.isDown || this.moveRight) vx = 200;
      this.player.setVelocityX(vx);

      // Lompat (keyboard atau mobile)
      const p = this.input.activePointer;
      if ((this.cursors.up.isDown || this.jumpDown) && this.player.body.blocked.down) {
        this.player.setVelocityY(-400);
      }

      // Atur stamina: jika menanjak (vy < 0) dan tidak menyentuh lereng
      const vy = this.player.body.velocity.y;
      if (!this.player.body.blocked.down && vy < 0) {
        this.stamina = Math.max(0, this.stamina - STAM_DEC * (dt / 1000));
      } else {
        this.stamina = Math.min(MAX_STAMINA, this.stamina + STAM_REC * (dt / 1000));
      }
      updateStamina.call(this);

      if (this.stamina <= 0) {
        this.endGame();
      }

      // Recycle lereng jika keluar layar bawah
      recycleSlope.call(this);

      // Hapus obstacle/items yang keluar layar
      this.obstacles.getChildren().forEach(o => {
        if (o.y > this.cameras.main.scrollY + H + 50) o.destroy();
      });
      this.items.getChildren().forEach(i => {
        if (i.y > this.cameras.main.scrollY + H + 50) i.destroy();
      });

      // Jika pemain jatuh di bawah kamera → game over
      const camY = this.cameras.main.scrollY;
      if (this.player.y > camY + H + 200) {
        this.endGame();
      }

      // Hitung skor ketinggian
      const h = Math.max(0, Math.floor(-this.player.y + H));
      this.heightScore = h;
      this.ui.hudHeight.textContent = 'Height: ' + h + ' m';
      if (h > best) {
        best = h;
        this.ui.hudBest.textContent = 'High Score: ' + best + ' m';
      }
    }

    createBackground() {
      // Fill background color (langit)
      this.add.rectangle(W / 2, H / 2, W, H, 0x87ceeb).setScrollFactor(0);
    }

    createSlope() {
      let sx = W / 2;
      let sy = H - 50;
      for (let i = 0; i < INIT_SEGS; i++) {
        const nx = Phaser.Math.Between(100, W - 100);
        const ny = sy - SEG_H;
        addSegment.call(this, sx, sy, nx, ny);
        sx = nx;
        sy = ny;
      }
    }

    createPlayer() {
      const g = this.add.graphics();
      g.fillStyle(0x228b22, 1);
      g.fillRect(0, 0, PLAYER_W, PLAYER_H);
      g.generateTexture('playerTex', PLAYER_W, PLAYER_H);
      g.destroy();
      this.player = this.physics.add.sprite(W / 2, H - 100, 'playerTex');
      this.player.body.setSize(PLAYER_W, PLAYER_H);
      this.player.body.setBounce(0);
      this.player.body.setFrictionX(1);
    }

    spawnObstacle() {
      const highY = getHighestY.call(this);
      const ox = Phaser.Math.Between(50, W - 50);
      const oy = highY - 50;
      const g = this.add.graphics();
      g.fillStyle(0xff0000, 1);
      g.fillCircle(0, 0, OBI_SZ / 2);
      g.generateTexture('obs' + ox + oy, OBI_SZ, OBI_SZ);
      g.destroy();
      const o = this.physics.add.sprite(ox, oy, 'obs' + ox + oy);
      o.body.setVelocityY(getScrollSpeed.call(this));
      o.body.setCircle(OBI_SZ / 2);
      o.body.setImmovable(true);
      this.obstacles.add(o);
    }

    spawnItem() {
      const highY = getHighestY.call(this);
      const ix = Phaser.Math.Between(50, W - 50);
      const iy = highY - 50;
      const g = this.add.graphics();
      g.fillStyle(0x00ffff, 1);
      g.fillCircle(0, 0, ITEM_SZ / 2);
      g.generateTexture('itm' + ix + iy, ITEM_SZ, ITEM_SZ);
      g.destroy();
      const it = this.physics.add.sprite(ix, iy, 'itm' + ix + iy);
      it.body.setVelocityY(getScrollSpeed.call(this) * 0.7);
      it.body.setCircle(ITEM_SZ / 2);
      it.body.setImmovable(true);
      this.items.add(it);
    }

    hitObstacle() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.player.setTint(0xff0000);
      this.physics.pause();
      showGameOver.call(this);
    }

    collectItem(_, item) {
      item.destroy();
      this.stamina = Math.min(MAX_STAMINA, this.stamina + ITEM_REC);
      updateStamina.call(this);
    }

    endGame() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.player.setTint(0xff0000);
      this.physics.pause();
      showGameOver.call(this);
    }
  }

  function addSegment(x1, y1, x2, y2) {
    const g = this.add.graphics();
    g.fillStyle(0x8b4513, 1);
    const ang = Phaser.Math.Angle.Between(x1, y1, x2, y2);
    const perp = ang - Math.PI / 2;
    const halfW = 80;
    const ax = x1 + halfW * Math.cos(perp),
      ay = y1 + halfW * Math.sin(perp),
      bx = x1 - halfW * Math.cos(perp),
      by = y1 - halfW * Math.sin(perp),
      cx = x2 - halfW * Math.cos(perp),
      cy = y2 - halfW * Math.sin(perp),
      dx = x2 + halfW * Math.cos(perp),
      dy = y2 + halfW * Math.sin(perp);
    g.beginPath();
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
    g.lineTo(cx, cy);
    g.lineTo(dx, dy);
    g.closePath();
    g.fillPath();
    const seg = g;
    this.physics.add.existing(seg, true);
    seg.body.setFriction(1);
    seg.body.setBounce(0);
    const verts = [{ x: ax, y: ay }, { x: bx, y: by }, { x: cx, y: cy }, { x: dx, y: dy }];
    seg.body.setPolygon(verts);
    seg.lastPt = { x: x2, y: y2 };
    this.segs.add(seg);
  }

  function recycleSlope() {
    const camY = this.cameras.main.scrollY;
    let minY = Infinity,
      pt = { x: W / 2, y: H - 50 };
    this.segs.getChildren().forEach(seg => {
      if (seg.y > camY + H + 50) seg.destroy();
      if (seg.y < minY) {
        minY = seg.y;
        pt = seg.lastPt;
      }
    });
    if (minY < camY - 150) {
      const nx = Phaser.Math.Between(100, W - 100);
      const ny = pt.y - SEG_H;
      addSegment.call(this, pt.x, pt.y, nx, ny);
    }
  }

  function getHighestY() {
    let minY = Infinity,
      pt = { x: W / 2, y: H - 50 };
    this.segs.getChildren().forEach(seg => {
      if (seg.y < minY) {
        minY = seg.y;
        pt = seg.lastPt;
      }
    });
    return pt.y;
  }

  function getScrollSpeed() {
    return 100 + Math.floor(this.heightScore / 500) * 20;
  }

  function updateStamina() {
    const pct = (this.stamina / MAX_STAMINA) * 100;
    this.ui.stamFill.style.width = pct * 2 + 'px';
    this.ui.hudStamina.textContent = 'Stamina: ' + Math.floor(pct) + '%';
    this.ui.stamFill.style.background = pct > 50 ? '#0f0' : pct > 20 ? '#ff0' : '#f00';
  }

  function showGameOver() {
    const goO = document.getElementById('overlay-gameover');
    document.getElementById('final-height').textContent = 'Your Height: ' + this.heightScore + ' m';
    document.getElementById('best-height').textContent = 'Best Height: ' + best + ' m';
    goO.classList.remove('hidden');
  }

  function setupMobile() {
    this.moveLeft = false;
    this.moveRight = false;
    this.jumpDown = false;
    document.getElementById('btn-left').addEventListener('touchstart', () => (this.moveLeft = true));
    document.getElementById('btn-left').addEventListener('touchend', () => (this.moveLeft = false));
    document.getElementById('btn-right').addEventListener('touchstart', () => (this.moveRight = true));
    document.getElementById('btn-right').addEventListener('touchend', () => (this.moveRight = false));
    document.getElementById('btn-jump').addEventListener('touchstart', () => (this.jumpDown = true));
    document.getElementById('btn-jump').addEventListener('touchend', () => (this.jumpDown = false));
  }

  function selectAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }
})();