import { createElement } from "../utils.js";
import { createAddContactModal } from "../components/addContact.js";
import { createChatView } from "../messages/chatView.js";

export function creerSectionDiscussions() {
  // Conteneur principal des discussions
  const container = createElement("div", {
    class:
      "flex flex-col h-full w-full bg-[#95D2B3 p-2 border-r border-gray-300", // Ajout de bordure droite
  });

  // En-tête de la section
  const header = createElement("div", {
    class: "flex items-center justify-between p-3 bg-[#95D2B3] rounded-lg mb-3",
  });

  // Partie gauche avec le titre "Discussions"
  const headerLeft = createElement("div", {
    class: "flex items-center",
  });

  const titre = createElement(
    "h2",
    {
      class: "text-white text-lg font-medium",
    },
    "Discussions"
  );

  // Partie droite avec les icônes
  const headerRight = createElement("div", {
    class: "flex items-center space-x-3",
  });

  // Icônes d'action
  const icons = [
    { icon: "fa-regular fa-comment", action: () => {} },
    { icon: "fa-solid fa-archive", action: () => {} }, // Icône d'archivage
    { icon: "fa-solid fa-ellipsis-vertical", action: () => {} }, // Menu 3 points
  ];

  icons.forEach(({ icon, action }) => {
    const iconButton = createElement("button", {
      class:
        "text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200",
      onclick: action,
    });

    const iconElement = createElement("i", {
      class: `${icon} text-xl`,
    });

    iconButton.appendChild(iconElement);
    headerRight.appendChild(iconButton);
  });

  // Ajouter le bouton d'ajout de contact dans headerRight
  const addContactButton = createElement("button", {
    class:
      "text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200",
    onclick: () => {
      document.body.appendChild(createAddContactModal());
    },
  });

  const addContactIcon = createElement("i", {
    class: "fa-solid fa-user-plus text-xl",
  });

  addContactButton.appendChild(addContactIcon);
  headerRight.appendChild(addContactButton);

  headerLeft.appendChild(titre);
  header.appendChild(headerLeft);
  header.appendChild(headerRight);

  // Barre de recherche
  const searchBar = createElement("div", {
    class: "px-3 py-2",
  });

  const searchInput = createElement("input", {
    type: "text",
    placeholder: "Rechercher une discussion...",
    class:
      "w-full bg-white text-gray-800 placeholder-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#95D2B3] border border-gray-300", // Fond blanc avec bordure
  });

  // Liste des discussions
  const chatList = createElement("div", {
    class: "flex-1 overflow-y-auto",
  });

  // Écouter les mises à jour de l'ordre des contacts
  window.addEventListener("contactOrderUpdated", () => {
    loadContacts();
  });

  async function loadContacts() {
    try {
      const [contactsResponse, groupsResponse] = await Promise.all([
        fetch("http://localhost:3000/users"),
        fetch("http://localhost:3000/groups"),
      ]);

      const contacts = await contactsResponse.json();
      const groups = await groupsResponse.json();

      chatList.innerHTML = "";

      // Trier les contacts par ordre décroissant de lastSeen
      const sortedContacts = contacts.sort((a, b) => {
        return new Date(b.lastSeen) - new Date(a.lastSeen);
      });

      // Afficher les contacts
      sortedContacts.forEach((contact) => {
        const [firstName = "", lastName = ""] = contact.name.split(" ");
        const initials = `${firstName[0] || ""}${
          lastName[0] || ""
        }`.toUpperCase();

        const chatItem = createElement("div", {
          class:
            "flex items-center p-3 rounded-lg cursor-pointer mb-1 hover:bg-gray-100",
          onclick: () => {
            const mainContent = document.querySelector("#main-content");
            if (mainContent) {
              mainContent.innerHTML = "";
              const chatView = createChatView({
                id: contact.id,
                name: contact.name,
                type: "contact",
                phone: contact.phone,
              });
              mainContent.appendChild(chatView);
            }
          },
        });

        chatItem.innerHTML = `
          <div class="w-12 h-12 bg-[#95D2B3] rounded-full flex items-center justify-center text-white font-medium text-lg">
            ${initials}
          </div>
          <div class="ml-4 flex flex-col">
            <div class="text-gray-800 font-medium">${contact.name}</div>
            <div class="text-gray-500 text-sm">${contact.phone}</div>
          </div>
        `;

        chatList.appendChild(chatItem); // Utiliser appendChild au lieu de insertBefore
      });

      // Afficher les groupes après les contacts
      groups.forEach((group) => {
        const chatItem = createElement("div", {
          class:
            "flex items-center p-3 rounded-lg cursor-pointer mb-1 hover:bg-gray-100",
          onclick: () => {
            const mainContent = document.querySelector("#main-content");
            if (mainContent) {
              mainContent.innerHTML = "";
              const chatView = createChatView({
                id: group.id,
                name: group.name,
                type: "group",
                members: group.members,
              });
              mainContent.appendChild(chatView);
            }
          },
        });

        const firstLetter = group.name.charAt(0).toUpperCase();

        chatItem.innerHTML = `
          <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
            ${firstLetter}
          </div>
          <div class="ml-4 flex flex-col">
            <div class="text-gray-800 font-medium">${group.name}</div>
            <div class="text-gray-500 text-sm">${group.members.length} participants • Groupe</div>
          </div>
        `;

        chatList.appendChild(chatItem); // Utiliser appendChild au lieu de insertBefore
      });
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  loadContacts();

  window.addEventListener("contactAdded", loadContacts);

  searchBar.appendChild(searchInput);
  container.appendChild(header);
  container.appendChild(searchBar);
  container.appendChild(chatList);

  return container;
}

export function updateDiscussions() {
  const chatList = document.querySelector(
    ".section-discussions > div > div:last-child"
  );
  if (!chatList) return;

  fetch("http://localhost:3000/groups")
    .then((res) => res.json())
    .then((groups) => {
      chatList.innerHTML = "";

      groups.forEach((group) => {
        const chatItem = createElement("div", {
          class: "flex items-center p-3 hover:bg-gray-100 cursor-pointer",
        });

        const firstLetter = group.name.charAt(0).toUpperCase();

        chatItem.innerHTML = `
          <div class="w-12 h-12 bg-[#95D2B3] rounded-full flex items-center justify-center text-white font-medium">
            ${firstLetter}
          </div>
          <div class="ml-4 flex flex-col">
            <div class="font-medium text-gray-900">${group.name}</div>
            <div class="text-sm text-gray-500">
              ${group.members.length} participants
            </div>
          </div>
        `;

        chatList.appendChild(chatItem);
      });
    });
}

window.addEventListener("groupCreated", updateDiscussions);
