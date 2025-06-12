import { getConversation } from "./conversationService.js";

class MessagePolling {
  constructor() {
    this.activeConversations = new Map();
    this.pollingInterval = null;
    this.pollDelay = 2000; // 2 secondes
  }

  startPolling() {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(() => {
      this.checkForNewMessages();
    }, this.pollDelay);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  addConversation(contactId, callback) {
    this.activeConversations.set(contactId, {
      callback,
      lastMessageCount: 0
    });
    
    if (!this.pollingInterval) {
      this.startPolling();
    }
  }

  removeConversation(contactId) {
    this.activeConversations.delete(contactId);
    
    if (this.activeConversations.size === 0) {
      this.stopPolling();
    }
  }

  async checkForNewMessages() {
    const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    if (!currentUser) return;

    for (const [contactId, conversationData] of this.activeConversations) {
      try {
        const messages = await getConversation(currentUser.id, contactId);
        
        if (messages.length > conversationData.lastMessageCount) {
          const newMessages = messages.slice(conversationData.lastMessageCount);
          conversationData.callback(newMessages);
          conversationData.lastMessageCount = messages.length;
        }
      } catch (error) {
        console.error(`Erreur polling conversation ${contactId}:`, error);
      }
    }
  }
}

export const messagePolling = new MessagePolling();