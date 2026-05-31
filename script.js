/* ─── Loading ─── */
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
  if (!loadingScreen.classList.contains('hidden')) startExperience();
}, 6000);
document.body.addEventListener('click', () => {
  if (!loadingScreen.classList.contains('hidden')) loadingVideo.play();
}, { once: true });

/* ─── Background Video Loop ─── */
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

/* ─── Music Player + Globe ─── */
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
    if (audio.readyState >= 2) doPlay();
    else { pendingPlay = true; audio.load(); }
  }

  function pause() {
    audio.pause();
    setPlayingUI(false);
    if (globe) globe.pause();
  }

  audio.addEventListener('canplay', () => {
    if (pendingPlay) { pendingPlay = false; doPlay(); }
  });
  loadTrack(0);

  playBtn.addEventListener('click', () => {
    if (audio.paused) { if (audio.src) play(); }
    else pause();
  });
  prevBtn.addEventListener('click', () => {
    if (audio.currentTime > 2) audio.currentTime = 0;
    else loadTrack((currentTrack - 1 + tracks.length) % tracks.length);
    play();
  });
  nextBtn.addEventListener('click', () => {
    loadTrack((currentTrack + 1) % tracks.length);
    play();
  });
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
  });
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });
  audio.addEventListener('ended', () => {
    loadTrack((currentTrack + 1) % tracks.length);
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
    bumpScale: 0.015, roughness: 0.7, metalness: 0.05
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), earthMat);
  scene.add(earth);
  const cloudMat = new THREE.MeshStandardMaterial({
    map: loader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png'),
    transparent: true, opacity: 0.3
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(0.605, 32, 32), cloudMat);
  scene.add(clouds);
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
  sunLight.position.set(5, 3, 5);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x333333));
  let playing = false;
  function animate() {
    requestAnimationFrame(animate);
    if (playing) { earth.rotation.y += 0.02; clouds.rotation.y += 0.025; }
    renderer.render(scene, camera);
  }
  animate();
  return { resume() { playing = true; }, pause() { playing = false; } };
}

/* ─── Storage Helpers ─── */
function loadJSON(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) || def; }
  catch { return def; }
}
function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

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
function formatDate(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
}

/* ─── Chat Helpers ─── */
function createMessageBubble(text, type, ts, opts) {
  opts = opts || {};
  const div = document.createElement('div');
  div.className = 'chat-msg ' + type;

  if (type === 'other' && opts.sender) {
    const s = document.createElement('span');
    s.className = 'sender';
    s.textContent = opts.sender.substring(0, 10) + '...';
    div.appendChild(s);
  }

  if (opts.isImage) {
    const img = document.createElement('img');
    img.className = 'chat-img';
    img.src = text;
    img.alt = 'Shared image';
    img.addEventListener('click', () => openImageModal(text));
    div.appendChild(img);
    if (opts.caption) {
      const c = document.createElement('span');
      c.textContent = opts.caption;
      div.appendChild(c);
    }
  } else if (opts.isFile) {
    const link = document.createElement('a');
    link.href = text;
    link.target = '_blank';
    link.textContent = opts.fileName || '📎 File';
    link.style.color = '#8ab';
    link.style.textDecoration = 'underline';
    div.appendChild(link);
  } else {
    const t = document.createElement('span');
    t.textContent = text;
    div.appendChild(t);
  }

  const time = document.createElement('span');
  time.className = 'time';
  time.textContent = formatTime(ts);
  div.appendChild(time);

  return div;
}

function openImageModal(src) {
  let modal = document.getElementById('img-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'img-modal';
    modal.addEventListener('click', () => modal.classList.remove('open'));
    document.body.appendChild(modal);
  }
  modal.innerHTML = '<img src="' + src + '" alt="Full image">';
  modal.classList.add('open');
}

