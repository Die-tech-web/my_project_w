import { createElement } from "../utils.js";
import { API_ENDPOINTS } from "../config.js"; // Ajout de l'import manquant

export function creerSectionDiffusion() {
  const container = createElement("div", {
    class: "h-full flex flex-col",
    style: { backgroundColor: "[95D2B3 p-2 border-r border-gray-300" },
  });

  const header = createElement("div", {
    class: "px-4 py-3 flex items-center justify-between",
  });

  const titre = createElement(
    "h2",
    {
      class: "text-white font-medium",
    },
    "Diffusion"
  );

  const selectAllBtn = createElement(
    "button",
    {
      class:
        "text-white text-sm hover:bg-[#0A6847] px-3 py-1 rounded-full transition-colors duration-200",
      onclick: () => {
        const checkboxes = document.querySelectorAll(".contact-checkbox");
        const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
        checkboxes.forEach((cb) => (cb.checked = !allChecked));
      },
    },
    "Tout sélectionner"
  );

  header.appendChild(titre);
  header.appendChild(selectAllBtn);

  const searchBar = createElement("div", {
    class: "px-3 py-2",
    // La couleur est déjà héritée du container
  });

  const searchInput = createElement("input", {
    type: "text",
    placeholder: "Rechercher un contact...",
    class:
      "w-full bg-white text-gray-800 placeholder-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#95D2B3] border border-gray-300",
  });

  searchBar.appendChild(searchInput);

  // Liste des contacts
  const contactList = createElement("div", {
    class: "flex-1 overflow-y-auto p-3 space-y-2",
  });

  // Fonction pour charger les contacts depuis json-server
  async function loadContactsForDiffusion() {
    try {
      const [contactsResponse, archivesResponse] = await Promise.all([
        fetch(API_ENDPOINTS.USERS),
        fetch(API_ENDPOINTS.ARCHIVES),
      ]);

      if (!contactsResponse.ok || !archivesResponse.ok) {
        throw new Error("Erreur lors du chargement des données");
      }

      const contacts = await contactsResponse.json();
      const archives = await archivesResponse.json();

      // Filtrer les contacts archivés
      const archivedContactIds = archives
        .filter((a) => a.itemType === "contact")
        .map((a) => a.itemId);

      // Filtrer les contacts non archivés
      const activeContacts = contacts.filter(
        (contact) => !archivedContactIds.includes(contact.id)
      );

      contactList.innerHTML = "";

      activeContacts.forEach((contact) => {
        // Séparation du nom complet en prénom et nom
        const [firstName = "", lastName = ""] = contact.name.split(" ");
        const initials = `${firstName[0] || ""}${
          lastName[0] || ""
        }`.toUpperCase();

        const contactItem = createElement("div", {
          class:
            "contact-item flex items-center p-2 rounded-lg hover:bg-[#0A6847] group",
          "data-contact-id": contact.id,
        });

        const leftContainer = createElement("div", {
          class: "flex items-center space-x-3",
        });

        // Checkbox
        const checkbox = createElement("input", {
          type: "checkbox",
          class:
            "contact-checkbox w-4 h-4 rounded border-gray-300 text-[#0A6847] focus:ring-[#0A6847] cursor-pointer",
        });

        // Avatar
        const avatar = createElement("div", {
          class:
            "w-10 h-10 bg-[#0A6847] rounded-full flex items-center justify-center text-white font-medium",
        });
        avatar.textContent = initials;

        // Informations du contact
        const contactInfo = createElement("div", {
          class: "ml-3 flex flex-col justify-center",
        });

        const contactName = createElement("div", {
          class: "text-white font-medium group-hover:text-white",
        });
        contactName.textContent = contact.name;

        const contactPhone = createElement("div", {
          class: "text-white/60 text-sm group-hover:text-white/80",
        });
        contactPhone.textContent = contact.phone || "";

        // Assemblage
        leftContainer.append(checkbox, avatar);
        contactInfo.append(contactName, contactPhone);
        contactItem.append(leftContainer, contactInfo);
        contactList.appendChild(contactItem);
      });
    } catch (error) {
      console.error("Erreur chargement contacts diffusion:", error);
      contactList.innerHTML =
        '<p class="text-center text-white/60 p-4">Erreur de chargement</p>';
    }
  }

  // Bouton d'envoi avec couleur de fond héritée
  const bottomBar = createElement("div", {
    class: "p-3 border-t",
    // La couleur est déjà héritée du container
  });

  const sendButton = createElement(
    "button",
    {
      class:
        "w-full bg-[#0A6847] text-white py-2 rounded-lg hover:bg-[#085339] transition-colors duration-200",
      onclick: () => {
        const selectedContacts = Array.from(
          document.querySelectorAll(".contact-checkbox:checked")
        ).map(
          (checkbox) => checkbox.closest(".contact-item").dataset.contactId
        );
        console.log("Contacts sélectionnés:", selectedContacts);
      },
    },
    "Envoyer le message"
  );

  bottomBar.appendChild(sendButton);

  // Assemblage des éléments
  container.appendChild(header);
  container.appendChild(searchBar);
  container.appendChild(contactList);
  container.appendChild(bottomBar);

  // Ajouter les écouteurs d'événements pour les mises à jour automatiques
  document.addEventListener("contactAdded", loadContactsForDiffusion);
  document.addEventListener("contactArchived", loadContactsForDiffusion);
  document.addEventListener("contactUnarchived", loadContactsForDiffusion);

  // Charger les contacts initialement
  loadContactsForDiffusion();

  return container;
}

export function updateDiffusionGroups() {
  const diffusionSection = document.querySelector(".section-diffusion");
  if (!diffusionSection) return;

  // Créer le conteneur des groupes s'il n'existe pas
  let groupsContainer = diffusionSection.querySelector(".groups-container");
  if (!groupsContainer) {
    groupsContainer = createElement("div", {
      class: "groups-container space-y-2 p-4",
    });
    diffusionSection.appendChild(groupsContainer);
  }

  fetch("http://localhost:3000/groups")
    .then((res) => res.json())
    .then((groups) => {
      groupsContainer.innerHTML = `
        <h3 class="text-lg font-medium mb-4 text-gray-800">Vos groupes (${groups.length})</h3>
      `;

      groups.forEach((group) => {
        const groupItem = createElement("div", {
          class: "flex items-center p-3 bg-white rounded-lg hover:bg-gray-50",
        });

        groupItem.innerHTML = `
          <div class="w-10 h-10 bg-[#95D2B3] rounded-full flex items-center justify-center text-white">
            <i class="fas fa-users"></i>
          </div>
          <div class="ml-3 flex-1">
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-gray-800">${group.name}</h4>
              <span class="text-sm text-gray-500">${group.members.length} participants</span>
            </div>
          </div>
        `;

        groupsContainer.appendChild(groupItem);
      });
    });
}
