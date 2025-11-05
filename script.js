// Configuration
const GITHUB_USERNAME = "4uffin";  // Replace with your username
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

// Modal open/close
addBtn.onclick = () => modal.style.display = "block";
closeModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; }

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
    embeds: embedsArray
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

// Load playlists from GitHub
async function loadPlaylists() {
  container.innerHTML = "<p>Loading playlists...</p>";

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const files = await response.json();

    if (!Array.isArray(files)) throw new Error("Unexpected API response");

    const jsonFiles = files.filter(f => f.name.endsWith(".json"));

    if (!jsonFiles.length) {
      container.innerHTML = "<p>No playlists found yet. Add one to /playlists!</p>";
      return;
    }

    container.innerHTML = "";

    for (const file of jsonFiles) {
      try {
        const res = await fetch(file.download_url);
        const playlist = await res.json();

        const div = document.createElement("div");
        div.className = "playlist";
        div.innerHTML = `
          <h2>${playlist.name}</h2>
          <p>${playlist.description}</p>
          ${playlist.embeds
            .map(
              e => `
            <div class="embed">
              <h4>${e.title}</h4>
              ${e.iframe}
            </div>
          `
            )
            .join("")}
        `;
        container.appendChild(div);
      } catch (err) {
        console.error(`Error loading ${file.name}:`, err);
      }
    }
  } catch (err) {
    console.error("Error fetching playlists:", err);
    container.innerHTML = "<p style='color:red'>Failed to load playlists. Check console.</p>";
  }
}

// Run
loadPlaylists();