/* ─── Chat (Regular User) ─── */
function initChat() {
  const messagesEl = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const emojiBtn = document.getElementById('chat-emoji-btn');
  const emojiPicker = document.getElementById('emoji-picker');
  const emojiGrid = document.getElementById('emoji-grid');
  const fileInput = document.getElementById('file-input');
  const attachBtn = document.getElementById('chat-attach-btn');

  /* Emoji grid */
  const EMOJIS = '😀😃😄😁😅😂🤣😊😇🙂😉😌😍🥰😘😗😋😛😜🤪😝🤑🤗🤭🤫🤔🤐🤨😐😑😶😏😒🙄😬🤥😌😔😪🤤😴😷🤒🤕🤢🤮🤧🥵🥶🥴😵🤯🤠🥳🥸😎🤓🧐😕😟🙁😮😯😲😳🥺😢😭😤😠😡🤬😈👿💀☠💩🤡👹👺👻👽👾🤖💋💌💘💝💖💗💓💞💕💟❣💔❤🧡💛💚💙💜🤎🖤🤍💯💢💥💫💦💨🕳💣💬🗨🗯💭';
  EMOJIS.split('').forEach(e => {
    const span = document.createElement('span');
    span.textContent = e;
    span.addEventListener('click', () => {
      input.focus();
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.substring(0, start) + e + input.value.substring(end);
      input.selectionStart = input.selectionEnd = start + e.length;
      input.dispatchEvent(new Event('input'));
      emojiPicker.classList.remove('open');
    });
    emojiGrid.appendChild(span);
  });

  emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
      emojiPicker.classList.remove('open');
    }
  });

  /* Attach file */
  attachBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert('File too large (max 500KB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const isImage = file.type.startsWith('image/');
      const msg = {
        text: dataUrl,
        type: 'own',
        time: Date.now(),
        isImage: isImage,
        isFile: !isImage,
        fileName: isImage ? null : file.name
      };
      appendChatMessage(msg);
      const history = loadJSON('vibe_chat', []);
      history.push(msg);
      saveJSON('vibe_chat', history);
      if (socket && socket.connected) {
        socket.emit('send_message', {
          senderId: myId,
          text: dataUrl,
          isImage: isImage,
          isFile: !isImage,
          fileName: isImage ? null : file.name
        });
      }
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });

  /* Load history */
  const chatHistory = loadJSON('vibe_chat', []);
  chatHistory.forEach(m => appendChatMessage(m));

  /* Send text */
  function sendMsg() {
    const text = input.value.trim();
    if (!text) return;
    const msg = { text, type: 'own', time: Date.now() };
    appendChatMessage(msg);
    const history = loadJSON('vibe_chat', []);
    history.push(msg);
    saveJSON('vibe_chat', history);
    if (socket && socket.connected) {
      socket.emit('send_message', { senderId: myId, text });
    }
    input.value = '';
    input.focus();
  }
  sendBtn.addEventListener('click', sendMsg);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMsg(); });

  /* Socket.io */
  const SERVER_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://localhost:3000' : 'https://vibe-chat-server.onrender.com';

  if (typeof io !== 'undefined') {
    socket = io(SERVER_URL, { transports: ['websocket', 'polling'], timeout: 5000 });
    const statusEl = document.getElementById('chat-status');
    socket.on('connect', () => {
      socket.emit('register', { userId: myId });
      statusEl.textContent = 'online';
    });
    socket.on('connect_error', () => { statusEl.textContent = 'offline'; });
    socket.on('disconnect', () => { statusEl.textContent = 'offline'; });
    socket.on('receive_message', (data) => {
      if (data.senderId !== myId && data.senderId !== 'me') {
        const msg = {
          text: data.text, type: 'other', time: data.time || Date.now(),
          isImage: data.isImage, isFile: data.isFile, fileName: data.fileName
        };
        appendChatMessage(msg);
        const history = loadJSON('vibe_chat', []);
        history.push(msg);
        saveJSON('vibe_chat', history);
      }
    });
  } else {
    document.getElementById('chat-status').textContent = 'offline';
  }
}

