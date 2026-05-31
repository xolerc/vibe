const loadingScreen = document.getElementById('loading-screen');
const pageHome = document.getElementById('page-home');
const loadingVideo = document.getElementById('loading-video');
const bgVideos = document.querySelectorAll('.bg-video');

function startExperience() {
  loadingScreen.classList.add('hidden');
  pageHome.classList.add('visible');
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

  function animate() {
    requestAnimationFrame(animate);
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

function getUserId() {
  let id = localStorage.getItem('vibe_uid');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('vibe_uid', id);
  }
  return id;
}

const myId = getUserId();
let isAdmin = false;
let socket = null;

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

function addAdminMessage(senderId, text, ts) {
  const adminMessages = document.getElementById('admin-messages');
  if (!adminMessages) return;
  const div = document.createElement('div');
  div.className = 'admin-msg';
  div.innerHTML = '<strong>' + senderId.slice(0, 12) + '...</strong> ' + text +
    '<span class="time">' + formatTime(ts) + '</span>';
  adminMessages.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

const navHome = document.getElementById('nav-home');
const navChat = document.getElementById('nav-chat');
const pageChat = document.getElementById('page-chat');
const pageAdmin = document.getElementById('page-admin');

function switchPage(page) {
  navHome.classList.toggle('active', page === 'home');
  navChat.classList.toggle('active', page === 'chat');
  pageChat.classList.toggle('open', page === 'chat');
  pageAdmin.classList.remove('open');
}

function saveMessages(key, messages) {
  localStorage.setItem(key, JSON.stringify(messages));
}

function loadMessages(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch { return []; }
}

function initChat() {
  const messagesEl = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  const chatHistory = loadMessages('vibe_chat');
  chatHistory.forEach(m => addChatMessage(m.text, m.type, m.time));

  function sendMsg() {
    const text = input.value.trim();
    if (!text) return;

    const msg = { text, type: 'own', time: Date.now() };
    addChatMessage(text, 'own', Date.now());

    const history = loadMessages('vibe_chat');
    history.push(msg);
    saveMessages('vibe_chat', history);

    if (socket && socket.connected) {
      socket.emit('send_message', { senderId: myId, text });
    }

    input.value = '';
  }

  sendBtn.addEventListener('click', sendMsg);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMsg();
  });

  const SERVER_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://vibe-chat-server.onrender.com';

  if (typeof io !== 'undefined') {
    socket = io(SERVER_URL, { transports: ['websocket', 'polling'], timeout: 5000 });

    socket.on('connect', () => {
      socket.emit('register', { userId: myId });
      document.getElementById('chat-status').textContent = 'online';
    });

    socket.on('connect_error', () => {
      document.getElementById('chat-status').textContent = 'offline';
    });

    socket.on('disconnect', () => {
      document.getElementById('chat-status').textContent = 'offline';
    });

    socket.on('receive_message', (data) => {
      if (data.senderId !== 'me') {
        const msg = { text: data.text, type: 'other', time: data.time };
        addChatMessage(data.text, 'other', data.time);
        const history = loadMessages('vibe_chat');
        history.push(msg);
        saveMessages('vibe_chat', history);
      }
    });
  } else {
    document.getElementById('chat-status').textContent = 'offline';
  }
}

function initAdmin() {
  isAdmin = true;
  pageAdmin.classList.add('open');
  pageChat.classList.remove('open');
  if (navChat) navChat.textContent = 'Admin';

  const adminMessages = document.getElementById('admin-messages');
  const userList = document.getElementById('admin-user-list');
  const adminInput = document.getElementById('admin-input');
  const adminSend = document.getElementById('admin-send');
  const replyTo = document.getElementById('admin-reply-to');

  const saved = loadMessages('vibe_admin_chats');
  saved.forEach(m => addAdminMessage(m.sender, m.text, m.time));

  let selectedUser = null;

  const users = loadMessages('vibe_known_users');
  users.forEach(u => {
    if (u === 'xoleric2003') return;
    const div = document.createElement('div');
    div.className = 'admin-user';
    div.innerHTML = '<span class="user-dot"></span>' + u.slice(0, 12) + '...';
    div.addEventListener('click', () => {
      selectedUser = u;
      document.querySelectorAll('.admin-user').forEach(el => el.classList.remove('active'));
      div.classList.add('active');
      replyTo.style.display = 'block';
      replyTo.textContent = 'To: ' + u.slice(0, 12) + '...';
    });
    userList.appendChild(div);
  });

  function saveAdminMsg(sender, text, time) {
    const msgs = loadMessages('vibe_admin_chats');
    msgs.push({ sender, text, time });
    saveMessages('vibe_admin_chats', msgs);
  }

  function sendAdminMsg() {
    const text = adminInput.value.trim();
    if (!text || !selectedUser) return;
    addAdminMessage(selectedUser, text + ' (you)', Date.now());
    saveAdminMsg(selectedUser, text + ' (you)', Date.now());
    localStorage.setItem('vibe_last_reply_' + selectedUser, text);
    if (socket && socket.connected) {
      socket.emit('admin_send', { targetId: selectedUser, text });
    }
    adminInput.value = '';
  }

  adminSend.addEventListener('click', sendAdminMsg);
  adminInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendAdminMsg();
  });

  if (socket) {
    socket.on('receive_message', (data) => {
      addAdminMessage(data.senderId, data.text, data.time);
      saveAdminMsg(data.senderId, data.text, data.time);
      const users = loadMessages('vibe_known_users');
      if (!users.includes(data.senderId)) {
        users.push(data.senderId);
        saveMessages('vibe_known_users', users);
      }
    });
  }
}

let clickCount = 0;
let lastClick = 0;

document.addEventListener('click', (e) => {
  const pageChatOpen = pageChat.classList.contains('open');
  if (!pageChatOpen && !pageAdmin.classList.contains('open')) return;

  const now = Date.now();
  if (now - lastClick < 500) {
    clickCount++;
  } else {
    clickCount = 1;
  }
  lastClick = now;
  if (clickCount === 5) {
    clickCount = 0;
    initAdmin();
  }
});

navHome.addEventListener('click', () => switchPage('home'));
navChat.addEventListener('click', () => switchPage('chat'));

initChat();
