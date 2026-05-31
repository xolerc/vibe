const FB = 'https://xoleric-9ad1b-default-rtdb.firebaseio.com/vibe';
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
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressFill = document.getElementById('progress-fill');
  const progressBar = document.getElementById('progress-bar');
  const trackName = document.getElementById('track-name');
  const trackArtist = document.getElementById('track-artist');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const videoWrap = document.getElementById('yt-video-wrap');
  let globe;

  const V_PATH = 'https://xolerc.github.io/me/videos';
  const tracks = [
    { file: '2_5287781263149656497.mp3', video: V_PATH + '/2_5287781263149656497.mp4', name: 'Track 1', artist: 'XOLERIC' },
    { file: '2_5373350012551988338.mp3', video: V_PATH + '/2_5373350012551988338.mp4', name: 'Track 2', artist: 'XOLERIC' },
    { file: '2_5211184992486459614.mp3', video: V_PATH + '/2_5211184992486459614.mp4', name: 'Track 3', artist: 'XOLERIC' },
    { file: '2_5282749129141818157.mp3', video: V_PATH + '/2_5282749129141818157.mp4', name: 'Track 4', artist: 'XOLERIC' },
    { file: '2_5447322629427989855.mp3', video: V_PATH + '/2_5447322629427989855.mp4', name: 'Track 5', artist: 'XOLERIC' },
    { file: '2_5452074624193953955.mp3', video: V_PATH + '/2_5452074624193953955.mp4', name: 'Track 6', artist: 'XOLERIC' },
    { file: '2_5462948497839910298.mp3', video: V_PATH + '/2_5462948497839910298.mp4', name: 'Track 7', artist: 'XOLERIC' },
    { file: '2_5237973231792597901.mp3', video: V_PATH + '/2_5237973231792597901.mp4', name: 'Track 8', artist: 'XOLERIC' },
    { file: '2_5458751034891467046.mp3', video: V_PATH + '/2_5458751034891467046.mp4', name: 'Track 9', artist: 'XOLERIC' },
    { file: '2_5235775282278869717.mp3', video: V_PATH + '/2_5235775282278869717.mp4', name: 'Track 10', artist: 'XOLERIC' },
    { file: '2_5458751034891467056.mp3', video: V_PATH + '/2_5458751034891467056.mp4', name: 'Track 11', artist: 'XOLERIC' },
    { file: '2_5458622658318987050.mp3', video: V_PATH + '/2_5458622658318987050.mp4', name: 'Track 12', artist: 'XOLERIC' },
    { file: 'track0.mp3', name: 'VOCE NA MIRA', artist: 'Hwungii, DJ VGK1' },
    { file: 'track1.mp3', name: 'NO ERA AMOR', artist: 'DJ Asul' },
    { file: 'track2.mp3', name: 'AURA', artist: 'Ogryzek' }
  ];

  let currentTrack = 0;
  const audio = new Audio();
  audio.preload = 'auto';
  let isPlaying = false;

  const mv = document.createElement('video');
  mv.muted = true;
  mv.loop = true;
  mv.playsInline = true;
  mv.preload = 'auto';
  mv.style.cssText = 'width:100%;height:100%;display:block;object-fit:cover';
  videoWrap.innerHTML = '';
  videoWrap.appendChild(mv);

  function preloadVideo(url) {
    if (!url) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'video';
    document.head.appendChild(link);
    setTimeout(() => link.remove(), 5000);
  }

  function setUI(on) {
    playIcon.style.display = on ? 'none' : '';
    pauseIcon.style.display = on ? '' : 'none';
    isPlaying = on;
  }

  function loadTrack(index) {
    const t = tracks[index];
    currentTrack = index;
    trackName.textContent = t.name;
    trackArtist.textContent = t.artist;
    progressFill.style.width = '0%';
    audio.src = t.file;

    if (t.video) {
      mv.src = t.video;
      mv.currentTime = 0;
      mv.load();
      mv.style.display = '';
    } else {
      mv.removeAttribute('src');
      mv.load();
      mv.style.display = 'none';
    }

    const nextT = tracks[(index + 1) % tracks.length];
    preloadVideo(nextT.video);

    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }

  function doPlay() {
    if (!audio.src) { loadTrack(currentTrack); return; }
    audio.play().then(() => {
      setUI(true);
      if (globe) globe.resume();
      if (tracks[currentTrack].video) {
        const tryPlay = () => mv.play().catch(() => setTimeout(tryPlay, 300));
        tryPlay();
      }
    }).catch(() => {});
  }

  function pause() {
    audio.pause();
    setUI(false);
    mv.pause();
    if (globe) globe.pause();
  }

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
      if (tracks[currentTrack].video && mv.duration && mv.readyState > 0) {
        const diff = Math.abs(audio.currentTime - mv.currentTime);
        if (diff > 0.5) mv.currentTime = audio.currentTime;
      }
    }
  });
  audio.addEventListener('ended', () => {
    loadTrack((currentTrack + 1) % tracks.length);
    doPlay();
  });
  mv.addEventListener('canplay', () => {
    if (isPlaying && mv.src) mv.play().catch(() => {});
  });

  playBtn.addEventListener('click', () => {
    if (audio.paused) doPlay();
    else pause();
  });
  prevBtn.addEventListener('click', () => {
    if (audio.currentTime > 2) { audio.currentTime = 0; if (tracks[currentTrack].video) mv.currentTime = 0; }
    else loadTrack((currentTrack - 1 + tracks.length) % tracks.length);
    doPlay();
  });
  nextBtn.addEventListener('click', () => {
    loadTrack((currentTrack + 1) % tracks.length);
    doPlay();
  });
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
    if (tracks[currentTrack].video && mv.duration) mv.currentTime = pct * mv.duration;
  });

  loadTrack(0);
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

