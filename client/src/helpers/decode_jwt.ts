import { jwtDecode } from "jwt-decode";
import type { AuthTokenClaimsType } from "../types/AuthTokenClaimsType";

export const decodeJWT = (token: string): AuthTokenClaimsType | null => {
  try {
    const decoded = jwtDecode<AuthTokenClaimsType>(token);

    if (decoded.id && decoded.email && decoded.role) {
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }

    return null;
  } catch {
    return null;
  }
};