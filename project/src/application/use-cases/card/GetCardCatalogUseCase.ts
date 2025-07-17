import type { ICardRepository } from '../../ports/repositories/ICardRepository';
import type { MarketplaceCardCatalogDTO, MarketplaceCardResponseDTO } from '../../dtos/CardDTO';

export interface IGetCardCatalogUseCase {
  execute(limit?: number, offset?: number): Promise<{
    success: boolean;
    catalog?: MarketplaceCardCatalogDTO;
    error?: string;
  }>;
}

export class GetCardCatalogUseCase implements IGetCardCatalogUseCase {
  constructor(
    private readonly cardRepository: ICardRepository
  ) {}

  async execute(limit: number = 20, offset: number = 0): Promise<{
    success: boolean;
    catalog?: MarketplaceCardCatalogDTO;
    error?: string;
  }> {
    try {
      // Validaciones
      if (limit < 1 || limit > 100) {
        return {
          success: false,
          error: 'El límite debe estar entre 1 y 100'
        };
      }

      if (offset < 0) {
        return {
          success: false,
          error: 'El offset no puede ser negativo'
        };
      }

      // Obtener cartas
      const cards = await this.cardRepository.findAll(limit, offset);

      // Obtener total
      const total = await this.cardRepository.count();

      // Mapear a DTOs
      const cardDTOs: MarketplaceCardResponseDTO[] = cards.map(card => ({
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

      const catalog: MarketplaceCardCatalogDTO = {
        cards: cardDTOs,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      };

      return {
        success: true,
        catalog
      };
    } catch (error) {
      console.error('Error en GetCardCatalogUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener catálogo de cartas'
      };
    }
  }
}
