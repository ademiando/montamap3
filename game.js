// Montane Mapbox Climbing Game – game.js
// Ganti dengan token Mapbox Anda
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';

(() => {
  // Variabel global
  const MOVE_SPEED = 0.0005;        // Kecepatan pindah (derajat per frame)
  const OBI_COUNT = 50;             // Jumlah obstacle di awal
  const ITEM_COUNT = 30;            // Jumlah item air di awal
  const COLLIDE_DIST = 0.0008;      // Jarak threshold (deg) untuk deteksi tabrakan
  const INIT_STAMINA = 100;
  const STAMINA_DEC = 0.05;         // per frame saat bergerak
  const STAMINA_INC = 0.02;         // per frame saat diam
  const SLOPE_PENALTY = 0.1;        // tambahan stamina hilang saat slope curam
  const UPDATE_INTERVAL = 16;       // sekitar 60fps

  let map, player, playerLngLat, playerAltitude = 0;
  let stamina = INIT_STAMINA, distance = 0;
  let obstacles = [], items = [];
  let paused = false;

  // Inisialisasi peta
  function initMap() {
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v12',    // style dengan terrain
      center: [86.9250, 27.9881], // Koordinat Everest (sebagai contoh)
      zoom: 12,
      pitch: 60,
      bearing: -20,
      antialias: true
    });

    // Aktifkan terrain
    map.on('load', () => {
      map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      placePlayer();
      generateObstacles();
      generateItems();
      startGameLoop();
    });
  }

  // Tempatkan marker pemain di posisi awal
  function placePlayer() {
    const el = document.createElement('div');
    el.className = 'player-marker';
    playerLngLat = map.getCenter(); // mulai di center Everest
    player = new mapboxgl.Marker(el)
      .setLngLat(playerLngLat)
      .addTo(map);

    // Dapatkan altitude awal
    playerAltitude = getAltitude(playerLngLat);
    updateHUD();
  }

  // Ambil ketinggian (altitude) di koordinat tertentu (dengan sampling DEM)
  function getAltitude(lnglat) {
    const canvas = map.getCanvas();
    const context = canvas.getContext('webgl');
    // Kita bisa menggunakan API terrain-rgb, tapi untuk kesederhanaan:
    // Mapbox GL JS tidak menyediakan API langsung untuk baca DEM di JS, 
    // maka kita ambil approximate dari API Mapbox Terrain-RGB:
    // contoh: https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}@2x.pngraw
    // Karena implementasinya kompleks, kita akan set altitude = 0 sebagai placeholder,
    // dan hanya gunakan zoom-based estimation untuk slope.
    return 0;
  }

  // Hasilkan obstacles (titik‐titik merah) secara acak di area lereng
  function generateObstacles() {
    for (let i = 0; i < OBI_COUNT; i++) {
      const coord = randomPointAround(map.getCenter(), 0.02); 
      const el = document.createElement('div');
      el.className = 'obstacle-marker';
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.backgroundColor = 'red';
      el.style.borderRadius = '50%';
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coord)
        .addTo(map);
      obstacles.push({ coord, marker, active: true });
    }
  }

  // Hasilkan items (titik‐titik biru) secara acak
  function generateItems() {
    for (let i = 0; i < ITEM_COUNT; i++) {
      const coord = randomPointAround(map.getCenter(), 0.02);
      const el = document.createElement('div');
      el.className = 'item-marker';
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.backgroundColor = 'blue';
      el.style.borderRadius = '50%';
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coord)
        .addTo(map);
      items.push({ coord, marker, active: true });
    }
  }

  // Fungsi bantu: generate titik acak di radius (derajat)
  function randomPointAround(center, radius) {
    const lng = center.lng + (Math.random() - 0.5) * radius;
    const lat = center.lat + (Math.random() - 0.5) * radius;
    return [lng, lat];
  }

  // Mulai game loop (sekitar 60fps)
  function startGameLoop() {
    setInterval(() => {
      if (!paused) {
        handleMovement();
        handleCollisions();
        updateHUD();
      }
    }, UPDATE_INTERVAL);
  }

  // Handle Input & Pergerakan pemain
  let move = { left: false, right: false, up: false, down: false };

  function setupControls() {
    // Desktop: panah
    window.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowLeft': move.left = true; break;
        case 'ArrowRight': move.right = true; break;
        case 'ArrowUp': move.up = true; break;
        case 'ArrowDown': move.down = true; break;
        case 'p':
        case 'P':
          togglePause();
          break;
        default: break;
      }
    });
    window.addEventListener('keyup', e => {
      switch (e.key) {
        case 'ArrowLeft': move.left = false; break;
        case 'ArrowRight': move.right = false; break;
        case 'ArrowUp': move.up = false; break;
        case 'ArrowDown': move.down = false; break;
        default: break;
      }
    });
    // Tombol Pause
    document.getElementById('btn-pause').addEventListener('click', () => togglePause());
    // Mobile: touch events
    document.getElementById('btn-left').addEventListener('touchstart', e => { e.preventDefault(); move.left = true; });
    document.getElementById('btn-left').addEventListener('touchend', e => { e.preventDefault(); move.left = false; });
    document.getElementById('btn-right').addEventListener('touchstart', e => { e.preventDefault(); move.right = true; });
    document.getElementById('btn-right').addEventListener('touchend', e => { e.preventDefault(); move.right = false; });
    document.getElementById('btn-up').addEventListener('touchstart', e => { e.preventDefault(); move.up = true; });
    document.getElementById('btn-up').addEventListener('touchend', e => { e.preventDefault(); move.up = false; });
    document.getElementById('btn-down').addEventListener('touchstart', e => { e.preventDefault(); move.down = true; });
    document.getElementById('btn-down').addEventListener('touchend', e => { e.preventDefault(); move.down = false; });
  }

  // Toggle Pause / Resume
  function togglePause() {
    paused = !paused;
    document.getElementById('hud-status').textContent = paused ? 'Status: Paused' : 'Status: Running';
  }

  // Gerakkan pemain sesuai input
  function handleMovement() {
    let changed = false;
    let lng = playerLngLat[0];
    let lat = playerLngLat[1];
    if (move.left) { lng -= MOVE_SPEED; changed = true; }
    if (move.right) { lng += MOVE_SPEED; changed = true; }
    if (move.up) { lat += MOVE_SPEED; changed = true; }
    if (move.down) { lat -= MOVE_SPEED; changed = true; }

    if (changed) {
      const newLngLat = [lng, lat];
      playerLngLat = newLngLat;
      player.setLngLat(newLngLat);
      map.easeTo({ center: newLngLat, duration: 200, easing: t => t });

      // Perbarui jarak tempuh
      distance += MOVE_SPEED * 111000; // konversi derajat ke meter kira‐kira (1° ≈ 111 km)
      // Kurangi stamina
      let slopePenalty = computeSlopePenalty(newLngLat);
      stamina = Math.max(0, stamina - (STAM_DEC + slopePenalty));
    } else {
      // Jika diam, stamina pulih perlahan
      stamina = Math.min(MAX_STAMINA, stamina + STAM_REC);
    }
  }

  // Hitung tambahan penalti stamina berdasarkan kemiringan di sekitar titik
  function computeSlopePenalty(lnglat) {
    // Ambil dua titik kecil di utara/selatan untuk approximasi kemiringan
    const delta = 0.0001;
    const north = [lnglat[0], lnglat[1] + delta];
    const south = [lnglat[0], lnglat[1] - delta];
    // Karena getAltitude() hanya placeholder (0), kita tidak punya DEM raw.
    // Sebagai workaround, kita gunakan zoom‐based estimation:
    // Pada zoom besar (lereng curam), paksa sedikit penalty.
    const zoom = map.getZoom();
    return zoom > 14 ? SLOPE_PENALTY : 0;
  }

  // Periksa tabrakan dengan obstacle dan item
  function handleCollisions() {
    obstacles.forEach(obj => {
      if (obj.active) {
        const d = distanceDeg(playerLngLat, obj.coord);
        if (d < COLLIDE_DIST) {
          obj.active = false;
          obj.marker.remove();
          stamina = Math.max(0, stamina - 15);
        }
      }
    });
    items.forEach(it => {
      if (it.active) {
        const d = distanceDeg(playerLngLat, it.coord);
        if (d < COLLIDE_DIST) {
          it.active = false;
          it.marker.remove();
          stamina = Math.min(MAX_STAMINA, stamina + ITEM_REC);
        }
      }
    });
  }

  // Hitung jarak (dalam derajat) antar dua koordinat [lng,lat]
  function distanceDeg(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Perbarui HUD (Altitude, Stamina, Distance)
  function updateHUD() {
    document.getElementById('hud-altitude').textContent =
      'Altitude: ' + Math.floor(playerAltitude) + ' m';

    document.getElementById('hud-stamina').textContent =
      'Stamina: ' + Math.floor(stamina) + '%';

    document.getElementById('hud-distance').textContent =
      'Distance: ' + Math.floor(distance) + ' m';
  }

  // Tampilkan overlay Game Over
  function showGameOver() {
    document.getElementById('final-height').textContent =
      'Your Height: ' + Math.floor(playerAltitude) + ' m';
    document.getElementById('best-height').textContent =
      'Best Height: ' + best + ' m';
    document.getElementById('overlay-gameover').classList.remove('hidden');
  }

  // Dapatkan titik koordinat acak di radius tertentu
  function randomPointAround(center, radius) {
    const lng = center.lng + (Math.random() - 0.5) * radius;
    const lat = center.lat + (Math.random() - 0.5) * radius;
    return [lng, lat];
  }

  // Generate obstacle (merah) di koordinat acak dekat basecamp
  function generateObstacles() {
    const center = map.getCenter();
    for (let i = 0; i < OBI_COUNT; i++) {
      const coord = randomPointAround(center, 0.02);
      const el = document.createElement('div');
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.backgroundColor = 'red';
      el.style.borderRadius = '50%';
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coord)
        .addTo(map);
      obstacles.push({ coord, marker, active: true });
    }
  }

  // Generate items (biru) di koordinat acak
  function generateItems() {
    const center = map.getCenter();
    for (let i = 0; i < ITEM_COUNT; i++) {
      const coord = randomPointAround(center, 0.02);
      const el = document.createElement('div');
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.backgroundColor = 'blue';
      el.style.borderRadius = '50%';
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coord)
        .addTo(map);
      items.push({ coord, marker, active: true });
    }
  }

  // Mulai game begitu peta muat
  map && map.on('load', () => {
    placePlayer();
    generateObstacles();
    generateItems();
    setupControls();
    startGameLoop();
  });

  // Tempatkan pemain menggunakan marker, dapatkan altitude awal
  function placePlayer() {
    const el = document.createElement('div');
    el.className = 'player-marker';
    playerLngLat = map.getCenter();
    player = new mapboxgl.Marker(el)
      .setLngLat(playerLngLat)
      .addTo(map);
    // Ambil altitude (sambil placeholder = 0)
    playerAltitude = getAltitude(playerLngLat);
    updateHUD();
  }

  // Pendekatan: altitude tetap 0 (untuk contoh ini)
  function getAltitude(lnglat) {
    return 0;
  }

  // Variabel untuk menampung obstacle/item
  let obstacles = [];
  let items = [];

  // Inisialisasi posisi dan update setiap frame
  function startGameLoop() {
    setInterval(() => {
      if (!paused) {
        handleMovement();
        handleCollisions();
        updateHUD();
      }
    }, UPDATE_INTERVAL);
  }
})();