export interface AddToCollectionDTO {
  userId: string;
  cardId: string;
  quantity: number;
  condition: string;
  acquiredPrice: number;
  notes?: string;
}

export interface UpdateCollectionEntryDTO {
  quantity?: number;
  condition?: string;
  currentValue?: number;
  isForTrade?: boolean;
  notes?: string;
}

export interface CollectionEntryResponseDTO {
  id: string;
  userId: string;
  cardId: string;
  quantity: number;
  condition: string;
  acquiredDate: Date;
  acquiredPrice: number;
  currentValue: number;
  isForTrade: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  // Información de la carta incluida
  card?: {
    name: string;
    imageUrl: string;
    set: string;
    rarity: string;
    marketPrice?: number;
  };
}

export interface CollectionSummaryDTO {
  entries: CollectionEntryResponseDTO[];
  totalCards: number;
  uniqueCards: number;
  totalValue: number;
  totalInvestment: number;
  profitLoss: number;
  tradableCards: number;
}
