import { API_ENDPOINTS } from "../config.js";
import { showNotification } from "../components/notifications.js";

export class MessageSyncService {
  constructor() {
    this.activeChats = new Map();
    this.syncInterval = null;
    this.lastSync = new Date().toISOString();
  }

  startSync() {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.syncAllChats();
    }, 1000); // Réduire l'intervalle à 1 seconde
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

  formatDate(timestamp) {
    if (!timestamp) return new Date().toISOString();
    try {
      return new Date(timestamp).toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  async envoyerMessage(message) {
    const messageData = {
      ...message,
      timestamp: this.formatDate(message.timestamp),
      status: message.status || "sent",
    };

    // ...rest of sending logic...
  }

  async syncAllChats() {
    const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    if (!currentUser) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.MESSAGES}?_sort=timestamp&_order=asc&timestamp_gte=${this.lastSync}`
      );
      const newMessages = await response.json();

      if (newMessages.length > 0) {
        this.lastSync = new Date().toISOString();

        newMessages.forEach((message) => {
          if (message.destinataireId === currentUser.id) {
            // Notification pour les nouveaux messages reçus
            showNotification("Nouveau message reçu");

            // Envoyer à la conversation active si elle existe
            const callback = this.activeChats.get(message.expediteurId);
            if (callback) callback([message]);
          }
        });
      }
    } catch (error) {
      console.error("Erreur synchronisation:", error);
    }
  }
}

export const messageSyncService = new MessageSyncService();
