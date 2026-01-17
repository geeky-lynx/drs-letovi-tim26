import type { User } from '../models/User';
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken?: string | null;
}


export interface LogoutResponse {
  message: string;
  success: boolean;
}


export interface AccountLockInfo {
  isLocked: boolean;
  lockedUntil?: Date;
  remainingTime?: number;     
  attemptsLeft?: number;      
}