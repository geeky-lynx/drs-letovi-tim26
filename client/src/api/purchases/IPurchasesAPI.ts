import { CreatePurchaseResponse, PurchaseDTO } from "../../models/purchases/PurchaseDTO";

export interface IPurchasesAPI {
  createPurchase(data: { user_id: number; flight_id: number }): Promise<CreatePurchaseResponse>;
  getUserPurchases(userId: number): Promise<PurchaseDTO[]>;
}
