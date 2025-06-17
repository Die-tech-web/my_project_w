import { createElement } from "../utils.js";
import { searchItems } from "../services/searchService.js";
import {
  createContactElement,
  createGroupElement,
} from "../services/searchManager.js";

let searchTimeout = null;

export function createSearchBar() {
  const searchContainer = createElement("div", {
    class: "px-4 py-2",
  });

  const searchInput = createElement("input", {
    type: "text",
    placeholder: "Rechercher ou commencer une nouvelle discussion",
    class:
      "w-full px-4 py-2 bg-white text-gray-800 rounded-lg placeholder-gray-500 focus:outline-none border border-gray-200",
  });

  searchInput.addEventListener("input", function () {
    const query = this.value.trim();

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
      try {
        console.log("Recherche pour:", query);
        const results = await searchItems(query);
        console.log("Résultats:", results);
        updateSearchResults(results);
      } catch (error) {
        console.error("Erreur recherche:", error);
      }
    }, 300);
  });

  // Charger la liste initiale
  setTimeout(async () => {
    const results = await searchItems("");
    updateSearchResults(results);
  }, 0);

  searchContainer.appendChild(searchInput);
  return searchContainer;
}

function updateSearchResults({ contacts, groups }) {
  const discussionsContainer = document.querySelector(".discussions-list");
  if (!discussionsContainer) return;

  discussionsContainer.innerHTML = "";

  if (!contacts?.length && !groups?.length) {
    discussionsContainer.innerHTML = `
      <div class="text-center py-4 text-gray-400">
        Aucun résultat trouvé
      </div>
    `;
    return;
  }

  contacts?.forEach((contact) => {
    const element = createContactElement(contact);
    if (element) discussionsContainer.appendChild(element);
  });

  groups?.forEach((group) => {
    const element = createGroupElement(group);
    if (element) discussionsContainer.appendChild(element);
  });
}
