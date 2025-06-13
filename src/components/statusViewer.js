import { createElement } from "../utils.js";
import { addStatusView, getUserStatus } from "../services/statusService.js";

export function createStatusViewer(statusList, initialIndex = 0) {
  const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
  let currentIndex = initialIndex;
  let autoProgressTimer = null;

  const overlay = createElement("div", {
    class: "fixed inset-0 bg-black z-50 flex items-center justify-center",
  });

  const container = createElement("div", {
    class: "relative w-full h-full max-w-md mx-auto bg-black",
  });

  const header = createElement("div", {
    class: "absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4",
  });

  const progressBar = createElement("div", {
    class: "flex gap-1 mb-4",
  });

  const userInfo = createElement("div", {
    class: "flex items-center justify-between text-white",
  });

  const content = createElement("div", {
    class: "absolute inset-0 flex items-center justify-center",
    id: "status-content",
  });

  const navigation = createElement("div", {
    class: "absolute inset-0 flex z-5",
  });

  const prevArea = createElement("div", {
    class: "flex-1 cursor-pointer",
    onclick: () => navigateStatus(-1),
  });

  const nextArea = createElement("div", {
    class: "flex-1 cursor-pointer",
    onclick: () => navigateStatus(1),
  });

  const closeBtn = createElement("button", {
    class: "absolute top-4 right-4 z-20 text-white bg-black/50 rounded-full p-2 hover:bg-black/70",
    onclick: () => closeViewer(),
  });
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';

  navigation.append(prevArea, nextArea);

  function updateProgressBar() {
    progressBar.innerHTML = "";
    statusList.forEach((_, index) => {
      const segment = createElement("div", {
        class: `h-1 flex-1 rounded transition-all duration-300 ${
          index === currentIndex ? "bg-white" : 
          index < currentIndex ? "bg-white/70" : "bg-white/30"
        }`,
      });
      progressBar.appendChild(segment);
    });
  }

  function startAutoProgress() {
    if (autoProgressTimer) clearTimeout(autoProgressTimer);
    
    autoProgressTimer = setTimeout(() => {
      if (currentIndex < statusList.length - 1) {
        navigateStatus(1);
      } else {
        closeViewer();
      }
    }, 5000); 
  }

  function stopAutoProgress() {
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer);
      autoProgressTimer = null;
    }
  }

  function renderStatus() {
    const status = statusList[currentIndex];
    if (!status) return;

    if (status.userId !== currentUser?.id) {
      addStatusView(status.id, currentUser.id);
    }

    const timeAgo = getTimeAgo(status.timestamp);
    userInfo.innerHTML = `
      <div class="flex items-center">
        <div class="w-8 h-8 bg-[#95D2B3] rounded-full flex items-center justify-center text-white text-sm mr-3">
          ${status.userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p class="font-medium text-sm">${status.userName}</p>
          <p class="text-xs text-white/70">${timeAgo}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        ${status.userId === currentUser?.id ? `
          <button class="text-white/70 hover:text-white p-1" onclick="showStatusInfo()">
            <i class="fas fa-eye text-sm"></i>
          </button>
          <button class="text-white/70 hover:text-white p-1" onclick="deleteCurrentStatus()">
            <i class="fas fa-trash text-sm"></i>
          </button>
        ` : ''}
      </div>
    `;

   
    content.innerHTML = "";
    
    if (status.type === "text") {
      const textElement = createElement("div", {
        class: "w-full h-full flex items-center justify-center p-8",
        style: status.backgroundColor ? `background-color: ${status.backgroundColor}` : "background: linear-gradient(135deg, #95D2B3, #0A6847)",
      });

      const textContent = createElement("p", {
        class: "text-white text-xl font-medium text-center leading-relaxed",
      }, status.content);

      textElement.appendChild(textContent);
      content.appendChild(textElement);
      
    } else if (status.type === "image") {
      const imageElement = createElement("img", {
        src: status.mediaUrl,
        class: "max-w-full max-h-full object-contain",
        alt: "Statut image",
      });
      content.appendChild(imageElement);
      
    } else if (status.type === "video") {
      const videoElement = createElement("video", {
        src: status.mediaUrl,
        class: "max-w-full max-h-full object-contain",
        controls: true,
        autoplay: true,
        muted: true,
      });
      content.appendChild(videoElement);
    }

    updateProgressBar();
    startAutoProgress();
  }

  function navigateStatus(direction) {
    stopAutoProgress();
    
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < statusList.length) {
      currentIndex = newIndex;
      renderStatus();
    } else if (direction > 0) {
      closeViewer();
    }
  }

  function closeViewer() {
    stopAutoProgress();
    overlay.remove();
  }

  function getTimeAgo(timestamp) {
    const now = new Date();
    const statusTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - statusTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    return "1j";
  }

  container.addEventListener('touchstart', stopAutoProgress);
  container.addEventListener('mousedown', stopAutoProgress);
  container.addEventListener('touchend', startAutoProgress);
  container.addEventListener('mouseup', startAutoProgress);

  renderStatus();

  header.append(progressBar, userInfo);
  container.append(header, content, navigation, closeBtn);
  overlay.appendChild(container);

  return overlay;
}

export async function viewUserStatus(userId, userName) {
  try {
    const userStatus = await getUserStatus(userId);
    
    if (userStatus.length === 0) {
      console.log("Aucun statut trouvé pour cet utilisateur");
      return;
    }

    const activeStatus = userStatus.filter(status => {
      const expiresAt = new Date(status.expiresAt);
      return expiresAt > new Date();
    });

    if (activeStatus.length === 0) {
      console.log("Aucun statut actif pour cet utilisateur");
      return;
    }

    const viewer = createStatusViewer(activeStatus, 0);
    document.body.appendChild(viewer);
    
  } catch (error) {
    console.error("Erreur lors de l'affichage des statuts:", error);
  }
}