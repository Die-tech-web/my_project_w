import { envoyerNouveauMessage, getMessages } from "../services/messageService.js";
import { createMessageBubble } from "./messageUI.js";

export class SimpleChatManager {
  constructor(messagesContainer, contactId) {
    this.messagesContainer = messagesContainer;
    this.contactId = contactId;
    this.currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    this.displayedMessageIds = new Set();
    this.pollInterval = null;
    
    console.log("Chat initialisé pour contact:", contactId); // Debug
    this.init();
  }

  async init() {
    if (!this.currentUser) {
      console.error("Utilisateur non connecté");
      return;
    }
    
    // Charger les messages existants
    await this.loadMessages();
    
    // Démarrer le polling pour les nouveaux messages
    this.startPolling();
  }

  async loadMessages() {
    try {
      const allMessages = await getMessages();
      console.log("Messages récupérés:", allMessages.length); // Debug
      
      // Filtrer les messages de cette conversation
      const conversationMessages = allMessages.filter(msg => 
        (msg.expediteurId === this.currentUser.id && msg.destinataireId == this.contactId) ||
        (msg.expediteurId == this.contactId && msg.destinataireId === this.currentUser.id)
      );
      
      console.log("Messages de la conversation:", conversationMessages.length); // Debug
      
      // Trier par timestamp
      conversationMessages.sort((a, b) => 
        new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date)
      );
      
      // Afficher les messages
      conversationMessages.forEach(message => {
        this.displayMessage(message);
      });
      
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  }

  displayMessage(message) {
    if (this.displayedMessageIds.has(message.id)) {
      return; // Message déjà affiché
    }
    
    const isSent = message.expediteurId === this.currentUser.id;
    
    const bubble = createMessageBubble({
      text: message.texte,
      timestamp: message.timestamp || message.date,
      isSent,
      status: message.status || "sent",
    });

    this.messagesContainer.appendChild(bubble);
    this.displayedMessageIds.add(message.id);
    
    // Scroll vers le bas
    this.scrollToBottom();
  }

  async sendMessage(texte) {
    if (!texte || !texte.trim()) {
      console.log("Message vide, envoi annulé");
      return null;
    }
    
    console.log("Tentative d'envoi:", texte, "vers:", this.contactId); // Debug
    
    try {
      const message = await envoyerNouveauMessage(texte.trim(), this.contactId);
      
      if (message) {
        console.log("Message envoyé avec succès:", message); // Debug
        this.displayMessage(message);
        return message;
      } else {
        console.error("Échec de l'envoi du message");
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      return null;
    }
  }

  startPolling() {
    // Vérifier les nouveaux messages toutes les 3 secondes
    this.pollInterval = setInterval(async () => {
      await this.checkForNewMessages();
    }, 3000);
  }

  async checkForNewMessages() {
    try {
      const allMessages = await getMessages();
      
      const newMessages = allMessages.filter(msg => {
        const isForThisChat = 
          (msg.expediteurId == this.contactId && msg.destinataireId === this.currentUser.id) ||
          (msg.expediteurId === this.currentUser.id && msg.destinataireId == this.contactId);
        
        return isForThisChat && !this.displayedMessageIds.has(msg.id);
      });
      
      newMessages.forEach(message => {
        this.displayMessage(message);
      });
      
    } catch (error) {
      console.error("Erreur vérification nouveaux messages:", error);
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  cleanup() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log("Chat nettoyé pour contact:", this.contactId);
  }
}