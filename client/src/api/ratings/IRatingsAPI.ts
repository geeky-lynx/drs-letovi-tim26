import { CreateRatingResponse, RatingDTO } from "../../models/ratings/RatingDTO";

export interface IRatingsAPI {
  createRating(data: { user_id: number; flight_id: number; rating: number }): Promise<CreateRatingResponse>;
  getAllRatings(): Promise<RatingDTO[]>;
}
