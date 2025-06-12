import { API_ENDPOINTS } from "../config.js";

export async function getConversation(userId1, userId2) {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.MESSAGES}?_sort=timestamp&_order=asc`
    );
    const allMessages = await response.json();
    
    return allMessages.filter(message => 
      (message.expediteurId === userId1 && message.destinataireId === userId2) ||
      (message.expediteurId === userId2 && message.destinataireId === userId1)
    );
  } catch (error) {
    console.error("Erreur chargement conversation:", error);
    return [];
  }
}

export async function sendMessage(expediteurId, destinataireId, texte) {
  const message = {
    expediteurId,
    destinataireId,
    texte,
    timestamp: new Date().toISOString(),
    status: "sent",
    type: "text"
  };

  try {
    const response = await fetch(API_ENDPOINTS.MESSAGES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) throw new Error("Erreur envoi message");
    
    const savedMessage = await response.json();
    await updateMessageStatus(savedMessage.id, "delivered");
    return savedMessage;
  } catch (error) {
    console.error("Erreur envoi message:", error);
    return null;
  }
}

export async function updateMessageStatus(messageId, status) {
  try {
    const response = await fetch(`${API_ENDPOINTS.MESSAGES}/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await response.json();
  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
  }
}

export async function markMessagesAsRead(expediteurId, destinataireId) {
  try {
    const conversation = await getConversation(expediteurId, destinataireId);
    const unreadMessages = conversation.filter(
      msg => msg.expediteurId === expediteurId && msg.status !== "read"
    );

    const updatePromises = unreadMessages.map(msg => 
      updateMessageStatus(msg.id, "read")
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Erreur marquage messages lus:", error);
  }
}