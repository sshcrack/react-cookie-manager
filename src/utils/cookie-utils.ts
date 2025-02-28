/**
 * Sets a cookie with the specified name, value, and expiration days
 * @param name The name of the cookie
 * @param value The value to store in the cookie
 * @param days Number of days until the cookie expires
 */
export const setCookie = (name: string, value: string, days: number): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * Gets a cookie value by name
 * @param name The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

/**
 * Deletes a cookie by setting its expiration to a past date
 * @param name The name of the cookie to delete
 */
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

/**
 * Checks if a cookie exists
 * @param name The name of the cookie to check
 * @returns True if the cookie exists, false otherwise
 */
export const cookieExists = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * Gets all cookies as an object
 * @returns An object with cookie names as keys and values as values
 */
export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  document.cookie.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = value;
    }
  });
  return cookies;
};

/**
 * Clears all cookies from the current domain
 */
export const clearAllCookies = (): void => {
  const cookies = getAllCookies();
  Object.keys(cookies).forEach((name) => {
    deleteCookie(name);
  });
};
