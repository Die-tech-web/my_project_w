import { sendMessage, markMessagesAsRead, getConversation } from "../services/conversationService.js";
import { messagePolling } from "../services/messagePolling.js";
import { createMessageBubble } from "./messageUI.js";

export class ChatManager {
  constructor(messagesContainer, contactId) {
    this.messagesContainer = messagesContainer;
    this.contactId = contactId;
    this.currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    this.displayedMessages = new Set();
    
    this.init();
  }

  async init() {
    if (!this.currentUser) return;
    
    // Charger les messages existants
    await this.loadExistingMessages();
    
    // Démarrer le polling pour nouveaux messages
    messagePolling.addConversation(this.contactId, (newMessages) => {
      this.handleNewMessages(newMessages);
    });
  }

  async loadExistingMessages() {
    try {
      const messages = await getConversation(this.currentUser.id, this.contactId);
      messages.forEach(message => this.displayMessage(message));
      
      // Marquer les messages reçus comme lus
      await markMessagesAsRead(this.contactId, this.currentUser.id);
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  }

  handleNewMessages(newMessages) {
    newMessages.forEach(message => {
      if (!this.displayedMessages.has(message.id)) {
        this.displayMessage(message);
        
        // Marquer comme lu si c'est un message reçu
        if (message.destinataireId === this.currentUser.id) {
          markMessagesAsRead(this.contactId, this.currentUser.id);
        }
      }
    });
  }

  displayMessage(message) {
    if (this.displayedMessages.has(message.id)) return;
    
    const isSent = message.expediteurId === this.currentUser.id;
    const bubble = createMessageBubble({
      text: message.texte,
      timestamp: message.timestamp,
      isSent,
      status: message.status,
    });

    this.messagesContainer.appendChild(bubble);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    this.displayedMessages.add(message.id);
  }

  async sendMessage(texte) {
    if (!texte.trim()) return null;
    
    const message = await sendMessage(
      this.currentUser.id,
      this.contactId,
      texte
    );
    
    if (message) {
      this.displayMessage(message);
    }
    
    return message;
  }

  cleanup() {
    messagePolling.removeConversation(this.contactId);
  }
}