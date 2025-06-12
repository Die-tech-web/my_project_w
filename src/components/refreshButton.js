import { createElement } from "../utils.js";
import { forceRefreshContacts } from "./contactsList.js";
import { clearUserCache } from "../utils/cacheManager.js";

export function createRefreshButton() {
  const button = createElement("button", {
    class: "bg-[#95D2B3] text-white px-4 py-2 rounded-lg hover:bg-[#0A6847] transition-colors",
    onclick: async () => {
      button.disabled = true;
      button.textContent = "Actualisation...";
      
      try {
        // Nettoyer le cache
        clearUserCache();
        
        // Forcer le refresh des contacts
        await forceRefreshContacts();
        
        button.textContent = "✓ Actualisé";
        setTimeout(() => {
          button.textContent = "Actualiser";
          button.disabled = false;
        }, 2000);
        
      } catch (error) {
        console.error("Erreur refresh:", error);
        button.textContent = "Erreur";
        button.disabled = false;
      }
    }
  });
  
  button.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Actualiser';
  return button;
}