import { createElement } from "../utils.js";
import { showNotification } from "./notifications.js";
import { createStatusModal } from "./createStatus.js";

// Fonctions utilitaires pour gérer les statuts
function getAllStatuses() {
  try {
    return JSON.parse(localStorage.getItem("userStatuses") || "[]");
  } catch (error) {
    console.error("Erreur lecture statuts:", error);
    return [];
  }
}

function deleteStatus(statusId) {
  try {
    const statuses = getAllStatuses();
    const filteredStatuses = statuses.filter(status => status.id !== statusId);
    localStorage.setItem("userStatuses", JSON.stringify(filteredStatuses));
    return true;
  } catch (error) {
    console.error("Erreur suppression statut:", error);
    return false;
  }
}

export async function viewMyStatus() {
  const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
  if (!currentUser) {
    console.error("Utilisateur non connecté");
    if (typeof showNotification === 'function') {
      showNotification("Vous devez être connecté pour voir vos statuts", "error");
    }
    return;
  }

  try {
    const allStatuses = getAllStatuses();
    
    // Filtrer mes statuts uniquement
    const myStatuses = allStatuses.filter(status => status.userId === currentUser.id);
    
    if (myStatuses.length === 0) {
      showMyStatusOptions();
      return;
    }

    // Afficher les statuts avec options de gestion
    const viewer = createMyStatusViewer(myStatuses, currentUser);
    document.body.appendChild(viewer);
  } catch (error) {
    console.error("Erreur lors de l'affichage de mes statuts:", error);
    if (typeof showNotification === 'function') {
      showNotification("Erreur lors du chargement des statuts", "error");
    }
  }
}

