export interface AddToCartDTO {
  userId: string;
  cardId: string;
  quantity: number;
  priceAtTime: number;
}

export interface UpdateCartItemDTO {
  quantity?: number;
  priceAtTime?: number;
}

export interface CartItemResponseDTO {
  id: string;
  userId: string;
  cardId: string;
  quantity: number;
  priceAtTime: number;
  isActive: boolean;
  reservedUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  // Información de la carta incluida
  card?: {
    id: string;
    name: string;
    imageUrl: string;
    condition: string;
    sellerName: string;
  };
}

export interface CartSummaryDTO {
  items: CartItemResponseDTO[];
  totalItems: number;
  totalPrice: number;
  totalUniqueCards: number;
}
