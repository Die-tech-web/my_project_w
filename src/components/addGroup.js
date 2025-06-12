import { createElement } from "../utils.js";
import { API_ENDPOINTS } from "../config.js";
import { listUpdateService } from "../services/listUpdateService.js";

export function createAddGroupModal() {
  // ... code existant du modal ...

  const form = createElement("form", {
    class: "space-y-4",
    onsubmit: async (e) => {
      e.preventDefault();
      
      const groupName = document.getElementById("groupName").value.trim();
      const selectedMembers = Array.from(
        document.querySelectorAll('input[name="groupMembers"]:checked')
      ).map(checkbox => checkbox.value);

      if (!groupName) {
        showError("groupName", "Le nom du groupe est requis");
        return;
      }

      if (selectedMembers.length === 0) {
        showError("groupMembers", "Sélectionnez au moins un membre");
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.GROUPS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: groupName,
            members: selectedMembers,
            createdAt: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          const newGroup = await response.json();
          
          // Fermer le modal
          overlay.remove();
          
          // Mettre à jour les listes de groupes
          await listUpdateService.updateGroups();
          
          // Notification de succès
          if (window.showNotification) {
            window.showNotification("Groupe créé avec succès!", "success");
          }
        } else {
          throw new Error("Erreur lors de la création du groupe");
        }
      } catch (error) {
        console.error("Erreur:", error);
        showError("groupName", "Erreur lors de la création du groupe");
      }
    },
  });

  // ... reste du code du modal ...
}