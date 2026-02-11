import axios, { AxiosInstance } from "axios";
import { CreateFlightDTO, FlightDTO } from "../../models/flights/FlightDTO";
import { IFlightsAPI } from "./IFlightsAPI";

export class FlightsAPI implements IFlightsAPI {
	private readonly axiosInstance: AxiosInstance;

	constructor() {
		this.axiosInstance = axios.create({
			baseURL: import.meta.env.VITE_GATEWAY_URL,
			headers: { "Content-Type": "application/json" },
		});
	}

	async getAllFlights(): Promise<FlightDTO[]> {
		return (await this.axiosInstance.get<FlightDTO[]>("/flights")).data;
	}

	async getFlightById(id: number): Promise<FlightDTO> {
		return (await this.axiosInstance.get<FlightDTO>(`/flights/${id}`)).data;
	}

	async createFlight(token: string, data: CreateFlightDTO): Promise<FlightDTO> {
		return (
			await this.axiosInstance.post<FlightDTO>("/flights", data, {
				headers: { Authorization: `Bearer ${token}` },
			})
		).data;
	}

	async approveFlight(token: string, id: number): Promise<FlightDTO> {
		return (
			await this.axiosInstance.put<FlightDTO>(`/flights/${id}/approve`, null, {
				headers: { Authorization: `Bearer ${token}` },
			})
		).data;
	}

	async rejectFlight(token: string, id: number, reason: string): Promise<FlightDTO> {
		return (
			await this.axiosInstance.put<FlightDTO>(
				`/flights/${id}/reject`,
				{ reason },
				{ headers: { Authorization: `Bearer ${token}` } }
			)
		).data;
	}

	async cancelFlight(token: string, id: number): Promise<FlightDTO> {
		return (
			await this.axiosInstance.put<FlightDTO>(`/flights/${id}/cancel`, null, {
				headers: { Authorization: `Bearer ${token}` },
			})
		).data;
	}

	async deleteFlight(token: string, id: number): Promise<void> {
		await this.axiosInstance.delete(`/flights/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	}
}
