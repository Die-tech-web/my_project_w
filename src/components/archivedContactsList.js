import { createElement } from "../utils.js";
import { archiveService } from "../services/archiveService.js";

export function createArchivedContactsList() {
  const container = createElement("div", {
    class: "archived-contacts-list p-4"
  });

  const handleContactClick = async (contact, event) => {
    if (event.ctrlKey) {
      console.log("Désarchivage du contact:", contact);
      const success = await archiveService.unarchiveContact(contact.id);
      if (success) {
        loadArchivedContacts(); // Recharger la liste
      }
    }
  };

  async function loadArchivedContacts() {
    const archivedContacts = await archiveService.getArchivedContacts();
    container.innerHTML = '';

    archivedContacts.forEach(archived => {
      const contact = archived.contactInfo;
      const contactElement = createElement("div", {
        class: "flex items-center p-3 hover:bg-[#1e3d59] cursor-pointer rounded-lg mb-2",
        onclick: (e) => handleContactClick(archived, e),
      });

      contactElement.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-[#4a90e2] flex items-center justify-center text-white mr-3">
          ${contact.name.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-white">${contact.name}</h3>
          <p class="text-sm text-gray-300">${contact.phone || ""}</p>
          <p class="text-xs text-gray-400">Ctrl+Clic pour désarchiver</p>
        </div>
      `;

      container.appendChild(contactElement);
    });
  }

  loadArchivedContacts();
  
  // Écouter les événements d'archivage/désarchivage
  document.addEventListener("contactArchived", loadArchivedContacts);
  document.addEventListener("contactUnarchived", loadArchivedContacts);

  return container;
}