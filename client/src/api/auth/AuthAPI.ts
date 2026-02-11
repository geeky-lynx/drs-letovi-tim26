import axios, { AxiosInstance } from "axios";
import type { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import type { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import type { IAuthAPI } from "./IAuthAPI";
import type { AuthResponseType } from "../../types/AuthResponseType";

export class AuthAPI implements IAuthAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({baseURL: import.meta.env.VITE_GATEWAY_URL, headers: { "Content-Type": "application/json" }});
  }

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    return (await this.axiosInstance.post("/login", data)).data;
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    return (await this.axiosInstance.post("/register", data)).data;
  }
}