const EMOJIS = '😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🥰😍🤩😘😗😚😋😛😜🤪😝🤑🤗🤭🤫🤔🤐🤨😐😑😶😏😒🙄😬🤥😌😔😪🤤😴😷🤒🤕🤢🤮🤧🥵🥶🥴😵🤯🤠🥳🥸😎🤓🧐😕😟🙁😮😯😲😳🥺😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬👋🤚🖐✋🖖👌🤌🤏✌️🤞🤟🤘🤙👈👉👆🖕👇☝️👍👎✊👊🤛🤜👏🙌👐🤲🤝🙏✍️💅🤳💪🦾🦵🦿🦶👂🦻👃🧠🫀🫁🦷🦴👀👁👅👄👶👧🧒👦👩🧑👨👩‍🦱🧑‍🦱👨‍🦱👩‍🦰🧑‍🦰👨‍🦰👱‍♀️👱👱‍♂️👩‍🦳🧑‍🦳👨‍🦳👩‍🦲🧑‍🦲👨‍🦲🧔‍♀️🧔🧔‍♂️👵🧓👴👲👳‍♀️👳👳‍♂️🧕👮‍♀️👮👮‍♂️👷‍♀️👷👷‍♂️💂‍♀️💂💂‍♂️🕵️‍♀️🕵️🕵️‍♂️👩‍⚕️🧑‍⚕️👨‍⚕️👩‍🌾🧑‍🌾👨‍🌾👩‍🍳🧑‍🍳👨‍🍳👩‍🎓🧑‍🎓👨‍🎓👩‍🎤🧑‍🎤👨‍🎤👩‍🏫🧑‍🏫👨‍🏫👩‍🏭🧑‍🏭👨‍🏭👩‍💻🧑‍💻👨‍💻👩‍💼🧑‍💼👨‍💼👩‍🔧🧑‍🔧👨‍🔧👩‍🔬🧑‍🔬👨‍🔬👩‍🎨🧑‍🎨👨‍🎨👩‍🚒🧑‍🚒👨‍🚒👩‍✈️🧑‍✈️👨‍✈️👩‍🚀🧑‍🚀👨‍🚀👩‍⚖️🧑‍⚖️👨‍⚖️👰‍♀️👰👰‍♂️🤵‍♀️🤵🤵‍♂️👸🤴🦸‍♀️🦸🦸‍♂️🦹‍♀️🦹🦹‍♂️🤶🧑‍🎄🎅🧙‍♀️🧙🧙‍♂️🧝‍♀️🧝🧝‍♂️🧛‍♀️🧛🧛‍♂️🧟‍♀️🧟🧟‍♂️🧞‍♀️🧞🧞‍♂️🧜‍♀️🧜🧜‍♂️🧚‍♀️🧚🧚‍♂️👼🤰🤱👩‍🍼🧑‍🍼👨‍🍼🙇‍♀️🙇🙇‍♂️💁‍♀️💁💁‍♂️🙅‍♀️🙅🙅‍♂️🙆‍♀️🙆🙆‍♂️🙋‍♀️🙋🙋‍♂️🧏‍♀️🧏🧏‍♂️🤦‍♀️🤦🤦‍♂️🤷‍♀️🤷🤷‍♂️🙎‍♀️🙎🙎‍♂️🙍‍♀️🙍🙍‍♂️💇‍♀️💇💇‍♂️💆‍♀️💆💆‍♂️🧖‍♀️🧖🧖‍♂️💃🕺👯‍♀️👯👯‍♂️🧑‍🤝‍🧑👭👫👬💏👩‍❤️‍💋‍👨👨‍❤️‍💋‍👨👩‍❤️‍💋‍👩💑👩‍❤️‍👨👨‍❤️‍👨👩‍❤️‍👩👪👨‍👩‍👦👨‍👩‍👧👨‍👩‍👧‍👦👨‍👩‍👦‍👦👨‍👩‍👧‍👧👨‍👨‍👦👨‍👨‍👧👨‍👨‍👧‍👦👨‍👨‍👦‍👦👨‍👨‍👧‍👧👩‍👩‍👦👩‍👩‍👧👩‍👩‍👧‍👦👩‍👩‍👦‍👦👩‍👩‍👧‍👧👨‍👦👨‍👦‍👦👨‍👧👨‍👧‍👦👨‍👧‍👧👩‍👦👩‍👦‍👦👩‍👧👩‍👧‍👦👩‍👧‍👧🐶🐱🐭🐹🐰🦊🐻🐼🐻‍❄️🐨🐯🦁🐮🐷🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🪱🐛🦋🐌🐞🐜🪰🪲🪳🦟🦗🕷🕸🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🦧🦣🐘🦛🦏🐪🐫🦒🦘🦬🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐕‍🦺🐈🐈‍⬛🪶🐓🦃🦤🦚🦜🦢🦩🕊🐇🦝🦨🦡🦫🦦🦥🐁🐀🐿🦔🐾🐉🐲💐🌸💮🏵🌹🥀🌺🌻🌼🌷🌱🪴🌲🌳🌴🌵🌾🌿☘️🍀🍁🍂🍃🍇🍈🍉🍊🍋🍌🍍🥭🍎🍏🍐🍑🍒🍓🫐🥝🍅🫒🥥🥑🍆🥔🥕🌽🌶🫑🥒🥬🥦🧄🧅🍄🥜🫘🌰🍞🥐🥖🫓🥨🥯🥞🧇🧀🍖🍗🥩🥓🍔🍟🍕🌭🥪🌮🌯🫔🥙🧆🥚🍳🥘🍲🫕🥣🥗🍿🧈🧂🥫🍱🍘🍙🍚🍛🍜🍝🍠🍢🍣🍤🍥🥮🍡🥟🥠🥡🍦🍧🍨🍩🍪🎂🍰🧁🥧🍫🍬🍭🍮🍯🍼🥛☕️🫖🍵🍶🍾🍷🍸🍹🍺🍻🥂🥃🫗🥤🧋🧃🧉⚽️🏀🏈⚾️🥎🎾🏐🏉🥏🎱🪀🏓🏸🏒🏑🥍🏏🪃🥅⛳️🪁🏹🎣🤿🥊🥋🎽🛹🛼🛷⛸🥌🎿⛷🏂🪂🏋️‍♀️🏋️🏋️‍♂️🤼‍♀️🤼🤼‍♂️🤸‍♀️🤸🤸‍♂️⛹️‍♀️⛹️⛹️‍♂️🤾‍♀️🤾🤾‍♂️🏌️‍♀️🏌️🏌️‍♂️🏄‍♀️🏄🏄‍♂️🏊‍♀️🏊🏊‍♂️🤽‍♀️🤽🤽‍♂️🚣‍♀️🚣🚣‍♂️🧗‍♀️🧗🧗‍♂️🚵‍♀️🚵🚵‍♂️🚴‍♀️🚴🚴‍♂️🎖🏆🥇🥈🥉🏅🎮🕹🎰🎲🎯🎳🎭🎨🎬🎤🎧🎼🎹🥁🪘🎷🎺🎸🪕🎻🎉🎊🎃🎄🎆🎇🧨✨🎈🎁🎀🎗🎟🎫🎪🎠🎡🎢🚗🚕🚙🚌🚎🏎🚓🚑🚒🚐🛻🚚🚛🚜🏍🛵🛺🚲🛴🛹🛼🚏🛣🛤🚂🚆🚇🚊🚉🚝🚞🚋🚃🚄🚅🚈🚔🚍🚘🚖🚢🛳🛥🚤⛴⛵️🛶🚟🚠🚡🛸🚁🛩✈️🛫🛬🪂💺🚀🛰🗺🌍🌎🌏🏔⛰🌋🗻🏕🏖🏜🏝🏞🏟🏛🏗🧱🏘🏚🏠🏡🏢🏣🏤🏥🏦🏨🏩🏪🏫🏬🏭🏯🏰💒🗼🗽⛪️🕌🛕🕍⛩🕋⛲️⛱🏙🌃🌄🌅🌆🌇🌉⌚️📱💻⌨️🖥🖨🖱🖲🕹🗜💽💾💿📀📼📷📸📹🎥📽🎞📞☎️📟📠📺📻🎙🎚🎛🧭⏱️⏲️⏰🕰⌛️📡🔋🪫🔌💡🔦🕯🪔🧯🛢💸💵💴💶💷💰🪙💳💎⚖️🪜🔧🔨⚒️🛠⛏️🔩⚙️🪤🧱⛓️🧲🔫💣🧨🪓🔪🗡⚔️🛡🚬⚰️🪦⚱️🏺🔮📿🧿🪬💈⚗️🔭🔬🕳🩻🩹🩺💊💉🩸🧬🦠🧫🧪🌡🧹🧺🧻🚽🚰🚿🛁🛀🧼🪥🪒🧽🪣🧴🛎🔑🗝🚪🪑🛋🛏🛌🧸🪆🖼🪞🪟🛍🛒🎁🎈🎏🎀🪄🪅🎊🎉🎎🎐🎍🎋🎃❤️🧡💛💚💙💜🖤🤍🤎💔❣️💕💞💓💗💖💘💝💟☮️✝️☪️🕉☸️✡️🔯🕎☯️☦️🛐⚛️♈️♉️♊️♋️♌️♍️♎️♏️♐️♑️♒️♓️⛎🔀🔁🔂▶️⏩⏭️⏯️◀️⏪⏮️🔼⏫🔽⏬⏸️⏹️⏺️⏏️🎦🔅🔆📶📳📴♀♂⚧️✖️➕➖➗♾️‼️⁉️❓❔❕❗️〰️💱💲⚕♻️🔱📛🔰⭕️✅☑️✔️❌❎➰➿〽️✳️✴️❇️©®™#️⃣*️⃣0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟🔤🔡🔠🔣🅰️🆎🅱️🆑🆒🆓ℹ️🆔Ⓜ️🆕🆖🅾️🆗🅿️🆘🆙🆚🈁🈂️🈷️🈶🈯️🉐🈹🈲🈸🈺🉑㊙️㊗️🈴🈵🈚️🚮🚯♿️🚻🚾🛂🛃🛄🛅⚠️🚸⛔️🚫🚳🚭🚯🚱🚷📵🔞☢️☣️⬆️↗️➡️↘️⬇️↙️⬅️↖️↕️↔️↩️↪️⤴️⤵️🔃🔄🔙🔚🔛🔜🔝';

