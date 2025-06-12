import { API_ENDPOINTS } from "../config.js";

let queue = [];
let processing = false;

export const messageQueue = {
  addToQueue(message) {
    queue.push({
      ...message,
      status: "pending",
    });

    if (!processing) {
      processQueue();
    }
  },
};

async function processQueue() {
  if (processing || queue.length === 0) return;

  processing = true;

  while (queue.length > 0) {
    const message = queue[0];

    try {
      await sendMessage(message);
      queue.shift(); 
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      message.status = "failed";
      break;
    }
  }

  processing = false;
}

async function sendMessage(message) {
  const response = await fetch(API_ENDPOINTS.MESSAGES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error("Échec de l'envoi du message");
  }

  return response.json();
}

// Exportez les fonctions utilitaires si nécessaire
export const utils = {
  getQueueLength: () => queue.length,
  clearQueue: () => {
    queue = [];
    processing = false;
  },
  getQueueStatus: () => ({
    processing,
    pendingMessages: queue.length,
  }),
};
