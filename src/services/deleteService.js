import { API_ENDPOINTS } from "../config.js";
import { showNotification } from "../components/notifications.js";

export async function deleteContact(contactId) {
  try {
    const response = await fetch(`${API_ENDPOINTS.USERS}/${contactId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showNotification("Contact supprimé avec succès", "success");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    showNotification("Erreur lors de la suppression", "error");
    return false;
  }
}

// export async function deleteGroup(groupId) {
//   try {
//     const response = await fetch(`${API_ENDPOINTS.GROUPS}/${groupId}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (response.ok) {
//       await listUpdateService.updateGroups();
//       showNotification("Groupe supprimé avec succès", "success");
//       return true;
//     }
//     return false;
//   } catch (error) {
//     console.error("Erreur lors de la suppression du groupe:", error);
//     showNotification("Erreur lors de la suppression", "error");
//     return false;
//   }
// }

// // Dans la fonction loadDiscussions(), modifiez la partie d'affichage des contacts:

// sortedContacts.forEach((contact) => {
//   const discussionElement = createElement("div", {
//     class:
//       "flex items-center p-3 hover:bg-[#33415c] rounded-lg cursor-pointer transition-colors duration-200 relative group",
//     onclick: (e) => {
//       // Empêcher le clic sur le contact si on clique sur l'icône de suppression
//       if (!e.target.closest(".delete-icon")) {
//         handleContactClick(contact);
//       }
//     },
//   });

//   const avatar = createElement(
//     "div",
//     {
//       class:
//         "w-12 h-12 bg-[#90D1CA] rounded-full flex items-center justify-center text-white font-medium mr-3",
//     },
//     contact.name.charAt(0).toUpperCase()
//   );

//   const info = createElement("div", { class: "flex-1" });
//   info.innerHTML = `
//     <h3 class="font-medium text-white">${contact.name}</h3>
//     <p class="text-sm text-white/80">${contact.phone}</p>
//   `;

//   const time = createElement(
//     "div",
//     { class: "text-xs text-white/60" },
//     "12:30"
//   );

//   // Ajout de l'icône de suppression
//   const deleteIcon = createElement("div", {
//     class:
//       "delete-icon opacity-0 group-hover:opacity-100 absolute right-2 text-red-500 hover:text-red-600 cursor-pointer p-2",
//     onclick: async (e) => {
//       e.stopPropagation();
//       const success = await deleteContact(contact.id);
//       if (success) {
//         discussionElement.remove();
//         // Rafraîchir la liste des discussions
//         window.dispatchEvent(new Event("contactDeleted"));
//       }
//     },
//   });
//   deleteIcon.innerHTML = '<i class="fas fa-trash-alt"></i>';

//   discussionElement.append(avatar, info, time, deleteIcon);
//   discussionsList.appendChild(discussionElement);
// });
