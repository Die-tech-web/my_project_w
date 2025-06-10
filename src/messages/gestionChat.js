import {
  initialiserMessages,
  envoyerNouveauMessage,
  updateMessageStatus,
} from "../services/messageService.js";
import { createMessageBubble } from "./messageUI.js";

export function initialiserChat(conteneurMessages, contactId) {
  const utilisateurActuel = JSON.parse(localStorage.getItem("whatsappUser"));
  const messagesAffiches = new Set();

  if (!utilisateurActuel) return messagesAffiches;

  initialiserMessages(async (message) => {
    const messageId = `${message.expediteurId}-${message.date}`;

    if (!messagesAffiches.has(messageId)) {
      const isForCurrentChat =
        (message.destinataireId === utilisateurActuel.id &&
          message.expediteurId === contactId) ||
        (message.expediteurId === utilisateurActuel.id &&
          message.destinataireId === contactId);

      if (isForCurrentChat) {
        const estEnvoye = message.expediteurId === utilisateurActuel.id;

        // Si le message est reçu et pas encore lu
        if (!estEnvoye && message.status !== "read") {
          await updateMessageStatus(message.id, "read");
          message.status = "read";
        }

        afficherMessage(conteneurMessages, message, estEnvoye);
        messagesAffiches.add(messageId);
      }
    }
  });

  return messagesAffiches;
}

export async function envoyerMessageChat(
  conteneurMessages,
  contactId,
  texte,
  messagesAffiches
) {
  const message = await envoyerNouveauMessage(texte, contactId);
  if (message) {
    const messageId = `${message.expediteurId || message.senderId}-${
      message.date || message.timestamp
    }`;
    if (!messagesAffiches.has(messageId)) {
      afficherMessage(conteneurMessages, message, true);
      messagesAffiches.add(messageId);
    }
  }
}

function afficherMessage(conteneur, message, estEnvoye) {
  const bulle = createMessageBubble({
    text: message.texte || message.content,
    timestamp: message.date || message.timestamp,
    isSent: estEnvoye,
    status: message.status,
  });

  conteneur.appendChild(bulle);
  conteneur.scrollTop = conteneur.scrollHeight;
}
