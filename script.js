//You can edit ALL of the code here
function setup() {
  const rootElem = document.getElementById("root");
  const countDisplay = document.getElementById("episode-count");

  // Show a loading message while we wait for the API
  rootElem.textContent = "Loading episodes...";
  countDisplay.textContent = "Loading episodes...";

  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((allEpisodes) => {
      // Clear loading message
      rootElem.innerHTML = "";

      // Use the fetched data just like before
      makePageForEpisodes(allEpisodes);
      setupSearch(allEpisodes);
      setupSelector(allEpisodes);

      countDisplay.textContent = `Showing ${allEpisodes.length} episode(s)`;
    })
    .catch((error) => {
      console.error(error);
      rootElem.textContent =
        "Sorry, something went wrong while loading episodes. Please try again later.";
      countDisplay.textContent = "Failed to load episodes.";
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
