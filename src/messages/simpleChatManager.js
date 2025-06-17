import { API_ENDPOINTS } from "../config.js";

// Variables globales pour gérer l'état
let messageIds = new Set();
let pollingInterval = null;

export function startMessagePolling(container, participantId) {
  checkNewMessages(container, participantId);
  pollingInterval = setInterval(() => {
    checkNewMessages(container, participantId);
  }, 1000); // Polling toutes les secondes
}

export function stopMessagePolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  messageIds.clear();
}

async function checkNewMessages(container, participantId) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    if (!currentUser) return;

    // Récupérer tous les messages de la conversation
    const response = await fetch(
      `${API_ENDPOINTS.MESSAGES}?_sort=timestamp&_order=asc&` +
        `expediteurId_in=${currentUser.id},${participantId}&` +
        `destinataireId_in=${currentUser.id},${participantId}`
    );

    const messages = await response.json();

    // Filtrer et afficher uniquement les nouveaux messages
    let hasNewMessages = false;
    messages.forEach((msg) => {
      if (!messageIds.has(msg.id)) {
        messageIds.add(msg.id);
        afficherMessage(container, msg);
        hasNewMessages = true;
      }
    });

    if (hasNewMessages) {
      scrollToBottom(container);
    }
  } catch (error) {
    console.error("Erreur vérification messages:", error);
  }
}

export async function envoyerMessage(container, participantId, texte) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    if (!currentUser) return false;

    const message = {
      expediteurId: currentUser.id,
      destinataireId: participantId,
      contenu: texte,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    const response = await fetch(API_ENDPOINTS.MESSAGES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) throw new Error("Erreur envoi message");

    const savedMessage = await response.json();
    messageIds.add(savedMessage.id);
    afficherMessage(container, savedMessage);
    scrollToBottom(container);
    return true;
  } catch (error) {
    console.error("Erreur envoi message:", error);
    return false;
  }
}

function afficherMessage(container, message) {
  if (!message?.contenu) return;

  const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
  if (!currentUser) return;

  const isMe = message.expediteurId === currentUser.id;
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const messageElement = document.createElement("div");
  messageElement.className = `flex ${
    isMe ? "justify-end" : "justify-start"
  } mb-4`;
  messageElement.innerHTML = `
    <div class="max-w-[70%] break-words rounded-lg px-4 py-2 ${
      isMe ? "bg-[#4a90e2] text-white" : "bg-gray-200 text-gray-800"
    }">
      <div class="message-content">${message.contenu}</div>
      <div class="text-xs ${isMe ? "text-white/70" : "text-gray-500"} mt-1">
        ${time}
      </div>
    </div>
  `;

  container.appendChild(messageElement);
}

function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}
