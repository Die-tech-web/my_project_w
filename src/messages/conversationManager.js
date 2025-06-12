import { API_ENDPOINTS } from "../config.js";
import { createMessageBubble } from "./messageUI.js";
import { messageSyncService } from "../services/messageSyncService.js";

export class ConversationManager {
  constructor(messagesContainer, contactId) {
    this.messagesContainer = messagesContainer;
    this.contactId = contactId;
    this.currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    this.messageIds = new Set();
    
    this.init();
  }

  async init() {
    if (!this.currentUser) return;
    
    // Charger tous les messages de la conversation
    await this.loadAllMessages();
    
    // S'abonner aux nouveaux messages
    messageSyncService.addChat(this.contactId, (newMessages) => {
      this.handleNewMessages(newMessages);
    });
  }

  async loadAllMessages() {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.MESSAGES}?_sort=timestamp&_order=asc`
      );
      const allMessages = await response.json();
      
      // Filtrer les messages de cette conversation
      const conversationMessages = allMessages.filter(msg => 
        (msg.expediteurId === this.currentUser.id && msg.destinataireId === this.contactId) ||
        (msg.expediteurId === this.contactId && msg.destinataireId === this.currentUser.id)
      );

      // Afficher tous les messages
      conversationMessages.forEach(message => {
        this.displayMessage(message);
      });

      // Marquer les messages reçus comme lus
      await this.markReceivedMessagesAsRead(conversationMessages);
      
    } catch (error) {
      console.error("Erreur chargement conversation:", error);
    }
  }

  handleNewMessages(newMessages) {
    newMessages.forEach(message => {
      if (!this.messageIds.has(message.id)) {
        this.displayMessage(message);
        
        // Si c'est un message reçu, le marquer comme lu
        if (message.destinataireId === this.currentUser.id) {
          this.markMessageAsRead(message.id);
        }
      }
    });
  }

  displayMessage(message) {
    if (this.messageIds.has(message.id)) return;
    
    const isSent = message.expediteurId === this.currentUser.id;
    const bubble = createMessageBubble({
      text: message.texte,
      timestamp: message.timestamp || message.date,
      isSent,
      status: message.status,
    });

    this.messagesContainer.appendChild(bubble);
    this.messageIds.add(message.id);
    
    // Scroll vers le bas
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  async sendMessage(texte) {
    if (!texte.trim()) return null;
    
    const message = {
      expediteurId: this.currentUser.id,
      destinataireId: this.contactId,
      texte: texte.trim(),
      timestamp: new Date().toISOString(),
      status: "sent"
    };

    try {
      const response = await fetch(API_ENDPOINTS.MESSAGES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) throw new Error("Erreur envoi message");
      
      const savedMessage = await response.json();
      
      // Afficher le message immédiatement
      this.displayMessage(savedMessage);
      
      // Mettre à jour le statut
      setTimeout(() => {
        this.updateMessageStatus(savedMessage.id, "delivered");
      }, 1000);
      
      return savedMessage;
    } catch (error) {
      console.error("Erreur envoi message:", error);
      return null;
    }
  }

  async markReceivedMessagesAsRead(messages) {
    const unreadMessages = messages.filter(
      msg => msg.destinataireId === this.currentUser.id && msg.status !== "read"
    );

    for (const message of unreadMessages) {
      await this.markMessageAsRead(message.id);
    }
  }

  async markMessageAsRead(messageId) {
    try {
      await fetch(`${API_ENDPOINTS.MESSAGES}/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
    } catch (error) {
      console.error("Erreur marquage message lu:", error);
    }
  }

  async updateMessageStatus(messageId, status) {
    try {
      await fetch(`${API_ENDPOINTS.MESSAGES}/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
    }
  }

  cleanup() {
    messageSyncService.removeChat(this.contactId);
  }
}