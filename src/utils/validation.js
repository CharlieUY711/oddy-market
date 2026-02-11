// Validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
};

export const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{13,19}$/.test(cleaned);
};

export const validateCardExpiry = (expiry) => {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiry)) return false;
  
  const [month, year] = expiry.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const now = new Date();
  
  return expiryDate > now;
};

export const validateCVC = (cvc) => {
  return /^\d{3,4}$/.test(cvc);
};

export const validateZipCode = (zipCode) => {
  if (!zipCode) return true; // Opcional
  return /^\d{4,10}$/.test(zipCode);
};

export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ').substring(0, 19);
};

export const formatCardExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  }
  return cleaned;
};

export const validateCheckoutForm = (formData) => {
  const errors = {};

  if (!formData.firstName.trim()) {
    errors.firstName = 'El nombre es requerido';
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'El apellido es requerido';
  }

  if (!formData.email.trim()) {
    errors.email = 'El email es requerido';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'El email no es válido';
  }

  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = 'El teléfono no es válido';
  }

  if (!formData.address.trim()) {
    errors.address = 'La dirección es requerida';
  }

  if (!formData.city.trim()) {
    errors.city = 'La ciudad es requerida';
  }

  if (formData.zipCode && !validateZipCode(formData.zipCode)) {
    errors.zipCode = 'El código postal no es válido';
  }

  if (formData.paymentMethod === 'card') {
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = 'El número de tarjeta es requerido';
    } else if (!validateCardNumber(formData.cardNumber)) {
      errors.cardNumber = 'El número de tarjeta no es válido';
    }

    if (!formData.cardExpiry.trim()) {
      errors.cardExpiry = 'La fecha de vencimiento es requerida';
    } else if (!validateCardExpiry(formData.cardExpiry)) {
      errors.cardExpiry = 'La fecha de vencimiento no es válida';
    }

    if (!formData.cardCVC.trim()) {
      errors.cardCVC = 'El CVC es requerido';
    } else if (!validateCVC(formData.cardCVC)) {
      errors.cardCVC = 'El CVC debe tener 3 o 4 dígitos';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
