// Tests unitarios para DataServiceHelpers
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataServiceHelpers } from '../../../infrastructure/driven/services/helpers/DataServiceHelpers';
import type { IDataService } from '../../../application/ports/services/IDataService';

describe('DataServiceHelpers', () => {
  let helpers: DataServiceHelpers;
  let mockDataService: Partial<IDataService>;

  beforeEach(() => {
    mockDataService = {
      getById: vi.fn(),
      getMany: vi.fn(),
      getOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      rpc: vi.fn(),
    };

    helpers = new DataServiceHelpers(mockDataService as IDataService);
  });

  describe('getPopularCards', () => {
    it('should get popular cards successfully', async () => {
      const mockPopularCards = [
        { id: 'card-1', name: 'Pikachu', sales_count: 25 },
        { id: 'card-2', name: 'Charizard', sales_count: 18 }
      ];

      (mockDataService.rpc! as any).mockResolvedValue({
        success: true,
        data: mockPopularCards
      });

      const result = await helpers.getPopularCards(10, 30);

      expect(result).toEqual(mockPopularCards);
      expect(mockDataService.rpc).toHaveBeenCalledWith('get_popular_cards_by_sales', {
        limit_count: 10,
        days_back: 30
      });
    });

    it('should return empty array when RPC fails', async () => {
      (mockDataService.rpc! as any).mockResolvedValue({
        success: false,
        error: 'RPC failed'
      });

      const result = await helpers.getPopularCards();

      expect(result).toEqual([]);
      expect(mockDataService.rpc).toHaveBeenCalledWith('get_popular_cards_by_sales', {
        limit_count: 10,
        days_back: 30
      });
    });

    it('should use default parameters', async () => {
      (mockDataService.rpc! as any).mockResolvedValue({
        success: true,
        data: []
      });

      await helpers.getPopularCards();

      expect(mockDataService.rpc).toHaveBeenCalledWith('get_popular_cards_by_sales', {
        limit_count: 10,
        days_back: 30
      });
    });
  });

  describe('getUserCards', () => {
    it('should get user cards successfully', async () => {
      const userId = 'user-123';
      const mockCards = [
        { id: 'card-1', name: 'Pikachu', owner_id: 'user-123' },
        { id: 'card-2', name: 'Charizard', owner_id: 'user-123' }
      ];

      (mockDataService.getMany! as any).mockResolvedValue({
        data: mockCards,
        count: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await helpers.getUserCards(userId);

      expect(result.data).toEqual(mockCards);
      expect(result.count).toBe(2);
      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          filters: [{ column: 'owner_id', operator: 'eq', value: userId }]
        })
      );
    });

    it('should handle includeInCollection parameter', async () => {
      const userId = 'user-123';

      (mockDataService.getMany! as any).mockResolvedValue({
        data: [],
        count: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });

      await helpers.getUserCards(userId, false);

      expect(mockDataService.getMany).toHaveBeenCalled();
      // Verificar que se llamó con los filtros correctos
      const callArgs = (mockDataService.getMany! as any).mock.calls[0];
      expect(callArgs[0]).toBe('cards');
      expect(callArgs[1]).toMatchObject({
        filters: expect.arrayContaining([
          { column: 'owner_id', operator: 'eq', value: userId }
        ])
      });
    });
  });

  describe('getUserTransactionHistory', () => {
    it('should get user transaction history successfully', async () => {
      const userId = 'user-123';
      const page = 1;
      const limit = 10;
      const mockTransactions = [
        {
          id: 'tx-1',
          amount: 25.99,
          created_at: '2023-01-01T10:00:00Z',
          status: 'completed',
          card: { id: 'card-1', name: 'Pikachu', image_url: 'pikachu.png' },
          seller: { username: 'trainer_ash' }
        },
        {
          id: 'tx-2',
          amount: 150.00,
          created_at: '2023-01-02T10:00:00Z',
          status: 'completed',
          card: { id: 'card-2', name: 'Charizard', image_url: 'charizard.png' },
          seller: { username: 'trainer_misty' }
        }
      ];

      (mockDataService.getMany! as any).mockResolvedValue({
        data: mockTransactions,
        count: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await helpers.getUserTransactionHistory(userId, page, limit);

      expect(result.data).toEqual(mockTransactions);
      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'purchases',
        expect.objectContaining({
          select: expect.stringContaining('card:cards'),
          filters: [{ column: 'buyer_id', operator: 'eq', value: userId }],
          orderBy: { column: 'created_at', ascending: false },
          limit: 10,
          offset: 0
        })
      );
    });

    it('should use default pagination values', async () => {
      const userId = 'user-123';

      (mockDataService.getMany! as any).mockResolvedValue({
        data: [],
        count: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });

      await helpers.getUserTransactionHistory(userId);

      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'purchases',
        expect.objectContaining({
          limit: 20,
          offset: 0
        })
      );
    });
  });

  describe('getUserActiveSales', () => {
    it('should get user active sales successfully', async () => {
      const userId = 'user-123';
      const mockSales = [
        {
          id: 'sale-1',
          price: 25.99,
          status: 'active',
          created_at: '2023-01-01T10:00:00Z',
          views_count: 15,
          card: { id: 'card-1', name: 'Pikachu', type: 'electric', rarity: 'rare', image_url: 'pikachu.png' }
        },
        {
          id: 'sale-2',
          price: 150.00,
          status: 'active',
          created_at: '2023-01-02T10:00:00Z',
          views_count: 32,
          card: { id: 'card-2', name: 'Charizard', type: 'fire', rarity: 'ultra-rare', image_url: 'charizard.png' }
        }
      ];

      (mockDataService.getMany! as any).mockResolvedValue({
        data: mockSales,
        count: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await helpers.getUserActiveSales(userId);

      expect(result.data).toEqual(mockSales);
      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'sales',
        expect.objectContaining({
          select: expect.stringContaining('card:cards'),
          filters: [
            { column: 'seller_id', operator: 'eq', value: userId },
            { column: 'status', operator: 'eq', value: 'active' }
          ],
          orderBy: { column: 'created_at', ascending: false }
        })
      );
    });
  });

  describe('getUnreadMessages', () => {
    it('should get unread messages successfully', async () => {
      const userId = 'user-123';
      const mockMessages = [
        {
          id: 'msg-1',
          subject: 'New message',
          content: 'You have a new offer!',
          created_at: '2023-01-01T10:00:00Z',
          sender: { id: 'user-456', username: 'trader_bob', avatar: 'bob.png' }
        },
        {
          id: 'msg-2',
          subject: 'Another message',
          content: 'Card is still available',
          created_at: '2023-01-02T10:00:00Z',
          sender: { id: 'user-789', username: 'collector_alice', avatar: 'alice.png' }
        }
      ];

      (mockDataService.getMany! as any).mockResolvedValue({
        data: mockMessages,
        count: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await helpers.getUnreadMessages(userId);

      expect(result.data).toEqual(mockMessages);
      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'messages',
        expect.objectContaining({
          select: expect.stringContaining('sender:users'),
          filters: [
            { column: 'recipient_id', operator: 'eq', value: userId },
            { column: 'read_at', operator: 'is', value: null }
          ],
          orderBy: { column: 'created_at', ascending: false }
        })
      );
    });
  });

  describe('getUserCartItems', () => {
    it('should get user cart items successfully', async () => {
      const userId = 'user-123';
      const mockCartItems = [
        { id: 'cart-1', quantity: 2, card: { id: 'card-1', name: 'Pikachu', price: 25.99 } },
        { id: 'cart-2', quantity: 1, card: { id: 'card-2', name: 'Charizard', price: 150.00 } }
      ];

      (mockDataService.getMany! as any).mockResolvedValue({
        data: mockCartItems,
        count: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await helpers.getUserCartItems(userId);

      expect(result.data).toEqual(mockCartItems);
      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cart_items',
        expect.objectContaining({
          filters: [{ column: 'user_id', operator: 'eq', value: userId }],
          select: expect.stringContaining('card:cards')
        })
      );
    });

    it('should handle service errors gracefully', async () => {
      const userId = 'user-123';

      (mockDataService.getMany! as any).mockRejectedValue(new Error('Database error'));

      await expect(helpers.getUserCartItems(userId)).rejects.toThrow('Database error');
    });
  });

  describe('getMarketplaceStats', () => {
    it('should get marketplace statistics successfully', async () => {
      const mockStats = {
        totalCards: 1250,
        totalUsers: 350,
        activeSales: 45,
        totalSales: 89,
        recentTransactions: [
          { id: 'tx-1', amount: 25.99, created_at: '2023-01-01T10:00:00Z' },
          { id: 'tx-2', amount: 150.00, created_at: '2023-01-01T09:30:00Z' }
        ]
      };

      // Mock para count calls
      (mockDataService.count! as any).mockResolvedValueOnce(1250); // totalCards
      (mockDataService.count! as any).mockResolvedValueOnce(350); // totalUsers
      (mockDataService.count! as any).mockResolvedValueOnce(45); // activeSales
      (mockDataService.count! as any).mockResolvedValueOnce(89); // totalSales

      // Mock para getMany (recentTransactions)
      (mockDataService.getMany! as any).mockResolvedValue({
        data: mockStats.recentTransactions,
        count: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await helpers.getMarketplaceStats();

      expect(result.totalCards).toBe(1250);
      expect(result.totalUsers).toBe(350);
      expect(result.activeSales).toBe(45);
      expect(result.totalSales).toBe(89);
      expect(result.recentTransactions).toEqual(mockStats.recentTransactions);

      expect(mockDataService.count).toHaveBeenCalledTimes(4);
      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'purchases',
        expect.objectContaining({
          orderBy: { column: 'created_at', ascending: false },
          limit: 10
        })
      );
    });

    it('should handle errors gracefully', async () => {
      (mockDataService.count! as any).mockRejectedValue(new Error('Database error'));

      // getMarketplaceStats no maneja errores internamente, el error se propaga
      await expect(helpers.getMarketplaceStats()).rejects.toThrow('Database error');
    });
  });

  describe('isCardAvailable', () => {
    it('should check if card is available', async () => {
      const cardId = 'card-123';
      const mockCard = {
        id: 'card-123',
        status: 'available',
        seller_id: 'seller-1'
      };

      (mockDataService.getById! as any).mockResolvedValue({
        success: true,
        data: mockCard
      });

      const result = await helpers.isCardAvailable(cardId);

      expect(result).toBe(true);
      expect(mockDataService.getById).toHaveBeenCalledWith(
        'cards',
        cardId,
        'id, status, seller_id'
      );
    });

    it('should return false for unavailable card', async () => {
      const cardId = 'card-123';
      const mockCard = {
        id: 'card-123',
        status: 'sold',
        seller_id: 'seller-1'
      };

      (mockDataService.getById! as any).mockResolvedValue({
        success: true,
        data: mockCard
      });

      const result = await helpers.isCardAvailable(cardId);

      expect(result).toBe(false);
    });

    it('should return false when card not found', async () => {
      const cardId = 'nonexistent-card';

      (mockDataService.getById! as any).mockResolvedValue({
        success: false,
        error: 'Card not found'
      });

      const result = await helpers.isCardAvailable(cardId);

      expect(result).toBe(false);
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const searchTerm = 'trainer';
      const mockUsers = [
        { id: 'user-1', username: 'trainer_ash', avatar: 'ash.png', created_at: '2023-01-01T00:00:00Z' },
        { id: 'user-2', username: 'trainer_misty', avatar: 'misty.png', created_at: '2023-01-02T00:00:00Z' }
      ];

      (mockDataService.getMany! as any).mockResolvedValue({
        data: mockUsers,
        count: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await helpers.searchUsers(searchTerm, 20);

      expect(result.data).toEqual(mockUsers);
      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          select: 'id, username, avatar, created_at',
          filters: expect.arrayContaining([
            expect.objectContaining({
              column: 'username',
              operator: 'ilike',
              value: `%${searchTerm}%`
            })
          ]),
          orderBy: { column: 'username', ascending: true },
          limit: 20
        })
      );
    });
  });

  describe('searchCards', () => {
    it('should search cards with filters', async () => {
      const searchOptions = {
        query: 'pikachu',
        type: 'electric',
        rarity: ['rare', 'ultra-rare'],
        minPrice: 10,
        maxPrice: 100,
        page: 1,
        limit: 20
      };

      const mockCards = [
        { id: 'card-1', name: 'Pikachu V', type: 'electric', rarity: 'rare', price: 25.99 },
        { id: 'card-2', name: 'Pikachu VMAX', type: 'electric', rarity: 'ultra-rare', price: 89.99 }
      ];

      (mockDataService.getMany! as any).mockResolvedValue({
        data: mockCards,
        count: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await helpers.searchCards(searchOptions);

      expect(result.data).toEqual(mockCards);
      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          filters: expect.arrayContaining([
            { column: 'name', operator: 'ilike', value: '%pikachu%' },
            { column: 'type', operator: 'eq', value: 'electric' },
            { column: 'rarity', operator: 'in', value: ['rare', 'ultra-rare'] },
            { column: 'price', operator: 'gte', value: 10 },
            { column: 'price', operator: 'lte', value: 100 },
            { column: 'status', operator: 'eq', value: 'available' }
          ]),
          orderBy: { column: 'created_at', ascending: false },
          limit: 20,
          offset: 0
        })
      );
    });

    it('should search cards with minimal options', async () => {
      const searchOptions = {};

      (mockDataService.getMany! as any).mockResolvedValue({
        data: [],
        count: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });

      await helpers.searchCards(searchOptions);

      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          filters: [{ column: 'status', operator: 'eq', value: 'available' }],
          limit: 20,
          offset: 0
        })
      );
    });
  });

  describe('getCardsByRarity', () => {
    it('should get cards by rarity', async () => {
      const rarity = 'legendary';
      const mockCards = [
        { id: 'card-1', name: 'Arceus', type: 'normal', price: 500.00, rarity: 'legendary' },
        { id: 'card-2', name: 'Dialga', type: 'steel', price: 450.00, rarity: 'legendary' }
      ];

      (mockDataService.getMany! as any).mockResolvedValue({
        data: mockCards,
        count: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await helpers.getCardsByRarity(rarity, 50);

      expect(result.data).toEqual(mockCards);
      expect(mockDataService.getMany).toHaveBeenCalledWith(
        'cards',
        expect.objectContaining({
          filters: [
            { column: 'rarity', operator: 'eq', value: 'legendary' },
            { column: 'status', operator: 'eq', value: 'available' }
          ],
          orderBy: { column: 'price', ascending: false },
          limit: 50
        })
      );
    });
  });

  describe('getRecommendations', () => {
    it('should get user recommendations', async () => {
      const userId = 'user-123';
      const mockRecommendations = [
        { id: 'card-1', name: 'Recommended Card 1', score: 0.95 },
        { id: 'card-2', name: 'Recommended Card 2', score: 0.87 }
      ];

      (mockDataService.rpc! as any).mockResolvedValue({
        success: true,
        data: mockRecommendations
      });

      const result = await helpers.getRecommendations(userId, 10);

      expect(result).toEqual(mockRecommendations);
      expect(mockDataService.rpc).toHaveBeenCalledWith('get_user_recommendations', {
        user_id: userId,
        limit_count: 10
      });
    });

    it('should return empty array when RPC fails', async () => {
      const userId = 'user-123';

      (mockDataService.rpc! as any).mockResolvedValue({
        success: false,
        error: 'Recommendations unavailable'
      });

      const result = await helpers.getRecommendations(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getUserRecentActivity', () => {
    it('should get user recent activity', async () => {
      const userId = 'user-123';

      // Mock para sales
      const mockSales = {
        data: [{ id: 'sale-1', created_at: '2023-01-03T10:00:00Z', card: { name: 'Pikachu' } }],
        count: 1,
        page: 1,
        limit: 6,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      // Mock para purchases
      const mockPurchases = {
        data: [{ id: 'purchase-1', created_at: '2023-01-02T10:00:00Z', card: { name: 'Charizard' } }],
        count: 1,
        page: 1,
        limit: 6,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      // Mock para messages
      const mockMessages = {
        data: [{ id: 'msg-1', created_at: '2023-01-01T10:00:00Z', subject: 'Welcome!' }],
        count: 1,
        page: 1,
        limit: 6,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      (mockDataService.getMany! as any)
        .mockResolvedValueOnce(mockSales)
        .mockResolvedValueOnce(mockPurchases)
        .mockResolvedValueOnce(mockMessages);

      const result = await helpers.getUserRecentActivity(userId, 20);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('sale'); // Más reciente
      expect(result[1].type).toBe('purchase');
      expect(result[2].type).toBe('message');

      expect(mockDataService.getMany).toHaveBeenCalledTimes(3);
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      (mockDataService.rpc! as any).mockRejectedValue(
        new Error('Database connection failed')
      );

      // getPopularCards no maneja errores internamente, el error se propaga
      await expect(helpers.getPopularCards()).rejects.toThrow('Database connection failed');
    });
  });
});
