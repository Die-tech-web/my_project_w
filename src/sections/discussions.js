import { API_ENDPOINTS } from "../config.js";
import { createElement } from "../utils.js";
import { createAddContactModal } from "../components/addContact.js";
import { createStatusModal } from "../components/createStatus.js";
import { viewUserStatus } from "../components/statusViewer.js";
import { viewMyStatus } from "../components/myStatusViewer.js";
import { createChatView } from "../messages/chatView.js";
import { listUpdateService } from "../services/listUpdateService.js";
import { showNotification } from "../components/notifications.js";
import { deleteContact } from "../services/deleteService.js";
import { archiveService } from "../services/archiveService.js";
import { createArchivedContactsList } from "../components/archivedContactsList.js";

let discussionsContainer = null;

export function creerSectionDiscussions() {
  const container = createElement("div", {
    class:
      "flex flex-col h-full w-full bg-[#457b9d] p-2 border-r border-gray-300",
  });

  const header = createElement("div", {
    class: "flex items-center justify-between p-3 bg-[#457b9d] rounded-lg mb-3",
  });

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

  // Dans la fonction creerSectionDiscussions, après la création du header
  const icons = [
    { icon: "fa-regular fa-comment", action: () => {} },
    {
      icon: "fa-solid fa-archive",
      action: async () => {
        const archivedListModal = await createArchivedContactsList();
        document.body.appendChild(archivedListModal);
      },
    },
    { icon: "fa-solid fa-ellipsis-vertical", action: () => {} },
  ];

  const headerRight = createElement("div", {
    class: "flex items-center gap-4",
  });

  icons.forEach(({ icon, action }) => {
    const button = createElement("button", {
      class:
        "text-white hover:bg-[#0A6847] p-2 rounded-full transition-colors duration-200",
      onclick: action,
    });
    button.innerHTML = `<i class="${icon}"></i>`;
    headerRight.appendChild(button);
  });

  header.appendChild(headerRight);

  // Bouton statut
  const statusButton = createElement("button", {
    class:
      "text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200",
    title: "Ajouter un statut",
    onclick: () => {
      const statusModal = createStatusModal();
      if (statusModal) {
        document.body.appendChild(statusModal);
      }
    },
  });

  const statusIcon = createElement("i", {
    class: "fa-solid fa-circle-plus text-xl",
  });

  statusButton.appendChild(statusIcon);
  headerRight.appendChild(statusButton);

  // Bouton ajouter contact
  const addContactButton = createElement("button", {
    class:
      "text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200",
    title: "Ajouter un contact",
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
  header.append(headerLeft, headerRight);

  // Barre de recherche
  const searchContainer = createElement("div", {
    class: "px-3 py-2",
  });

  const searchInput = createElement("input", {
    type: "text",
    placeholder: "Rechercher ou commencer une nouvelle discussion",
    class:
      "w-full bg-white text-gray-800 placeholder-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#22333b] border border-gray-300",
  });

  searchContainer.appendChild(searchInput);

  // Section statuts
  const statusSection = createElement("div", {
    class: "px-3 py-2",
    id: "status-section",
  });

  const statusTitle = createElement(
    "h3",
    {
      class: "text-white text-sm font-medium mb-2",
    },
    "Statuts"
  );

  const statusList = createElement("div", {
    class: "flex gap-3 overflow-x-auto pb-2",
    id: "status-list",
  });

  const myStatusContainer = createElement("div", {
    class: "flex-shrink-0 cursor-pointer",
    onclick: () => viewMyStatus(),
  });

  const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
  const userInitial = currentUser
    ? (currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`)
        .charAt(0)
        .toUpperCase()
    : "U";

  myStatusContainer.innerHTML = `
    <div class="flex flex-col items-center">
      <div class="relative">
        <div class="w-12 h-12 bg-[#0A6847] rounded-full flex items-center justify-center text-white font-medium border-2 border-white">
          ${userInitial}
        </div>
        <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2c7da0] rounded-full flex items-center justify-center border-2 border-white">
          <i class="fas fa-plus text-xs text-white"></i>
        </div>
      </div>
      <span class="text-white text-xs mt-1">Mon statut</span>
    </div>
  `;

  statusList.appendChild(myStatusContainer);
  statusSection.append(statusTitle, statusList);

  // Liste des discussions (contacts + groupes)
  const discussionsList = createElement("div", {
    class: "flex-1 overflow-y-auto px-3 space-y-2",
    id: "discussions-list",
  });

  discussionsContainer = discussionsList;

  // Fonction pour charger contacts et groupes
  async function loadDiscussions() {
    try {
      const [contactsResponse, groupsResponse, archivesResponse] =
        await Promise.all([
          fetch(API_ENDPOINTS.USERS),
          fetch(API_ENDPOINTS.GROUPS),
          fetch(API_ENDPOINTS.ARCHIVES),
        ]);

      const contacts = await contactsResponse.json();
      const groups = await groupsResponse.json();
      const archives = await archivesResponse.json();

      // Récupérer les IDs des contacts archivés
      const archivedContactIds = archives
        .filter((a) => a.itemType === "contact")
        .map((a) => a.itemId);

      // Filtrer les contacts non archivés
      const activeContacts = contacts.filter(
        (contact) => !archivedContactIds.includes(contact.id)
      );

      const discussionsList = document.querySelector("#discussions-list");
      if (!discussionsList) return;

      discussionsList.innerHTML = "";

      // Trier les contacts
      const sortedContacts = activeContacts.sort(
        (a, b) => new Date(b.lastSeen || 0) - new Date(a.lastSeen || 0)
      );

      // Afficher les contacts
      sortedContacts.forEach((contact) => {
        const discussionElement = createElement("div", {
          class:
            "flex items-center p-3 hover:bg-[#33415c] rounded-lg cursor-pointer transition-colors duration-200 relative group",
          onclick: (event) => {
            if (!event.target.closest(".delete-btn")) {
              handleContactClick(contact, event);
            }
          },
        });

        const avatar = createElement(
          "div",
          {
            class:
              "w-12 h-12 bg-[#90D1CA] rounded-full flex items-center justify-center text-white font-medium mr-3",
          },
          contact.name.charAt(0).toUpperCase()
        );

        const info = createElement("div", { class: "flex-1" });
        info.innerHTML = `
          <h3 class="font-medium text-white">${contact.name}</h3>
          <p class="text-sm text-white/80">${contact.phone}</p>
        `;

        const timeAndDelete = createElement("div", {
          class: "flex items-center gap-2",
        });

        const time = createElement(
          "div",
          { class: "text-xs text-white/60" },
          "12:30"
        );

        // Bouton de suppression
        const deleteButton = createElement("button", {
          class:
            "delete-btn opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-[#ffffff1a] transition-all duration-200",
          onclick: async (e) => {
            e.stopPropagation();
            try {
              const response = await fetch(
                `${API_ENDPOINTS.USERS}/${contact.id}`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok) {
                discussionElement.remove();
                showNotification("Contact supprimé avec succès", "success");
                document.dispatchEvent(new CustomEvent("updateDiffusion"));
              }
            } catch (error) {
              console.error("Erreur suppression:", error);
              showNotification("Erreur lors de la suppression", "error");
            }
          },
        });

        deleteButton.innerHTML = '<i class="fas fa-trash-alt text-sm"></i>';

        timeAndDelete.append(time, deleteButton);
        discussionElement.append(avatar, info, timeAndDelete);
        discussionsList.appendChild(discussionElement);
      });

      groups.forEach((group) => {
        const discussionElement = createElement("div", {
          class:
            "flex items-center p-3 hover:bg-[#90D1CA] rounded-lg cursor-pointer transition-colors duration-200",
          onclick: () => handleGroupClick(group),
        });

        const avatar = createElement(
          "div",
          {
            class:
              "w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium mr-3",
          },
          group.name.charAt(0).toUpperCase()
        );

        const info = createElement("div", { class: "flex-1" });
        info.innerHTML = `
          <h3 class="font-medium text-white">${group.name}</h3>
          <p class="text-sm text-white/80">${
            group.members?.length || 0
          } participants • Groupe</p>
        `;

        const time = createElement(
          "div",
          { class: "text-xs text-white/60" },
          "12:30"
        );

        discussionElement.append(avatar, info, time);
        discussionsList.appendChild(discussionElement);
      });
    } catch (error) {
      console.error("Erreur chargement discussions:", error);
    }
  }

  function handleContactClick(contact, event) {
    if (event && event.ctrlKey) {
      console.log("Tentative d'archivage du contact:", contact.id); // Pour le debug
      archiveService.archiveContact(contact.id);
      return;
    }

    // Code existant pour ouvrir le chat
    document
      .querySelectorAll(".selected-item")
      .forEach((el) => el.classList.remove("selected-item"));

    event.currentTarget.classList.add("selected-item");
    event.currentTarget.dataset.type = "contact";
    event.currentTarget.dataset.id = contact.id;

    const mainContent = document.querySelector("#main-content");
    if (mainContent) {
      mainContent.innerHTML = "";
      const chatView = createChatView(contact);
      mainContent.appendChild(chatView);
    }
  }

  function handleGroupClick(group) {
    document
      .querySelectorAll(".selected-item")
      .forEach((el) => el.classList.remove("selected-item"));

    event.currentTarget.classList.add("selected-item");
    event.currentTarget.dataset.type = "group";
    event.currentTarget.dataset.id = group.id;

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
  }

  // Fonction pour charger les statuts
  async function loadStatus() {
    try {
      const response = await fetch(
        "https://base-donnee-js.onrender.com/status"
      );
      const allStatus = await response.json();

      const activeStatus = allStatus.filter((status) => {
        const expiresAt = new Date(status.expiresAt);
        return expiresAt > new Date();
      });

      const statusByUser = {};
      activeStatus.forEach((status) => {
        if (!statusByUser[status.userId]) {
          statusByUser[status.userId] = [];
        }
        statusByUser[status.userId].push(status);
      });

      const existingStatus = statusList.querySelectorAll(".user-status");
      existingStatus.forEach((element) => element.remove());

      Object.entries(statusByUser).forEach(([userId, userStatus]) => {
        if (parseInt(userId) !== currentUser?.id) {
          const latestStatus = userStatus[0];
          const hasUnviewed = userStatus.some(
            (s) => !s.views?.includes(currentUser?.id)
          );

          const statusElement = createElement("div", {
            class: "flex-shrink-0 cursor-pointer user-status",
            onclick: () =>
              viewUserStatus(parseInt(userId), latestStatus.userName),
          });

          statusElement.innerHTML = `
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 bg-[#0A6847] rounded-full flex items-center justify-center text-white font-medium border-2 ${
                hasUnviewed ? "border-[#25D366]" : "border-gray-400"
              }">
                ${latestStatus.userName.charAt(0).toUpperCase()}
              </div>
              <span class="text-white text-xs mt-1 max-w-16 truncate">${
                latestStatus.userName
              }</span>
            </div>
          `;

          statusList.appendChild(statusElement);
        }
      });
    } catch (error) {
      console.error("Erreur chargement statuts:", error);
    }
  }

  listUpdateService.subscribe("contacts", () => {
    loadDiscussions();
  });

  loadDiscussions();
  loadStatus();

  window.addEventListener("contactAdded", loadDiscussions);
  window.addEventListener("groupCreated", loadDiscussions);
  window.addEventListener("statusUpdated", loadStatus);
  window.addEventListener("contactDeleted", () => {
    loadDiscussions();

    document.dispatchEvent(new CustomEvent("updateDiffusion"));
  });

  document.addEventListener("contactUnarchived", () => {
    loadDiscussions(); // Recharge la liste des discussions
  });

  document.addEventListener("contactArchived", () => {
    loadDiscussions(); // Recharge la liste des discussions
  });

  container.append(header, searchContainer, statusSection, discussionsList);
  return container;
}

export function updateDiscussions() {
  const discussionsContainer = document.querySelector(".section-discussions");
  if (discussionsContainer) {
    const event = new CustomEvent("refreshDiscussions");
    discussionsContainer.dispatchEvent(event);
  }
}

document.addEventListener("contactAdded", () => {
  loadDiscussions();
});

document.addEventListener("contactDeleted", () => {
  loadDiscussions();
  document.dispatchEvent(new CustomEvent("updateDiffusion"));
});

document.dispatchEvent(new CustomEvent("contactAdded"));
