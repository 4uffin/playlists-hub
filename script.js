// Configuration
const GITHUB_USERNAME = "4uffin";
const REPO_NAME = "playlists-hub";
const BRANCH = "main";
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/playlists?ref=${BRANCH}`;

// Elements
const container = document.getElementById("playlists");
const addBtn = document.getElementById("addPlaylistBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

const playlistForm = document.getElementById("playlistForm");
const nameInput = document.getElementById("playlistName");
const descInput = document.getElementById("playlistDesc");
const embedsInput = document.getElementById("playlistEmbeds");
const template = document.getElementById("template");
const copyBtn = document.getElementById("copyBtn");
const repoLink = document.getElementById("repoLink");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

let allPlaylists = [];

// Load settings from localStorage
let settings = JSON.parse(localStorage.getItem("playlistHubSettings")) || {
  sortOrder: "alphabetical",
  lastSearch: ""
};
sortSelect.value = settings.sortOrder;
searchInput.value = settings.lastSearch;

// Modal open/close
addBtn.onclick = () => modal.style.display = "block";
closeModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if(e.target === modal) modal.style.display = "none"; }

// Update GitHub link dynamically
function updateRepoLink() {
  const safeName = nameInput.value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
  repoLink.href = `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/new/${BRANCH}/playlists?filename=playlists/${safeName}.json`;
}
nameInput.addEventListener("input", updateRepoLink);

// Generate JSON dynamically
playlistForm.addEventListener("submit", e => {
  e.preventDefault();
  const embedsArray = embedsInput.value
    .split("\n")
    .filter(line => line.trim() !== "")
    .map((iframe, index) => ({ title: `Embed ${index+1}`, iframe }));

  const playlistJSON = {
    name: nameInput.value.trim(),
    description: descInput.value.trim(),
    embeds: embedsArray,
    date: new Date().toISOString()
  };

  template.value = JSON.stringify(playlistJSON, null, 2);
  updateRepoLink();
});

// Copy JSON
copyBtn.onclick = () => {
  template.select();
  template.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("✅ JSON copied to clipboard!");
};

// Sorting and filtering
function applySorting(playlistsArray) {
  if (settings.sortOrder === "alphabetical") {
    playlistsArray.sort((a,b) => a.name.localeCompare(b.name));
  } else if (settings.sortOrder === "newest" && playlistsArray[0]?.date) {
    playlistsArray.sort((a,b) => new Date(b.date) - new Date(a.date));
  }
}

function applySearch(playlistsArray) {
  const query = searchInput.value.toLowerCase().trim();
  return playlistsArray.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );
}

function renderFilteredPlaylists() {
  let filtered = applySearch(allPlaylists);
  applySorting(filtered);
  renderPlaylists(filtered);
  scrollToPlaylistFromURL();
}

function renderPlaylists(playlistsArray) {
  container.innerHTML = "";
  if (!playlistsArray.length) {
    container.innerHTML = "<p>No playlists match your search.</p>";
    return;
  }

  playlistsArray.forEach(playlist => {
    const div = document.createElement("div");
    div.className = "playlist";

    const playlistURL = `${window.location.origin}${window.location.pathname}?playlist=${encodeURIComponent(playlist.name)}`;

    div.innerHTML = `
      <h2>${playlist.name}</h2>
      <p>${playlist.description}</p>
      ${playlist.embeds.map(e => `<div class="embed"><h4>${e.title}</h4>${e.iframe}</div>`).join('')}
      <button class="copy-url-btn">📋 Copy Playlist URL</button>
    `;

    div.querySelector(".copy-url-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(playlistURL).then(() => {
        alert(`✅ Playlist URL copied!\n${playlistURL}`);
      }).catch(err => console.error("Failed to copy URL:", err));
    });

    container.appendChild(div);
  });
}

function scrollToPlaylistFromURL() {
  const params = new URLSearchParams(window.location.search);
  const playlistName = params.get("playlist");
  if (!playlistName) return;

  const encodedName = decodeURIComponent(playlistName);
  const playlistCards = document.querySelectorAll(".playlist");
  for (const card of playlistCards) {
    const title = card.querySelector("h2").textContent;
    if (title === encodedName) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
      card.style.boxShadow = "0 0 20px rgba(108, 99, 255, 0.7)";
      setTimeout(() => card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)", 3000);
      break;
    }
  }
}

// Event listeners
searchInput.addEventListener("input", () => {
  settings.lastSearch = searchInput.value;
  localStorage.setItem("playlistHubSettings", JSON.stringify(settings));
  renderFilteredPlaylists();
});

sortSelect.addEventListener("change", () => {
  settings.sortOrder = sortSelect.value;
  localStorage.setItem("playlistHubSettings", JSON.stringify(settings));
  renderFilteredPlaylists();
});

// Fetch playlists
async function loadPlaylists() {
  container.innerHTML = "<p>Loading playlists...</p>";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const files = await response.json();
    if (!Array.isArray(files)) throw new Error("Unexpected API response");

    const jsonFiles = files.filter(f => f.name.endsWith(".json"));
    allPlaylists = [];

    for (const file of jsonFiles) {
      try {
        const res = await fetch(file.download_url);
        const playlist = await res.json();
        allPlaylists.push(playlist);
      } catch (err) {
        console.error(`Error loading ${file.name}:`, err);
      }
    }

    renderFilteredPlaylists();
  } catch (err) {
    console.error("Error fetching playlists:", err);
    container.innerHTML = "<p style='color:red'>Failed to load playlists. Check console.</p>";
  }
}

// Initialize
loadPlaylists();
updateRepoLink();
