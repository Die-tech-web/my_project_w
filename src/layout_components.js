import { createElement } from "./utils.js";
import { createGroupModal } from "./components/createGroup.js";
import { updateDiscussions } from "./sections/discussions.js";
import { createUserProfileModal } from "./components/userProfile.js";

export function creerSidebar() {
  const icones = [
    { icon: "fa-file-lines", badge: "118" },
    {
      icon: "fa-trash",
      action: () => {
        const currentlySelected = document.querySelector(".selected-item");
        if (currentlySelected) {
          const itemType = currentlySelected.dataset.type; // 'contact' ou 'group'
          const itemId = currentlySelected.dataset.id;

          const modal = createDeleteConfirmationModal(
            itemType,
            { id: itemId },
            async () => {
              if (itemType === "contact") {
                await deleteContact(itemId);
              } else if (itemType === "group") {
                await deleteGroup(itemId);
              }
            }
          );

          document.body.appendChild(modal);
        } else {
          showNotification(
            "Veuillez sélectionner un contact ou un groupe",
            "info"
          );
        }
      },
    },
    {
      icon: "fa-users",
      action: () => {
        document.querySelector(".section-discussions")?.classList.add("hidden");
        document
          .querySelector(".section-diffusion")
          ?.classList.remove("hidden");
        updateDiffusionGroups();
      },
    },
    {
      icon: "fa-plus",
      action: () => {
        const container = createElement("div", {
          class:
            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
          id: "groupContainer",
        });

        const modal = createGroupModal();

        modal
          .querySelector("#groupForm")
          .addEventListener("submit", async (e) => {
            e.preventDefault();
            if (response.ok) {
              updateDiscussions();
              container.remove();

              const successMessage = createElement(
                "div",
                {
                  class:
                    "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50",
                },
                "Groupe créé avec succès"
              );

              document.body.appendChild(successMessage);
              setTimeout(() => successMessage.remove(), 3000);
            }
          });

        container.appendChild(modal);
        document.body.appendChild(container);

        container.addEventListener("click", (e) => {
          if (e.target === container) {
            container.remove();
          }
        });
      },
    },
  ];

  const container = createElement("div", {
    class: "flex flex-col justify-between text-white h-full w-16",
    style: { backgroundColor: "#012a4a" },
  });

  const topIcons = createElement("div", {
    class: "flex flex-col gap-6 items-center",
  });

  icones.forEach(({ icon, badge, action }) => {
    const wrapper = createElement("div", {
      class: "relative cursor-pointer",
      onclick: action,
    });

    const iconEl = createElement("i", {
      class: `fa-solid ${icon} text-xl mt-2`,
    });

    wrapper.appendChild(iconEl);

    if (badge) {
      const badgeEl = createElement(
        "span",
        {
          class:
            "absolute -top-2 -right-2 text-xs bg-teal-500 rounded-full px-1 mt-3",
        },
        badge
      );
      wrapper.appendChild(badgeEl);
    }

    topIcons.appendChild(wrapper);
  });

  const bottomIcons = createElement("div", {
    class: "flex flex-col gap-6 items-center",
  });

  const settingsIcon = createElement("i", {
    class: "fa-solid fa-gear text-lg",
  });
  const userIcon = createElement("i", {
    class: "fa-solid fa-user text-lg cursor-pointer",
    onclick: () => {
      const profileModal = createUserProfileModal();
      if (profileModal) document.body.appendChild(profileModal);
    },
  });

  bottomIcons.appendChild(settingsIcon);
  bottomIcons.appendChild(userIcon);

  const logoutBtn = createElement("button", {
    class:
      "text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200",
    onclick: () => {
      localStorage.removeItem("whatsappUser");
      window.location.reload();
    },
  });

  const logoutIcon = createElement("i", {
    class: "fa-solid fa-sign-out-alt text-xl",
  });

  logoutBtn.appendChild(logoutIcon);
  bottomIcons.appendChild(logoutBtn);

  container.appendChild(topIcons);
  container.appendChild(bottomIcons);

  return container;
}

window.addEventListener("groupCreated", () => {
  updateGroupsList();
});
