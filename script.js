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

loadPlaylists();
