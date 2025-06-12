import { createElement } from "../utils.js";
import { getContacts, clearContactsCache } from "../services/contactService.js";
import { createAvatar } from "./avatar.js";

export async function updateContactsList(forceRefresh = false) {
  const contactsContainer = document.querySelector(".contacts-list");
  if (!contactsContainer) return;

  // Afficher un indicateur de chargement
  contactsContainer.innerHTML = '<div class="text-center py-4 text-white">Chargement...</div>';

  try {
    // Récupérer les contacts (avec option de forcer le refresh)
    const contacts = await getContacts(forceRefresh);
    
    // Vider le conteneur
    contactsContainer.innerHTML = "";
    
    if (contacts.length === 0) {
      contactsContainer.innerHTML = '<div class="text-center py-4 text-gray-400">Aucun contact</div>';
      return;
    }

    // Afficher chaque contact
    contacts.forEach(contact => {
      const contactElement = createContactElement(contact);
      contactsContainer.appendChild(contactElement);
    });
    
    console.log(`${contacts.length} contacts affichés`);
    
  } catch (error) {
    console.error("Erreur mise à jour liste contacts:", error);
    contactsContainer.innerHTML = '<div class="text-center py-4 text-red-400">Erreur de chargement</div>';
  }
}

function createContactElement(contact) {
  const contactDiv = createElement("div", {
    class: "flex items-center p-3 hover:bg-[#0A6847] cursor-pointer rounded-lg",
    onclick: () => {
      if (window.ouvrirChat) {
        window.ouvrirChat(contact);
      }
    }
  });

  const avatar = createAvatar(contact);
  
  const infoDiv = createElement("div", { class: "flex-1" });
  infoDiv.innerHTML = `
    <h3 class="font-medium text-white">${contact.name}</h3>
    <p class="text-sm text-gray-300">Dernière connexion récemment</p>
    <p class="text-xs text-gray-400">${contact.phone || ''}</p>
  `;

  const timeSpan = createElement("span", {
    class: "text-xs text-gray-400"
  }, "12:30");

  contactDiv.append(avatar, infoDiv, timeSpan);
  return contactDiv;
}

// Fonction pour forcer le refresh
export function forceRefreshContacts() {
  clearContactsCache();
  updateContactsList(true);

}

// Script pour vider la base sur le serveur
async function clearAllUsers() {
  try {
    // Récupérer tous les utilisateurs
    const response = await fetch("https://base-donnee-js.onrender.com/users");
    const users = await response.json();
    
    console.log(`Suppression de ${users.length} utilisateurs...`);
    
    // Supprimer chaque utilisateur
    for (const user of users) {
      if (user.id !== "1" && user.id !== "2") { // Garder seulement Die Niang et bibina niang
        await fetch(`https://base-donnee-js.onrender.com/users/${user.id}`, {
          method: 'DELETE'
        });
        console.log(`Supprimé: ${user.name}`);
      }
    }
    
    console.log("✅ Nettoyage terminé");
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Exécuter le nettoyage
clearAllUsers();