function formatTime(ts) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

function makeBubble(text, type, ts, opts) {
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
    img.className = 'chat-img'; img.src = text;
    img.addEventListener('click', () => openModal(text));
    div.appendChild(img);
  } else if (opts.isFile) {
    const a = document.createElement('a');
    a.href = text; a.target = '_blank';
    a.textContent = opts.fileName || '📎 File';
    a.style.color = '#8ab'; a.style.textDecoration = 'underline';
    div.appendChild(a);
  } else {
    const t = document.createElement('span');
    t.textContent = text;
    div.appendChild(t);
  }
  const time = document.createElement('span');
  time.className = 'time'; time.textContent = formatTime(ts);
  div.appendChild(time);
  return div;
}

function openModal(src) {
  let m = document.getElementById('img-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'img-modal';
    m.addEventListener('click', () => m.classList.remove('open'));
    document.body.appendChild(m);
  }
  m.innerHTML = '<img src="' + src + '" alt="">';
  m.classList.add('open');
}

function appendMsg(container, msg) {
  const el = makeBubble(msg.text, msg.type, msg.time, msg);
  const empty = container.querySelector('.chat-empty');
  if (empty) empty.remove();
  container.appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

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

/* ─── Polling ─── */
let pollTimer = null;
function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    const data = await fbFetchAll();
    processNewMessages(data);
  }, 2000);
}

