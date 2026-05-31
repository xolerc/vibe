const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const loadingVideo = document.getElementById('loading-video');
const bgVideos = document.querySelectorAll('.bg-video');

function startExperience() {
  loadingScreen.classList.add('hidden');
  mainContent.classList.add('visible');
  startBackgroundLoop();
  initMusicPlayer();
}

loadingVideo.addEventListener('ended', startExperience);
loadingVideo.addEventListener('canplay', () => loadingVideo.play());

if (loadingVideo.readyState >= 2) loadingVideo.play();

setTimeout(() => {
  if (!loadingScreen.classList.contains('hidden')) {
    startExperience();
  }
}, 6000);

document.body.addEventListener('click', () => {
  if (!loadingScreen.classList.contains('hidden')) {
    loadingVideo.play();
  }
}, { once: true });

function startBackgroundLoop() {
  let activeIdx = 0;
  const OVERLAP = 1.5;

  bgVideos[0].currentTime = 0;
  bgVideos[0].play();
  bgVideos[0].classList.add('active');
  bgVideos[1].pause();
  bgVideos[1].currentTime = 0;

  bgVideos.forEach((v, i) => {
    v.addEventListener('timeupdate', () => {
      if (i !== activeIdx) return;
      if (v.duration - v.currentTime <= OVERLAP) {
        const next = 1 - activeIdx;
        bgVideos[next].currentTime = 0;
        bgVideos[next].play();
        bgVideos[next].classList.add('active');
        bgVideos[activeIdx].classList.remove('active');
        activeIdx = next;
      }
    });
  });
}

function initMusicPlayer() {
  const tracks = [
    { file: 'track0.mp3', name: 'VOCE NA MIRA', artist: 'Hwungii, DJ VGK1' },
    { file: 'track1.mp3', name: 'NO ERA AMOR', artist: 'DJ Asul' },
    { file: 'track2.mp3', name: 'AURA', artist: 'Ogryzek' }
  ];
  let currentTrack = 0;

  const audio = new Audio();
  audio.preload = 'auto';

  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressFill = document.getElementById('progress-fill');
  const progressBar = document.getElementById('progress-bar');
  const trackName = document.getElementById('track-name');
  const trackArtist = document.getElementById('track-artist');

  let globe;
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');

  function setPlayingUI(on) {
    playIcon.style.display = on ? 'none' : '';
    pauseIcon.style.display = on ? '' : 'none';
  }

  let pendingPlay = false;

  function loadTrack(index) {
    const t = tracks[index];
    audio.src = t.file;
    trackName.textContent = t.name;
    trackArtist.textContent = t.artist;
    progressFill.style.width = '0%';
    currentTrack = index;
  }

  function doPlay() {
    audio.play().then(() => {
      setPlayingUI(true);
      if (globe) globe.resume();
    }).catch(() => {});
  }

  function play() {
    if (audio.readyState >= 2) {
      doPlay();
    } else {
      pendingPlay = true;
      audio.load();
    }
  }

  function pause() {
    audio.pause();
    setPlayingUI(false);
    if (globe) globe.pause();
  }

  audio.addEventListener('canplay', () => {
    if (pendingPlay) {
      pendingPlay = false;
      doPlay();
    }
  });

  loadTrack(0);

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      if (audio.src) play();
    } else {
      pause();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (audio.currentTime > 2) {
      audio.currentTime = 0;
    } else {
      const prev = (currentTrack - 1 + tracks.length) % tracks.length;
      loadTrack(prev);
    }
    play();
  });

  nextBtn.addEventListener('click', () => {
    const next = (currentTrack + 1) % tracks.length;
    loadTrack(next);
    play();
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
  });

  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  audio.addEventListener('ended', () => {
    const next = (currentTrack + 1) % tracks.length;
    loadTrack(next);
    play();
  });

  globe = initGlobe();
}

function initGlobe() {
  const container = document.getElementById('globe-container');
  if (!container) return;

  const w = container.clientWidth || 50;
  const h = container.clientHeight || 50;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.z = 2.2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const loader = new THREE.TextureLoader();

  const earthMat = new THREE.MeshStandardMaterial({
    color: 0x4488cc,
    map: loader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg'),
    bumpMap: loader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg'),
    bumpScale: 0.015,
    roughness: 0.7,
    metalness: 0.05
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), earthMat);
  scene.add(earth);

  const cloudMat = new THREE.MeshStandardMaterial({
    map: loader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png'),
    transparent: true,
    opacity: 0.3
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(0.605, 32, 32), cloudMat);
  scene.add(clouds);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
  sunLight.position.set(5, 3, 5);
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);

  let playing = false;
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    if (playing) {
      earth.rotation.y += 0.02;
      clouds.rotation.y += 0.025;
    }
    renderer.render(scene, camera);
  }

  animate();

  return {
    resume() { playing = true; },
    pause() { playing = false; }
  };
}

function initChat() {
  const chatBtn = document.getElementById('chat-btn');
  const overlay = document.getElementById('chat-overlay');
  const closeBtn = document.getElementById('chat-close');
  const messagesEl = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  chatBtn.addEventListener('click', () => overlay.classList.add('open'));

  function closeChat() {
    overlay.classList.remove('open');
  }

  closeBtn.addEventListener('click', closeChat);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeChat();
  });

  function addMessage(text, type) {
    const el = document.createElement('div');
    el.className = 'chat-msg ' + type;
    const now = new Date();
    const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    el.innerHTML = text + '<span class="time">' + time + '</span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'own');
    input.value = '';
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

initChat();
