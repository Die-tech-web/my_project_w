// URL de votre backend déployé
export const API_URL = "https://base-donnee-js.onrender.com";

// URLs spécifiques pour chaque endpoint
export const API_ENDPOINTS = {
  USERS: `${API_URL}/users`,
  GROUPS: `${API_URL}/groups`,
  MESSAGES: `${API_URL}/messages`,
  CONTACTS: `${API_URL}/contacts`,
  STATUS: `${API_URL}/status`,
  API_URL: API_URL,
  ARCHIVES: "http://localhost:3000/archives",
};

export const REFRESH_INTERVAL = 1000; // 1 seconde pour la synchronisation
