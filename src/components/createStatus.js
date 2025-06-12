import { createElement } from "../utils.js";
import { showNotification } from "./notifications.js";

// Fonctions utilitaires pour le stockage local
function saveStatus(statusData) {
  try {
    const statuses = JSON.parse(localStorage.getItem("userStatuses") || "[]");
    const newStatus = {
      ...statusData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      views: [],
      isActive: true
    };
    statuses.push(newStatus);
    localStorage.setItem("userStatuses", JSON.stringify(statuses));
    return newStatus;
  } catch (error) {
    console.error("Erreur sauvegarde statut:", error);
    return null;
  }
}

function canCreateStatus() {
  try {
    const currentUser = localStorage.getItem("whatsappUser");
    return currentUser !== null;
  } catch (error) {
    console.error("Erreur vérification utilisateur:", error);
    return false;
  }
}

// Fonction utilitaire pour convertir un fichier en base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

export function createStatusModal() {
  console.log("Création du modal de statut");
  
  // Vérifier si l'utilisateur peut créer des statuts
  if (!canCreateStatus()) {
    console.log("Utilisateur non connecté");
    if (typeof showNotification === 'function') {
      showNotification("Vous devez être connecté pour créer un statut", "error");
    }
    return null;
  }

  let currentUser;
  try {
    currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    if (!currentUser) {
      console.log("Pas d'utilisateur trouvé");
      return null;
    }
  } catch (error) {
    console.error("Erreur parsing utilisateur:", error);
    return null;
  }

  console.log("Utilisateur connecté:", currentUser.name);

  const overlay = createElement("div", {
    class: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const modal = createElement("div", {
    class: "bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden shadow-2xl",
  });

  modal.addEventListener("click", (e) => e.stopPropagation());

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
  title.textContent = "Nouveau statut";

  const subtitle = createElement("p", {
    class: "text-white text-opacity-90 text-sm",
  });
  subtitle.textContent = currentUser.name || "Utilisateur";

  userInfo.append(title, subtitle);

  const closeButton = createElement("button", {
    class: "text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors ml-4",
  });
  closeButton.innerHTML = '<i class="fas fa-times text-lg"></i>';
  closeButton.addEventListener("click", () => overlay.remove());

  headerContent.append(avatar, userInfo, closeButton);
  header.appendChild(headerContent);

  const content = createElement("div", {
    class: "p-6",
  });

  const typeSelector = createElement("div", {
    class: "flex gap-3 mb-6",
  });

  const types = [
    { id: "text", label: "Texte", icon: "fa-font", color: "bg-blue-500" },
    { id: "image", label: "Photo", icon: "fa-image", color: "bg-purple-500" },
    { id: "video", label: "Vidéo", icon: "fa-video", color: "bg-red-500" },
  ];

  let selectedType = "text";
  let selectedColor = "#10b981"; // Vert par défaut

  types.forEach(type => {
    const button = createElement("button", {
      class: `flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
        type.id === selectedType 
          ? "border-green-500 bg-green-50 shadow-md transform scale-105" 
          : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
      }`,
    });

    const icon = createElement("i", {
      class: `fas ${type.icon} text-2xl mb-2 ${
        type.id === selectedType ? "text-green-600" : "text-gray-500"
      }`,
    });

    const label = createElement("div", {
      class: `text-sm font-semibold ${
        type.id === selectedType ? "text-green-700" : "text-gray-600"
      }`,
    });
    label.textContent = type.label;

    button.append(icon, label);
    button.addEventListener("click", () => selectType(type.id));
    typeSelector.appendChild(button);
  });

  const contentArea = createElement("div", {
    class: "mb-6",
    id: "status-content-area",
  });

  const submitButton = createElement("button", {
    class: "w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105",
  });
  submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Publier le statut';
  submitButton.addEventListener("click", handleSubmit);

  function selectType(type) {
    selectedType = type;
    console.log("Type sélectionné:", type);
    
    // Mettre à jour les boutons
    typeSelector.querySelectorAll("button").forEach((btn, index) => {
      const currentType = types[index];
      if (currentType.id === type) {
        btn.className = "flex-1 p-4 rounded-xl border-2 transition-all duration-200 border-green-500 bg-green-50 shadow-md transform scale-105";
        btn.querySelector("i").className = `fas ${currentType.icon} text-2xl mb-2 text-green-600`;
        btn.querySelector("div").className = "text-sm font-semibold text-green-700";
      } else {
        btn.className = "flex-1 p-4 rounded-xl border-2 transition-all duration-200 border-gray-200 hover:border-green-300 hover:bg-gray-50";
        btn.querySelector("i").className = `fas ${currentType.icon} text-2xl mb-2 text-gray-500`;
        btn.querySelector("div").className = "text-sm font-semibold text-gray-600";
      }
    });

    // Mettre à jour la zone de contenu
    updateContentArea();
  }

  function updateContentArea() {
    contentArea.innerHTML = "";

    switch (selectedType) {
      case "text":
        // Sélecteur de couleurs
        const colorSection = createElement("div", {
          class: "mb-4",
        });

        const colorLabel = createElement("label", {
          class: "block text-sm font-semibold text-gray-700 mb-3",
        });
        colorLabel.textContent = "Couleur de fond";

        const colorGrid = createElement("div", {
          class: "grid grid-cols-6 gap-3 mb-4",
        });

        const colors = [
          "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#06b6d4",
          "#84cc16", "#ec4899", "#6366f1", "#f97316", "#14b8a6", "#a855f7",
          "#22c55e", "#2563eb", "#dc2626", "#ca8a04", "#0891b2", "#7c3aed"
        ];

        colors.forEach(color => {
          const colorButton = createElement("button", {
            class: `w-10 h-10 rounded-full border-4 transition-all duration-200 ${
              selectedColor === color ? "border-gray-800 scale-110" : "border-gray-300 hover:border-gray-500"
            }`,
            style: `background-color: ${color}`,
          });

          colorButton.addEventListener("click", () => {
            selectedColor = color;
            // Mettre à jour les styles des boutons de couleur
            colorGrid.querySelectorAll("button").forEach(btn => {
              if (btn === colorButton) {
                btn.className = "w-10 h-10 rounded-full border-4 transition-all duration-200 border-gray-800 scale-110";
              } else {
                btn.className = "w-10 h-10 rounded-full border-4 transition-all duration-200 border-gray-300 hover:border-gray-500";
              }
            });
            
            // Mettre à jour l'aperçu
            updateTextPreview();
          });

          colorGrid.appendChild(colorButton);
        });

        colorSection.append(colorLabel, colorGrid);

        // Zone de texte
        const textArea = createElement("textarea", {
          class: "w-full h-32 p-4 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-lg",
          placeholder: "Écrivez votre statut...",
          id: "status-text",
        });

        textArea.addEventListener("input", updateTextPreview);

        // Aperçu du statut
        const previewSection = createElement("div", {
          class: "mt-4",
        });

        const previewLabel = createElement("label", {
          class: "block text-sm font-semibold text-gray-700 mb-2",
        });
        previewLabel.textContent = "Aperçu";

        const preview = createElement("div", {
          class: "w-full h-32 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg",
          style: `background-color: ${selectedColor}`,
          id: "text-preview",
        });
        preview.textContent = "Votre texte apparaîtra ici...";

        function updateTextPreview() {
          const text = textArea.value.trim();
          preview.textContent = text || "Votre texte apparaîtra ici...";
          preview.style.backgroundColor = selectedColor;
        }

        previewSection.append(previewLabel, preview);
        contentArea.append(colorSection, textArea, previewSection);
        break;

      case "image":
        const imageInput = createElement("input", {
          type: "file",
          accept: "image/*",
          class: "w-full p-4 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-green-500 hover:border-green-400 transition-colors cursor-pointer",
          id: "status-image",
        });
        
        const imagePreview = createElement("div", {
          class: "mt-4 hidden",
          id: "image-preview",
        });

        imageInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = createElement("img", {
                class: "w-full max-h-64 object-cover rounded-xl shadow-lg",
                src: e.target.result,
              });
              imagePreview.innerHTML = "";
              imagePreview.appendChild(img);
              imagePreview.classList.remove("hidden");
            };
            reader.readAsDataURL(file);
          }
        });

        contentArea.append(imageInput, imagePreview);
        break;

      case "video":
        const videoInput = createElement("input", {
          type: "file",
          accept: "video/*",
          class: "w-full p-4 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-green-500 hover:border-green-400 transition-colors cursor-pointer",
          id: "status-video",
        });
        
        const videoPreview = createElement("div", {
          class: "mt-4 hidden",
          id: "video-preview",
        });

        videoInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              const url = URL.createObjectURL(file);
              const video = createElement("video", {
                class: "w-full max-h-64 rounded-xl shadow-lg",
                src: url,
                controls: true,
              });
              videoPreview.innerHTML = "";
              videoPreview.appendChild(video);
              videoPreview.classList.remove("hidden");
            } catch (error) {
              console.error("Erreur création URL vidéo:", error);
            }
          }
        });

        contentArea.append(videoInput, videoPreview);
        break;
    }
  }

  async function handleSubmit() {
    console.log("Soumission du statut, type:", selectedType);
    
    let statusData = {
      type: selectedType,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
    };

    try {
      switch (selectedType) {
        case "text":
          const textElement = document.getElementById("status-text");
          if (!textElement) {
            console.error("Élément texte non trouvé");
            return;
          }
          const textContent = textElement.value.trim();
          if (!textContent) {
            if (typeof showNotification === 'function') {
              showNotification("Veuillez saisir du texte", "error");
            }
            return;
          }
          statusData.content = textContent;
          statusData.backgroundColor = "#10b981"; // green-500
          break;

        case "image":
          const imageElement = document.getElementById("status-image");
          if (!imageElement || !imageElement.files[0]) {
            if (typeof showNotification === 'function') {
              showNotification("Veuillez sélectionner une image", "error");
            }
            return;
          }
          
          // Convertir l'image en base64 pour le stockage local
          const imageFile = imageElement.files[0];
          const imageBase64 = await fileToBase64(imageFile);
          statusData.content = imageBase64;
          statusData.mediaType = "image";
          statusData.fileName = imageFile.name;
          break;

        case "video":
          const videoElement = document.getElementById("status-video");
          if (!videoElement || !videoElement.files[0]) {
            if (typeof showNotification === 'function') {
              showNotification("Veuillez sélectionner une vidéo", "error");
            }
            return;
          }
          
          // Convertir la vidéo en base64 pour le stockage local
          const videoFile = videoElement.files[0];
          const videoBase64 = await fileToBase64(videoFile);
          statusData.content = videoBase64;
          statusData.mediaType = "video";
          statusData.fileName = videoFile.name;
          break;
      }

      console.log("Données du statut:", statusData);
      const result = saveStatus(statusData);
      
      if (result) {
        overlay.remove();
        if (typeof showNotification === 'function') {
          showNotification("Statut publié avec succès!", "success");
        }
        
        // Déclencher l'événement de mise à jour
        window.dispatchEvent(new CustomEvent('statusUpdated', { 
          detail: { userId: currentUser.id, status: result } 
        }));
        
        console.log("Statut créé avec succès:", result);
      } else {
        if (typeof showNotification === 'function') {
          showNotification("Erreur lors de la publication", "error");
        }
      }
    } catch (error) {
      console.error("Erreur publication statut:", error);
      if (typeof showNotification === 'function') {
        showNotification("Erreur lors de la publication", "error");
      }
    }
  }

  // Initialiser avec le type texte
  updateContentArea();

  content.append(typeSelector, contentArea, submitButton);
  modal.append(header, content);
  overlay.appendChild(modal);

  console.log("Modal créé et prêt");
  return overlay;
}

