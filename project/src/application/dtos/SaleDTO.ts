export interface CreateSaleDTO {
  sellerId: string;
  cardId: string;
  quantity: number;
  price: number;
  condition: string;
  description?: string;
}

export interface UpdateSaleDTO {
  quantity?: number;
  price?: number;
  condition?: string;
  description?: string;
  isActive?: boolean;
}

export interface SaleResponseDTO {
  id: string;
  sellerId: string;
  cardId: string;
  quantity: number;
  price: number;
  condition: string;
  description?: string;
  isActive: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida
  card?: {
    name: string;
    imageUrl: string;
    set: string;
    rarity: string;
  };
  seller?: {
    displayName: string;
    tradingReputation: number;
    totalTrades: number;
  };
}

export interface SaleSearchDTO {
  cardName?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  sortBy?: 'price' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SaleListDTO {
  sales: SaleResponseDTO[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