function processNewMessages(data) {
  if (!data) return;
  const newMsgs = [];
  Object.entries(data).forEach(([pushId, msg]) => {
    if (knownIds.has(pushId)) return;
    knownIds.add(pushId);
    newMsgs.push({ pushId, ...msg });
  });
  if (!newMsgs.length) return;
  saveJSON('vibe_fb_ids', [...knownIds]);

  /* User chat: only admin replies */
  const userHist = loadJSON('vibe_chat', []);
  let userChanged = false;

  /* Admin data: all user messages */
  const admData = loadJSON('vibe_admin_data', {});
  let admChanged = false;

  newMsgs.forEach(m => {
    /* user chat */
    if (m.senderId === 'admin') {
      userHist.push({ text: m.text, type: 'other', time: m.time, isImage: m.isImage, isFile: m.isFile, fileName: m.fileName });
      userChanged = true;
      if (document.getElementById('page-chat').classList.contains('open')) {
        appendMsg(document.getElementById('chat-messages'), { text: m.text, type: 'other', time: m.time, isImage: m.isImage, isFile: m.isFile, fileName: m.fileName });
      }
    }

    /* admin data */
    if (m.senderId && m.senderId !== 'admin') {
      if (!admData[m.senderId]) admData[m.senderId] = { messages: [], unread: 0 };
      admData[m.senderId].messages.push({
        sender: m.senderId, text: m.text, time: m.time,
        isImage: m.isImage, isFile: m.isFile, fileName: m.fileName
      });
      admData[m.senderId].unread = (admData[m.senderId].unread || 0) + 1;
      admChanged = true;
    }
  });

  if (userChanged) saveJSON('vibe_chat', userHist);
  if (admChanged) saveJSON('vibe_admin_data', admData);

  /* Update admin UI if open */
  if (admChanged && pageAdmin.classList.contains('open')) {
    renderUserList();
    if (selectedAdmUser && admData[selectedAdmUser]) {
      renderAdmMessages(selectedAdmUser);
    }
  }
}

