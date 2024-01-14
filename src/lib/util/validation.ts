/**
 * Checks if a given password is valid.
 * @param {string} password - The password to be checked.
 * @returns {boolean} - Whether the password is valid or not.
 */
export function isValidPassword (password: string | undefined): boolean {
  if (password === undefined) {
    return false
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}
