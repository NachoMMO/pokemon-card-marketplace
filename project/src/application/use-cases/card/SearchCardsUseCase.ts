import type { ICardRepository } from '../../ports/repositories/ICardRepository';
import type { MarketplaceCardCatalogDTO, MarketplaceCardResponseDTO } from '../../dtos/CardDTO';

export interface SearchCardsDTO {
  name?: string;
  type?: string;
  rarity?: string;
  expansion?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  isForSale?: boolean;
  limit?: number;
  offset?: number;
}

export interface ISearchCardsUseCase {
  execute(searchData: SearchCardsDTO): Promise<{
    success: boolean;
    result?: MarketplaceCardCatalogDTO;
    error?: string;
  }>;
}

export class SearchCardsUseCase implements ISearchCardsUseCase {
  constructor(
    private readonly cardRepository: ICardRepository
  ) {}

  async execute(searchData: SearchCardsDTO): Promise<{
    success: boolean;
    result?: MarketplaceCardCatalogDTO;
    error?: string;
  }> {
    try {
      const {
        name,
        type,
        rarity,
        expansion,
        minPrice,
        maxPrice,
        condition,
        isForSale = true, // Por defecto, buscar solo cartas a la venta
        limit = 20,
        offset = 0
      } = searchData;

      // Validaciones
      if (limit && (limit < 1 || limit > 100)) {
        return {
          success: false,
          error: 'El límite debe estar entre 1 y 100'
        };
      }

      if (offset && offset < 0) {
        return {
          success: false,
          error: 'El offset no puede ser negativo'
        };
      }

      if (minPrice && minPrice < 0) {
        return {
          success: false,
          error: 'El precio mínimo no puede ser negativo'
        };
      }

      if (maxPrice && maxPrice < 0) {
        return {
          success: false,
          error: 'El precio máximo no puede ser negativo'
        };
      }

      if (minPrice && maxPrice && minPrice > maxPrice) {
        return {
          success: false,
          error: 'El precio mínimo no puede ser mayor al precio máximo'
        };
      }

      // Realizar búsqueda
      const searchResults = await this.cardRepository.searchMarketplace({
        name,
        type,
        rarity,
        expansion,
        minPrice,
        maxPrice,
        condition,
        isForSale
      }, limit, offset);

      // Obtener total de resultados
      const total = await this.cardRepository.countMarketplace({
        name,
        type,
        rarity,
        expansion,
        minPrice,
        maxPrice,
        condition,
        isForSale
      });

      // Mapear resultados a DTO
      const cardDTOs: MarketplaceCardResponseDTO[] = searchResults.map(card => ({
        id: card.id,
        name: card.name,
        type: card.type,
        rarity: card.rarity,
        expansion: card.expansion,
        price: card.price,
        stock: card.stock,
        imageUrl: card.imageUrl,
        description: card.description,
        sellerId: card.sellerId,
        condition: card.condition,
        cardNumber: card.cardNumber,
        artist: card.artist,
        isForSale: card.isForSale,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt
      }));

      const result: MarketplaceCardCatalogDTO = {
        cards: cardDTOs,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      };

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Error en SearchCardsUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al buscar cartas'
      };
    }
  }
}