/* ─── Regular Chat ─── */
function initChat() {
  const container = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const emojiBtn = document.getElementById('chat-emoji-btn');
  const emojiPick = document.getElementById('emoji-picker');
  const emojiGrid = document.getElementById('emoji-grid');
  const fileInput = document.getElementById('file-input');
  const attachBtn = document.getElementById('chat-attach-btn');

  Array.from(EMOJIS).forEach(e => {
    const s = document.createElement('span');
    s.textContent = e;
    s.addEventListener('click', () => {
      input.focus();
      const st = input.selectionStart, en = input.selectionEnd;
      input.value = input.value.substring(0, st) + e + input.value.substring(en);
      input.selectionStart = input.selectionEnd = st + e.length;
      input.dispatchEvent(new Event('input'));
      emojiPick.classList.remove('open');
    });
    emojiGrid.appendChild(s);
  });
  emojiBtn.addEventListener('click', e => { e.stopPropagation(); emojiPick.classList.toggle('open'); });
  document.addEventListener('click', e => {
    if (!emojiPick.contains(e.target) && e.target !== emojiBtn) emojiPick.classList.remove('open');
  });

  attachBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 500*1024) { alert('File too large (max 500KB)'); return; }
    const r = new FileReader();
    r.onload = ev => {
      const isImg = f.type.startsWith('image/');
      const sid = isAdmin ? 'admin' : myId;
      const msg = { text: ev.target.result, type: 'own', time: Date.now(), isImage: isImg, isFile: !isImg, fileName: isImg ? null : f.name };
      appendMsg(container, msg);
      fbSend({ senderId: sid, text: ev.target.result, time: msg.time, isImage: isImg, isFile: !isImg, fileName: msg.fileName });
    };
    r.readAsDataURL(f);
    fileInput.value = '';
  });

  loadJSON('vibe_chat', []).forEach(m => appendMsg(container, m));

  function send() {
    const t = input.value.trim();
    if (!t) return;
    const sid = isAdmin ? 'admin' : myId;
    const msg = { text: t, type: 'own', time: Date.now() };
    appendMsg(container, msg);
    fbSend({ senderId: sid, text: t, time: msg.time });
    input.value = '';
    input.focus();
  }
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  document.getElementById('chat-status').textContent = 'online';
  startPolling();
}

