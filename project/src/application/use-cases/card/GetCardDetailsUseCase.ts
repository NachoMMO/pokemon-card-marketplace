import type { ICardRepository } from '../../ports/repositories/ICardRepository';
import type { MarketplaceCardResponseDTO } from '../../dtos/CardDTO';

export interface IGetCardDetailsUseCase {
  execute(cardId: string): Promise<{
    success: boolean;
    card?: MarketplaceCardResponseDTO;
    error?: string;
  }>;
}

export class GetCardDetailsUseCase implements IGetCardDetailsUseCase {
  constructor(
    private readonly cardRepository: ICardRepository
  ) {}

  async execute(cardId: string): Promise<{
    success: boolean;
    card?: MarketplaceCardResponseDTO;
    error?: string;
  }> {
    try {
      // Validar que el cardId no esté vacío
      if (!cardId || cardId.trim() === '') {
        return {
          success: false,
          error: 'ID de carta es requerido'
        };
      }

      // Buscar la carta
      const card = await this.cardRepository.findById(cardId);

      if (!card) {
        return {
          success: false,
          error: 'Carta no encontrada'
        };
      }

      // Construir respuesta DTO
      const cardResponse: MarketplaceCardResponseDTO = {
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
      };

      return {
        success: true,
        card: cardResponse
      };
    } catch (error) {
      console.error('Error en GetCardDetailsUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener detalles de la carta'
      };
    }
  }
}
