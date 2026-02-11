export interface AirlineDTO {
  id: number;
  name: string;
  country: string;
  code: string;
}

export interface CreateAirlineDTO {
  name: string;
  country: string;
  code: string;
}