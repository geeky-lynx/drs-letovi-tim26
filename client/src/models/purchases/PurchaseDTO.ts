export interface PurchaseDTO {
  id: number;
  flight_id: number;
  status: string;
  ticket_price: number;
  purchase_time: string;
}

export interface CreatePurchaseResponse {
  message: string;
  purchase_id: number;
  status: string;
}
