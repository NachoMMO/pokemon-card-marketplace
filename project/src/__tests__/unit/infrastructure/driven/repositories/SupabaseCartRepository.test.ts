import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { SupabaseCartRepository } from '../../../../../infrastructure/driven/repositories/SupabaseCartRepository';
import { CartItem } from '../../../../../domain/entities/CartItem';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock de SupabaseClient
const createMockSupabaseClient = () => {
  const mockFrom = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn()
  };

  return {
    from: vi.fn().mockReturnValue(mockFrom)
  } as unknown as SupabaseClient;
};

describe('SupabaseCartRepository', () => {
  let repository: SupabaseCartRepository;
  let mockSupabase: SupabaseClient;
  let mockFrom: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockFrom = (mockSupabase.from as MockedFunction<any>)();
    repository = new SupabaseCartRepository(mockSupabase);

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('addItem', () => {
    it('should successfully add item to cart', async () => {
      // Arrange
      const cartItem = new CartItem(
        'item-123',
        'user-456',
        'card-789',
        2,
        50.00,
        true,
        new Date('2025-07-18T10:00:00Z'),
        new Date('2025-07-17T10:00:00Z'),
        new Date('2025-07-17T10:00:00Z')
      );

      const mockDbRow = {
        id: 'item-123',
        user_id: 'user-456',
        card_id: 'card-789',
        quantity: 2,
        price_at_time: 50.00,
        is_active: true,
        reserved_until: '2025-07-18T10:00:00.000Z',
        created_at: '2025-07-17T10:00:00.000Z',
        updated_at: '2025-07-17T10:00:00.000Z'
      };

      mockFrom.single.mockResolvedValue({ data: mockDbRow, error: null });

      // Act
      const result = await repository.addItem(cartItem);

      // Assert
      expect(result).toBeInstanceOf(CartItem);
      expect(result.id).toBe('item-123');
      expect(result.userId).toBe('user-456');
      expect(result.cardId).toBe('card-789');
      expect(result.quantity).toBe(2);
      expect(result.priceAtTime).toBe(50.00);

      expect(mockSupabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockFrom.insert).toHaveBeenCalledWith({
        id: 'item-123',
        user_id: 'user-456',
        card_id: 'card-789',
        quantity: 2,
        price_at_time: 50.00,
        is_active: true,
        reserved_until: '2025-07-18T10:00:00.000Z'
      });
    });

    it('should throw error when database insert fails', async () => {
      // Arrange
      const cartItem = new CartItem(
        'item-123',
        'user-456',
        'card-789',
        1,
        25.00,
        true,
        new Date(),
        new Date(),
        new Date()
      );

      mockFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Act & Assert
      await expect(repository.addItem(cartItem)).rejects.toThrow('Error al añadir artículo al carrito: Database error');
    });

    it('should handle unknown errors gracefully', async () => {
      // Arrange
      const cartItem = new CartItem(
        'item-123',
        'user-456',
        'card-789',
        1,
        25.00,
        true,
        new Date(),
        new Date(),
        new Date()
      );

      mockFrom.single.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(repository.addItem(cartItem)).rejects.toThrow('Error desconocido al añadir artículo al carrito');
    });
  });

  describe('findByUserId', () => {
    it('should return cart items for user', async () => {
      // Arrange
      const userId = 'user-123';
      const mockRows = [
        {
          id: 'item-1',
          user_id: 'user-123',
          card_id: 'card-1',
          quantity: 1,
          price_at_time: 30.00,
          is_active: true,
          reserved_until: '2025-07-18T10:00:00.000Z',
          created_at: '2025-07-17T10:00:00.000Z',
          updated_at: '2025-07-17T10:00:00.000Z'
        },
        {
          id: 'item-2',
          user_id: 'user-123',
          card_id: 'card-2',
          quantity: 2,
          price_at_time: 45.00,
          is_active: true,
          reserved_until: '2025-07-18T11:00:00.000Z',
          created_at: '2025-07-17T11:00:00.000Z',
          updated_at: '2025-07-17T11:00:00.000Z'
        }
      ];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CartItem);
      expect(result[0].id).toBe('item-1');
      expect(result[1].id).toBe('item-2');

      expect(mockSupabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockFrom.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockFrom.gt).toHaveBeenCalledWith('reserved_until', expect.any(String));
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array when no items found', async () => {
      // Arrange
      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findByUserId('user-123');

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      mockFrom.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Act
      const result = await repository.findByUserId('user-123');

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle null data response', async () => {
      // Arrange
      mockFrom.order.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.findByUserId('user-123');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByUserIdAndCardId', () => {
    it('should return cart item when found', async () => {
      // Arrange
      const userId = 'user-123';
      const cardId = 'card-456';
      const mockRow = {
        id: 'item-789',
        user_id: 'user-123',
        card_id: 'card-456',
        quantity: 3,
        price_at_time: 75.00,
        is_active: true,
        reserved_until: '2025-07-18T10:00:00.000Z',
        created_at: '2025-07-17T10:00:00.000Z',
        updated_at: '2025-07-17T10:00:00.000Z'
      };

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findByUserIdAndCardId(userId, cardId);

      // Assert
      expect(result).toBeInstanceOf(CartItem);
      expect(result!.id).toBe('item-789');
      expect(result!.userId).toBe('user-123');
      expect(result!.cardId).toBe('card-456');

      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockFrom.eq).toHaveBeenCalledWith('card_id', cardId);
      expect(mockFrom.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('should return null when item not found', async () => {
      // Arrange
      mockFrom.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      // Act
      const result = await repository.findByUserIdAndCardId('user-123', 'card-456');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when exception occurs', async () => {
      // Arrange
      mockFrom.single.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.findByUserIdAndCardId('user-123', 'card-456');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateQuantity', () => {
    it('should successfully update quantity', async () => {
      // Arrange
      const itemId = 'item-123';
      const newQuantity = 5;
      const mockUpdatedRow = {
        id: 'item-123',
        user_id: 'user-456',
        card_id: 'card-789',
        quantity: 5,
        price_at_time: 50.00,
        is_active: true,
        reserved_until: '2025-07-18T10:00:00.000Z',
        created_at: '2025-07-17T10:00:00.000Z',
        updated_at: '2025-07-17T10:30:00.000Z'
      };

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.updateQuantity(itemId, newQuantity);

      // Assert
      expect(result).toBeInstanceOf(CartItem);
      expect(result.quantity).toBe(5);
      expect(result.id).toBe('item-123');

      expect(mockFrom.update).toHaveBeenCalledWith({
        quantity: 5,
        updated_at: expect.any(String)
      });
      expect(mockFrom.eq).toHaveBeenCalledWith('id', itemId);
    });

    it('should throw error when update fails', async () => {
      // Arrange
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      // Act & Assert
      await expect(repository.updateQuantity('item-123', 3)).rejects.toThrow('Error al actualizar cantidad del carrito: Update failed');
    });
  });

  describe('removeItem', () => {
    it('should successfully remove item', async () => {
      // Arrange
      mockFrom.eq.mockResolvedValue({ error: null });

      // Act
      const result = await repository.removeItem('item-123');

      // Assert
      expect(result).toBe(true);
      expect(mockFrom.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'item-123');
    });

    it('should return false when remove fails', async () => {
      // Arrange
      mockFrom.eq.mockResolvedValue({ error: { message: 'Remove failed' } });

      // Act
      const result = await repository.removeItem('item-123');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when exception occurs', async () => {
      // Arrange
      mockFrom.eq.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.removeItem('item-123');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('clearCart', () => {
    it('should successfully clear cart', async () => {
      // Arrange
      // Mock the chained eq calls that clearCart makes
      const mockSecondEq = vi.fn().mockResolvedValue({ error: null });
      mockFrom.eq.mockReturnValueOnce({ eq: mockSecondEq });

      // Act
      const result = await repository.clearCart('user-123');

      // Assert
      expect(result).toBe(true);
      expect(mockFrom.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockSecondEq).toHaveBeenCalledWith('is_active', true);
    });

    it('should return false when clear fails', async () => {
      // Arrange
      const mockSecondEq = vi.fn().mockResolvedValue({ error: { message: 'Clear failed' } });
      mockFrom.eq.mockReturnValueOnce({ eq: mockSecondEq });

      // Act
      const result = await repository.clearCart('user-123');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getTotalItems', () => {
    it('should calculate total items correctly', async () => {
      // Arrange
      const mockData = [
        { quantity: 2 },
        { quantity: 3 },
        { quantity: 1 }
      ];

      mockFrom.gt.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await repository.getTotalItems('user-123');

      // Assert
      expect(result).toBe(6); // 2 + 3 + 1
      expect(mockFrom.select).toHaveBeenCalledWith('quantity');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockFrom.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('should return 0 when no items found', async () => {
      // Arrange
      mockFrom.gt.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.getTotalItems('user-123');

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when error occurs', async () => {
      // Arrange
      mockFrom.gt.mockResolvedValue({ data: null, error: { message: 'Error' } });

      // Act
      const result = await repository.getTotalItems('user-123');

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getTotalPrice', () => {
    it('should calculate total price correctly', async () => {
      // Arrange
      const mockData = [
        { quantity: 2, price_at_time: 25.00 }, // 50.00
        { quantity: 1, price_at_time: 75.00 }, // 75.00
        { quantity: 3, price_at_time: 10.00 }  // 30.00
      ];

      mockFrom.gt.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await repository.getTotalPrice('user-123');

      // Assert
      expect(result).toBe(155.00); // 50 + 75 + 30
      expect(mockFrom.select).toHaveBeenCalledWith('quantity, price_at_time');
    });

    it('should return 0 when no items found', async () => {
      // Arrange
      mockFrom.gt.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.getTotalPrice('user-123');

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('clearExpiredItems', () => {
    it('should clear expired items and return count', async () => {
      // Arrange
      const mockData = [
        { id: 'item-1' },
        { id: 'item-2' },
        { id: 'item-3' }
      ];

      mockFrom.select.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await repository.clearExpiredItems();

      // Assert
      expect(result).toBe(3);
      expect(mockFrom.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockFrom.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockFrom.lt).toHaveBeenCalledWith('reserved_until', expect.any(String));
    });

    it('should return 0 when no expired items found', async () => {
      // Arrange
      mockFrom.select.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.clearExpiredItems();

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when error occurs', async () => {
      // Arrange
      mockFrom.select.mockResolvedValue({ data: null, error: { message: 'Error' } });

      // Act
      const result = await repository.clearExpiredItems();

      // Assert
      expect(result).toBe(0);
    });
  });
});
