const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const loadingVideo = document.getElementById('loading-video');
const bgVideos = document.querySelectorAll('.bg-video');

function startExperience() {
  loadingScreen.classList.add('hidden');
  mainContent.classList.add('visible');
  startBackgroundLoop();
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
