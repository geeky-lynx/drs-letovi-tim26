import axios, { AxiosInstance } from "axios";
import { CreateRatingResponse, RatingDTO } from "../../models/ratings/RatingDTO";
import { IRatingsAPI } from "./IRatingsAPI";

export class RatingsAPI implements IRatingsAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
    });
  }

  async createRating(data: { user_id: number; flight_id: number; rating: number }): Promise<CreateRatingResponse> {
    return (await this.axiosInstance.post<CreateRatingResponse>("/rating", data)).data;
  }

  async getAllRatings(): Promise<RatingDTO[]> {
    return (await this.axiosInstance.get<RatingDTO[]>("/ratings")).data;
  }
}
