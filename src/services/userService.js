import { API_ENDPOINTS } from "../config.js";

export async function getAllUsers() {
  try {
    const response = await fetch(API_ENDPOINTS.USERS);
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }
    const users = await response.json();
    console.log("Utilisateurs récupérés depuis l'API:", users);
    return users;
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    return [];
  }
}

export async function refreshUsers() {
  // Forcer le rechargement des utilisateurs
  const users = await getAllUsers();
  
  // Mettre à jour le localStorage si nécessaire
  localStorage.setItem("cachedUsers", JSON.stringify(users));
  
  return users;
}