// Fonction pour vérifier les permissions avant d'afficher le bouton de création
export function shouldShowCreateStatusButton() {
  return canCreateStatus();
}

// Fonction pour récupérer tous les statuts
export function getAllStatuses() {
  try {
    const statuses = JSON.parse(localStorage.getItem("userStatuses") || "[]");
    // Filtrer les statuts actifs et non expirés
    const now = new Date();
    return statuses.filter(status => 
      status.isActive && 
      new Date(status.expiresAt) > now
    );
  } catch (error) {
    console.error("Erreur récupération statuts:", error);
    return [];
  }
}

// Fonction pour supprimer un statut
export function deleteStatus(statusId) {
  try {
    const statuses = JSON.parse(localStorage.getItem("userStatuses") || "[]");
    const updatedStatuses = statuses.filter(status => status.id !== statusId);
    localStorage.setItem("userStatuses", JSON.stringify(updatedStatuses));
    
    // Déclencher l'événement de mise à jour
    window.dispatchEvent(new CustomEvent('statusDeleted', { 
      detail: { statusId } 
    }));
    
    return true;
  } catch (error) {
    console.error("Erreur suppression statut:", error);
    return false;
  }
}

// Fonction pour marquer un statut comme vu
export function markStatusAsViewed(statusId, viewerId) {
  try {
    const statuses = JSON.parse(localStorage.getItem("userStatuses") || "[]");
    const status = statuses.find(s => s.id === statusId);
    
    if (status && !status.views.includes(viewerId)) {
      status.views.push(viewerId);
      localStorage.setItem("userStatuses", JSON.stringify(statuses));
    }
    
    return true;
  } catch (error) {
    console.error("Erreur marquage vue statut:", error);
    return false;
  }
}

// Test simple pour vérifier que le module fonctionne
console.log("Module createStatus chargé");