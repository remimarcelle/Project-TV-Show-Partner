//You can edit ALL of the code here
const SHOWS_API = "https://api.tvmaze.com/shows/82/episodes";
const episodesCache = {}; // store episodes by show ID so we dont have to re fetch
// them


function setup() {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "Loading episodes, please wait...";
  
  fetch(SHOWS_API)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP was not ok: ${response.status}`);
      return response.json();
    })
    .then((shows) => {
      shows.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      setupShowSelector(shows);
      loadEpisodesForShow(shows[0].id); // load first show by default
    })
    .catch((error) => {
      rootElem.textContent = `Failed to load shows: ${error.message}`;
    });
}

function setupShowSelector(shows) {
  const selector = document.getElementById("show-selector");
  selector.innerHTML = "";

  for (const show of shows) {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selector.appendChild(option);
  }

  selector.addEventListener("change", () => {
    loadEpisodesForShow(selector.value);
  });
}

function loadEpisodesForShow(showId) {
  const rootElem = document.getElementById("root");

  if (episodesCache[showId]) {
    makePageForEpisodes(episodesCache[showId]);
    setupSearch(episodesCache[showId]);
    setupSelector(episodesCache[showId]);
    return;
  }

  rootElem.textContent = "Loading episodes...";

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    })
    .then((episodes) => {
      episodesCache[showId] = episodes;
      makePageForEpisodes(episodes);
      setupSearch(episodes);
      setupSelector(episodes);
    })
    .catch((error) => {
      rootElem.textContent = `Error loading episodes: ${error.message}`;
    });
}

function formatEpisodeCode(season, episode) {
  const s = String(season).padStart(2, "0");
  const e = String(episode).padStart(2, "0");
  return `S${s}E${e}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "episode-grid";

  for (const episode of episodeList) {
    const card = document.createElement("article");
    card.className = "episode-card";
    card.id = `episode-${episode.id}`;

    const code = formatEpisodeCode(episode.season, episode.number);

    card.innerHTML = `
      <img src="${episode.image?.medium ?? ""}" alt="${episode.name}" />
      <div class="episode-info">
        <h2>${episode.name}</h2>
        <p class="episode-code">${code}</p>
        <div class="episode-summary">${episode.summary ?? ""}</div>
      </div>
    `;

    grid.appendChild(card);
  }

  const attribution = document.createElement("footer");
  attribution.innerHTML = `Data originally from <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>`;
  attribution.className = "attribution";

  rootElem.appendChild(grid);
  rootElem.appendChild(attribution);
}

function setupSearch(allEpisodes) {
  const searchInput = document.getElementById("search");
  const countDisplay = document.getElementById("episode-count");

  countDisplay.textContent = `Showing ${allEpisodes.length} episode(s)`;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        (ep.summary ?? "").toLowerCase().includes(term)
    );
    makePageForEpisodes(filtered);
    countDisplay.textContent = `Showing ${filtered.length} of ${allEpisodes.length} episode(s)`;
  });
}

function setupSelector(allEpisodes) {
  const selector = document.getElementById("episode-selector");
  selector.innerHTML = ""; // clear options when switching shows

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Show all episodes";
  selector.appendChild(defaultOption);

  for (const episode of allEpisodes) {
    const option = document.createElement("option");
    const code = formatEpisodeCode(episode.season, episode.number);
    option.value = episode.id;
    option.textContent = `${code} - ${episode.name}`;
    selector.appendChild(option);
  }

  selector.addEventListener("change", () => {
    const selectedId = selector.value;
    if (!selectedId) return;
    const target = document.getElementById(`episode-${selectedId}`);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
}
window.onload = setup;
