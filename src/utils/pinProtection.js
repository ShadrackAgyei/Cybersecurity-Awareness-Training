// PIN Protection Utilities

const PIN_SALT = 'cybersecurity_training_salt_2024';

export const hashPin = (pin) => {
  return btoa(pin + PIN_SALT);
};

export const setPin = (pin) => {
  const hash = hashPin(pin);
  localStorage.setItem('analytics_pin_hash', hash);
  localStorage.setItem('pin_attempts', '0');
  localStorage.removeItem('analytics_lockout');
};

export const verifyPin = (pin) => {
  const storedHash = localStorage.getItem('analytics_pin_hash');
  if (!storedHash) return { success: false, error: 'No PIN set' };

  const lockout = checkLockout();
  if (lockout) return { success: false, error: lockout };

  const hash = hashPin(pin);
  const isCorrect = hash === storedHash;

  if (isCorrect) {
    localStorage.setItem('pin_attempts', '0');
    return { success: true };
  } else {
    const attempts = parseInt(localStorage.getItem('pin_attempts') || '0') + 1;
    localStorage.setItem('pin_attempts', attempts.toString());

    if (attempts >= 3) {
      const lockoutUntil = new Date(Date.now() + 5 * 60 * 1000);
      localStorage.setItem('analytics_lockout', lockoutUntil.toISOString());
      return { success: false, error: 'Too many attempts. Locked out for 5 minutes.' };
    }

    return { success: false, error: `Incorrect PIN. ${3 - attempts} attempts remaining.` };
  }
};

export const checkLockout = () => {
  const lockoutUntil = localStorage.getItem('analytics_lockout');
  if (lockoutUntil && new Date(lockoutUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(lockoutUntil) - new Date()) / 60000);
    return `Too many failed attempts. Try again in ${minutesLeft} minute(s).`;
  }
  localStorage.removeItem('analytics_lockout');
  return null;
};

export const isPinSet = () => {
  return localStorage.getItem('analytics_pin_hash') !== null;
};

export const changePin = (currentPin, newPin) => {
  const verification = verifyPin(currentPin);
  if (!verification.success) return verification;
  setPin(newPin);
  return { success: true };
};

export const getRemainingAttempts = () => {
  const attempts = parseInt(localStorage.getItem('pin_attempts') || '0');
  return Math.max(0, 3 - attempts);
};
