import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetUserCollectionUseCase } from '../../../../application/use-cases/collection/GetUserCollectionUseCase';
import type { ICollectionRepository } from '../../../../application/ports/repositories/ICollectionRepository';
import type { ICardRepository } from '../../../../application/ports/repositories/ICardRepository';
import { CollectionEntry } from '../../../../domain/entities/CollectionEntry';
import { Card } from '../../../../domain/entities/Card';

describe('GetUserCollectionUseCase', () => {
  let useCase: GetUserCollectionUseCase;
  let mockCollectionRepository: ICollectionRepository;
  let mockCardRepository: ICardRepository;

  const mockCard1: Card = new Card(
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

  const mockCard2: Card = new Card(
    'card-2',
    'Charizard',
    'Fire',
    'Rare',
    'Base Set',
    199.99,
    5,
    'https://example.com/charizard.jpg',
    'A powerful fire-breathing dragon Pokémon',
    'seller-2',
    'Lightly Played',
    '4/102',
    'Mitsuhiro Arita',
    true,
    new Date(),
    new Date()
  );

  const mockCollectionEntry1: CollectionEntry = new CollectionEntry(
    'entry-1',
    'user-1',
    'card-1',
    2,
    'Near Mint',
    new Date('2024-01-01'),
    20.00,
    25.99,
    false,
    'First Pikachu',
    new Date(),
    new Date()
  );

  const mockCollectionEntry2: CollectionEntry = new CollectionEntry(
    'entry-2',
    'user-1',
    'card-2',
    1,
    'Lightly Played',
    new Date('2024-01-02'),
    180.00,
    199.99,
    true,
    'Valuable Charizard',
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

    useCase = new GetUserCollectionUseCase(mockCollectionRepository, mockCardRepository);
  });

  describe('execute', () => {
    it('should get user collection successfully with multiple entries', async () => {
      // Arrange
      const userId = 'user-1';
      const collectionEntries = [mockCollectionEntry1, mockCollectionEntry2];

      vi.mocked(mockCollectionRepository.findByUserId).mockResolvedValue(collectionEntries);
      vi.mocked(mockCardRepository.findById)
        .mockResolvedValueOnce(mockCard1)
        .mockResolvedValueOnce(mockCard2);
      vi.mocked(mockCollectionRepository.countTotalCards).mockResolvedValue(3); // 2 + 1
      vi.mocked(mockCollectionRepository.countUniqueCards).mockResolvedValue(2);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection!.entries).toHaveLength(2);

      // Check first entry
      expect(result.collection!.entries[0]).toEqual({
        id: mockCollectionEntry1.id,
        userId: mockCollectionEntry1.userId,
        cardId: mockCollectionEntry1.cardId,
        quantity: mockCollectionEntry1.quantity,
        condition: mockCollectionEntry1.condition,
        acquiredDate: mockCollectionEntry1.acquiredDate,
        acquiredPrice: mockCollectionEntry1.acquiredPrice,
        currentValue: mockCollectionEntry1.currentValue,
        isForTrade: mockCollectionEntry1.isForTrade,
        notes: mockCollectionEntry1.notes,
        createdAt: mockCollectionEntry1.createdAt,
        updatedAt: mockCollectionEntry1.updatedAt,
        card: {
          name: mockCard1.name,
          imageUrl: mockCard1.imageUrl,
          set: mockCard1.expansion,
          rarity: mockCard1.rarity,
          marketPrice: mockCard1.price
        }
      });

      // Check statistics
      expect(result.collection!.totalCards).toBe(3);
      expect(result.collection!.uniqueCards).toBe(2);
      expect(result.collection!.totalInvestment).toBe(220.00); // (20.00 * 2) + (180.00 * 1)
      expect(result.collection!.totalValue).toBe(251.97); // (25.99 * 2) + (199.99 * 1)
      expect(result.collection!.profitLoss).toBe(31.97); // 251.97 - 220.00
      expect(result.collection!.tradableCards).toBe(1); // Only second entry is for trade

      expect(mockCollectionRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockCardRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockCollectionRepository.countTotalCards).toHaveBeenCalledWith(userId);
      expect(mockCollectionRepository.countUniqueCards).toHaveBeenCalledWith(userId);
    });

    it('should return empty collection when no entries found', async () => {
      // Arrange
      const userId = 'user-1';

      vi.mocked(mockCollectionRepository.findByUserId).mockResolvedValue([]);
      vi.mocked(mockCollectionRepository.countTotalCards).mockResolvedValue(0);
      vi.mocked(mockCollectionRepository.countUniqueCards).mockResolvedValue(0);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection!.entries).toHaveLength(0);
      expect(result.collection!.totalCards).toBe(0);
      expect(result.collection!.uniqueCards).toBe(0);
      expect(result.collection!.totalInvestment).toBe(0);
      expect(result.collection!.totalValue).toBe(0);
      expect(result.collection!.profitLoss).toBe(0);
      expect(result.collection!.tradableCards).toBe(0);

      expect(mockCardRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle missing card data gracefully', async () => {
      // Arrange
      const userId = 'user-1';
      const collectionEntries = [mockCollectionEntry1];

      vi.mocked(mockCollectionRepository.findByUserId).mockResolvedValue(collectionEntries);
      vi.mocked(mockCardRepository.findById).mockResolvedValue(null);
      vi.mocked(mockCollectionRepository.countTotalCards).mockResolvedValue(2);
      vi.mocked(mockCollectionRepository.countUniqueCards).mockResolvedValue(1);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.collection!.entries).toHaveLength(1);
      expect(result.collection!.entries[0].card).toBeUndefined();
      expect(result.collection!.totalInvestment).toBe(40.00); // 20.00 * 2
      expect(result.collection!.totalValue).toBe(51.98); // 25.99 * 2
    });

    it('should validate userId parameter', async () => {
      // Empty string
      let result = await useCase.execute('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de usuario es requerido');

      // Whitespace only
      result = await useCase.execute('   ');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de usuario es requerido');

      expect(mockCollectionRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should handle collection repository errors', async () => {
      // Arrange
      const userId = 'user-1';
      vi.mocked(mockCollectionRepository.findByUserId).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.collection).toBeUndefined();
    });

    it('should handle card repository errors', async () => {
      // Arrange
      const userId = 'user-1';
      const collectionEntries = [mockCollectionEntry1];

      vi.mocked(mockCollectionRepository.findByUserId).mockResolvedValue(collectionEntries);
      vi.mocked(mockCardRepository.findById).mockRejectedValue(new Error('Card service error'));

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Card service error');
      expect(result.collection).toBeUndefined();
    });

    it('should handle count repository errors', async () => {
      // Arrange
      const userId = 'user-1';
      const collectionEntries = [mockCollectionEntry1];

      vi.mocked(mockCollectionRepository.findByUserId).mockResolvedValue(collectionEntries);
      vi.mocked(mockCardRepository.findById).mockResolvedValue(mockCard1);
      vi.mocked(mockCollectionRepository.countTotalCards).mockRejectedValue(new Error('Count error'));

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Count error');
      expect(result.collection).toBeUndefined();
    });

    it('should handle unknown errors', async () => {
      // Arrange
      const userId = 'user-1';
      vi.mocked(mockCollectionRepository.findByUserId).mockRejectedValue('Unknown error');

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido al obtener la colección');
      expect(result.collection).toBeUndefined();
    });

    it('should calculate profit/loss correctly', async () => {
      // Arrange
      const userId = 'user-1';
      const profitableEntry = new CollectionEntry(
        'entry-profit',
        'user-1',
        'card-1',
        1,
        'Near Mint',
        new Date(),
        10.00, // Bought for $10
        30.00, // Now worth $30
        false,
        'Profitable card',
        new Date(),
        new Date()
      );

      const lossEntry = new CollectionEntry(
        'entry-loss',
        'user-1',
        'card-2',
        1,
        'Poor',
        new Date(),
        100.00, // Bought for $100
        50.00,  // Now worth $50
        false,
        'Card lost value',
        new Date(),
        new Date()
      );

      vi.mocked(mockCollectionRepository.findByUserId).mockResolvedValue([profitableEntry, lossEntry]);
      vi.mocked(mockCardRepository.findById)
        .mockResolvedValueOnce(mockCard1)
        .mockResolvedValueOnce(mockCard2);
      vi.mocked(mockCollectionRepository.countTotalCards).mockResolvedValue(2);
      vi.mocked(mockCollectionRepository.countUniqueCards).mockResolvedValue(2);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.collection!.totalInvestment).toBe(110.00); // 10 + 100
      expect(result.collection!.totalValue).toBe(80.00); // 30 + 50
      expect(result.collection!.profitLoss).toBe(-30.00); // 80 - 110 (loss)
    });
  });
});
