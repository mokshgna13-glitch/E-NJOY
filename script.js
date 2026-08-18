const state = {
  files: [],
  objectUrls: new Map(),
  audioFile: null
};

const fileInput = document.getElementById("fileInput");
const viewer = document.getElementById("viewer");
const viewerTitle = document.getElementById("viewerTitle");
const viewerContent = document.getElementById("viewerContent");

function updateClock() {
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}
setInterval(updateClock, 1000);
updateClock();

function showPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(page).classList.add("active");
  render();
  window.scrollTo({top: 0, behavior: "smooth"});
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.getElementById("importBtn").addEventListener("click", () => fileInput.click());
document.querySelectorAll("[data-import]").forEach(button => {
  button.addEventListener("click", () => fileInput.click());
});

fileInput.addEventListener("change", event => {
  const selected = [...event.target.files];

  selected.forEach(file => {
    const id = crypto.randomUUID();
    state.files.push({ id, file });
    state.objectUrls.set(id, URL.createObjectURL(file));
  });

  fileInput.value = "";
  render();
  showPage("home");
});

function category(file) {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type === "application/pdf" || /\.(epub|pdf)$/.test(name)) return "books";
  if (type.startsWith("video/") || /\.(mp4|webm|ogg|mov|mkv)$/.test(name)) return "videos";
  if (type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/.test(name)) return "music";
  if (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/.test(name)) return "gallery";
  return "files";
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function iconFor(file) {
  const c = category(file);
  return {books:"📚", videos:"🎬", music:"🎵", gallery:"🖼️", files:"📄"}[c];
}

function makeItem(entry, actionText = "Open", action = null) {
  const file = entry.file;
  const item = document.createElement("div");
  item.className = "item";

  const icon = document.createElement("div");
  icon.className = "item-icon";
  icon.textContent = iconFor(file);

  const main = document.createElement("div");
  main.className = "item-main";
  main.innerHTML = `<div class="item-name">${escapeHtml(file.name)}</div>
                    <div class="item-meta">${formatSize(file.size)} · ${file.type || "unknown type"}</div>`;

  const button = document.createElement("button");
  button.textContent = actionText;
  button.addEventListener("click", () => action ? action(entry) : openFile(entry));

  item.append(icon, main, button);
  return item;
}

function openFile(entry) {
  const file = entry.file;
  const url = state.objectUrls.get(entry.id);
  const c = category(file);

  if (c === "music") {
    playMusic(entry);
    return;
  }

  if (c === "books" && file.type === "application/pdf") {
    viewerTitle.textContent = file.name;
    viewerContent.innerHTML = `<iframe src="${url}" title="${escapeHtml(file.name)}"></iframe>`;
  } else if (c === "videos") {
    viewerTitle.textContent = file.name;
    viewerContent.innerHTML = `<video src="${url}" controls autoplay></video>`;
  } else if (c === "gallery") {
    viewerTitle.textContent = file.name;
    viewerContent.innerHTML = `<img src="${url}" alt="${escapeHtml(file.name)}">`;
  } else {
    viewerTitle.textContent = file.name;
    viewerContent.innerHTML = `
      <div style="text-align:center">
        <p>This file is stored in the current E-NJOY session.</p>
        <button class="primary" id="downloadCurrent">Save a copy</button>
      </div>`;
    document.getElementById("downloadCurrent").addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
    });
  }

  viewer.hidden = false;
}

document.getElementById("closeViewer").addEventListener("click", () => {
  viewer.hidden = true;
  viewerContent.innerHTML = "";
});

function playMusic(entry) {
  const audio = document.getElementById("audio");
  const url = state.objectUrls.get(entry.id);
  audio.src = url;
  audio.play();
  state.audioFile = entry;
  document.getElementById("audioPlayerBox").hidden = false;
  document.getElementById("nowPlaying").textContent = entry.file.name;
  document.getElementById("playPause").textContent = "⏸ Pause";
}

document.getElementById("playPause").addEventListener("click", () => {
  const audio = document.getElementById("audio");
  if (audio.paused) {
    audio.play();
    document.getElementById("playPause").textContent = "⏸ Pause";
  } else {
    audio.pause();
    document.getElementById("playPause").textContent = "▶ Play";
  }
});

document.getElementById("volume").addEventListener("input", e => {
  document.getElementById("audio").volume = Number(e.target.value);
});

document.getElementById("audio").addEventListener("timeupdate", e => {
  const audio = e.target;
  const seek = document.getElementById("audioSeek");
  seek.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  document.getElementById("audioTime").textContent = formatTime(audio.currentTime);
});

document.getElementById("audioSeek").addEventListener("input", e => {
  const audio = document.getElementById("audio");
  if (audio.duration) audio.currentTime = (Number(e.target.value) / 100) * audio.duration;
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function render() {
  const groups = {books: [], videos: [], music: [], gallery: [], files: []};
  state.files.forEach(entry => groups[category(entry.file)].push(entry));

  renderList("booksList", groups.books, "Open");
  renderList("videosList", groups.videos, "Watch");
  renderList("musicList", groups.music, "Play");
  renderList("filesList", state.files, "Open");
  renderGallery(groups.gallery);

  setEmpty("booksEmpty", groups.books.length === 0);
  setEmpty("videosEmpty", groups.videos.length === 0);
  setEmpty("musicEmpty", groups.music.length === 0);
  setEmpty("galleryEmpty", groups.gallery.length === 0);
  setEmpty("filesEmpty", state.files.length === 0);

  document.getElementById("fileCount").textContent =
    `${state.files.length} file${state.files.length === 1 ? "" : "s"}`;
}

function renderList(id, entries, actionText) {
  const box = document.getElementById(id);
  box.innerHTML = "";
  entries.forEach(entry => {
    box.appendChild(makeItem(entry, actionText));
  });
}

function renderGallery(entries) {
  const box = document.getElementById("galleryList");
  box.innerHTML = "";

  entries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.innerHTML = `<img src="${state.objectUrls.get(entry.id)}" alt="${escapeHtml(entry.file.name)}">
                      <div>${escapeHtml(entry.file.name)}</div>`;
    card.addEventListener("click", () => openFile(entry));
    box.appendChild(card);
  });
}

function setEmpty(id, empty) {
  document.getElementById(id).style.display = empty ? "block" : "none";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

document.getElementById("darkMode").addEventListener("change", e => {
  document.body.classList.toggle("light", !e.target.checked);
  localStorage.setItem("enjoy-dark", e.target.checked);
});

document.getElementById("largeText").addEventListener("change", e => {
  document.body.classList.toggle("large-text", e.target.checked);
  localStorage.setItem("enjoy-large", e.target.checked);
});

document.getElementById("clearFiles").addEventListener("click", () => {
  if (!confirm("Clear all imported files from this session?")) return;
  state.objectUrls.forEach(url => URL.revokeObjectURL(url));
  state.files = [];
  state.objectUrls.clear();
  render();
});

const savedDark = localStorage.getItem("enjoy-dark");
const savedLarge = localStorage.getItem("enjoy-large");

if (savedDark !== null) {
  document.getElementById("darkMode").checked = savedDark === "true";
  document.body.classList.toggle("light", savedDark !== "true");
}
if (savedLarge === "true") {
  document.getElementById("largeText").checked = true;
  document.body.classList.add("large-text");
}

render();