function createMyStatusViewer(statusList, currentUser) {
  const overlay = createElement("div", {
    class: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center",
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const modal = createElement("div", {
    class: "bg-white rounded-xl w-full max-w-md mx-4 max-h-[85vh] overflow-hidden shadow-2xl",
  });

  modal.addEventListener("click", (e) => e.stopPropagation());

  // Header avec gradient
  const header = createElement("div", {
    class: "bg-gradient-to-r from-green-500 to-green-600 p-6 text-white",
  });

  const headerContent = createElement("div", {
    class: "flex items-center",
  });

  const avatar = createElement("div", {
    class: "w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white mr-4 text-lg font-bold",
  });
  avatar.textContent = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U";

  const userInfo = createElement("div", {
    class: "flex-1",
  });
  
  const title = createElement("h2", {
    class: "text-xl font-semibold",
  });
  title.textContent = "Mes statuts";

  const subtitle = createElement("p", {
    class: "text-white text-opacity-90 text-sm",
  });
  subtitle.textContent = `${statusList.length} statut${statusList.length > 1 ? 's' : ''}`;

  userInfo.append(title, subtitle);

  const closeButton = createElement("button", {
    class: "text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors ml-4",
  });
  closeButton.innerHTML = '<i class="fas fa-times text-lg"></i>';
  closeButton.addEventListener("click", () => overlay.remove());

  headerContent.append(avatar, userInfo, closeButton);
  header.appendChild(headerContent);

  // Content area
  const content = createElement("div", {
    class: "max-h-96 overflow-y-auto",
  });

  statusList.forEach((status, index) => {
    const statusItem = createElement("div", {
      class: "flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
    });

    // Preview du statut
    const preview = createElement("div", {
      class: "w-16 h-16 rounded-xl mr-4 flex items-center justify-center overflow-hidden shadow-md cursor-pointer",
    });

    try {
      if (status.type === "text") {
        preview.style.backgroundColor = status.backgroundColor || "#10b981";
        preview.className += " text-white font-bold text-sm";
        const previewText = status.content && status.content.length > 15 ? 
          status.content.substring(0, 15) + "..." : 
          status.content || "Texte";
        preview.textContent = previewText;
      } else if (status.type === "image") {
        const img = createElement("img", {
          class: "w-full h-full object-cover rounded-xl",
          src: status.content || "",
        });
        img.onerror = () => {
          preview.innerHTML = '<i class="fas fa-image text-gray-400 text-xl"></i>';
          preview.className = "w-16 h-16 rounded-xl mr-4 flex items-center justify-center shadow-md cursor-pointer bg-gray-100";
        };
        preview.appendChild(img);
      } else if (status.type === "video") {
        const video = createElement("video", {
          class: "w-full h-full object-cover rounded-xl",
          src: status.content || "",
        });
        video.onerror = () => {
          preview.innerHTML = '<i class="fas fa-video text-gray-400 text-xl"></i>';
          preview.className = "w-16 h-16 rounded-xl mr-4 flex items-center justify-center shadow-md cursor-pointer bg-gray-100";
        };
        preview.appendChild(video);
      }
    } catch (error) {
      console.error("Erreur création preview:", error);
      preview.innerHTML = '<i class="fas fa-exclamation-triangle text-gray-400 text-xl"></i>';
      preview.className = "w-16 h-16 rounded-xl mr-4 flex items-center justify-center shadow-md cursor-pointer bg-gray-100";
    }

    // Clic sur preview pour voir le statut
    preview.addEventListener("click", () => {
      overlay.remove();
      viewSingleStatus(status);
    });

    // Info du statut
    const info = createElement("div", {
      class: "flex-1 cursor-pointer",
    });

    info.addEventListener("click", () => {
      overlay.remove();
      viewSingleStatus(status);
    });

    const typeLabel = status.type === "text" ? "Statut texte" : 
                     status.type === "image" ? "Photo" : "Vidéo";
    
    const typeElement = createElement("p", {
      class: "font-semibold text-gray-800 mb-1",
    });
    typeElement.textContent = typeLabel;

    const timeAgo = getTimeAgo(status.timestamp);
    const viewsCount = status.views ? status.views.length : 0;

    const metaElement = createElement("p", {
      class: "text-sm text-gray-500 mb-1",
    });
    metaElement.textContent = `${timeAgo} • ${viewsCount} vue${viewsCount > 1 ? 's' : ''}`;

    info.append(typeElement, metaElement);

    // Actions
    const actions = createElement("div", {
      class: "flex items-center space-x-2",
    });

    const viewBtn = createElement("button", {
      class: "text-green-500 hover:bg-green-50 p-3 rounded-full transition-colors",
      title: "Voir le statut",
    });
    viewBtn.innerHTML = '<i class="fas fa-eye text-lg"></i>';
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      overlay.remove();
      viewSingleStatus(status);
    });

    const deleteBtn = createElement("button", {
      class: "text-red-500 hover:bg-red-50 p-3 rounded-full transition-colors",
      title: "Supprimer le statut",
    });
    deleteBtn.innerHTML = '<i class="fas fa-trash text-lg"></i>';
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteStatusConfirm(status.id, statusItem, subtitle, content);
    });

    actions.append(viewBtn, deleteBtn);
    statusItem.append(preview, info, actions);
    content.appendChild(statusItem);
  });

  // Footer avec bouton d'ajout
  const footer = createElement("div", {
    class: "p-4 border-t border-gray-200 bg-gray-50",
  });

  const addButton = createElement("button", {
    class: "w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105",
  });
  addButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Ajouter un nouveau statut';
  addButton.addEventListener("click", () => {
    overlay.remove();
    showMyStatusOptions();
  });

  footer.appendChild(addButton);

  modal.append(header, content, footer);
  overlay.appendChild(modal);
  return overlay;
}

