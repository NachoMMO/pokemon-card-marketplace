import type { ICollectionRepository } from '../../ports/repositories/ICollectionRepository';
import type { ICardRepository } from '../../ports/repositories/ICardRepository';
import type { AddToCollectionDTO, CollectionEntryResponseDTO } from '../../dtos/CollectionDTO';
import { CollectionEntry } from '../../../domain/entities/CollectionEntry';

export interface IAddToCollectionUseCase {
  execute(addToCollectionData: AddToCollectionDTO): Promise<{
    success: boolean;
    collectionEntry?: CollectionEntryResponseDTO;
    error?: string;
  }>;
}

export class AddToCollectionUseCase implements IAddToCollectionUseCase {
  constructor(
    private readonly collectionRepository: ICollectionRepository,
    private readonly cardRepository: ICardRepository
  ) {}

  async execute(addToCollectionData: AddToCollectionDTO): Promise<{
    success: boolean;
    collectionEntry?: CollectionEntryResponseDTO;
    error?: string;
  }> {
    try {
      // Verificar que la carta existe
      const card = await this.cardRepository.findById(addToCollectionData.cardId);
      if (!card) {
        return {
          success: false,
          error: 'La carta no existe'
        };
      }

      // Verificar si ya existe una entrada para esta carta y condición
      const existingEntry = await this.collectionRepository.findByUserIdAndCardId(
        addToCollectionData.userId,
        addToCollectionData.cardId
      );

      if (existingEntry && existingEntry.condition === addToCollectionData.condition) {
        // Si existe con la misma condición, actualizar la cantidad
        const updatedEntry = await this.collectionRepository.updateQuantity(
          existingEntry.id,
          existingEntry.quantity + addToCollectionData.quantity
        );

        return {
          success: true,
          collectionEntry: {
            id: updatedEntry.id,
            userId: updatedEntry.userId,
            cardId: updatedEntry.cardId,
            quantity: updatedEntry.quantity,
            condition: updatedEntry.condition,
            acquiredDate: updatedEntry.acquiredDate,
            acquiredPrice: updatedEntry.acquiredPrice,
            currentValue: updatedEntry.currentValue,
            isForTrade: updatedEntry.isForTrade,
            notes: updatedEntry.notes,
            createdAt: updatedEntry.createdAt,
            updatedAt: updatedEntry.updatedAt,
            card: {
              name: card.name,
              imageUrl: card.imageUrl,
              set: card.expansion,
              rarity: card.rarity,
              marketPrice: card.price
            }
          }
        };
      }

      // Si no existe o es diferente condición, crear nueva entrada
      const collectionEntry = new CollectionEntry(
        crypto.randomUUID(),
        addToCollectionData.userId,
        addToCollectionData.cardId,
        addToCollectionData.quantity,
        addToCollectionData.condition,
        new Date(),
        addToCollectionData.acquiredPrice,
        addToCollectionData.acquiredPrice, // Valor inicial igual al precio de adquisición
        false, // No está para intercambio por defecto
        addToCollectionData.notes || '',
        new Date(),
        new Date()
      );

      const createdEntry = await this.collectionRepository.addCard(collectionEntry);

      return {
        success: true,
        collectionEntry: {
          id: createdEntry.id,
          userId: createdEntry.userId,
          cardId: createdEntry.cardId,
          quantity: createdEntry.quantity,
          condition: createdEntry.condition,
          acquiredDate: createdEntry.acquiredDate,
          acquiredPrice: createdEntry.acquiredPrice,
          currentValue: createdEntry.currentValue,
          isForTrade: createdEntry.isForTrade,
          notes: createdEntry.notes,
          createdAt: createdEntry.createdAt,
          updatedAt: createdEntry.updatedAt,
          card: {
            name: card.name,
            imageUrl: card.imageUrl,
            set: card.expansion,
            rarity: card.rarity,
            marketPrice: card.price
          }
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
