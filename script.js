async function loadPlaylists() {
  const container = document.getElementById('playlists');
  const playlistFiles = [
    'chill_vibes.json',
    'workout_beats.json',
    'study_focus.json'
  ];

  for (const file of playlistFiles) {
    try {
      const response = await fetch(`./playlists/${file}`);
      const playlist = await response.json();

      const div = document.createElement('div');
      div.className = 'playlist';
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
          .join('')}
      `;
      container.appendChild(div);
    } catch (err) {
      console.error(`Error loading ${file}:`, err);
    }
  }
}

// Modal logic
const addBtn = document.getElementById('addPlaylistBtn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const template = document.getElementById('template');
const repoLink = document.getElementById('repoLink');

// ✏️ Replace this with your actual repo URL:
const GITHUB_REPO = "https://github.com/YOUR_USERNAME/playlist-hub";

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
  repoLink.href = `${GITHUB_REPO}/new/main/playlists?filename=playlists/your_playlist_name.json`;
  modal.style.display = 'block';
};

closeModal.onclick = () => (modal.style.display = 'none');
window.onclick = e => {
  if (e.target === modal) modal.style.display = 'none';
};

loadPlaylists();
