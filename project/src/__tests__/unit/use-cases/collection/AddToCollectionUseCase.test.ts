import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddToCollectionUseCase } from '../../../../application/use-cases/collection/AddToCollectionUseCase';
import type { ICollectionRepository } from '../../../../application/ports/repositories/ICollectionRepository';
import type { ICardRepository } from '../../../../application/ports/repositories/ICardRepository';
import type { AddToCollectionDTO } from '../../../../application/dtos/CollectionDTO';
import { CollectionEntry } from '../../../../domain/entities/CollectionEntry';
import { Card } from '../../../../domain/entities/Card';

describe('AddToCollectionUseCase', () => {
  let useCase: AddToCollectionUseCase;
  let mockCollectionRepository: ICollectionRepository;
  let mockCardRepository: ICardRepository;

  const mockCard: Card = new Card(
    'card-1',
    'Pikachu',
    'Electric',
    'Common',
    'Base Set',
    25.99,
    10,
    'https://example.com/pikachu.jpg',
    'A cute electric mouse Pokémon',
    'seller-1',
    'Near Mint',
    '25/102',
    'Atsuko Nishida',
    true,
    new Date(),
    new Date()
  );

  const mockCollectionEntry: CollectionEntry = new CollectionEntry(
    'entry-1',
    'user-1',
    'card-1',
    2,
    'Near Mint',
    new Date(),
    25.99,
    25.99,
    false,
    'Test notes',
    new Date(),
    new Date()
  );

  beforeEach(() => {
    mockCollectionRepository = {
      addCard: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdAndCardId: vi.fn(),
      updateQuantity: vi.fn(),
      removeCard: vi.fn(),
      countUniqueCards: vi.fn(),
      countTotalCards: vi.fn()
    };

    mockCardRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      search: vi.fn(),
      findBySet: vi.fn(),
      findBySeller: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      searchMarketplace: vi.fn(),
      countMarketplace: vi.fn()
    };

    useCase = new AddToCollectionUseCase(mockCollectionRepository, mockCardRepository);
  });

  describe('execute', () => {
    const validAddToCollectionData: AddToCollectionDTO = {
      userId: 'user-1',
      cardId: 'card-1',
      quantity: 1,
      condition: 'Near Mint',
      acquiredPrice: 25.99,
      notes: 'First Pikachu'
    };

    it('should add new card to collection successfully', async () => {
      // Arrange
      vi.mocked(mockCardRepository.findById).mockResolvedValue(mockCard);
      vi.mocked(mockCollectionRepository.findByUserIdAndCardId).mockResolvedValue(null);
      vi.mocked(mockCollectionRepository.addCard).mockResolvedValue(mockCollectionEntry);

      // Act
      const result = await useCase.execute(validAddToCollectionData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.collectionEntry).toBeDefined();
      expect(result.collectionEntry!.cardId).toBe(validAddToCollectionData.cardId);
      expect(result.collectionEntry!.quantity).toBe(mockCollectionEntry.quantity);
      expect(result.collectionEntry!.condition).toBe(validAddToCollectionData.condition);
      expect(result.collectionEntry!.card).toEqual({
        name: mockCard.name,
        imageUrl: mockCard.imageUrl,
        set: mockCard.expansion,
        rarity: mockCard.rarity,
        marketPrice: mockCard.price
      });

      expect(mockCardRepository.findById).toHaveBeenCalledWith(validAddToCollectionData.cardId);
      expect(mockCollectionRepository.findByUserIdAndCardId).toHaveBeenCalledWith(
        validAddToCollectionData.userId,
        validAddToCollectionData.cardId
      );
      expect(mockCollectionRepository.addCard).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: validAddToCollectionData.userId,
          cardId: validAddToCollectionData.cardId,
          quantity: validAddToCollectionData.quantity,
          condition: validAddToCollectionData.condition,
          acquiredPrice: validAddToCollectionData.acquiredPrice,
          notes: validAddToCollectionData.notes
        })
      );
    });

    it('should update existing collection entry with same condition', async () => {
      // Arrange
      const existingEntry = new CollectionEntry(
        'entry-1',
        'user-1',
        'card-1',
        1,
        'Near Mint', // Same condition
        new Date(),
        20.00,
        20.00,
        false,
        'Existing notes',
        new Date(),
        new Date()
      );

      const updatedEntry = new CollectionEntry(
        'entry-1',
        'user-1',
        'card-1',
        3, // Original 1 + new 2
        'Near Mint',
        new Date(),
        20.00,
        20.00,
        false,
        'Existing notes',
        new Date(),
        new Date()
      );

      vi.mocked(mockCardRepository.findById).mockResolvedValue(mockCard);
      vi.mocked(mockCollectionRepository.findByUserIdAndCardId).mockResolvedValue(existingEntry);
      vi.mocked(mockCollectionRepository.updateQuantity).mockResolvedValue(updatedEntry);

      const addData: AddToCollectionDTO = {
        userId: 'user-1',
        cardId: 'card-1',
        quantity: 2,
        condition: 'Near Mint', // Same as existing
        acquiredPrice: 25.99
      };

      // Act
      const result = await useCase.execute(addData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.collectionEntry!.quantity).toBe(3); // 1 + 2
      expect(mockCollectionRepository.updateQuantity).toHaveBeenCalledWith(
        existingEntry.id,
        3 // existing.quantity + addData.quantity
      );
    });

    it('should create new entry for existing card with different condition', async () => {
      // Arrange
      const existingEntry = new CollectionEntry(
        'entry-1',
        'user-1',
        'card-1',
        1,
        'Lightly Played', // Different condition
        new Date(),
        20.00,
        20.00,
        false,
        'Existing notes',
        new Date(),
        new Date()
      );

      vi.mocked(mockCardRepository.findById).mockResolvedValue(mockCard);
      vi.mocked(mockCollectionRepository.findByUserIdAndCardId).mockResolvedValue(existingEntry);
      vi.mocked(mockCollectionRepository.addCard).mockResolvedValue(mockCollectionEntry);

      const addData: AddToCollectionDTO = {
        userId: 'user-1',
        cardId: 'card-1',
        quantity: 1,
        condition: 'Near Mint', // Different from existing
        acquiredPrice: 25.99
      };

      // Act
      const result = await useCase.execute(addData);

      // Assert
      expect(result.success).toBe(true);
      expect(mockCollectionRepository.addCard).toHaveBeenCalled();
      expect(mockCollectionRepository.updateQuantity).not.toHaveBeenCalled();
    });

    it('should return error when card does not exist', async () => {
      // Arrange
      vi.mocked(mockCardRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(validAddToCollectionData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('La carta no existe');
      expect(result.collectionEntry).toBeUndefined();
      expect(mockCollectionRepository.findByUserIdAndCardId).not.toHaveBeenCalled();
    });

    it('should handle collection repository errors during add', async () => {
      // Arrange
      vi.mocked(mockCardRepository.findById).mockResolvedValue(mockCard);
      vi.mocked(mockCollectionRepository.findByUserIdAndCardId).mockResolvedValue(null);
      vi.mocked(mockCollectionRepository.addCard).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(validAddToCollectionData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.collectionEntry).toBeUndefined();
    });

    it('should handle collection repository errors during update', async () => {
      // Arrange
      const existingEntry = new CollectionEntry(
        'entry-1',
        'user-1',
        'card-1',
        1,
        'Near Mint',
        new Date(),
        20.00,
        20.00,
        false,
        'Existing notes',
        new Date(),
        new Date()
      );

      vi.mocked(mockCardRepository.findById).mockResolvedValue(mockCard);
      vi.mocked(mockCollectionRepository.findByUserIdAndCardId).mockResolvedValue(existingEntry);
      vi.mocked(mockCollectionRepository.updateQuantity).mockRejectedValue(new Error('Update failed'));

      // Act
      const result = await useCase.execute(validAddToCollectionData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
      expect(result.collectionEntry).toBeUndefined();
    });

    it('should handle card repository errors', async () => {
      // Arrange
      vi.mocked(mockCardRepository.findById).mockRejectedValue(new Error('Card service error'));

      // Act
      const result = await useCase.execute(validAddToCollectionData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Card service error');
      expect(result.collectionEntry).toBeUndefined();
    });

    it('should handle unknown errors', async () => {
      // Arrange
      vi.mocked(mockCardRepository.findById).mockRejectedValue('Unknown error');

      // Act
      const result = await useCase.execute(validAddToCollectionData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido');
      expect(result.collectionEntry).toBeUndefined();
    });

    it('should handle collection entry without notes', async () => {
      // Arrange
      const dataWithoutNotes: AddToCollectionDTO = {
        userId: 'user-1',
        cardId: 'card-1',
        quantity: 1,
        condition: 'Near Mint',
        acquiredPrice: 25.99
        // notes omitted
      };

      vi.mocked(mockCardRepository.findById).mockResolvedValue(mockCard);
      vi.mocked(mockCollectionRepository.findByUserIdAndCardId).mockResolvedValue(null);
      vi.mocked(mockCollectionRepository.addCard).mockResolvedValue(mockCollectionEntry);

      // Act
      const result = await useCase.execute(dataWithoutNotes);

      // Assert
      expect(result.success).toBe(true);
      expect(mockCollectionRepository.addCard).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: '' // Should default to empty string
        })
      );
    });
  });
});
