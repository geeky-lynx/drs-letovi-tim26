export interface UserDTO {
  id: number;
  name: string;
  lastName: string;
  dateOfBirth?: string;
  email: string;
  role: string;
  gender?: string;
  state?: string;
  street?: string;
  number?: string;
  accountBalance: number;
  profileImage?: string;
}