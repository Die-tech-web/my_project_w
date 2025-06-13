import { createElement } from "../utils.js";
import { archiveService } from "../services/archiveService.js";
import { createChatView } from "../messages/chatView.js";

export async function createArchivedContactsList() {
  const container = createElement("div", {
    class:
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
  });

  // Modification de la couleur de fond du modal
  const modal = createElement("div", {
    class: "bg-[#457b9d] rounded-lg w-96 max-h-[80vh] flex flex-col shadow-xl",
    style: "margin-top: 60px;",
  });

  // Modification de la couleur du header
  const header = createElement("div", {
    class:
      "p-4 border-b border-white/20 flex justify-between items-center bg-[#457b9d]",
  });

  header.innerHTML = `
    <h2 class="text-lg font-medium text-white">Contacts archivés</h2>
    <button class="text-white hover:text-gray-300">
      <i class="fas fa-times"></i>
    </button>
  `;

  const content = createElement("div", {
    class: "p-4 overflow-y-auto flex-1",
  });

  modal.append(header, content);
  container.appendChild(modal);

  // Charger les contacts archivés
  const archivedContacts = await archiveService.getArchivedContacts();

  if (archivedContacts.length === 0) {
    content.innerHTML =
      '<p class="text-center text-white/60 p-4">Aucun contact archivé</p>';
  } else {
    archivedContacts.forEach((archived) => {
      const contact = archived.contactInfo;
      if (!contact) return;

      const contactDiv = createElement("div", {
        class:
          "flex items-center justify-between p-3 hover:bg-[#33415c] rounded-lg group cursor-pointer mb-2 transition-colors duration-200",
      });

      contactDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-[#0A6847] rounded-full flex items-center justify-center text-white font-medium">
            ${contact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="text-white font-medium">${contact.name}</div>
            <div class="text-white/60 text-sm">${contact.phone || ""}</div>
          </div>
        </div>
        <button class="unarchive-btn opacity-0 group-hover:opacity-100 text-white/60 hover:text-white p-2 transition-opacity duration-200">
          <i class="fas fa-inbox-out"></i>
        </button>
      `;

      // Ajout des gestionnaires d'événements
      const unarchiveBtn = contactDiv.querySelector(".unarchive-btn");
      unarchiveBtn.onclick = async (e) => {
        e.stopPropagation();
        if (await archiveService.unarchiveContact(archived.id)) {
          contactDiv.remove();
          document.dispatchEvent(new CustomEvent("contactUnarchived"));
          if (content.children.length === 0) {
            content.innerHTML =
              '<p class="text-center text-white/60 p-4">Aucun contact archivé</p>';
          }
        }
      };

      content.appendChild(contactDiv);
    });
  }

  // Fermeture du modal
  header.querySelector("button").onclick = () => container.remove();
  container.addEventListener("click", (e) => {
    if (e.target === container) container.remove();
  });

  return container;
}
