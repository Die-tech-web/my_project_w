export function initialiserMessages(callback) {
  // Charger les messages existants
  chargerMessagesExistants(callback);

  // Vérifier les nouveaux messages toutes les 2 secondes
  setInterval(() => {
    chargerMessagesExistants(callback);
  }, 2000);
}

async function chargerMessagesExistants(callback) {
  try {
    const response = await fetch("http://localhost:3000/messages");
    const messages = await response.json();
    // Trier les messages par date
    messages.sort((a, b) => new Date(a.date) - new Date(b.date));
    messages.forEach((message) => {
      callback(message);
    });
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
    status: "sent", // Ajout du status
  };

  try {
    const response = await fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    const messageEnvoye = await response.json();
    return messageEnvoye;
  } catch (error) {
    console.error("Erreur envoi message:", error);
    return null;
  }
}
