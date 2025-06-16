import { API_URL, API_ENDPOINTS } from "../config.js";
import { showNotification } from "../components/notifications.js";

export function initialiserMessages(callback) {
  chargerMessagesExistants(callback);

  const intervalId = setInterval(async () => {
    await chargerMessagesExistants(callback);
  }, 1000);

  return intervalId;
}

async function chargerMessagesExistants(callback) {
  try {
    const response = await fetch(API_ENDPOINTS.MESSAGES);
    const messages = await response.json();

    const sortedMessages = messages.sort(
      (a, b) =>
        new Date(a.date || a.timestamp) - new Date(b.date || b.timestamp)
    );

    sortedMessages.forEach(callback);
  } catch (error) {
    console.error("Erreur chargement messages:", error);
  }
}

// Fonction pour envoyer un message
export async function envoyerMessage(message) {
  try {
    const response = await fetch(API_ENDPOINTS.MESSAGES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
        status: "sent",
        isRead: false,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Erreur envoi message:", error);
    return null;
  }
}

// Fonction pour vérifier les nouveaux messages
export function demarrerVerificationMessages(userId, callback) {
  let lastCheck = new Date().toISOString();

  return setInterval(async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.MESSAGES}?destinataireId=${userId}&isRead=false&timestamp_gte=${lastCheck}`
      );
      const nouveauxMessages = await response.json();

      if (nouveauxMessages.length > 0) {
        nouveauxMessages.forEach((msg) => {
          showNotification(`Nouveau message de ${msg.expediteurNom}`);
          callback(msg);
        });
        lastCheck = new Date().toISOString();
      }
    } catch (error) {
      console.error("Erreur vérification messages:", error);
    }
  }, 3000); // Vérifie toutes les 3 secondes
}

// Fonction pour marquer un message comme lu
export async function marquerCommeLu(messageId) {
  try {
    await fetch(`${API_ENDPOINTS.MESSAGES}/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isRead: true,
        status: "read",
      }),
    });
  } catch (error) {
    console.error("Erreur marquage message:", error);
  }
}

export async function getMessages() {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.MESSAGES}?_sort=timestamp&_order=asc`
    );

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur récupération messages:", error);
    return [];
  }
}

export async function updateMessageStatus(messageId, status) {
  try {
    const response = await fetch(`${API_ENDPOINTS.MESSAGES}/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
  }
}
