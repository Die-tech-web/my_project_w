export const validateForm = (formData) => {
  const errors = {};

  // Validation du prénom
  if (!formData.firstName.trim()) {
    errors.firstName = "Le prénom est requis";
  }

  // Validation du nom
  if (!formData.lastName.trim()) {
    errors.lastName = "veuillez saisir votre nom";
  }

  // Validation du numéro de téléphone
  const phoneRegex = /^\+?\d{1,15}$/;
  if (!formData.phone.trim()) {
    errors.phone = "veuillez saisir votre numéro de téléphone";
  } else if (!phoneRegex.test(formData.phone)) {
    errors.phone = "le numéro de téléphone est invalide";
  }

  return errors;
};
