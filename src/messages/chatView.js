import { createElement } from "../utils.js";
import { initialiserChat, envoyerMessageChat } from "./gestionChat.js";
import { DraftsManager } from "./drafts.js"; 

export function createChatView(participant) {
  const container = createElement("div", {
    class: "h-full flex flex-col bg-[#E5DDD5]",
    id: `chat-${participant.id}`,
  });

 
  const header = createElement("div", {
    class: "flex items-center px-4 py-3 bg-[#95D2B3]",
  });
  const avatar = createElement(
    "div",
    {
      class:
        "w-10 h-10 rounded-full bg-[#0A6847] flex items-center justify-center text-white font-medium mr-3",
    },
    participant.name.charAt(0).toUpperCase()
  );
  const info = createElement("div", { class: "flex flex-col" });
  info.append(
    createElement("div", { class: "text-white font-medium" }, participant.name),
    createElement("div", { class: "text-white/80 text-sm" }, "en ligne")
  );
  header.append(avatar, info);

  
  const messagesContainer = createElement("div", {
    class: "flex-1 overflow-y-auto p-4",
    id: `messages-${participant.id}`,
  });
  const messagesAffiches = initialiserChat(messagesContainer, participant.id);

  const cleanup = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };

  container.cleanup = cleanup;

  const composer = createElement("div", {
    class: "bg-white p-3 border-t border-gray-200",
  });
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
        e.preventDefault();
        sendButton.click();
      }
    },
  });


  const draft = DraftsManager.getDraft(participant.id);
  if (draft && draft.text) textarea.value = draft.text;

  
  textarea.addEventListener("input", () => {
    DraftsManager.saveDraft(participant.id, textarea.value);
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
        DraftsManager.saveDraft(participant.id, ""); envoi
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    },
  });
  sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';

  inputContainer.appendChild(textarea);
  inputContainer.appendChild(sendButton);
  composer.appendChild(inputContainer);

  container.append(header, messagesContainer, composer);
  return container;
}
