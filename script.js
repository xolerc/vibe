/* ─── Firebase ─── */
const FB = 'https://xoleric-9ad1b-default-rtdb.firebaseio.com/vibe';

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

/* ─── Storage ─── */
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

function formatTime(ts) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

/* ─── Chat Bubbles ─── */
function createMessageBubble(text, type, ts, opts) {
  opts = opts || {};
  const div = document.createElement('div');
  div.className = 'chat-msg ' + type;
  if (opts.sender) {
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
  } else if (opts.isFile) {
    const link = document.createElement('a');
    link.href = text; link.target = '_blank';
    link.textContent = opts.fileName || '📎 File';
    link.style.color = '#8ab'; link.style.textDecoration = 'underline';
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

function appendChatMessage(msg) {
  const el = createMessageBubble(msg.text, msg.type, msg.time, msg);
  const container = document.getElementById('chat-messages');
  const empty = container.querySelector('.chat-empty');
  if (empty) empty.remove();
  container.appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

/* ─── Firebase ─── */
let knownIds = new Set(loadJSON('vibe_fb_ids', []));

async function fbSend(msg) {
  try {
    const r = await fetch(FB + '/messages.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    return r.ok;
  } catch { return false; }
}

async function fbFetchAll() {
  try {
    const r = await fetch(FB + '/messages.json');
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

function saveKnownIds() {
  saveJSON('vibe_fb_ids', [...knownIds]);
}

function processFirebaseMessages(data) {
  if (!data) return;
  const newMsgs = [];
  Object.entries(data).forEach(([pushId, msg]) => {
    if (knownIds.has(pushId)) return;
    knownIds.add(pushId);
    newMsgs.push({ pushId, ...msg });
  });
  if (!newMsgs.length) return;
  saveKnownIds();

  if (isAdmin) {
    /* Admin mode: show all messages from all users */
    const container = document.getElementById('chat-messages');
    newMsgs.sort((a, b) => (a.time || 0) - (b.time || 0));
    newMsgs.forEach(msg => {
      if (msg.senderId === 'admin' || msg.senderId === myId) {
        appendChatMessage({ text: msg.text, type: 'own', time: msg.time, isImage: msg.isImage, isFile: msg.isFile, fileName: msg.fileName });
      } else {
        appendChatMessage({ text: msg.text, type: 'other', time: msg.time, sender: msg.senderId, isImage: msg.isImage, isFile: msg.isFile, fileName: msg.fileName });
      }
    });
    /* Also save admin msgs to user's chat for persistence */
    const chatHistory = loadJSON('vibe_chat', []);
    newMsgs.forEach(msg => {
      if (msg.senderId === 'admin') {
        chatHistory.push({ text: msg.text, type: 'other', time: msg.time, isImage: msg.isImage, isFile: msg.isFile, fileName: msg.fileName });
      }
    });
    saveJSON('vibe_chat', chatHistory);
  } else {
    /* User mode: only show admin's replies */
    const chatHistory = loadJSON('vibe_chat', []);
    let changed = false;
    newMsgs.forEach(msg => {
      if (msg.senderId === 'admin') {
        chatHistory.push({ text: msg.text, type: 'other', time: msg.time, isImage: msg.isImage, isFile: msg.isFile, fileName: msg.fileName });
        changed = true;
        if (document.getElementById('page-chat').classList.contains('open')) {
          appendChatMessage({ text: msg.text, type: 'other', time: msg.time, isImage: msg.isImage, isFile: msg.isFile, fileName: msg.fileName });
        }
      }
    });
    if (changed) saveJSON('vibe_chat', chatHistory);
  }
}

/* ─── Polling ─── */
let pollTimer = null;
function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    const data = await fbFetchAll();
    processFirebaseMessages(data);
  }, 2000);
}

/* ─── Chat ─── */
function clearChatDisplay() {
  const container = document.getElementById('chat-messages');
  container.innerHTML = '<div class="chat-empty">No messages yet. Start a conversation!</div>';
}

function loadChatHistory() {
  clearChatDisplay();
  const chatHistory = loadJSON('vibe_chat', []);
  chatHistory.forEach(m => appendChatMessage(m));
}

function initChat() {
  const messagesEl = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const emojiBtn = document.getElementById('chat-emoji-btn');
  const emojiPicker = document.getElementById('emoji-picker');
  const emojiGrid = document.getElementById('emoji-grid');
  const fileInput = document.getElementById('file-input');
  const attachBtn = document.getElementById('chat-attach-btn');
  const statusEl = document.getElementById('chat-status');

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
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const isImage = file.type.startsWith('image/');
      const msg = {
        text: dataUrl, type: 'own', time: Date.now(),
        isImage, isFile: !isImage, fileName: isImage ? null : file.name
      };
      appendChatMessage(msg);
      const sid = isAdmin ? 'admin' : myId;
      fbSend({ senderId: sid, text: dataUrl, time: msg.time, isImage, isFile: !isImage, fileName: msg.fileName });
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });

  /* Load chat history */
  loadChatHistory();

  /* Send text */
  function sendMsg() {
    const text = input.value.trim();
    if (!text) return;
    const sid = isAdmin ? 'admin' : myId;
    const msg = { text, type: 'own', time: Date.now() };
    appendChatMessage(msg);
    fbSend({ senderId: sid, text, time: msg.time });
    input.value = '';
    input.focus();
  }
  sendBtn.addEventListener('click', sendMsg);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMsg(); });

  statusEl.textContent = 'online';
  startPolling();
}

/* ─── Admin mode ─── */
function activateAdmin() {
  if (isAdmin) return;
  isAdmin = true;
  document.getElementById('chat-status').textContent = 'Admin';
  document.getElementById('chat-header').querySelector('span').textContent = 'Chat (Admin)';

  clearChatDisplay();

  /* Load ALL messages from Firebase */
  fbFetchAll().then(data => {
    if (!data) return;
    const all = Object.entries(data)
      .map(([pushId, msg]) => ({ pushId, ...msg }))
      .filter(m => m.senderId)
      .sort((a, b) => (a.time || 0) - (b.time || 0));
    all.forEach(msg => {
      if (msg.senderId === 'admin' || msg.senderId === myId) {
        appendChatMessage({ text: msg.text, type: 'own', time: msg.time, isImage: msg.isImage, isFile: msg.isFile, fileName: msg.fileName });
      } else {
        appendChatMessage({ text: msg.text, type: 'other', time: msg.time, sender: msg.senderId, isImage: msg.isImage, isFile: msg.isFile, fileName: msg.fileName });
      }
    });
    /* Track all IDs */
    Object.keys(data).forEach(id => knownIds.add(id));
    saveKnownIds();
  });
}

/* ─── Navigation ─── */
const navHome = document.getElementById('nav-home');
const navChat = document.getElementById('nav-chat');
const pageChat = document.getElementById('page-chat');

navHome.addEventListener('click', () => {
  navHome.classList.add('active');
  navChat.classList.remove('active');
  pageChat.classList.remove('open');
  document.getElementById('emoji-picker').classList.remove('open');
});

navChat.addEventListener('click', () => {
  navHome.classList.remove('active');
  navChat.classList.add('active');
  pageChat.classList.add('open');
});

/* ─── 5-Click Admin Activation ─── */
let clickCount = 0;
let lastClick = 0;
document.addEventListener('click', (e) => {
  if (!pageChat.classList.contains('open')) return;
  const now = Date.now();
  if (now - lastClick < 500) clickCount++;
  else clickCount = 1;
  lastClick = now;
  if (clickCount === 5) { clickCount = 0; activateAdmin(); }
});

/* ─── Init ─── */
initChat();
