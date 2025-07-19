// Tests unitarios para SearchCardsAdvancedUseCase
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchCardsAdvancedUseCase } from '../../../../application/use-cases/card/SearchCardsAdvancedUseCase';
import type { IDataService, PaginatedResult } from '../../../../application/ports/services/IDataService';
import { createPaginatedResult } from '../../../mocks/supabase.mock';

const createMockDataService = (): IDataService => ({
  getMany: vi.fn(),
  getById: vi.fn(),
  getOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  createMany: vi.fn(),
  upsert: vi.fn(),
  count: vi.fn(),
  rpc: vi.fn(),
  executeQuery: vi.fn(),
});

describe('SearchCardsAdvancedUseCase', () => {
  let mockDataService: IDataService;
  let useCase: SearchCardsAdvancedUseCase;

  beforeEach(() => {
    mockDataService = createMockDataService();
    useCase = new SearchCardsAdvancedUseCase(mockDataService);
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('should search cards with basic query', async () => {
      const mockCards = [
        { id: '1', name: 'Pikachu', set_name: 'Base Set', type: 'Pokemon', rarity: 'common' },
        { id: '2', name: 'Charizard', set_name: 'Base Set', type: 'Pokemon', rarity: 'rare' },
      ];
      const mockResult = createPaginatedResult(mockCards);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      const result = await useCase.execute(
        { query: 'Pikachu' },
        { page: 1, limit: 20 }
      );

      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          filters: expect.arrayContaining([
            { column: 'status', operator: 'eq', value: 'available' },
            { column: 'name', operator: 'ilike', value: '%Pikachu%' }
          ])
        })
      );

      expect(result.cards).toEqual(mockCards);
      expect(result.totalCount).toBe(mockCards.length);
    });

    it('should search cards with multiple filters', async () => {
      const mockCards = [
        { id: '1', name: 'Pikachu', type: 'Pokemon', rarity: 'common' },
      ];
      const mockResult = createPaginatedResult(mockCards);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      const result = await useCase.execute(
        {
          query: 'Pikachu',
          type: 'Pokemon',
          rarity: ['common'],
          minPrice: 5,
          maxPrice: 15,
          condition: 'mint',
        },
        { page: 1, limit: 10 }
      );

      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          filters: expect.any(Array),
          limit: 10,
          offset: 0,
        })
      );

      expect(result.cards).toEqual(mockCards);
    });

    it('should apply sorting', async () => {
      const mockCards = [
        { id: '1', name: 'Charizard', price: 100 },
        { id: '2', name: 'Pikachu', price: 10 },
      ];
      const mockResult = createPaginatedResult(mockCards);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      await useCase.execute(
        { sortBy: 'price_desc' },
        { page: 1, limit: 20 }
      );

      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          orderBy: expect.objectContaining({
            ascending: false
          }),
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const mockCards = [
        { id: '21', name: 'Card 21' },
        { id: '22', name: 'Card 22' },
      ];
      const mockResult = createPaginatedResult(mockCards, 2, 20);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      const result = await useCase.execute(
        {},
        { page: 2, limit: 20 }
      );

      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          limit: 20,
          offset: 20, // (page - 1) * limit
        })
      );

      expect(result.page).toBe(2);
    });

    it('should filter by price range', async () => {
      const mockCards = [
        { id: '1', name: 'Pikachu', price: 10 },
      ];
      const mockResult = createPaginatedResult(mockCards);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      await useCase.execute(
        { minPrice: 5, maxPrice: 15 },
        { page: 1, limit: 20 }
      );

      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              column: 'price',
              operator: 'gte',
              value: 5
            }),
            expect.objectContaining({
              column: 'price',
              operator: 'lte',
              value: 15
            }),
          ]),
        })
      );
    });

    it('should handle empty results', async () => {
      const mockResult = createPaginatedResult([]);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      const result = await useCase.execute(
        { query: 'NonexistentCard' },
        { page: 1, limit: 20 }
      );

      expect(result.cards).toEqual([]);
      expect(result.totalCount).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });

    it('should filter by seller', async () => {
      const mockCards = [
        { id: '1', name: 'Pikachu', seller_id: 'seller-123' },
      ];
      const mockResult = createPaginatedResult(mockCards);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      await useCase.execute(
        { sellerId: 'seller-123' },
        { page: 1, limit: 20 }
      );

      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              column: 'seller_id',
              operator: 'eq',
              value: 'seller-123'
            }),
          ]),
        })
      );
    });

    it('should filter by multiple rarities', async () => {
      const mockCards = [
        { id: '1', name: 'Pikachu', rarity: 'common' },
        { id: '2', name: 'Charizard', rarity: 'rare' },
      ];
      const mockResult = createPaginatedResult(mockCards);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      await useCase.execute(
        { rarity: ['common', 'rare'] },
        { page: 1, limit: 20 }
      );

      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              column: 'rarity',
              operator: 'in',
              value: ['common', 'rare']
            }),
          ]),
        })
      );
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      (mockDataService.getMany as any).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(
        { query: 'Pikachu' },
        { page: 1, limit: 20 }
      );

      // Assert
      expect(result.cards).toEqual([]);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });

    it('should handle different sort orders', async () => {
      const mockCards = [{ id: '1', name: 'Pikachu', price: 10 }];
      const mockResult = createPaginatedResult(mockCards);
      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      // Test price ascending
      await useCase.execute({ sortBy: 'price_asc' }, { page: 1, limit: 20 });
      expect(mockDataService.getMany).toHaveBeenLastCalledWith(
        'cards',
        expect.objectContaining({
          orderBy: { column: 'price', ascending: true }
        })
      );

      // Test name ascending
      await useCase.execute({ sortBy: 'name_asc' }, { page: 1, limit: 20 });
      expect(mockDataService.getMany).toHaveBeenLastCalledWith(
        'cards',
        expect.objectContaining({
          orderBy: { column: 'name', ascending: true }
        })
      );

      // Test name descending
      await useCase.execute({ sortBy: 'name_desc' }, { page: 1, limit: 20 });
      expect(mockDataService.getMany).toHaveBeenLastCalledWith(
        'cards',
        expect.objectContaining({
          orderBy: { column: 'name', ascending: false }
        })
      );

      // Test oldest
      await useCase.execute({ sortBy: 'oldest' }, { page: 1, limit: 20 });
      expect(mockDataService.getMany).toHaveBeenLastCalledWith(
        'cards',
        expect.objectContaining({
          orderBy: { column: 'created_at', ascending: true }
        })
      );

      // Test default case (newest)
      await useCase.execute({ sortBy: 'newest' }, { page: 1, limit: 20 });
      expect(mockDataService.getMany).toHaveBeenLastCalledWith(
        'cards',
        expect.objectContaining({
          orderBy: { column: 'created_at', ascending: false }
        })
      );

      // Test unknown sortBy option (should default to newest)
      await useCase.execute({ sortBy: 'unknown_sort' as any }, { page: 1, limit: 20 });
      expect(mockDataService.getMany).toHaveBeenLastCalledWith(
        'cards',
        expect.objectContaining({
          orderBy: { column: 'created_at', ascending: false }
        })
      );
    });
  });
});
