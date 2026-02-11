import { AirlineDTO, CreateAirlineDTO } from "../../models/flights/AirlineDTO";

export interface IAirlinesAPI {
  getAllAirlines(): Promise<AirlineDTO[]>;
  getAirlineById(id: number): Promise<AirlineDTO>;
  createAirline(token: string, data: CreateAirlineDTO): Promise<AirlineDTO>;
  deleteAirline(token: string, id: number): Promise<void>;
}
