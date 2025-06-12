import { API_URL, API_ENDPOINTS } from "../config.js";

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

export async function envoyerNouveauMessage(texte, destinataireId) {
  const expediteur = JSON.parse(localStorage.getItem("whatsappUser"));
  
  if (!expediteur) {
    console.error("Utilisateur non connecté");
    return null;
  }

  const message = {
    texte,
    destinataireId,
    expediteurId: expediteur.id,
    timestamp: new Date().toISOString(),
    status: "sent"
  };

  console.log("Envoi du message:", message); // Debug

  try {
    const response = await fetch(API_ENDPOINTS.MESSAGES, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message),
    });

    console.log("Réponse serveur:", response.status); // Debug

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur serveur:", errorText);
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const savedMessage = await response.json();
    console.log("Message sauvegardé:", savedMessage); // Debug
    
    return savedMessage;
  } catch (error) {
    console.error("Erreur envoi message:", error);
    return null;
  }
}

export async function getMessages() {
  try {
    const response = await fetch(`${API_ENDPOINTS.MESSAGES}?_sort=timestamp&_order=asc`);
    
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
