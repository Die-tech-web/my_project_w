import { createElement } from "../utils.js";
import { API_ENDPOINTS } from "../config.js";

export function createAddGroupModal() {
  // ... code existant du modal ...

  const form = createElement("form", {
    class: "space-y-4",
  });

  form.onsubmit = async (e) => {
    e.preventDefault();

    const groupName = document.getElementById("groupName").value.trim();
    const selectedMembers = Array.from(
      document.querySelectorAll('input[name="groupMembers"]:checked')
    ).map((checkbox) => checkbox.value);

    if (!groupName || selectedMembers.length === 0) {
      // ...validation code...
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));

      const response = await fetch(API_ENDPOINTS.GROUPS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          members: selectedMembers,
          createdAt: new Date().toISOString(),
          admin: currentUser.id,
          createdBy: currentUser.name,
        }),
      });

      if (response.ok) {
        // Fermer le modal
        modal.remove();
        overlay.remove();

        // Déclencher les événements de mise à jour
        document.dispatchEvent(new CustomEvent("groupCreated"));
        window.updateGroupsList(); // Met à jour la liste des discussions

        // Notification de succès
        if (window.showNotification) {
          window.showNotification("Groupe créé avec succès!", "success");
        }
      }
    } catch (error) {
      console.error("Erreur création groupe:", error);
      if (window.showNotification) {
        window.showNotification(
          "Erreur lors de la création du groupe",
          "error"
        );
      }
    }
  };

  // ... reste du code du modal ...
}
