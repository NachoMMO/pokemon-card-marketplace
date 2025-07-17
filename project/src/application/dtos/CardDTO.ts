export interface CardSearchDTO {
  name?: string;
  set?: string;
  rarity?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface CardResponseDTO {
  id: string;
  pokemonTcgId: string;
  name: string;
  imageUrl: string;
  imageUrlHiRes?: string;
  set: string;
  setName: string;
  rarity: string;
  types: string[];
  subtypes: string[];
  number: string;
  artist?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  marketPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para cartas del marketplace (entidad Card del dominio)
export interface MarketplaceCardResponseDTO {
  id: string;
  name: string;
  type: string;
  rarity: string;
  expansion: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  sellerId: string;
  condition: string;
  cardNumber: string;
  artist: string;
  isForSale: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardCatalogDTO {
  cards: CardResponseDTO[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface MarketplaceCardCatalogDTO {
  cards: MarketplaceCardResponseDTO[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
