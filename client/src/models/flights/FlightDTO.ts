export interface FlightDTO {
  id: number;
  name: string;
  airline_id: number;
  airline_name: string; 
  distance_km: number;
  duration_minutes: number;
  departure_time: string;
  departure_airport: string;
  arrival_airport: string;
  created_by_user_id: number;
  ticket_price: number;
  status: string;
  rejection_reason?: string; 
}

export interface CreateFlightDTO {
  name: string; 
  airline_id: number;
  distance_km: number; 
  duration_minutes: number; 
  departure_time: string; // Format: "YYYY-MM-DD HH:MM:SS"
  departure_airport: string; 
  arrival_airport: string; 
  ticket_price: number; 
}