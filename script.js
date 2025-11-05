// ==== CONFIGURATION ====
const GITHUB_USERNAME = "YOUR_USERNAME"; // ← your GitHub username
const REPO_NAME = "playlist-hub";        // ← your repo name
const BRANCH = "main";                   // or "master" if your repo uses that

// GitHub API endpoint for listing playlist files
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/playlists?ref=${BRANCH}`;

async function loadPlaylists() {
  const container = document.getElementById("playlists");
  container.innerHTML = "<p>Loading playlists...</p>";

  try {
    // Get playlist file list from GitHub
    const response = await fetch(API_URL);
    const files = await response.json();

    // Filter only JSON files
    const jsonFiles = files.filter(file => file.name.endsWith(".json"));

    if (!jsonFiles.length) {
      container.innerHTML = "<p>No playlists found yet. Be the first to add one!</p>";
      return;
    }

    container.innerHTML = "";

    for (const file of jsonFiles) {
      try {
        // Fetch raw JSON content
        const rawResponse = await fetch(file.download_url);
        const playlist = await rawResponse.json();

        // Render playlist
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
  } catch (error) {
    console.error("Error fetching playlist list:", error);
    container.innerHTML = `<p style="color:red">Failed to load playlists. Check console for details.</p>`;
  }
}

// ==== MODAL LOGIC ====
const addBtn = document.getElementById("addPlaylistBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const template = document.getElementById("template");
const repoLink = document.getElementById("repoLink");

const REPO_URL = `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}`;

template.value = `{
  "name": "My Awesome Playlist",
  "description": "Describe your playlist here!",
  "embeds": [
    {
      "title": "YouTube Example",
      "iframe": "<iframe width='100%' height='200' src='https://www.youtube.com/embed/VIDEO_ID' allow='autoplay; encrypted-media' allowfullscreen></iframe>"
    },
    {
      "title": "Spotify Example",
      "iframe": "<iframe style='border-radius:12px' src='https://open.spotify.com/embed/playlist/PLAYLIST_ID' width='100%' height='200' allowfullscreen></iframe>"
    }
  ]
}`;

addBtn.onclick = () => {
  repoLink.href = `${REPO_URL}/new/${BRANCH}/playlists?filename=playlists/your_playlist_name.json`;
  modal.style.display = "block";
};

closeModal.onclick = () => (modal.style.display = "none");
window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

// ==== RUN ====
loadPlaylists();
