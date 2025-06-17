import { createElement } from "../utils.js";
import {
  startMessagePolling,
  stopMessagePolling,
  envoyerMessage,
} from "./simpleChatManager.js";
import { DraftsManager } from "./drafts.js";

export function createChatView(participant) {
  console.log("Création du chat pour:", participant);

  const container = createElement("div", {
    class: "flex flex-col h-full bg-white",
    id: `chat-${participant.id}`,
  });

  // Ajout de l'en-tête avec le nom du contact - changement du vert en bleu
  const header = createElement("div", {
    class: "bg-[#1e3d59] text-white px-4 py-3 flex items-center", // Changé de #095C44 en #1e3d59
  });

  // Avatar du contact (initiales) - changement du vert en bleu
  const avatar = createElement("div", {
    class:
      "w-8 h-8 rounded-full bg-[#4a90e2] flex items-center justify-center mr-3 text-sm font-medium", // Changé de #95D2B3 en #4a90e2
  });
  avatar.textContent = participant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Nom du contact
  const contactName = createElement("div", {
    class: "font-medium text-lg",
  });
  contactName.textContent = participant.name;

  header.append(avatar, contactName);

  const messagesContainer = createElement("div", {
    class: "flex-1 overflow-y-auto p-4",
    id: `messages-${participant.id}`,
  });

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
  });

  const sendButton = createElement("button", {
    class:
      "absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#4a90e2] text-white p-2 rounded-full hover:bg-[#357abd]", // Changé de #95D2B3 et #7BC0A1
  });
  sendButton.innerHTML = '<i class="fas fa-paper-plane text-sm"></i>';

  // Gestion de l'envoi
  const handleSend = async () => {
    const text = textarea.value.trim();
    console.log("Tentative d'envoi du message:", text);

    if (text) {
      const success = await envoyerMessage(
        messagesContainer,
        participant.id,
        text
      );
      if (success) {
        textarea.value = "";
        DraftsManager.saveDraft(participant.id, "");
        textarea.style.height = "auto";
        console.log("Message envoyé avec succès");
      } else {
        console.error("Échec de l'envoi du message");
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

  textarea.oninput = () => {
    DraftsManager.saveDraft(participant.id, textarea.value);
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const draft = DraftsManager.getDraft(participant.id);
  if (draft?.text) {
    textarea.value = draft.text;
  }

  inputContainer.append(textarea, sendButton);
  composer.appendChild(inputContainer);
  // Ajouter le header avant le conteneur de messages
  container.append(header, messagesContainer, composer);

  // Démarrer le polling des messages
  startMessagePolling(messagesContainer, participant.id);

  const cleanup = () => {
    stopMessagePolling();
    messagesContainer.innerHTML = "";
  };

  container.cleanup = cleanup;
  return container;
}
