// Tests unitarios para GetCardCatalogUseCase
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCardCatalogUseCase } from '../../../../application/use-cases/card/GetCardCatalogUseCase';
import type { ICardRepository } from '../../../../application/ports/repositories/ICardRepository';
import type { Card } from '../../../../domain/entities/Card';

describe('GetCardCatalogUseCase', () => {
  let useCase: GetCardCatalogUseCase;
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

    useCase = new GetCardCatalogUseCase(mockCardRepository as ICardRepository);
  });

  describe('execute', () => {
    it('should get card catalog successfully', async () => {
      const mockCards: Card[] = [
        {
          id: 'card-1',
          name: 'Pikachu',
          type: 'Electric',
          rarity: 'Rare',
          expansion: 'Base Set',
          price: 25.99,
          stock: 3,
          imageUrl: 'https://example.com/pikachu.jpg',
          description: 'A cute electric Pokémon',
          sellerId: 'seller-1',
          condition: 'Near Mint',
          cardNumber: '025',
          artist: 'Ken Sugimori',
          isForSale: true,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T00:00:00Z')
        },
        {
          id: 'card-2',
          name: 'Charizard',
          type: 'Fire',
          rarity: 'Holo Rare',
          expansion: 'Base Set',
          price: 350.00,
          stock: 1,
          imageUrl: 'https://example.com/charizard.jpg',
          description: 'A powerful fire Pokémon',
          sellerId: 'seller-2',
          condition: 'Mint',
          cardNumber: '006',
          artist: 'Mitsuhiro Arita',
          isForSale: true,
          createdAt: new Date('2023-01-02T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z')
        }
      ];

      vi.mocked(mockCardRepository.findAll!).mockResolvedValue(mockCards);
      vi.mocked(mockCardRepository.count!).mockResolvedValue(150);

      const result = await useCase.execute(20, 0);

      expect(result.success).toBe(true);
      expect(result.catalog).toBeDefined();
      expect(result.catalog!.cards).toHaveLength(2);
      expect(result.catalog!.total).toBe(150);
      expect(result.catalog!.limit).toBe(20);
      expect(result.catalog!.offset).toBe(0);
      expect(result.catalog!.hasMore).toBe(true);

      // Verificar mapeo de DTOs
      expect(result.catalog!.cards[0]).toEqual({
        id: 'card-1',
        name: 'Pikachu',
        type: 'Electric',
        rarity: 'Rare',
        expansion: 'Base Set',
        price: 25.99,
        stock: 3,
        imageUrl: 'https://example.com/pikachu.jpg',
        description: 'A cute electric Pokémon',
        sellerId: 'seller-1',
        condition: 'Near Mint',
        cardNumber: '025',
        artist: 'Ken Sugimori',
        isForSale: true,
        createdAt: mockCards[0].createdAt,
        updatedAt: mockCards[0].updatedAt
      });

      expect(mockCardRepository.findAll).toHaveBeenCalledWith(20, 0);
      expect(mockCardRepository.count).toHaveBeenCalled();
    });

    it('should use default parameters', async () => {
      const mockCards: Card[] = [];

      vi.mocked(mockCardRepository.findAll!).mockResolvedValue(mockCards);
      vi.mocked(mockCardRepository.count!).mockResolvedValue(0);

      const result = await useCase.execute();

      expect(result.success).toBe(true);
      expect(result.catalog!.limit).toBe(20);
      expect(result.catalog!.offset).toBe(0);
      expect(mockCardRepository.findAll).toHaveBeenCalledWith(20, 0);
    });

    it('should calculate hasMore correctly when no more pages', async () => {
      const mockCards: Card[] = [];

      vi.mocked(mockCardRepository.findAll!).mockResolvedValue(mockCards);
      vi.mocked(mockCardRepository.count!).mockResolvedValue(15);

      const result = await useCase.execute(20, 0);

      expect(result.success).toBe(true);
      expect(result.catalog!.hasMore).toBe(false);
      expect(result.catalog!.total).toBe(15);
    });

    it('should validate limit parameter', async () => {
      // Límite demasiado pequeño
      let result = await useCase.execute(0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('El límite debe estar entre 1 y 100');

      // Límite demasiado grande
      result = await useCase.execute(101, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('El límite debe estar entre 1 y 100');

      expect(mockCardRepository.findAll).not.toHaveBeenCalled();
    });

    it('should validate offset parameter', async () => {
      const result = await useCase.execute(20, -1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El offset no puede ser negativo');
      expect(mockCardRepository.findAll).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      vi.mocked(mockCardRepository.findAll!).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await useCase.execute(20, 0);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should handle count repository errors gracefully', async () => {
      const mockCards: Card[] = [];

      vi.mocked(mockCardRepository.findAll!).mockResolvedValue(mockCards);
      vi.mocked(mockCardRepository.count!).mockRejectedValue(
        new Error('Count query failed')
      );

      const result = await useCase.execute(20, 0);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Count query failed');
    });

    it('should handle unknown errors', async () => {
      vi.mocked(mockCardRepository.findAll!).mockRejectedValue('Unknown error');

      const result = await useCase.execute(20, 0);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido al obtener catálogo de cartas');
    });

    it('should handle pagination correctly with different offsets', async () => {
      const mockCards: Card[] = [];

      vi.mocked(mockCardRepository.findAll!).mockResolvedValue(mockCards);
      vi.mocked(mockCardRepository.count!).mockResolvedValue(100);

      // Segunda página
      const result = await useCase.execute(20, 20);

      expect(result.success).toBe(true);
      expect(result.catalog!.offset).toBe(20);
      expect(result.catalog!.hasMore).toBe(true); // 20 + 20 < 100
      expect(mockCardRepository.findAll).toHaveBeenCalledWith(20, 20);
    });

    it('should handle last page correctly', async () => {
      const mockCards: Card[] = [];

      vi.mocked(mockCardRepository.findAll!).mockResolvedValue(mockCards);
      vi.mocked(mockCardRepository.count!).mockResolvedValue(100);

      // Última página (elementos 80-99)
      const result = await useCase.execute(20, 80);

      expect(result.success).toBe(true);
      expect(result.catalog!.offset).toBe(80);
      expect(result.catalog!.hasMore).toBe(false); // 80 + 20 = 100, no más elementos
    });
  });
});
