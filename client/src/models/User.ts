import { UserRole } from '../enums/UserRole';
import { Gender } from '../enums/Gender';


export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  dateOfBirth: string;
  gender: Gender;
  country: string;
  street: string;
  number: string;
  accountBalance: number;
  profileImage?: string;  
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}


export interface LoginResponse {
  token: string;              
  refreshToken?: string;      
  user: User;                 
  message?: string;           
}


export interface LoginErrorResponse {
  message: string;                    
  attemptsLeft?: number;              
  lockedUntil?: string;               
  lockoutDuration?: number;          
}


export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;    
  dateOfBirth: string;        // Format: YYYY-MM-DD
  gender: Gender;
  country: string;
  street: string;
  number: string;
  accountBalance: number;     
}


export interface RegisterResponse {
  token: string;
  refreshToken?: string;
  user: User;
  message?: string;
}