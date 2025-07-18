import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseSaleRepository } from '../../../../../infrastructure/driven/repositories/SupabaseSaleRepository';
import { Sale } from '../../../../../domain/entities/Sale';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn()
};

// Mock query builder methods
const mockFrom = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  order: vi.fn(),
  single: vi.fn()
};

// Helper function to create mock sale row
function createMockSaleRow() {
  return {
    id: 'sale-123',
    seller_id: 'seller-1',
    card_id: 'card-123',
    buyer_id: 'buyer-1',
    quantity: 1,
    unit_price: 50.00,
    total_price: 50.00,
    commission: 5.00,
    net_amount: 45.00,
    status: 'completed',
    purchase_id: 'purchase-123',
    sale_date: '2023-01-01T00:00:00Z',
    confirmed_at: '2023-01-01T01:00:00Z',
    shipped_at: '2023-01-02T00:00:00Z',
    completed_at: '2023-01-03T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };
}

describe('SupabaseSaleRepository', () => {
  let repository: SupabaseSaleRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue(mockFrom);
    repository = new SupabaseSaleRepository(mockSupabaseClient as any);
  });

  describe('create', () => {
    it('should create sale successfully', async () => {
      // Arrange
      const sale = new Sale(
        'sale-123',
        'seller-1',
        'card-123',
        'buyer-1',
        1,
        50.00,
        50.00,
        5.00,
        45.00,
        'completed',
        'purchase-123',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        new Date('2023-01-02'),
        new Date('2023-01-03'),
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );

      const mockCreatedRow = createMockSaleRow();
      mockFrom.single.mockResolvedValue({ data: mockCreatedRow, error: null });

      // Act
      const result = await repository.create(sale);

      // Assert
      expect(result).toBeInstanceOf(Sale);
      expect(result.id).toBe('sale-123');
      expect(result.totalPrice).toBe(50.00);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sales');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      // Arrange
      const sale = new Sale(
        'sale-123',
        'seller-1',
        'card-123',
        'buyer-1',
        1,
        50.00,
        50.00,
        5.00,
        45.00,
        'completed',
        'purchase-123',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        new Date('2023-01-02'),
        new Date('2023-01-03'),
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Insert failed') });

      // Act & Assert
      await expect(repository.create(sale)).rejects.toThrow('Error al crear venta: Insert failed');
    });
  });

  describe('findById', () => {
    it('should find sale by ID successfully', async () => {
      // Arrange
      const saleId = 'sale-123';
      const mockRow = createMockSaleRow();

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findById(saleId);

      // Assert
      expect(result).toBeInstanceOf(Sale);
      expect(result?.id).toBe('sale-123');
      expect(result?.sellerId).toBe('seller-1');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', saleId);
    });

    it('should return null when sale not found', async () => {
      // Arrange
      const saleId = 'nonexistent';

      mockFrom.single.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.findById(saleId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      // Arrange
      const saleId = 'sale-123';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findById(saleId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findBySellerId', () => {
    it('should find sales by seller ID with default pagination', async () => {
      // Arrange
      const sellerId = 'seller-1';
      const mockRows = [createMockSaleRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySellerId(sellerId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Sale);
      expect(result[0].sellerId).toBe('seller-1');
      expect(mockFrom.eq).toHaveBeenCalledWith('seller_id', sellerId);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19);
      expect(mockFrom.order).toHaveBeenCalledWith('sale_date', { ascending: false });
    });

    it('should find sales by seller ID with custom pagination', async () => {
      // Arrange
      const sellerId = 'seller-1';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockSaleRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySellerId(sellerId, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no sales found', async () => {
      // Arrange
      const sellerId = 'seller-nonexistent';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findBySellerId(sellerId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      const sellerId = 'seller-1';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findBySellerId(sellerId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByCardId', () => {
    it('should find sales by card ID with default pagination', async () => {
      // Arrange
      const cardId = 'card-123';
      const mockRows = [createMockSaleRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByCardId(cardId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Sale);
      expect(result[0].cardId).toBe('card-123');
      expect(mockFrom.eq).toHaveBeenCalledWith('card_id', cardId);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19);
      expect(mockFrom.order).toHaveBeenCalledWith('sale_date', { ascending: false });
    });

    it('should find sales by card ID with custom pagination', async () => {
      // Arrange
      const cardId = 'card-123';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockSaleRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByCardId(cardId, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no sales found for card', async () => {
      // Arrange
      const cardId = 'card-nonexistent';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findByCardId(cardId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database error in findByCardId', async () => {
      // Arrange
      const cardId = 'card-123';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findByCardId(cardId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findAvailable', () => {
    it('should find available sales with default pagination', async () => {
      // Arrange
      const mockRows = [createMockSaleRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findAvailable();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Sale);
      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'available');
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19);
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should find available sales with custom pagination', async () => {
      // Arrange
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockSaleRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findAvailable(limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no available sales found', async () => {
      // Arrange
      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findAvailable();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database error in findAvailable', async () => {
      // Arrange
      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findAvailable();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update sale successfully', async () => {
      // Arrange
      const saleId = 'sale-123';
      const updates = {
        quantity: 2,
        unitPrice: 75.00,
        totalPrice: 150.00,
        commission: 15.00,
        netAmount: 135.00,
        status: 'shipped'
      };
      const mockUpdatedRow = {
        ...createMockSaleRow(),
        quantity: 2,
        unit_price: 75.00,
        total_price: 150.00,
        commission: 15.00,
        net_amount: 135.00,
        status: 'shipped'
      };

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.update(saleId, updates);

      // Assert
      expect(result).toBeInstanceOf(Sale);
      expect(result.quantity).toBe(2);
      expect(result.unitPrice).toBe(75.00);
      expect(result.status).toBe('shipped');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', saleId);
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 2,
          unit_price: 75.00,
          total_price: 150.00,
          commission: 15.00,
          net_amount: 135.00,
          status: 'shipped',
          updated_at: expect.any(String)
        })
      );
    });

    it('should update sale with partial data', async () => {
      // Arrange
      const saleId = 'sale-123';
      const updates = { status: 'shipped' };
      const mockUpdatedRow = { ...createMockSaleRow(), status: 'shipped' };

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.update(saleId, updates);

      // Assert
      expect(result).toBeInstanceOf(Sale);
      expect(result.status).toBe('shipped');
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'shipped',
          updated_at: expect.any(String)
        })
      );
    });

    it('should throw error when update fails', async () => {
      // Arrange
      const saleId = 'sale-123';
      const updates = { status: 'shipped' };

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Update failed') });

      // Act & Assert
      await expect(repository.update(saleId, updates)).rejects.toThrow('Error al actualizar venta: Update failed');
    });

    it('should handle unknown error in update', async () => {
      // Arrange
      const saleId = 'sale-123';
      const updates = { status: 'shipped' };

      mockFrom.single.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(repository.update(saleId, updates)).rejects.toThrow('Error desconocido al actualizar venta');
    });
  });

  describe('delete', () => {
    const mockDelete = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn()
    };

    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue(mockDelete);
    });

    it('should delete sale successfully', async () => {
      // Arrange
      const saleId = 'sale-123';
      mockDelete.eq.mockResolvedValue({ error: null });

      // Act
      const result = await repository.delete(saleId);

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sales');
      expect(mockDelete.delete).toHaveBeenCalled();
      expect(mockDelete.eq).toHaveBeenCalledWith('id', saleId);
    });

    it('should return false when delete fails', async () => {
      // Arrange
      const saleId = 'sale-123';
      mockDelete.eq.mockResolvedValue({ error: new Error('Delete failed') });

      // Act
      const result = await repository.delete(saleId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle exception in delete', async () => {
      // Arrange
      const saleId = 'sale-123';
      mockDelete.eq.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.delete(saleId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('search', () => {
    const mockSearchQuery = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn()
    };

    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue(mockSearchQuery);
    });

    it('should search sales with all criteria', async () => {
      // Arrange
      const criteria = {
        cardName: 'Pikachu',
        condition: 'mint',
        minPrice: 10,
        maxPrice: 100,
        sellerId: 'seller-1',
        limit: 10,
        offset: 5
      };
      const mockRows = [createMockSaleRow()];

      mockSearchQuery.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Sale);
      expect(mockSearchQuery.select).toHaveBeenCalledWith(expect.stringContaining('cards(name, condition)'));
      expect(mockSearchQuery.ilike).toHaveBeenCalledWith('cards.name', '%Pikachu%');
      expect(mockSearchQuery.eq).toHaveBeenCalledWith('cards.condition', 'mint');
      expect(mockSearchQuery.eq).toHaveBeenCalledWith('seller_id', 'seller-1');
      expect(mockSearchQuery.eq).toHaveBeenCalledWith('status', 'available');
      expect(mockSearchQuery.gte).toHaveBeenCalledWith('unit_price', 10);
      expect(mockSearchQuery.lte).toHaveBeenCalledWith('unit_price', 100);
      expect(mockSearchQuery.range).toHaveBeenCalledWith(5, 14);
      expect(mockSearchQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should search sales with minimal criteria', async () => {
      // Arrange
      const criteria = {};
      const mockRows = [createMockSaleRow()];

      mockSearchQuery.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockSearchQuery.eq).toHaveBeenCalledWith('status', 'available');
      expect(mockSearchQuery.range).toHaveBeenCalledWith(0, 19); // default limit 20
    });

    it('should search sales with only card name', async () => {
      // Arrange
      const criteria = { cardName: 'Charizard' };
      const mockRows = [createMockSaleRow()];

      mockSearchQuery.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockSearchQuery.ilike).toHaveBeenCalledWith('cards.name', '%Charizard%');
    });

    it('should search sales with only price range', async () => {
      // Arrange
      const criteria = { minPrice: 50, maxPrice: 200 };
      const mockRows = [createMockSaleRow()];

      mockSearchQuery.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockSearchQuery.gte).toHaveBeenCalledWith('unit_price', 50);
      expect(mockSearchQuery.lte).toHaveBeenCalledWith('unit_price', 200);
    });

    it('should return empty array when search fails', async () => {
      // Arrange
      const criteria = { cardName: 'Pikachu' };

      mockSearchQuery.order.mockResolvedValue({ data: null, error: new Error('Search failed') });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle exception in search', async () => {
      // Arrange
      const criteria = { cardName: 'Pikachu' };

      mockSearchQuery.order.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