/* ─── Admin Page ─── */
const pageAdmin = document.getElementById('page-admin');
let selectedAdmUser = null;

function renderUserList() {
  const list = document.getElementById('admin-user-list');
  const count = document.getElementById('admin-user-count');
  const admData = loadJSON('vibe_admin_data', {});
  list.innerHTML = '';
  const ids = Object.keys(admData);
  count.textContent = '(' + ids.length + ')';
  ids.forEach(id => {
    const d = admData[id];
    const div = document.createElement('div');
    div.className = 'admin-user-item';
    div.innerHTML = '<span class="u-name">' + id.substring(0, 12) + '...</span>';
    if (d.unread > 0) {
      div.innerHTML += '<span class="u-badge">' + d.unread + '</span>';
    }
    div.addEventListener('click', () => openAdmChat(id));
    list.appendChild(div);
  });
}

function openAdmChat(userId) {
  selectedAdmUser = userId;
  document.getElementById('admin-chat-view').classList.add('open');
  document.getElementById('admin-user-view').style.display = 'none';
  document.getElementById('admin-chat-title').textContent = userId.substring(0, 16) + '...';

  /* Clear unread */
  const admData = loadJSON('vibe_admin_data', {});
  if (admData[userId]) {
    admData[userId].unread = 0;
    saveJSON('vibe_admin_data', admData);
  }
  renderAdmMessages(userId);
  renderUserList();
}

