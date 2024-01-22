import validator from 'validator';

/**
 * check if email is valid
 * @param {string} email - The email to be checked.
 * @returns {boolean} - Whether the password is valid or not.
 */
export function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Checks if a given password is valid.
 * @param {string} password - The password to be checked.
 * @returns {boolean} - Whether the password is valid or not.
 */
export function isValidPassword(password: string | undefined): boolean {
  if (password === undefined) {
    return false;
  }

  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
}
