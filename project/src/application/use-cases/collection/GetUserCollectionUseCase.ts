import type { ICollectionRepository } from '../../ports/repositories/ICollectionRepository';
import type { ICardRepository } from '../../ports/repositories/ICardRepository';
import type { CollectionSummaryDTO, CollectionEntryResponseDTO } from '../../dtos/CollectionDTO';

export interface IGetUserCollectionUseCase {
  execute(userId: string): Promise<{
    success: boolean;
    collection?: CollectionSummaryDTO;
    error?: string;
  }>;
}

export class GetUserCollectionUseCase implements IGetUserCollectionUseCase {
  constructor(
    private readonly collectionRepository: ICollectionRepository,
    private readonly cardRepository: ICardRepository
  ) {}

  async execute(userId: string): Promise<{
    success: boolean;
    collection?: CollectionSummaryDTO;
    error?: string;
  }> {
    try {
      // Validaciones
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          error: 'ID de usuario es requerido'
        };
      }

      // Obtener entradas de la colección
      const collectionEntries = await this.collectionRepository.findByUserId(userId);

      // Construir respuesta con información de las cartas
      const entriesWithCardInfo: CollectionEntryResponseDTO[] = [];

      for (const entry of collectionEntries) {
        // Obtener información de la carta
        const card = await this.cardRepository.findById(entry.cardId);

        const entryResponse: CollectionEntryResponseDTO = {
          id: entry.id,
          userId: entry.userId,
          cardId: entry.cardId,
          quantity: entry.quantity,
          condition: entry.condition,
          acquiredDate: entry.acquiredDate,
          acquiredPrice: entry.acquiredPrice,
          currentValue: entry.currentValue,
          isForTrade: entry.isForTrade,
          notes: entry.notes,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          card: card ? {
            name: card.name,
            imageUrl: card.imageUrl,
            set: card.expansion,
            rarity: card.rarity,
            marketPrice: card.price
          } : undefined
        };

        entriesWithCardInfo.push(entryResponse);
      }

      // Calcular estadísticas
      const totalCards = await this.collectionRepository.countTotalCards(userId);
      const uniqueCards = await this.collectionRepository.countUniqueCards(userId);

      // Calcular valores financieros
      const totalInvestment = entriesWithCardInfo.reduce((sum, entry) => sum + (entry.acquiredPrice * entry.quantity), 0);
      const totalValue = entriesWithCardInfo.reduce((sum, entry) => sum + (entry.currentValue * entry.quantity), 0);
      const profitLoss = totalValue - totalInvestment;
      const tradableCards = entriesWithCardInfo.filter(entry => entry.isForTrade).length;

      const collectionSummary: CollectionSummaryDTO = {
        entries: entriesWithCardInfo,
        totalCards,
        uniqueCards,
        totalValue,
        totalInvestment,
        profitLoss,
        tradableCards
      };

      return {
        success: true,
        collection: collectionSummary
      };
    } catch (error) {
      console.error('Error en GetUserCollectionUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener la colección'
      };
    }
  }
}
