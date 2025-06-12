import { API_ENDPOINTS } from "../config.js";

class MessageSyncService {
  constructor() {
    this.activeChats = new Map();
    this.syncInterval = null;
    this.lastSync = new Date().toISOString();
  }

  startSync() {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(() => {
      this.syncAllChats();
    }, 2000); // Sync toutes les 2 secondes
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  addChat(contactId, callback) {
    this.activeChats.set(contactId, callback);
    if (!this.syncInterval) {
      this.startSync();
    }
  }

  removeChat(contactId) {
    this.activeChats.delete(contactId);
    if (this.activeChats.size === 0) {
      this.stopSync();
    }
  }

  async syncAllChats() {
    const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    if (!currentUser) return;

    try {
      // Récupérer tous les messages depuis la dernière sync
      const response = await fetch(
        `${API_ENDPOINTS.MESSAGES}?timestamp_gte=${this.lastSync}&_sort=timestamp&_order=asc`
      );
      const newMessages = await response.json();

      if (newMessages.length > 0) {
        this.lastSync = new Date().toISOString();
        
        // Distribuer les messages aux chats actifs
        for (const [contactId, callback] of this.activeChats) {
          const relevantMessages = newMessages.filter(msg => 
            (msg.expediteurId === currentUser.id && msg.destinataireId === contactId) ||
            (msg.expediteurId === contactId && msg.destinataireId === currentUser.id)
          );
          
          if (relevantMessages.length > 0) {
            callback(relevantMessages);
          }
        }
      }
    } catch (error) {
      console.error("Erreur sync messages:", error);
    }
  }
}

export const messageSyncService = new MessageSyncService();