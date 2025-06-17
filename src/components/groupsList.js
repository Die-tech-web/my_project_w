import { createElement } from "../utils.js";
import { API_ENDPOINTS } from "../config.js";

export async function updateGroupsList() {
  const groupsContainer = document.querySelector(".section-discussions");
  if (!groupsContainer) return;

  try {
    const response = await fetch(API_ENDPOINTS.GROUPS);
    const groups = await response.json();

    // Récupérer ou créer le conteneur des groupes
    let groupsList = groupsContainer.querySelector(".groups-list");
    if (!groupsList) {
      groupsList = createElement("div", {
        class: "groups-list mt-4 space-y-2",
      });
      groupsContainer.appendChild(groupsList);
    }

    // Vider la liste existante
    groupsList.innerHTML = "";

    // Message si aucun groupe
    if (groups.length === 0) {
      groupsList.innerHTML =
        '<div class="text-center py-4 text-gray-400">Aucun groupe</div>';
      return;
    }

    // Afficher tous les groupes
    groups.forEach((group) => {
      const groupElement = createElement("div", {
        class:
          "flex items-center p-3 hover:bg-[#1e3d59] cursor-pointer rounded-lg",
        onclick: () => {
          if (window.handleGroupClick) {
            window.handleGroupClick(group);
          }
        },
      });

      groupElement.innerHTML = `
        <div class="w-10 h-10 bg-[#4a90e2] rounded-full flex items-center justify-center text-white mr-3">
          <i class="fas fa-users"></i>
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-white">${group.name}</h3>
          <p class="text-sm text-gray-300">${
            group.members ? group.members.length : 0
          } participants</p>
        </div>
      `;

      groupsList.appendChild(groupElement);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des groupes:", error);
  }
}

// Écouter l'événement de création de groupe
document.addEventListener("groupCreated", updateGroupsList);
document.addEventListener("DOMContentLoaded", updateGroupsList);
