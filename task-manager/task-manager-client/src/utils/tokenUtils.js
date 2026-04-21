import { jwtDecode } from 'jwt-decode';

/**
 * Decodes a JWT and returns the payload.
 * Returns null if the token is invalid or expired.
 */
export const decodeToken = (token) => {
  try {
    const payload = jwtDecode(token);
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

/**
 * Builds a normalised user object from the JWT payload.
 * Merges with any extra fields from the API response (name, email, etc.)
 */
export const buildUserFromToken = (token, apiUser = {}) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    // Fields from JWT payload
    _id:             payload.user_id,
    role:            payload.role,
    organization_id: payload.organization_id,
    // Extra fields from API response (name, email) — override payload if present
    ...apiUser,
  };
};
