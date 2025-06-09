import {
  initialiserMessages,
  envoyerNouveauMessage,
} from "../services/messageService.js";
import { createMessageBubble } from "./messageUI.js";

export function initialiserChat(conteneurMessages, contactId) {
  const utilisateurActuel = JSON.parse(localStorage.getItem("whatsappUser"));
  const messagesAffiches = new Set();

  initialiserMessages((message) => {
    const messageId = `${message.expediteurId}-${message.date}`;

    // Vérifier si le message n'a pas déjà été affiché
    if (messagesAffiches.has(messageId)) {
      return;
    }

    // Vérifier si c'est une conversation entre l'utilisateur actuel et le contact
    if (
      (message.destinataireId === utilisateurActuel.id &&
        message.expediteurId === contactId) ||
      (message.expediteurId === utilisateurActuel.id &&
        message.destinataireId === contactId)
    ) {
      afficherMessage(
        conteneurMessages,
        message,
        message.expediteurId === utilisateurActuel.id
      );
      messagesAffiches.add(messageId);
    }
  });

  return messagesAffiches; // Retourner la référence pour la réutiliser
}

export async function envoyerMessageChat(
  conteneurMessages,
  contactId,
  texte,
  messagesAffiches
) {
  const message = await envoyerNouveauMessage(texte, contactId);
  if (message) {
    const messageId = `${message.expediteurId}-${message.date}`;
    if (!messagesAffiches.has(messageId)) {
      afficherMessage(conteneurMessages, message, true);
      messagesAffiches.add(messageId);
    }
  }
}

function afficherMessage(conteneur, message, estEnvoye) {
  const bulle = createMessageBubble({
    text: message.texte,
    timestamp: message.date,
    isSent: estEnvoye,
  });
  conteneur.appendChild(bulle);
  conteneur.scrollTop = conteneur.scrollHeight;
}
