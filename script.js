const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const loadingVideo = document.getElementById('loading-video');
const bgVideos = document.querySelectorAll('.bg-video');

loadingVideo.addEventListener('ended', () => {
  loadingScreen.classList.add('hidden');
  mainContent.classList.add('visible');
  startBackgroundLoop();
});

function startBackgroundLoop() {
  let current = 0;
  const CROSSFADE_MS = 1000;
  const OVERLAP = 1.5;

  bgVideos.forEach((v, i) => {
    v.currentTime = 0;
    v.play();
    if (i === 0) v.classList.add('active');
  });

  setInterval(() => {
    const next = 1 - current;
    const curVideo = bgVideos[current];
    const nextVideo = bgVideos[next];

    if (curVideo.duration - curVideo.currentTime <= OVERLAP) {
      nextVideo.currentTime = 0;
      nextVideo.play();
      nextVideo.classList.add('active');
      curVideo.classList.remove('active');
      current = next;
    }
  }, 100);
}
