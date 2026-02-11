import axios, { AxiosInstance } from "axios";
import { IUserAPI } from "./IUserAPI";
import { UserDTO } from "../../models/users/UserDTO";

export class UserAPI implements IUserAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getAllUsers(token: string): Promise<UserDTO[]> {
    return (
      await this.axiosInstance.get<UserDTO[]>("/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async getUserById(token: string, id: number): Promise<UserDTO> {
    return (
      await this.axiosInstance.get<UserDTO>(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async deleteUser(token: string, id: number): Promise<void> {
    await this.axiosInstance.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateUserRole(token: string, id: number, role: string): Promise<UserDTO> {
    return (
      await this.axiosInstance.put<UserDTO>(
        `/users/${id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    ).data;
  }

  async updateUserProfile(token: string, id: number, data: Partial<UserDTO>): Promise<UserDTO> {
    return (
      await this.axiosInstance.put<UserDTO>(
        `/users/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    ).data;
  }

  async uploadProfileImage(token: string, id: number, file: File): Promise<UserDTO> {
    const formData = new FormData();
    formData.append("file", file);
    return (
      await this.axiosInstance.post<UserDTO>(
        `/users/${id}/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
    ).data;
  }
  }
