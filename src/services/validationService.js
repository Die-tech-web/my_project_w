import { API_ENDPOINTS } from "../config.js";

export class ValidationService {
  
  // Vérifier si un numéro existe déjà
  static async isPhoneNumberUnique(phoneNumber, excludeUserId = null) {
    try {
      const response = await fetch(API_ENDPOINTS.USERS);
      if (!response.ok) {
        throw new Error("Erreur de connexion");
      }
      
      const users = await response.json();
      
      // Normaliser le numéro (supprimer espaces, tirets, etc.)
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      // Vérifier si le numéro existe (en excluant l'utilisateur actuel si modification)
      const existingUser = users.find(user => 
        user.id !== excludeUserId && 
        this.normalizePhoneNumber(user.phone) === normalizedPhone
      );
      
      return !existingUser; // true si unique, false si existe déjà
    } catch (error) {
      console.error("Erreur validation numéro:", error);
      throw error;
    }
  }
  
  // Normaliser le format du numéro
  static normalizePhoneNumber(phone) {
    if (!phone) return "";
    
    // Supprimer tous les caractères non numériques sauf le +
    return phone.replace(/[^\d+]/g, "").trim();
  }
  
  // Valider le format du numéro
  static isValidPhoneFormat(phone) {
    const normalized = this.normalizePhoneNumber(phone);
    
    // Doit commencer par + et avoir au moins 8 chiffres
    const phoneRegex = /^\+\d{8,15}$/;
    return phoneRegex.test(normalized);
  }
  
  // Validation complète du numéro
  static async validatePhoneNumber(phoneNumber, excludeUserId = null) {
    const errors = [];
    
    // Vérifier le format
    if (!phoneNumber || phoneNumber.trim() === "") {
      errors.push("Le numéro de téléphone est requis");
      return { isValid: false, errors };
    }
    
    if (!this.isValidPhoneFormat(phoneNumber)) {
      errors.push("Format invalide. Utilisez le format international (+221XXXXXXXXX)");
      return { isValid: false, errors };
    }
    
    // Vérifier l'unicité
    try {
      const isUnique = await this.isPhoneNumberUnique(phoneNumber, excludeUserId);
      if (!isUnique) {
        errors.push("Ce numéro de téléphone est déjà utilisé");
      }
    } catch (error) {
      errors.push("Impossible de vérifier l'unicité du numéro");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Valider le nom
  static validateName(name) {
    const errors = [];
    
    if (!name || name.trim() === "") {
      errors.push("Le nom est requis");
    } else if (name.trim().length < 2) {
      errors.push("Le nom doit contenir au moins 2 caractères");
    } else if (name.trim().length > 50) {
      errors.push("Le nom ne peut pas dépasser 50 caractères");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}