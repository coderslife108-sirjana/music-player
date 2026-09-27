const tracks = [
  { title: "Soft Focus", artist: "SoundHelix", album: "Demo session 01", duration: "--:--", image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=600&q=80", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Driftwood", artist: "SoundHelix", album: "Demo session 02", duration: "--:--", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Blue Hour", artist: "SoundHelix", album: "Demo session 03", duration: "--:--", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "First Light", artist: "SoundHelix", album: "Demo session 04", duration: "--:--", image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600&q=80", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { title: "Open Road", artist: "SoundHelix", album: "Demo session 05", duration: "--:--", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { title: "Afterglow", artist: "SoundHelix", album: "Demo session 06", duration: "--:--", image: "https://images.unsplash.com/photo-1441974231531-c6227db76e6e?auto=format&fit=crop&w=600&q=80", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { title: "Night Drive", artist: "SoundHelix", album: "Demo session 07", duration: "--:--", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" }
];
const mixes = [
  { title: "Window Seat", subtitle: "soft focus, miles away", image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=500&q=80", index: 0 },
  { title: "Low Tide", subtitle: "slow waves & slower days", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=500&q=80", index: 1 },
  { title: "Open Road", subtitle: "somewhere past the turn", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80", index: 2 },
  { title: "Golden Hour", subtitle: "a little light left", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=500&q=80", index: 3 }
];
const audio = new Audio();
audio.volume = 0.72;
let currentIndex = 0;
let isPlaying = false;
let shuffleOn = false;
let repeatMode = 0;
let liked = new Set();
let activeView = "For you";
const $ = (selector) => document.querySelector(selector);
function renderMixes() {
  $("#mix-grid").innerHTML = mixes.map((mix) => `<button class="mix-card" type="button" data-track="${mix.index}" aria-label="Play ${mix.title}"><span class="mix-art"><img src="${mix.image}" alt="" loading="lazy"><span class="mix-play"><svg viewBox="0 0 24 24"><path d="m8 5 12 7-12 7z"/></svg></span></span><span class="mix-title">${mix.title}</span><span class="mix-subtitle">${mix.subtitle}</span></button>`).join("");
}
function renderTracks() {
  const query = $("#search").value.trim().toLowerCase();
  let visible = tracks.map((track, index) => ({ track, index }));
  if (activeView === "Liked songs") visible = visible.filter(({ index }) => liked.has(index));
  if (activeView === "Recently played") visible = visible.filter(({ index }) => index === currentIndex);
  if (query) visible = visible.filter(({ track }) => `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query));
  $("#track-list").innerHTML = visible.length ? visible.map(({ track, index }) => `<div class="track-row${index === currentIndex ? " selected" : ""}" data-track="${index}" tabindex="0" role="button" aria-label="Play ${track.title} by ${track.artist}"><span class="track-index">${index === currentIndex && isPlaying ? "*" : String(index + 1).padStart(2, "0")}</span><span class="track-name-wrap"><img class="track-thumb" src="${track.image}" alt="" loading="lazy"><span class="track-text"><span class="track-title">${track.title}</span><span class="track-artist">${track.artist}</span></span></span><span class="track-album">${track.album}</span><span class="track-duration">${track.duration}</span><button class="tiny-button track-like${liked.has(index) ? " liked" : ""}" type="button" data-like="${index}" aria-label="${liked.has(index) ? "Unlike" : "Like"} ${track.title}"><svg viewBox="0 0 24 24"><path d="M20.8 8.7c0 5.4-8.8 11-8.8 11s-8.8-5.6-8.8-11a4.5 4.5 0 0 1 8.8-1.3 4.5 4.5 0 0 1 8.8 1.3Z"/></svg></button></div>`).join("") : `<div class="empty-state">${activeView === "Liked songs" ? "Songs you like will show up here." : "No tracks match that search."}</div>`;
}
function renderQueue() {
  const upcoming = Array.from({ length: 4 }, (_, offset) => tracks[(currentIndex + offset + 1) % tracks.length]);
  $("#queue-count").textContent = `${tracks.length - 1} songs`;
  $("#queue-list").innerHTML = upcoming.map((track) => {
    const index = tracks.indexOf(track);
    return `<button class="queue-row" type="button" data-track="${index}"><img src="${track.image}" alt="" loading="lazy"><span class="queue-copy"><span class="queue-track-title">${track.title}</span><span class="queue-track-artist">${track.artist}</span></span><span class="queue-duration">${track.duration}</span></button>`;
  }).join("");
}
function setLiked(index, shouldLike = !liked.has(index)) {
  if (shouldLike) liked.add(index); else liked.delete(index);
  renderTracks();
  updateLikeButtons();
}
function updateLikeButtons() {
  const active = liked.has(currentIndex);
  ["#aside-like", "#player-like"].forEach((selector) => {
    const button = $(selector);
    button.classList.toggle("liked", active);
    button.setAttribute("aria-label", `${active ? "Unlike" : "Like"} song`);
  });
}
function updatePlayButton() {
  $("#toggle-play").innerHTML = isPlaying ? '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM15 5h4v14h-4z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="m8 5 12 7-12 7z"/></svg>';
  $("#toggle-play").setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  renderTracks();
}
function loadTrack(index, autoplay = false) {
  currentIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentIndex];
  audio.src = track.audio;
  audio.load();
  $("#player-art").src = track.image;
  $("#player-title").textContent = track.title;
  $("#player-artist").textContent = track.artist;
  $("#aside-art").src = track.image;
  $("#aside-art").alt = `${track.title} album artwork`;
  $("#aside-title").textContent = track.title;
  $("#aside-artist").textContent = track.artist;
  $("#elapsed").textContent = "0:00";
  $("#duration").textContent = track.duration;
  $("#progress").value = 0;
  updateRange($("#progress"));
  renderTracks();
  renderQueue();
  updateLikeButtons();
  if (autoplay) playAudio();
}
async function playAudio() {
  try {
    await audio.play();
    isPlaying = true;
    updatePlayButton();
  } catch {
    isPlaying = false;
    updatePlayButton();
    showStatus("This track couldn't load. Try another song.");
  }
}
function togglePlay() {
  if (isPlaying) { audio.pause(); isPlaying = false; updatePlayButton(); }
  else playAudio();
}
function playNext() {
  const nextIndex = shuffleOn ? Math.floor(Math.random() * tracks.length) : currentIndex + 1;
  loadTrack(nextIndex, true);
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
function updateRange(range) {
  const min = Number(range.min) || 0;
  const max = Number(range.max) || 100;
  const percent = ((Number(range.value) - min) / (max - min)) * 100;
  range.style.background = `linear-gradient(to right, var(--lime) 0%, var(--lime) ${percent}%, #ffffff26 ${percent}%, #ffffff26 100%)`;
}
let statusTimer;
function showStatus(message) {
  const status = $("#status");
  status.textContent = message;
  status.classList.add("visible");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove("visible"), 2200);
}
function activateTrack(index) { loadTrack(index, true); }
renderMixes();
renderTracks();
loadTrack(0);
$("#mix-grid").addEventListener("click", (event) => {
  const card = event.target.closest("[data-track]");
  if (card) activateTrack(Number(card.dataset.track));
});
$("#track-list").addEventListener("click", (event) => {
  const likeButton = event.target.closest("[data-like]");
  if (likeButton) { event.stopPropagation(); setLiked(Number(likeButton.dataset.like)); return; }
  const row = event.target.closest("[data-track]");
  if (row) activateTrack(Number(row.dataset.track));
});
$("#track-list").addEventListener("keydown", (event) => {
  const row = event.target.closest(".track-row");
  if (row && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); activateTrack(Number(row.dataset.track)); }
});
$("#queue-list").addEventListener("click", (event) => {
  const row = event.target.closest("[data-track]");
  if (row) activateTrack(Number(row.dataset.track));
});
$("#toggle-play").addEventListener("click", togglePlay);
$("#hero-play").addEventListener("click", () => activateTrack(0));
$("#play-all").addEventListener("click", () => activateTrack(0));
$("#previous").addEventListener("click", () => {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadTrack(currentIndex - 1, true);
});
$("#next").addEventListener("click", playNext);
$("#shuffle").addEventListener("click", (event) => {
  shuffleOn = !shuffleOn;
  event.currentTarget.classList.toggle("active", shuffleOn);
  showStatus(shuffleOn ? "Shuffle on" : "Shuffle off");
});
$("#repeat").addEventListener("click", (event) => {
  repeatMode = (repeatMode + 1) % 3;
  const labels = ["Repeat off", "Repeat all", "Repeat one"];
  event.currentTarget.classList.toggle("active", repeatMode !== 0);
  event.currentTarget.setAttribute("aria-label", labels[repeatMode]);
  event.currentTarget.title = labels[repeatMode];
  showStatus(labels[repeatMode]);
});
["#aside-like", "#player-like"].forEach((selector) => $(selector).addEventListener("click", () => setLiked(currentIndex)));
$("#search").addEventListener("input", renderTracks);
$("#volume").addEventListener("input", (event) => { audio.volume = Number(event.target.value); updateRange(event.target); });
$("#progress").addEventListener("input", (event) => {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  audio.currentTime = (Number(event.target.value) / 1000) * duration;
  $("#elapsed").textContent = formatTime(audio.currentTime);
  updateRange(event.target);
});
audio.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audio.duration)) return;
  const progress = $("#progress");
  progress.value = Math.round((audio.currentTime / audio.duration) * 1000);
  $("#elapsed").textContent = formatTime(audio.currentTime);
  $("#duration").textContent = formatTime(audio.duration);
  updateRange(progress);
});
audio.addEventListener("loadedmetadata", () => {
  if (!Number.isFinite(audio.duration)) return;
  tracks[currentIndex].duration = formatTime(audio.duration);
  $("#duration").textContent = tracks[currentIndex].duration;
  renderTracks();
  renderQueue();
});
audio.addEventListener("ended", () => {
  if (repeatMode === 2) { audio.currentTime = 0; playAudio(); }
  else if (repeatMode === 1 || currentIndex < tracks.length - 1 || shuffleOn) playNext();
  else { isPlaying = false; updatePlayButton(); }
});
audio.addEventListener("error", () => {
  if (audio.src) { isPlaying = false; updatePlayButton(); }
});
document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item === button));
  activeView = button.dataset.view;
  $("#tracks-title").textContent = activeView === "Liked songs" ? "Liked songs" : activeView === "Recently played" ? "Recently played" : activeView === "For you" ? "Easy does it" : activeView;
  renderTracks();
  if (activeView !== "For you") document.querySelector("#tracks").scrollIntoView({ behavior: "smooth", block: "start" });
}));
$("#hero-save").addEventListener("click", (event) => {
  const saved = event.currentTarget.dataset.saved === "true";
  event.currentTarget.dataset.saved = String(!saved);
  event.currentTarget.textContent = saved ? "+ Save to library" : "Saved to library";
  showStatus(saved ? "Removed from your library" : "Saved to your library");
});
$("#see-all").addEventListener("click", () => showStatus("You're all caught up"));
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !["INPUT", "BUTTON"].includes(document.activeElement.tagName)) { event.preventDefault(); togglePlay(); }
  if (event.key === "ArrowRight" && !["INPUT"].includes(document.activeElement.tagName)) audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0);
  if (event.key === "ArrowLeft" && !["INPUT"].includes(document.activeElement.tagName)) audio.currentTime = Math.max(audio.currentTime - 5, 0);
});
