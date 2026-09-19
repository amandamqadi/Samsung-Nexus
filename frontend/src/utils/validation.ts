export function validateFullName(name: string): string | null {
  if (!name.trim()) return 'Full name is required.';
  if (name.trim().length < 3) return 'Enter your full name.';
  if (!/^[A-Za-z' -]+$/.test(name.trim())) return 'Name may only contain letters, spaces, and hyphens.';
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include a number.';
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

/**
 * Validates a South African 13-digit ID number: numeric format, a plausible
 * YYMMDD date of birth, and the Luhn (mod10) check digit used by Home Affairs.
 */
export function validateSAID(id: string): string | null {
  const value = id.trim();
  if (!value) return 'ID number is required.';
  if (!/^\d{13}$/.test(value)) return 'ID number must be exactly 13 digits.';

  const month = Number(value.slice(2, 4));
  const day = Number(value.slice(4, 6));
  if (month < 1 || month > 12) return 'ID number contains an invalid birth month.';
  const daysInMonth = new Date(2000, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return 'ID number contains an invalid birth day.';

  const genderDigits = Number(value.slice(6, 10));
  if (Number.isNaN(genderDigits)) return 'ID number is malformed.';

  const citizenshipDigit = Number(value[10]);
  if (citizenshipDigit !== 0 && citizenshipDigit !== 1) return 'ID number has an invalid citizenship digit.';

  if (!luhnCheck(value)) return 'ID number failed checksum validation — check for typos.';

  return null;
}

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}