function appendChatMessage(msg) {
  const el = createMessageBubble(msg.text, msg.type, msg.time, msg);
  const container = document.getElementById('chat-messages');
  const empty = container.querySelector('.chat-empty');
  if (empty) empty.remove();
  container.appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

/* ─── Admin Panel ─── */
let adminInitialized = false;
function initAdmin() {
  if (adminInitialized) return;
  adminInitialized = true;
  isAdmin = true;
  const pageAdmin = document.getElementById('page-admin');
  pageAdmin.classList.add('open');
  document.getElementById('page-chat').classList.remove('open');
  if (document.getElementById('nav-chat')) {
    document.getElementById('nav-chat').querySelector('span').textContent = 'Admin';
  }

  const adminMessages = document.getElementById('admin-messages');
  const userListEl = document.getElementById('admin-user-list');
  const adminInput = document.getElementById('admin-input');
  const adminSend = document.getElementById('admin-send');
  const currentUserEl = document.getElementById('admin-current-user');
  const userCountEl = document.getElementById('admin-user-count');

  const adminData = loadJSON('vibe_admin_data', {});
  let selectedUserId = null;

  function renderUserList() {
    userListEl.innerHTML = '';
    const ids = Object.keys(adminData);
    userCountEl.textContent = '(' + ids.length + ')';
    ids.forEach(id => {
      const data = adminData[id];
      const div = document.createElement('div');
      div.className = 'admin-user' + (id === selectedUserId ? ' active' : '');
      div.dataset.userId = id;
      div.innerHTML = '<span class="user-dot"></span>';
      const name = document.createElement('span');
      name.className = 'user-name';
      name.textContent = id.substring(0, 12) + '...';
      div.appendChild(name);
      if (data.unread > 0 && id !== selectedUserId) {
        const badge = document.createElement('span');
        badge.className = 'unread-badge';
        badge.textContent = data.unread;
        div.appendChild(badge);
      }
      div.addEventListener('click', () => selectUser(id));
      userListEl.appendChild(div);
    });
  }

  function selectUser(userId) {
    selectedUserId = userId;
    currentUserEl.textContent = userId.substring(0, 16) + '...';
    userListEl.querySelectorAll('.admin-user').forEach(el => el.classList.toggle('active', el.dataset.userId === userId));

    if (adminData[userId]) adminData[userId].unread = 0;
    saveJSON('vibe_admin_data', adminData);
    renderUserList();

    renderAdminMessages(userId);
  }

  function renderAdminMessages(userId) {
    adminMessages.innerHTML = '';
    const data = adminData[userId];
    if (!data || !data.messages.length) {
      adminMessages.innerHTML = '<div class="chat-empty">No messages with this user</div>';
      return;
    }
    data.messages.forEach(m => {
      const div = document.createElement('div');
      const fromAdmin = m.sender === 'admin';
      div.className = 'admin-msg ' + (fromAdmin ? 'from-admin' : 'from-user');

      if (!fromAdmin) {
        const s = document.createElement('span');
        s.className = 'sender';
        s.textContent = m.sender.substring(0, 10) + '...';
        div.appendChild(s);
      }

      if (m.isImage) {
        const img = document.createElement('img');
        img.className = 'chat-img';
        img.src = m.text;
        img.addEventListener('click', () => openImageModal(m.text));
        div.appendChild(img);
      } else if (m.isFile) {
        const link = document.createElement('a');
        link.href = m.text;
        link.target = '_blank';
        link.textContent = '📎 ' + (m.fileName || 'Download');
        link.style.color = '#8ab';
        link.style.textDecoration = 'underline';
        div.appendChild(link);
      } else {
        const t = document.createElement('span');
        t.textContent = m.text;
        div.appendChild(t);
      }

      const time = document.createElement('span');
      time.className = 'time';
      const label = fromAdmin ? 'You' : m.sender.substring(0, 6);
      time.textContent = label + ' · ' + formatTime(m.time) + ' ' + formatDate(m.time);
      div.appendChild(time);

      adminMessages.appendChild(div);
    });
    adminMessages.scrollTop = adminMessages.scrollHeight;
  }

  function addAdminMessage(userId, sender, text, time, opts) {
    opts = opts || {};
    if (!adminData[userId]) {
      adminData[userId] = { messages: [], unread: 0 };
    }
    const msg = { sender, text, time, isImage: opts.isImage, isFile: opts.isFile, fileName: opts.fileName };
    adminData[userId].messages.push(msg);
    if (sender !== 'admin' && userId !== selectedUserId) {
      adminData[userId].unread = (adminData[userId].unread || 0) + 1;
    }
    saveJSON('vibe_admin_data', adminData);
    if (userId === selectedUserId) {
      renderAdminMessages(userId);
    }
    renderUserList();
  }

  function sendAdminReply() {
    const text = adminInput.value.trim();
    if (!text || !selectedUserId) return;
    addAdminMessage(selectedUserId, 'admin', text, Date.now());
    adminInput.value = '';

    /* Also save to user's chat history so they see it */
    const userMsg = { text, type: 'other', time: Date.now() };
    const chatHistory = loadJSON('vibe_chat', []);
    chatHistory.push(userMsg);
    saveJSON('vibe_chat', chatHistory);

    if (socket && socket.connected) {
      socket.emit('admin_send', { targetId: selectedUserId, text });
    }
  }

  adminSend.addEventListener('click', sendAdminReply);
  adminInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendAdminReply(); });

  /* Socket listeners for admin */
  if (socket) {
    socket.on('receive_message', (data) => {
      if (data.senderId !== myId && data.senderId !== 'admin') {
        addAdminMessage(data.senderId, data.senderId, data.text, data.time || Date.now(), {
          isImage: data.isImage, isFile: data.isFile, fileName: data.fileName
        });
        const users = loadJSON('vibe_known_users', []);
        if (!users.includes(data.senderId)) {
          users.push(data.senderId);
          saveJSON('vibe_known_users', users);
        }
      }
    });
  }

  /* Load existing known users + admin data */
  const knownUsers = loadJSON('vibe_known_users', []);
  knownUsers.forEach(uid => {
    if (!adminData[uid]) {
      adminData[uid] = { messages: [], unread: 0 };
    }
  });

  /* Reconcile vibe_admin_data from old format if needed */
  const oldChats = loadJSON('vibe_admin_chats', null);
  if (Array.isArray(oldChats)) {
    oldChats.forEach(m => {
      addAdminMessage(m.sender, m.sender, m.text, m.time, { isImage: m.isImage, isFile: m.isFile, fileName: m.fileName });
    });
    localStorage.removeItem('vibe_admin_chats');
  }

  saveJSON('vibe_admin_data', adminData);
  renderUserList();

  if (Object.keys(adminData).length) {
    selectUser(Object.keys(adminData)[0]);
  }
}

