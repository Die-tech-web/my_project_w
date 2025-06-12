import { createElement } from "../utils.js";
import { ChatManager } from "./chatManager.js";
import { DraftsManager } from "./drafts.js";

export function createChatInterface(contact) {
  const container = createElement("div", {
    class: "h-full flex flex-col bg-[#E5DDD5]",
    id: `chat-${contact.id}`,
  });

  // En-tête du chat
  const header = createChatHeader(contact);
  
  // Zone des messages
  const messagesContainer = createElement("div", {
    class: "flex-1 overflow-y-auto p-4",
    id: `messages-${contact.id}`,
  });

  // Zone de composition
  const composer = createMessageComposer(contact.id);
  
  // Initialiser le gestionnaire de chat
  const chatManager = new ChatManager(messagesContainer, contact.id);
  
  // Gérer l'envoi de messages
  const textarea = composer.querySelector("textarea");
  const sendButton = composer.querySelector(".send-button");
  
  const handleSend = async () => {
    const text = textarea.value.trim();
    if (text) {
      await chatManager.sendMessage(text);
      textarea.value = "";
      DraftsManager.saveDraft(contact.id, "");
      adjustTextareaHeight(textarea);
    }
  };

  sendButton.onclick = handleSend;
  textarea.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Gestion des brouillons
  textarea.oninput = () => {
    DraftsManager.saveDraft(contact.id, textarea.value);
    adjustTextareaHeight(textarea);
  };

  // Charger le brouillon existant
  const draft = DraftsManager.getDraft(contact.id);
  if (draft?.text) {
    textarea.value = draft.text;
    adjustTextareaHeight(textarea);
  }

  container.append(header, messagesContainer, composer);
  
  // Fonction de nettoyage
  container.cleanup = () => chatManager.cleanup();
  
  return container;
}

function createChatHeader(contact) {
  const header = createElement("div", {
    class: "flex items-center px-4 py-3 bg-[#95D2B3]",
  });

  header.innerHTML = `
    <div class="w-10 h-10 rounded-full bg-[#0A6847] flex items-center justify-center text-white font-medium mr-3">
      ${contact.name.charAt(0).toUpperCase()}
    </div>
    <div class="flex flex-col">
      <div class="text-white font-medium">${contact.name}</div>
      <div class="text-white/80 text-sm">en ligne</div>
    </div>
  `;

  return header;
}

function createMessageComposer(contactId) {
  const composer = createElement("div", {
    class: "bg-white p-3 border-t border-gray-200",
  });

  composer.innerHTML = `
    <div class="flex items-end space-x-2">
      <div class="flex-1 relative">
        <textarea 
          class="w-full p-3 pr-12 rounded-lg bg-gray-50 border-none focus:outline-none resize-none text-black placeholder-gray-500 min-h-[44px] max-h-[120px]"
          placeholder="Écrivez un message..."
          rows="1"
        ></textarea>
      </div>
      <button class="send-button bg-[#95D2B3] text-white p-3 rounded-full hover:bg-[#7BC0A1] transition-colors">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  `;

  return composer;
}

function adjustTextareaHeight(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
}