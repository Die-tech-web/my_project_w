import { createElement } from "../utils.js";
import { createAvatar } from "./avatar.js";
import { personalContactsService } from "../services/personalContactsService.js";

export async function updateContactsList(forceRefresh = false) {
  const contactsContainer = document.querySelector(".contacts-list");
  if (!contactsContainer) return;

  const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
  if (!currentUser?.id) {
    contactsContainer.innerHTML =
      '<div class="text-center py-4 text-gray-400">Veuillez vous connecter</div>';
    return;
  }

  contactsContainer.innerHTML =
    '<div class="text-center py-4 text-white">Chargement...</div>';

  try {
    // Utiliser personalContactsService au lieu de getContacts
    const contacts = await personalContactsService.getMyContacts();
    contactsContainer.innerHTML = "";

    if (contacts.length === 0) {
      contactsContainer.innerHTML =
        '<div class="text-center py-4 text-gray-400">Aucun contact</div>';
      return;
    }

    // Afficher chaque contact personnel
    contacts.forEach((contact) => {
      const contactElement = createContactElement(contact);
      contactsContainer.appendChild(contactElement);
    });

    console.log(`${contacts.length} contacts personnels affichés`);
  } catch (error) {
    console.error("Erreur mise à jour liste contacts:", error);
    contactsContainer.innerHTML =
      '<div class="text-center py-4 text-red-400">Erreur de chargement</div>';
  }
}

function createContactElement(contact) {
  const contactDiv = createElement("div", {
    class: "flex items-center p-3 hover:bg-[#0A6847] cursor-pointer rounded-lg",
    onclick: (event) => {
      if (window.handleContactClick) {
        window.handleContactClick(contact, event);
      }
    },
  });

  const avatar = createAvatar(contact);

  const infoDiv = createElement("div", { class: "flex-1" });
  infoDiv.innerHTML = `
    <h3 class="font-medium text-white">${contact.name}</h3>
    <p class="text-sm text-gray-300">Dernière connexion récemment</p>
    <p class="text-xs text-gray-400">${contact.phone || ""}</p>
  `;

  const timeSpan = createElement(
    "span",
    {
      class: "text-xs text-gray-400",
    },
    "12:30"
  );

  contactDiv.append(avatar, infoDiv, timeSpan);
  return contactDiv;
}

// Écouter l'événement d'ajout de contact
document.addEventListener("contactAdded", () => {
  updateContactsList(true);
});

// Initialiser la liste des contacts
updateContactsList();