/* ─── Navigation ─── */
const navHome = document.getElementById('nav-home');
const navChat = document.getElementById('nav-chat');
const pageChat = document.getElementById('page-chat');
const pageAdmin = document.getElementById('page-admin');

function switchPage(page) {
  navHome.classList.toggle('active', page === 'home');
  navChat.classList.toggle('active', page === 'chat');
  pageChat.classList.toggle('open', page === 'chat');
  if (page !== 'admin') {
    pageAdmin.classList.remove('open');
    document.getElementById('nav-chat').querySelector('span').textContent = 'Chat';
  } else {
    pageChat.classList.remove('open');
  }
  document.getElementById('emoji-picker').classList.remove('open');
}

navHome.addEventListener('click', () => switchPage('home'));
navChat.addEventListener('click', () => {
  if (adminInitialized) {
    switchPage('admin');
    pageAdmin.classList.add('open');
    document.getElementById('nav-chat').querySelector('span').textContent = 'Admin';
  } else {
    switchPage('chat');
  }
});

/* ─── 5-Click Admin Activation ─── */
let clickCount = 0;
let lastClick = 0;
document.addEventListener('click', (e) => {
  const pageChatOpen = pageChat.classList.contains('open');
  if (!pageChatOpen && !pageAdmin.classList.contains('open')) return;
  const now = Date.now();
  if (now - lastClick < 500) clickCount++;
  else clickCount = 1;
  lastClick = now;
  if (clickCount === 5) { clickCount = 0; initAdmin(); }
});

/* ─── Init ─── */
initChat();
