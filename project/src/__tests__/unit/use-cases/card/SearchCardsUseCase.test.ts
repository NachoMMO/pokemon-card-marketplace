// Tests unitarios para SearchCardsUseCase
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchCardsUseCase, type SearchCardsDTO } from '../../../../application/use-cases/card/SearchCardsUseCase';
import type { ICardRepository } from '../../../../application/ports/repositories/ICardRepository';
import type { Card } from '../../../../domain/entities/Card';

describe('SearchCardsUseCase', () => {
  let useCase: SearchCardsUseCase;
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

    useCase = new SearchCardsUseCase(mockCardRepository as ICardRepository);
  });

  describe('execute', () => {
    it('should search cards successfully with basic criteria', async () => {
      const searchData: SearchCardsDTO = {
        name: 'Pikachu',
        type: 'Electric',
        limit: 10,
        offset: 0
      };

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
        }
      ];

      vi.mocked(mockCardRepository.searchMarketplace!).mockResolvedValue(mockCards);
      vi.mocked(mockCardRepository.countMarketplace!).mockResolvedValue(1);

      const result = await useCase.execute(searchData);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result!.cards).toHaveLength(1);
      expect(result.result!.total).toBe(1);
      expect(result.result!.limit).toBe(10);
      expect(result.result!.offset).toBe(0);
      expect(result.result!.hasMore).toBe(false);

      expect(mockCardRepository.searchMarketplace).toHaveBeenCalledWith({
        name: 'Pikachu',
        type: 'Electric',
        isForSale: true // valor por defecto
      }, 10, 0);

      expect(mockCardRepository.countMarketplace).toHaveBeenCalledWith({
        name: 'Pikachu',
        type: 'Electric',
        isForSale: true
      });
    });

    it('should use default values when not provided', async () => {
      const searchData: SearchCardsDTO = {
        name: 'Charizard'
      };

      vi.mocked(mockCardRepository.searchMarketplace!).mockResolvedValue([]);
      vi.mocked(mockCardRepository.countMarketplace!).mockResolvedValue(0);

      const result = await useCase.execute(searchData);

      expect(result.success).toBe(true);
      expect(result.result!.limit).toBe(20); // valor por defecto
      expect(result.result!.offset).toBe(0); // valor por defecto

      expect(mockCardRepository.searchMarketplace).toHaveBeenCalledWith({
        name: 'Charizard',
        isForSale: true // valor por defecto
      }, 20, 0);
    });

    it('should search cards with price range', async () => {
      const searchData: SearchCardsDTO = {
        minPrice: 10.00,
        maxPrice: 50.00,
        rarity: 'Rare'
      };

      vi.mocked(mockCardRepository.searchMarketplace!).mockResolvedValue([]);
      vi.mocked(mockCardRepository.countMarketplace!).mockResolvedValue(0);

      const result = await useCase.execute(searchData);

      expect(result.success).toBe(true);
      expect(mockCardRepository.searchMarketplace).toHaveBeenCalledWith({
        minPrice: 10.00,
        maxPrice: 50.00,
        rarity: 'Rare',
        isForSale: true
      }, 20, 0);
    });

    it('should search cards with all criteria', async () => {
      const searchData: SearchCardsDTO = {
        name: 'Charizard',
        type: 'Fire',
        rarity: 'Holo Rare',
        expansion: 'Base Set',
        minPrice: 100.00,
        maxPrice: 500.00,
        condition: 'Mint',
        isForSale: false, // buscar cartas no disponibles
        limit: 5,
        offset: 10
      };

      vi.mocked(mockCardRepository.searchMarketplace!).mockResolvedValue([]);
      vi.mocked(mockCardRepository.countMarketplace!).mockResolvedValue(0);

      const result = await useCase.execute(searchData);

      expect(result.success).toBe(true);
      expect(mockCardRepository.searchMarketplace).toHaveBeenCalledWith({
        name: 'Charizard',
        type: 'Fire',
        rarity: 'Holo Rare',
        expansion: 'Base Set',
        minPrice: 100.00,
        maxPrice: 500.00,
        condition: 'Mint',
        isForSale: false
      }, 5, 10);
    });

    it('should validate limit parameter', async () => {
      // Límite demasiado grande
      let result = await useCase.execute({ limit: 101 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('El límite debe estar entre 1 y 100');

      // Para límite 0, NO se valida porque el check es `if (limit && ...)`
      // pero sí se usa el valor 0 (no el default), así que el repositorio se llama con 0
      vi.mocked(mockCardRepository.searchMarketplace!).mockResolvedValue([]);
      vi.mocked(mockCardRepository.countMarketplace!).mockResolvedValue(0);

      result = await useCase.execute({ limit: 0 });
      expect(result.success).toBe(true);

      // Verificar que se llamó con limit: 0, no con el default 20
      expect(mockCardRepository.searchMarketplace).toHaveBeenCalledWith(
        expect.objectContaining({
          isForSale: true
        }),
        0,  // Se usa el valor 0 pasado, no el default
        0   // offset por defecto
      );
    });

    it('should validate offset parameter', async () => {
      const result = await useCase.execute({ offset: -1 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('El offset no puede ser negativo');
      expect(mockCardRepository.searchMarketplace).not.toHaveBeenCalled();
    });

    it('should validate price parameters', async () => {
      // Precio mínimo negativo
      let result = await useCase.execute({ minPrice: -10 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('El precio mínimo no puede ser negativo');

      // Precio máximo negativo
      result = await useCase.execute({ maxPrice: -20 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('El precio máximo no puede ser negativo');

      // Precio mínimo mayor al máximo
      result = await useCase.execute({ minPrice: 100, maxPrice: 50 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('El precio mínimo no puede ser mayor al precio máximo');

      expect(mockCardRepository.searchMarketplace).not.toHaveBeenCalled();
    });

    it('should handle repository search errors gracefully', async () => {
      vi.mocked(mockCardRepository.searchMarketplace!).mockRejectedValue(
        new Error('Search query failed')
      );

      const result = await useCase.execute({ name: 'Pikachu' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Search query failed');
    });

    it('should handle repository count errors gracefully', async () => {
      vi.mocked(mockCardRepository.searchMarketplace!).mockResolvedValue([]);
      vi.mocked(mockCardRepository.countMarketplace!).mockRejectedValue(
        new Error('Count query failed')
      );

      const result = await useCase.execute({ name: 'Pikachu' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Count query failed');
    });

    it('should handle unknown errors', async () => {
      vi.mocked(mockCardRepository.searchMarketplace!).mockRejectedValue('Unknown error');

      const result = await useCase.execute({ name: 'Pikachu' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido al buscar cartas');
    });

    it('should calculate hasMore correctly', async () => {
      const searchData: SearchCardsDTO = {
        name: 'Pikachu',
        limit: 5,
        offset: 0
      };

      vi.mocked(mockCardRepository.searchMarketplace!).mockResolvedValue([]);
      vi.mocked(mockCardRepository.countMarketplace!).mockResolvedValue(15);

      const result = await useCase.execute(searchData);

      expect(result.success).toBe(true);
      expect(result.result!.hasMore).toBe(true); // 0 + 5 < 15
    });

    it('should map card data correctly to DTO', async () => {
      const mockCard: Card = {
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
      };

      vi.mocked(mockCardRepository.searchMarketplace!).mockResolvedValue([mockCard]);
      vi.mocked(mockCardRepository.countMarketplace!).mockResolvedValue(1);

      const result = await useCase.execute({ name: 'Pikachu' });

      expect(result.success).toBe(true);
      expect(result.result!.cards[0]).toEqual({
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
    });
  });
});
