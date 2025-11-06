const container = document.getElementById("playlistContainer");
const addPlaylistBtn = document.getElementById("addPlaylistBtn");
const modal = document.getElementById("modal");
const closeBtn = document.querySelector(".close");
const playlistForm = document.getElementById("playlistForm");
const template = document.getElementById("template");
const sortSelect = document.getElementById("sortSelect");

const usernameInput = document.getElementById("username");
const userPreview = document.getElementById("userPreview");

let userInfo = { username: "", profile_url: "", avatar_url: "" };

// Load playlists
async function loadPlaylists() {
  try {
    const res = await fetch("https://api.github.com/repos/4uffin/playlists-hub/contents/playlists");
    const files = await res.json();

    const playlists = await Promise.all(
      files.filter(f => f.name.endsWith(".json")).map(async file => {
        const data = await fetch(file.download_url);
        return await data.json();
      })
    );

    const sortType = localStorage.getItem("playlistSort") || "recent";
    sortSelect.value = sortType;

    if (sortType === "name") {
      playlists.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      playlists.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }

    renderPlaylists(playlists);
  } catch (err) {
    console.error("Error fetching playlists:", err);
  }
}

function renderPlaylists(playlists) {
  container.innerHTML = "";
  playlists.forEach(p => {
    const div = document.createElement("div");
    div.className = "playlist";
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="embed">
        ${p.embeds.map(e => e.iframe).join("")}
      </div>
      ${p.user ? `
        <div class="user-info">
          <img src="${p.user.avatar_url || ''}" alt="${p.user.username}" />
          <a href="${p.user.profile_url}" target="_blank">@${p.user.username}</a>
        </div>` : ""}
    `;
    container.appendChild(div);
  });
}

sortSelect.addEventListener("change", () => {
  localStorage.setItem("playlistSort", sortSelect.value);
  loadPlaylists();
});

// Modal logic
addPlaylistBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

// GitHub user preview
usernameInput.addEventListener("input", async e => {
  const username = e.target.value.trim();
  if (!username) {
    userPreview.innerHTML = "<p>Type your GitHub username to preview your profile</p>";
    userInfo = { username: "", profile_url: "", avatar_url: "" };
    return;
  }

  userPreview.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error("User not found");
    const data = await res.json();

    userInfo = {
      username: data.login,
      profile_url: data.html_url,
      avatar_url: data.avatar_url
    };

    userPreview.innerHTML = `
      <img src="${data.avatar_url}" alt="${data.login}" />
      <a href="${data.html_url}" target="_blank">@${data.login}</a>
    `;
  } catch {
    userPreview.innerHTML = `<p style="color:red;">User not found or API limit reached</p>`;
    userInfo = { username, profile_url: "", avatar_url: "" };
  }
});

// Form submission
playlistForm.addEventListener("submit", e => {
  e.preventDefault();

  const embedsArray = document.getElementById("embeds").value
    .split("\n")
    .filter(line => line.trim() !== "")
    .map((iframe, i) => ({ title: `Embed ${i+1}`, iframe }));

  const playlistJSON = {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    embeds: embedsArray,
    user: {
      username: userInfo.username || "unknown",
      profile_url: userInfo.profile_url || "",
      avatar_url: userInfo.avatar_url || ""
    },
    date: new Date().toISOString()
  };

  template.value = JSON.stringify(playlistJSON, null, 2);
});
 
loadPlaylists();
