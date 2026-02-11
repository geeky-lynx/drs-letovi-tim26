import axios, { AxiosInstance } from "axios";
import { AirlineDTO, CreateAirlineDTO } from "../../models/flights/AirlineDTO";
import { IAirlinesAPI } from "./IAirlinesAPI";

export class AirlinesAPI implements IAirlinesAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getAllAirlines(): Promise<AirlineDTO[]> {
    return (await this.axiosInstance.get<AirlineDTO[]>("/airlines")).data;
  }

  async getAirlineById(id: number): Promise<AirlineDTO> {
    return (await this.axiosInstance.get<AirlineDTO>(`/airlines/${id}`)).data;
  }

  async createAirline(token: string, data: CreateAirlineDTO): Promise<AirlineDTO> {
    return (
      await this.axiosInstance.post<AirlineDTO>("/airlines", data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async deleteAirline(token: string, id: number): Promise<void> {
    await this.axiosInstance.delete(`/airlines/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
