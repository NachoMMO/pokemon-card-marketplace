// Tests unitarios para GetCardDetailsUseCase
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCardDetailsUseCase } from '../../../../application/use-cases/card/GetCardDetailsUseCase';
import type { ICardRepository } from '../../../../application/ports/repositories/ICardRepository';

describe('GetCardDetailsUseCase', () => {
  let useCase: GetCardDetailsUseCase;
  let mockCardRepository: Partial<ICardRepository>;

  beforeEach(() => {
    mockCardRepository = {
      findById: vi.fn(),
      search: vi.fn(),
      searchMarketplace: vi.fn(),
      countMarketplace: vi.fn(),
      findAll: vi.fn(),
      findBySet: vi.fn(),
      findBySeller: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    useCase = new GetCardDetailsUseCase(mockCardRepository as ICardRepository);
  });

  describe('execute', () => {
    it('should get card details successfully', async () => {
      const cardId = 'card-123';
      const mockCard = {
        id: 'card-123',
        name: 'Pikachu',
        type: 'Electric',
        rarity: 'Rare',
        expansion: 'Base Set',
        price: 25.99,
        stock: 1,
        imageUrl: 'https://example.com/pikachu.jpg',
        description: 'A cute electric Pokémon',
        sellerId: 'seller-1',
        condition: 'Near Mint',
        cardNumber: '025',
        artist: 'Ken Sugimori',
        isForSale: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      (mockCardRepository.findById! as any).mockResolvedValue(mockCard);

      const result = await useCase.execute(cardId);

      expect(result.success).toBe(true);
      expect(result.card).toEqual({
        id: mockCard.id,
        name: mockCard.name,
        type: mockCard.type,
        rarity: mockCard.rarity,
        expansion: mockCard.expansion,
        price: mockCard.price,
        stock: mockCard.stock,
        imageUrl: mockCard.imageUrl,
        description: mockCard.description,
        sellerId: mockCard.sellerId,
        condition: mockCard.condition,
        cardNumber: mockCard.cardNumber,
        artist: mockCard.artist,
        isForSale: mockCard.isForSale,
        createdAt: mockCard.createdAt,
        updatedAt: mockCard.updatedAt
      });
      expect(mockCardRepository.findById).toHaveBeenCalledWith(cardId);
    });

    it('should return error when card not found', async () => {
      const cardId = 'nonexistent-card';

      (mockCardRepository.findById! as any).mockResolvedValue(null);

      const result = await useCase.execute(cardId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Carta no encontrada');
      expect(mockCardRepository.findById).toHaveBeenCalledWith(cardId);
    });

    it('should handle repository errors gracefully', async () => {
      const cardId = 'card-123';

      (mockCardRepository.findById! as any).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await useCase.execute(cardId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should validate card ID parameter', async () => {
      const result = await useCase.execute('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de carta es requerido');
      expect(mockCardRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle null card ID', async () => {
      const result = await useCase.execute(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de carta es requerido');
      expect(mockCardRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle undefined card ID', async () => {
      const result = await useCase.execute(undefined as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de carta es requerido');
      expect(mockCardRepository.findById).not.toHaveBeenCalled();
    });
  });
});
