export interface RatingDTO {
  id: number;
  user_id: number;
  flight_id: number;
  rating: number;
  created_at: string;
}

export interface CreateRatingResponse {
  message: string;
  rating_id: number;
}
