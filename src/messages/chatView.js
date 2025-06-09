import { createElement } from "../utils.js";
import { createMessageBubble } from "./messageUI.js";
import { messageQueue } from "./messageQueue.js";
import { DraftsManager } from "./drafts.js";
import { initialiserChat, envoyerMessageChat } from "./gestionChat.js";

export function createChatView(participant) {
  const container = createElement("div", {
    class: "h-full flex flex-col bg-[#E5DDD5]",
    id: `chat-${participant.id}`,
  });

  // Header
  const header = createElement("div", {
    class: "flex items-center px-4 py-3 bg-[#95D2B3]",
  });

  // Avatar
  const avatar = createElement(
    "div",
    {
      class:
        "w-10 h-10 rounded-full bg-[#0A6847] flex items-center justify-center text-white font-medium mr-3",
    },
    participant.name.charAt(0).toUpperCase()
  );

  // Contact info
  const info = createElement("div", {
    class: "flex flex-col",
  });

  const name = createElement(
    "div",
    {
      class: "text-white font-medium",
    },
    participant.name
  );

  const status = createElement(
    "div",
    {
      class: "text-white/80 text-sm",
    },
    "en ligne"
  );

  info.append(name, status);
  header.append(avatar, info);

  // Messages container
  const messagesContainer = createElement("div", {
    class: "flex-1 overflow-y-auto p-4",
  });

  const messagesAffiches = initialiserChat(messagesContainer, participant.id);

  // Message composer
  const composer = createElement("div", {
    class: "bg-white p-3 border-t border-gray-200",
  });

  // Conteneur qui englobe la zone de texte et le bouton d'envoi
  const inputContainer = createElement("div", {
    class: "relative flex items-center bg-gray-50 rounded-lg",
  });

  const textarea = createElement("textarea", {
    class:
      "w-full p-3 pr-12 rounded-lg bg-transparent border-none focus:outline-none resize-none text-black placeholder-gray-500",
    placeholder: "Écrivez un message...",
    rows: "1",
    onkeydown: (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Empêche le retour à la ligne
        sendButton.click(); // Déclenche le clic sur le bouton d'envoi
      }
    },
  });

  const sendButton = createElement("button", {
    class:
      "absolute right-2 p-2 text-white bg-[#95D2B3] rounded-full hover:bg-[#0A6847]",
    onclick: async () => {
      const texte = textarea.value.trim();
      if (texte) {
        await envoyerMessageChat(
          messagesContainer,
          participant.id,
          texte,
          messagesAffiches
        );
        textarea.value = "";
      }
    },
  });

  sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';

  // Assembler les éléments
  inputContainer.appendChild(textarea);
  inputContainer.appendChild(sendButton);
  composer.appendChild(inputContainer);

  container.append(header, messagesContainer, composer);
  return container;
}
