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

const SERVER_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:3000'
  : 'https://vibe-chat-server.onrender.com';

function getUserId() {
  let id = localStorage.getItem('vibe_uid');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('vibe_uid', id);
  }
  return id;
}

const myId = getUserId();
let isAdmin = (myId === 'xoleric2003');
let socket = null;

function connectSocket() {
  socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

  socket.on('connect', () => {
    socket.emit('register', { userId: myId });
    setChatStatus('connected');
    if (isAdmin) initAdmin();
  });

  socket.on('connect_error', () => setChatStatus('offline'));
  socket.on('disconnect', () => setChatStatus('offline'));

  socket.on('receive_message', (data) => {
    if (isAdmin) {
      addAdminMessage(data.senderId, data.text, data.time);
      highlightUser(data.senderId);
    } else {
      const type = data.senderId === 'me' ? 'own' : 'other';
      addChatMessage(data.text, type, data.time);
    }
  });

  socket.on('admin_users', (users) => {
    renderUserList(users);
  });

  socket.on('user_count', (count) => {
    const el = document.getElementById('chat-status');
    if (el) el.textContent = count + ' online';
  });
}

function setChatStatus(s) {
  const el = document.getElementById('chat-status');
  if (el) el.textContent = s === 'connected' ? 'online' : s;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

function addChatMessage(text, type, ts) {
  const el = document.createElement('div');
  el.className = 'chat-msg ' + type;
  el.innerHTML = text + '<span class="time">' + (ts ? formatTime(ts) : formatTime(Date.now())) + '</span>';
  document.getElementById('chat-messages').appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function initChat() {
  const chatBtn = document.getElementById('chat-btn');
  const overlay = document.getElementById('chat-overlay');
  const closeBtn = document.getElementById('chat-close');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  chatBtn.addEventListener('click', () => overlay.classList.add('open'));
  closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  function sendMsg() {
    const text = input.value.trim();
    if (!text || !socket) return;
    socket.emit('send_message', { senderId: myId, text });
    input.value = '';
  }

  sendBtn.addEventListener('click', sendMsg);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMsg();
  });

  connectSocket();
}

let clickCount = 0;
let lastClick = 0;

document.addEventListener('click', (e) => {
  const now = Date.now();
  if (now - lastClick < 500) {
    clickCount++;
  } else {
    clickCount = 1;
  }
  lastClick = now;
  if (clickCount === 5) {
    clickCount = 0;
    activateAdmin();
  }
});

function activateAdmin() {
  localStorage.setItem('vibe_uid', 'xoleric2003');
  window.location.reload();
}

function initAdmin() {
  document.getElementById('admin-panel').style.display = 'flex';

  const chatBtn = document.getElementById('chat-btn');
  const adminPanel = document.getElementById('admin-panel');
  const closeBtn = document.getElementById('admin-close');
  const userList = document.getElementById('admin-user-list');
  const adminMessages = document.getElementById('admin-messages');
  const adminInput = document.getElementById('admin-input');
  const adminSend = document.getElementById('admin-send');
  const replyTo = document.getElementById('admin-reply-to');

  let selectedUser = null;

  chatBtn.addEventListener('click', () => {
    adminPanel.style.display = adminPanel.style.display === 'none' ? 'flex' : 'none';
  });

  closeBtn.addEventListener('click', () => {
    adminPanel.style.display = 'none';
  });

  window.renderUserList = function(users) {
    userList.innerHTML = '';
    users.forEach(u => {
      if (u.id === 'xoleric2003') return;
      const div = document.createElement('div');
      div.className = 'admin-user';
      div.innerHTML = '<span class="user-dot"></span>' + u.id.slice(0, 16) + '...';
      div.addEventListener('click', () => {
        selectedUser = u.id;
        document.querySelectorAll('.admin-user').forEach(el => el.classList.remove('active'));
        div.classList.add('active');
        replyTo.style.display = 'block';
        replyTo.textContent = 'Reply to: ' + u.id.slice(0, 16) + '...';
      });
      userList.appendChild(div);
    });
  };

  window.addAdminMessage = function(senderId, text, ts) {
    const div = document.createElement('div');
    div.className = 'admin-msg';
    div.innerHTML = '<strong>' + senderId.slice(0, 16) + '...</strong> ' + text +
      '<span class="time">' + formatTime(ts) + '</span>';
    adminMessages.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  window.highlightUser = function(senderId) {
    document.querySelectorAll('.admin-user').forEach(el => {
      if (el.textContent.includes(senderId.slice(0, 16))) {
        el.style.borderLeft = '2px solid #4488cc';
      }
    });
  };

  function sendAdminMsg() {
    const text = adminInput.value.trim();
    if (!text || !selectedUser || !socket) return;
    socket.emit('admin_send', { targetId: selectedUser, text });
    addAdminMessage(selectedUser, text + ' (you)', Date.now());
    adminInput.value = '';
  }

  adminSend.addEventListener('click', sendAdminMsg);
  adminInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendAdminMsg();
  });
}

initChat();
