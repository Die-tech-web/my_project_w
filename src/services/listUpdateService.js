import { API_ENDPOINTS } from "../config.js";
import { createElement } from "../utils.js";

class ListUpdateService {
  constructor() {
    this.observers = new Map();
    this.contactsCache = [];
  }

  subscribe(listType, callback) {
    if (!this.observers.has(listType)) {
      this.observers.set(listType, []);
    }
    this.observers.get(listType).push(callback);
    console.log(
      `✅ Observer ajouté pour ${listType}, total: ${
        this.observers.get(listType).length
      }`
    );
  }

  unsubscribe(listType, callback) {
    if (this.observers.has(listType)) {
      const callbacks = this.observers.get(listType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notifier les observateurs
  notify(listType, data) {
    console.log(`🔔 Notification ${listType} avec ${data.length} éléments`);
    if (this.observers.has(listType)) {
      this.observers.get(listType).forEach((callback, index) => {
        try {
          console.log(`📞 Appel callback ${index} pour ${listType}`);
          callback(data);
        } catch (error) {
          console.error(`❌ Erreur callback ${listType}:`, error);
        }
      });
    }
  }

  // Mettre à jour la liste des contacts
  async updateContacts() {
    try {
      console.log("🔄 Récupération contacts depuis API...");
      const response = await fetch(API_ENDPOINTS.USERS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contacts = await response.json();

      this.contactsCache = contacts;
      console.log(`📦 ${contacts.length} contacts récupérés`);

      // Notifier tous les observateurs
      this.notify("contacts", contacts);
      this.notify("diffusion-contacts", contacts);

      return contacts;
    } catch (error) {
      console.error("❌ Erreur mise à jour contacts:", error);
      showNotification("Erreur lors de la mise à jour des contacts", "error");
      return this.contactsCache;
    }
  }

  // Ajouter un nouveau contact et notifier
  async addContact(contactData) {
    try {
      console.log("➕ Ajout contact:", contactData);

      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const newContact = await response.json();
      console.log("✅ Contact ajouté:", newContact);

      // Ajouter au cache local immédiatement
      this.contactsCache.push(newContact);

      // Notifier immédiatement
      console.log("🔔 Notification immédiate après ajout");
      this.notify("contacts", [...this.contactsCache]);
      this.notify("diffusion-contacts", [...this.contactsCache]);

      return newContact;
    } catch (error) {
      console.error("❌ Erreur ajout contact:", error);
      throw error;
    }
  }

  // Mettre à jour la liste des groupes
  async updateGroups() {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const groups = await response.json();

      this.notify("groups", groups);
      this.notify("discussion-groups", groups);

      return groups;
    } catch (error) {
      console.error("Erreur mise à jour groupes:", error);
      return [];
    }
  }

  // Initialiser les observateurs pour les listes existantes
  initializeObservers() {
    // Observer pour la liste des contacts
    this.subscribe("contacts", (contacts) => {
      console.log(
        "Observer contacts appelé avec:",
        contacts.length,
        "contacts"
      ); // Debug
    });

    // Observer pour les contacts de diffusion
    this.subscribe("diffusion-contacts", (contacts) => {
      console.log(
        "Observer diffusion appelé avec:",
        contacts.length,
        "contacts"
      ); // Debug
    });

    // Observer pour les groupes
    this.subscribe("groups", (groups) => {
      this.renderGroupsList(groups);
    });

    // Observer pour les groupes dans discussions
    this.subscribe("discussion-groups", (groups) => {
      this.renderDiscussionGroups(groups);
    });
  }

  // Rendu de la liste des contacts
  renderContactsList(contacts) {
    const contactsList = document.querySelector(".contacts-list");
    if (!contactsList) return;

    contactsList.innerHTML = "";

    contacts.forEach((contact) => {
      const contactElement = createElement("div", {
        class:
          "flex items-center p-3 hover:bg-[#0A6847] cursor-pointer rounded-lg",
        onclick: () => {
          if (window.handleContactClick) {
            window.handleContactClick(contact);
          }
        },
      });

      contactElement.innerHTML = `
        <div class="w-10 h-10 bg-[#95D2B3] rounded-full flex items-center justify-center text-white mr-3">
          ${contact.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 class="font-medium text-white">${contact.name}</h3>
          <p class="text-sm text-gray-300">${contact.phone}</p>
        </div>
      `;

      contactsList.appendChild(contactElement);
    });
  }

  // Rendu des contacts de diffusion
  renderDiffusionContacts(contacts) {
    const diffusionContactsList = document.querySelector(
      ".diffusion-contacts-list"
    );
    if (!diffusionContactsList) return;

    diffusionContactsList.innerHTML = "";

    contacts.forEach((contact) => {
      const contactElement = createElement("div", {
        class:
          "flex items-center p-2 hover:bg-[#0A6847] cursor-pointer rounded-lg",
      });

      contactElement.innerHTML = `
        <div class="w-8 h-8 bg-[#95D2B3] rounded-full flex items-center justify-center text-white mr-3 text-sm">
          ${contact.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 class="text-sm font-medium text-white">${contact.name}</h4>
          <p class="text-xs text-gray-300">${contact.phone}</p>
        </div>
      `;

      diffusionContactsList.appendChild(contactElement);
    });
  }

  // Rendu de la liste des groupes
  renderGroupsList(groups) {
    const groupsList = document.querySelector(".groups-list");
    if (!groupsList) return;

    groupsList.innerHTML = "";

    if (groups.length === 0) {
      groupsList.innerHTML =
        '<p class="text-white text-center py-4">Aucun groupe</p>';
      return;
    }

    groups.forEach((group) => {
      const groupElement = createElement("div", {
        class:
          "flex flex-col p-3 mb-2 rounded-lg hover:bg-[#0A6847] cursor-pointer",
        onclick: () => {
          if (window.handleGroupClick) {
            window.handleGroupClick(group);
          }
        },
      });

      groupElement.innerHTML = `
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-[#95D2B3] rounded-full flex items-center justify-center text-white">
              <i class="fas fa-users"></i>
            </div>
            <div>
              <h3 class="font-medium text-white">${group.name}</h3>
              <p class="text-sm text-gray-300">${
                group.members ? group.members.length : 0
              } participants</p>
            </div>
          </div>
        </div>
      `;

      groupsList.appendChild(groupElement);
    });
  }

  // Rendu des groupes dans discussions
  renderDiscussionGroups(groups) {
    const discussionsSection = document.querySelector(".section-discussions");
    if (!discussionsSection) return;

    let groupsInDiscussions = discussionsSection.querySelector(
      ".groups-in-discussions"
    );
    if (!groupsInDiscussions) {
      groupsInDiscussions = createElement("div", {
        class: "groups-in-discussions mt-4",
      });

      const groupsTitle = createElement(
        "h4",
        {
          class: "text-white text-sm font-medium mb-2 px-3",
        },
        "Groupes"
      );

      discussionsSection.appendChild(groupsTitle);
      discussionsSection.appendChild(groupsInDiscussions);
    }

    groupsInDiscussions.innerHTML = "";

    groups.forEach((group) => {
      const groupElement = createElement("div", {
        class:
          "flex items-center p-3 hover:bg-[#0A6847] cursor-pointer rounded-lg",
        onclick: () => {
          if (window.handleGroupClick) {
            window.handleGroupClick(group);
          }
        },
      });

      groupElement.innerHTML = `
        <div class="w-10 h-10 bg-[#95D2B3] rounded-full flex items-center justify-center text-white mr-3">
          <i class="fas fa-users"></i>
        </div>
        <div>
          <h3 class="font-medium text-white">${group.name}</h3>
          <p class="text-sm text-gray-300">${
            group.members ? group.members.length : 0
          } participants</p>
        </div>
      `;

      groupsInDiscussions.appendChild(groupElement);
    });
  }
}

// Instance globale
export const listUpdateService = new ListUpdateService();

// Fonctions globales pour compatibilité
window.updateContactsList = () => listUpdateService.updateContacts();
window.updateGroupsList = () => listUpdateService.updateGroups();
window.refreshContacts = () => listUpdateService.updateContacts();
window.refreshGroups = () => listUpdateService.updateGroups();
