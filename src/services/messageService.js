import { API_URL } from "../config.js";

export function initialiserMessages(callback) {
  // Charger les messages existants immédiatement
  chargerMessagesExistants(callback);

  // Polling plus fréquent (1 seconde au lieu de 2)
  const intervalId = setInterval(async () => {
    await chargerMessagesExistants(callback);
  }, 1000);

  // Retourner l'ID de l'intervalle pour pouvoir l'arrêter si besoin
  return intervalId;
}

async function chargerMessagesExistants(callback) {
  try {
    const response = await fetch("http://localhost:3000/messages");
    const messages = await response.json();

    // Trier les messages par date
    const sortedMessages = messages.sort(
      (a, b) =>
        new Date(a.date || a.timestamp) - new Date(b.date || b.timestamp)
    );

    // Retourner les messages triés pour le callback
    sortedMessages.forEach(callback);
  } catch (error) {
    console.error("Erreur chargement messages:", error);
  }
}

export async function envoyerNouveauMessage(texte, destinataireId) {
  const expediteur = JSON.parse(localStorage.getItem("whatsappUser"));
  const message = {
    texte,
    destinataireId,
    expediteurId: expediteur.id,
    date: new Date().toISOString(),
    status: "sent", // Le statut initial est "sent"
  };

  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    // Mettre à jour le statut en "delivered" immédiatement après l'envoi
    const savedMessage = await response.json();
    await updateMessageStatus(savedMessage.id, "delivered");
    return savedMessage;
  } catch (error) {
    console.error("Erreur envoi message:", error);
    return null;
  }
}

// Nouvelle fonction pour mettre à jour le statut du message
export async function updateMessageStatus(messageId, status) {
  try {
    const response = await fetch(
      `http://localhost:3000/messages/${messageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
  }
}
