import { UserDTO } from "../../models/users/UserDTO";

export interface IUserAPI {
  getAllUsers(token: string): Promise<UserDTO[]>;
  getUserById(token: string, id: number): Promise<UserDTO>;
  deleteUser(token: string, id: number): Promise<void>;
  updateUserRole(token: string, id: number, role: string): Promise<UserDTO>;
  updateUserProfile(token: string, id: number, data: Partial<UserDTO>): Promise<UserDTO>;
  uploadProfileImage(token: string, id: number, file: File): Promise<UserDTO>;
}