function deleteStatusConfirm(statusId, statusElement, subtitle, content) {
  // Modal de confirmation stylé
  const confirmOverlay = createElement("div", {
    class: "fixed inset-0 bg-black bg-opacity-60 z-60 flex items-center justify-center",
  });

  const confirmModal = createElement("div", {
    class: "bg-white rounded-xl p-6 mx-4 max-w-sm w-full shadow-2xl",
  });

  const confirmTitle = createElement("h3", {
    class: "text-lg font-semibold text-gray-800 mb-2",
  });
  confirmTitle.textContent = "Supprimer le statut";

  const confirmText = createElement("p", {
    class: "text-gray-600 mb-6",
  });
  confirmText.textContent = "Êtes-vous sûr de vouloir supprimer ce statut ? Cette action est irréversible.";

  const confirmButtons = createElement("div", {
    class: "flex space-x-3",
  });

  const cancelBtn = createElement("button", {
    class: "flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors",
  });
  cancelBtn.textContent = "Annuler";
  cancelBtn.addEventListener("click", () => confirmOverlay.remove());

  const deleteBtn = createElement("button", {
    class: "flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors",
  });
  deleteBtn.textContent = "Supprimer";
  deleteBtn.addEventListener("click", () => {
    try {
      const success = deleteStatus(statusId);
      if (success) {
        statusElement.remove();
        confirmOverlay.remove();
        
        if (typeof showNotification === 'function') {
          showNotification("Statut supprimé avec succès", "success");
        }
        
        // Mettre à jour le compteur dans le header
        const remainingCount = content.children.length;
        subtitle.textContent = `${remainingCount} statut${remainingCount > 1 ? 's' : ''}`;
        
        // Déclencher l'événement de mise à jour
        window.dispatchEvent(new CustomEvent("statusDeleted", { 
          detail: { statusId } 
        }));
      } else {
        if (typeof showNotification === 'function') {
          showNotification("Erreur lors de la suppression", "error");
        }
      }
    } catch (error) {
      console.error("Erreur suppression statut:", error);
      if (typeof showNotification === 'function') {
        showNotification("Erreur lors de la suppression", "error");
      }
    }
  });

  confirmButtons.append(cancelBtn, deleteBtn);
  confirmModal.append(confirmTitle, confirmText, confirmButtons);
  confirmOverlay.appendChild(confirmModal);
  document.body.appendChild(confirmOverlay);
}

function viewSingleStatus(status) {
  const overlay = createElement("div", {
    class: "fixed inset-0 bg-black z-50 flex items-center justify-center",
  });

  overlay.addEventListener("click", () => overlay.remove());

  const container = createElement("div", {
    class: "relative w-full h-full flex items-center justify-center p-4",
  });

  let statusContent;

  if (status.type === "text") {
    statusContent = createElement("div", {
      class: "w-full max-w-sm h-96 rounded-xl flex items-center justify-center text-white font-bold text-xl p-8 text-center shadow-2xl",
      style: `background-color: ${status.backgroundColor || "#10b981"}`,
    });
    statusContent.textContent = status.content;
  } else if (status.type === "image") {
    statusContent = createElement("img", {
      class: "max-w-full max-h-full object-contain rounded-xl shadow-2xl",
      src: status.content,
    });
  } else if (status.type === "video") {
    statusContent = createElement("video", {
      class: "max-w-full max-h-full object-contain rounded-xl shadow-2xl",
      src: status.content,
      controls: true,
      autoplay: true,
    });
  }

  // Bouton de fermeture
  const closeBtn = createElement("button", {
    class: "absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 p-3 rounded-full transition-colors z-10",
  });
  closeBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
  closeBtn.addEventListener("click", () => overlay.remove());

  container.append(statusContent, closeBtn);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
}

function getTimeAgo(timestamp) {
  try {
    const now = new Date();
    const statusTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - statusTime) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    return "Il y a 1j";
  } catch (error) {
    console.error("Erreur calcul temps:", error);
    return "Récent";
  }
}

function showMyStatusOptions() {
  // Afficher les options quand l'utilisateur n'a pas de statuts
  const overlay = createElement("div", {
    class: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center",
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const modal = createElement("div", {
    class: "bg-white rounded-xl w-full max-w-sm mx-4 p-8 shadow-2xl text-center",
  });

  modal.addEventListener("click", (e) => e.stopPropagation());

  const icon = createElement("div", {
    class: "w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4",
  });
  icon.innerHTML = '<i class="fas fa-plus-circle text-green-500 text-3xl"></i>';

  const title = createElement("h2", {
    class: "text-xl font-semibold text-gray-800 mb-2",
  });
  title.textContent = "Aucun statut";

  const description = createElement("p", {
    class: "text-gray-600 mb-6",
  });
  description.textContent = "Vous n'avez pas encore créé de statut. Créez votre premier statut maintenant !";

  const createButton = createElement("button", {
    class: "w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 mb-3",
  });
  createButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Créer un statut';
  createButton.addEventListener("click", () => {
    overlay.remove();
    const statusModal = createStatusModal();
    if (statusModal) {
      document.body.appendChild(statusModal);
    }
  });

  const cancelButton = createElement("button", {
    class: "w-full py-3 text-gray-600 hover:text-gray-800 transition-colors",
  });
  cancelButton.textContent = "Annuler";
  cancelButton.addEventListener("click", () => overlay.remove());

  modal.append(icon, title, description, createButton, cancelButton);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Export des fonctions utilitaires
export { getAllStatuses, deleteStatus };