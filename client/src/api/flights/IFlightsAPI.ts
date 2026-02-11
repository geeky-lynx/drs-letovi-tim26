import { CreateFlightDTO, FlightDTO } from "../../models/flights/FlightDTO";

export interface IFlightsAPI {
	getAllFlights(): Promise<FlightDTO[]>;
	getFlightById(id: number): Promise<FlightDTO>;
	createFlight(token: string, data: CreateFlightDTO): Promise<FlightDTO>;
	approveFlight(token: string, id: number): Promise<FlightDTO>;
	rejectFlight(token: string, id: number, reason: string): Promise<FlightDTO>;
	cancelFlight(token: string, id: number): Promise<FlightDTO>;
	deleteFlight(token: string, id: number): Promise<void>;
}
