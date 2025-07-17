export interface CreatePurchaseDTO {
  buyerId: string;
  sellerId: string;
  cardId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface PurchaseResponseDTO {
  id: string;
  buyerId: string;
  sellerId: string;
  cardId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  trackingNumber?: string;
  purchaseDate: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida
  card?: {
    name: string;
    imageUrl: string;
    condition: string;
  };
  buyer?: {
    displayName: string;
    email: string;
  };
  seller?: {
    displayName: string;
    email: string;
  };
}

export interface PurchaseHistoryDTO {
  purchases: PurchaseResponseDTO[];
  total: number;
  totalSpent: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
