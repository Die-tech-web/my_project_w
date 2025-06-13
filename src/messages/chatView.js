import { createElement } from "../utils.js";
import { SimpleChatManager } from "./simpleChatManager.js";
import { DraftsManager } from "./drafts.js";

export function createChatView(participant) {
  console.log("Création du chat pour:", participant); // Debug
  
  const container = createElement("div", {
    class: "h-full flex flex-col bg-[#fff]",
    id: `chat-${participant.id}`,
  });

  // En-tête
  const header = createElement("div", {
    class: "flex items-center px-4 py-3 bg-[#013a63]",
  });
  
  const avatar = createElement(
    "div",
    {
      class: "w-10 h-10 rounded-full bg-[#0A6847] flex items-center justify-center text-white font-medium mr-3",
    },
    participant.name.charAt(0).toUpperCase()
  );
  
  const info = createElement("div", { class: "flex flex-col" });
  info.append(
    createElement("div", { class: "text-white font-medium" }, participant.name),
    createElement("div", { class: "text-white/80 text-sm" }, "en ligne")
  );
  header.append(avatar, info);

  // Zone des messages
  const messagesContainer = createElement("div", {
    class: "flex-1 overflow-y-auto p-4",
    id: `messages-${participant.id}`,
  });

  // Initialiser le gestionnaire de chat
  const chatManager = new SimpleChatManager(messagesContainer, participant.id);

  // Zone de composition
  const composer = createElement("div", {
    class: "bg-white p-3 border-t border-gray-200",
  });
  
  const inputContainer = createElement("div", {
    class: "relative flex items-center bg-gray-50 rounded-lg",
  });
  
  const textarea = createElement("textarea", {
    class: "w-full p-3 pr-12 rounded-lg bg-transparent border-none focus:outline-none resize-none text-black placeholder-gray-500",
    placeholder: "Écrivez un message...",
    rows: "1",
  });

  const sendButton = createElement("button", {
    class: "absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#95D2B3] text-white p-2 rounded-full hover:bg-[#7BC0A1]",
  });
  sendButton.innerHTML = '<i class="fas fa-paper-plane text-sm"></i>';

  // Gestion de l'envoi
  const handleSend = async () => {
    const text = textarea.value.trim();
    console.log("Tentative d'envoi du message:", text); // Debug
    
    if (text) {
      const result = await chatManager.sendMessage(text);
      if (result) {
        textarea.value = "";
        DraftsManager.saveDraft(participant.id, "");
        textarea.style.height = "auto";
        console.log("Message envoyé avec succès"); // Debug
      } else {
        console.error("Échec de l'envoi du message"); // Debug
        alert("Erreur lors de l'envoi du message. Vérifiez votre connexion.");
      }
    }
  };

  sendButton.onclick = handleSend;
  
  textarea.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea et sauvegarde brouillon
  textarea.oninput = () => {
    DraftsManager.saveDraft(participant.id, textarea.value);
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  // Charger le brouillon existant
  const draft = DraftsManager.getDraft(participant.id);
  if (draft?.text) {
    textarea.value = draft.text;
  }

  inputContainer.append(textarea, sendButton);
  composer.appendChild(inputContainer);
  container.append(header, messagesContainer, composer);

  // Fonction de nettoyage
  container.cleanup = () => {
    chatManager.cleanup();
  };

  return container;
}
