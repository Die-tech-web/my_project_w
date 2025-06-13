import { createElement } from "./utils.js";
import { creerSidebar } from "./layout_components.js";
import { creerSectionDiscussions } from "./sections/discussions.js";
import { creerSectionDiffusion } from "./sections/diffusion.js";

export function creerInterface() {
  const container = createElement("div", {
    class: "fixed inset-0 flex items-center justify-center p-4",
  });

  const whiteContainer = createElement("div", {
    class: "bg-white w-full h-[95vh] rounded-xl shadow-2xl flex p-2",
  });

  const sidebarContainer = createElement("div", {
    class: "h-full",
  });

  sidebarContainer.appendChild(creerSidebar());
  whiteContainer.appendChild(sidebarContainer);

  const discussionsContainer = createElement("div", {
    class: "h-full w-[380px] section-discussions",
    style: { backgroundColor: "#012a4a" },
  });
  discussionsContainer.appendChild(creerSectionDiscussions());
  whiteContainer.appendChild(discussionsContainer);

  const diffusionContainer = createElement("div", {
    class: "h-full w-[380px] section-diffusion hidden",
    style: { backgroundColor: "#012a4a" },
  });
  diffusionContainer.appendChild(creerSectionDiffusion());
  whiteContainer.appendChild(diffusionContainer);

  const mainContent = createElement("div", {
    id: "main-content", // Ajout de l'ID manquant
    class: "flex-1",
    style: { backgroundColor: "#012a4a" },
  });
  whiteContainer.appendChild(mainContent);

  container.appendChild(whiteContainer);
  return container;
}

// Écouter l'événement de connexion
window.addEventListener("userConnected", (event) => {
  const user = event.detail;

  // Mettre à jour l'avatar dans l'en-tête
  const headerAvatar = document.querySelector(".header-avatar");
  if (headerAvatar) {
    headerAvatar.textContent = user.initials;
  }

  // Sauvegarder l'utilisateur connecté
  localStorage.setItem("whatsappUser", JSON.stringify(user));
});