function renderAdmMessages(userId) {
  const cont = document.getElementById('admin-chat-msgs');
  cont.innerHTML = '';
  const admData = loadJSON('vibe_admin_data', {});
  const d = admData[userId];
  if (!d || !d.messages.length) {
    cont.innerHTML = '<div class="chat-empty">No messages</div>';
    return;
  }
  d.messages.forEach(m => {
    const fromAdmin = m.sender === 'admin';
    appendMsg(cont, {
      text: m.text, type: fromAdmin ? 'own' : 'other',
      time: m.time, sender: fromAdmin ? null : m.sender,
      isImage: m.isImage, isFile: m.isFile, fileName: m.fileName
    });
  });
}

function initAdmin() {
  if (isAdmin) return;
  isAdmin = true;

  pageAdmin.classList.add('open');
  document.getElementById('page-chat').classList.remove('open');
  document.getElementById('admin-user-view').style.display = 'flex';
  document.getElementById('admin-chat-view').classList.remove('open');
  selectedAdmUser = null;

  /* Reconcile old data */
  const admData = loadJSON('vibe_admin_data', {});
  const old = loadJSON('vibe_admin_chats', null);
  if (Array.isArray(old)) {
    old.forEach(m => {
      if (!admData[m.sender]) admData[m.sender] = { messages: [], unread: 0 };
      admData[m.sender].messages.push({ sender: m.sender, text: m.text, time: m.time, isImage: m.isImage, isFile: m.isFile, fileName: m.fileName });
    });
    localStorage.removeItem('vibe_admin_chats');
  }
  loadJSON('vibe_known_users', []).forEach(uid => {
    if (!admData[uid]) admData[uid] = { messages: [], unread: 0 };
  });
  saveJSON('vibe_admin_data', admData);
  renderUserList();

  /* Back */
  document.getElementById('admin-back-btn').addEventListener('click', () => {
    document.getElementById('admin-chat-view').classList.remove('open');
    document.getElementById('admin-user-view').style.display = 'flex';
    selectedAdmUser = null;
    renderUserList();
  });

  /* Delete user chat */
  document.getElementById('admin-delete-btn').addEventListener('click', () => {
    if (!selectedAdmUser) return;
    if (!confirm('Delete all messages from this user?')) return;
    const admData = loadJSON('vibe_admin_data', {});
    if (admData[selectedAdmUser]) {
      admData[selectedAdmUser].messages = [];
      admData[selectedAdmUser].unread = 0;
      saveJSON('vibe_admin_data', admData);
    }
    renderAdmMessages(selectedAdmUser);
    renderUserList();
  });

  /* Send reply */
  const inp = document.getElementById('admin-inp');
  const send = document.getElementById('admin-send');
  function sendReply() {
    const t = inp.value.trim();
    if (!t || !selectedAdmUser) return;
    const admData = loadJSON('vibe_admin_data', {});
    if (!admData[selectedAdmUser]) admData[selectedAdmUser] = { messages: [], unread: 0 };
    admData[selectedAdmUser].messages.push({ sender: 'admin', text: t, time: Date.now() });
    saveJSON('vibe_admin_data', admData);
    renderAdmMessages(selectedAdmUser);
    renderUserList();

    /* Also push to user's chat */
    const userHist = loadJSON('vibe_chat', []);
    userHist.push({ text: t, type: 'other', time: Date.now() });
    saveJSON('vibe_chat', userHist);

    fbSend({ senderId: 'admin', targetId: selectedAdmUser, text: t, time: Date.now() });
    inp.value = '';
  }
  send.addEventListener('click', sendReply);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') sendReply(); });

  /* Admin emoji */
  const aemojiBtn = document.getElementById('admin-emoji-btn');
  const aemojiPick = document.getElementById('admin-emoji-picker');
  const aemojiGrid = document.getElementById('admin-emoji-grid');
  Array.from(EMOJIS).forEach(e => {
    const s = document.createElement('span');
    s.textContent = e;
    s.addEventListener('click', () => {
      inp.focus();
      const st = inp.selectionStart, en = inp.selectionEnd;
      inp.value = inp.value.substring(0, st) + e + inp.value.substring(en);
      inp.selectionStart = inp.selectionEnd = st + e.length;
      inp.dispatchEvent(new Event('input'));
      aemojiPick.classList.remove('open');
    });
    aemojiGrid.appendChild(s);
  });
  aemojiBtn.addEventListener('click', e => { e.stopPropagation(); aemojiPick.classList.toggle('open'); });
  document.addEventListener('click', e => {
    if (aemojiPick && !aemojiPick.contains(e.target) && e.target !== aemojiBtn) aemojiPick.classList.remove('open');
  });

  /* Admin file attach */
  const aAttach = document.getElementById('admin-attach-btn');
  const aFile = document.getElementById('admin-file-inp');
  aAttach.addEventListener('click', () => aFile.click());
  aFile.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f || !selectedAdmUser) return;
    if (f.size > 500*1024) { alert('File too large (max 500KB)'); return; }
    const r = new FileReader();
    r.onload = ev => {
      const isImg = f.type.startsWith('image/');
      const admData = loadJSON('vibe_admin_data', {});
      if (!admData[selectedAdmUser]) admData[selectedAdmUser] = { messages: [], unread: 0 };
      admData[selectedAdmUser].messages.push({
        sender: 'admin', text: ev.target.result, time: Date.now(),
        isImage: isImg, isFile: !isImg, fileName: isImg ? null : f.name
      });
      saveJSON('vibe_admin_data', admData);
      renderAdmMessages(selectedAdmUser);
      renderUserList();
      fbSend({ senderId: 'admin', targetId: selectedAdmUser, text: ev.target.result, time: Date.now(), isImage: isImg, isFile: !isImg, fileName: isImg ? null : f.name });
    };
    r.readAsDataURL(f);
    aFile.value = '';
  });

  /* Sync immediately */
  fbFetchAll().then(data => {
    if (!data) return;
    const allIds = Object.keys(data);
    const admData = loadJSON('vibe_admin_data', {});
    let changed = false;
    allIds.forEach(pushId => {
      if (knownIds.has(pushId)) return;
      knownIds.add(pushId);
      const m = data[pushId];
      if (m.senderId && m.senderId !== 'admin') {
        if (!admData[m.senderId]) admData[m.senderId] = { messages: [], unread: 0 };
        admData[m.senderId].messages.push({ sender: m.senderId, text: m.text, time: m.time, isImage: m.isImage, isFile: m.isFile, fileName: m.fileName });
        changed = true;
      }
    });
    if (changed) {
      saveJSON('vibe_admin_data', admData);
      saveJSON('vibe_fb_ids', [...knownIds]);
    }
    renderUserList();
  });
}

/* ─── Navigation ─── */
const navHome = document.getElementById('nav-home');
const navChat = document.getElementById('nav-chat');
const pageChat = document.getElementById('page-chat');

function hideAllPages() {
  pageChat.classList.remove('open');
  pageAdmin.classList.remove('open');
  document.getElementById('emoji-picker').classList.remove('open');
}
function deactivateAllNav() {
  navHome.classList.remove('active');
  navChat.classList.remove('active');
}

navHome.addEventListener('click', () => {
  hideAllPages();
  deactivateAllNav();
  navHome.classList.add('active');
});

navChat.addEventListener('click', () => {
  hideAllPages();
  deactivateAllNav();
  navChat.classList.add('active');
  if (isAdmin) {
    pageAdmin.classList.add('open');
    renderUserList();
  } else {
    pageChat.classList.add('open');
  }
});

/* ─── 5-Click ─── */
let clickCount = 0;
let lastClick = 0;
document.addEventListener('click', (e) => {
  if (!pageChat.classList.contains('open')) return;
  const now = Date.now();
  if (now - lastClick < 500) clickCount++;
  else clickCount = 1;
  lastClick = now;
  if (clickCount === 5) { clickCount = 0; initAdmin(); }
});

/* ─── Init ─── */
initChat();
