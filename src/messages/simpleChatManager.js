import { API_ENDPOINTS } from "../config.js";

export class SimpleChatManager {
  constructor(container, participantId) {
    this.container = container;
    this.participantId = participantId;
    this.lastCheck = new Date().toISOString();
    this.messageIds = new Set(); // Pour suivre les messages déjà affichés
    this.interval = null;
    this.startPolling();
  }

  startPolling() {
    this.checkNewMessages(); // Vérifier immédiatement
    this.interval = setInterval(() => {
      this.checkNewMessages();
    }, 1000); // Polling toutes les secondes
  }

  async checkNewMessages() {
    try {
      const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
      if (!currentUser) return;

      // Récupérer tous les messages de la conversation
      const response = await fetch(
        `${API_ENDPOINTS.MESSAGES}?_sort=timestamp&_order=asc&` +
          `expediteurId_in=${currentUser.id},${this.participantId}&` +
          `destinataireId_in=${currentUser.id},${this.participantId}`
      );

      const messages = await response.json();

      // Filtrer et afficher uniquement les nouveaux messages
      messages.forEach((msg) => {
        if (!this.messageIds.has(msg.id)) {
          this.messageIds.add(msg.id);
          this.afficherMessage(msg);
        }
      });

      if (messages.length > 0) {
        this.scrollToBottom();
      }
    } catch (error) {
      console.error("Erreur vérification messages:", error);
    }
  }

  async envoyerNouveauMessage(texte) {
    try {
      const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
      if (!currentUser) return false;

      const message = {
        expediteurId: currentUser.id,
        destinataireId: this.participantId,
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
      this.messageIds.add(savedMessage.id);
      this.afficherMessage(savedMessage);
      this.scrollToBottom();
      return true;
    } catch (error) {
      console.error("Erreur envoi message:", error);
      return false;
    }
  }

  afficherMessage(message) {
    const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    const isMe = message.expediteurId === currentUser.id;

    const messageElement = document.createElement("div");
    messageElement.className = `flex ${
      isMe ? "justify-end" : "justify-start"
    } mb-4`;

    messageElement.innerHTML = `
      <div class="max-w-[70%] break-words rounded-lg px-4 py-2 ${
        isMe ? "bg-[#95D2B3] text-white" : "bg-gray-200 text-gray-800"
      }">
        <div class="message-content">${message.contenu}</div>
        <div class="text-xs ${isMe ? "text-white/70" : "text-gray-500"} mt-1">
          ${new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    `;

    this.container.appendChild(messageElement);
  }

  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  cleanup() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
