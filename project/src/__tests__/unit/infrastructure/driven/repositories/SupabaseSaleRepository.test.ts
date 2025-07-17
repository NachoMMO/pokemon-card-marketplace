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
});
