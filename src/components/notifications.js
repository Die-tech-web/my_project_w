import { createElement } from "../utils.js";

export function showNotification(message, type = "success") {
  const notification = createElement("div", {
    class: `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === "success" ? "bg-green-500" : "bg-blue-500"
    } text-white opacity-0 transition-opacity duration-500`,
  });

  // Animation d'entrée
  setTimeout(() => (notification.style.opacity = "1"), 100);

  notification.textContent = message;
  document.body.appendChild(notification);

  // Suppression après 3 secondes
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
