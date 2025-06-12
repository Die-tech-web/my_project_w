import { API_ENDPOINTS } from "../config.js";

export async function updateUserProfile(userId, updates) {
  try {
    const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error("Erreur de mise à jour");

    const updatedUser = await response.json();
    localStorage.setItem("whatsappUser", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    throw error;
  }
}

export function uploadProfileImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}
