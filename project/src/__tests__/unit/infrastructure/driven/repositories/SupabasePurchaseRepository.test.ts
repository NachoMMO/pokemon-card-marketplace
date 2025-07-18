import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabasePurchaseRepository } from '../../../../../infrastructure/driven/repositories/SupabasePurchaseRepository';
import { Purchase } from '../../../../../domain/entities/Purchase';

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

// Helper function to create mock purchase row
function createMockPurchaseRow() {
  return {
    id: 'purchase-123',
    buyer_id: 'buyer-1',
    card_id: 'card-123',
    quantity: 1,
    unit_price: 50.00,
    total_price: 50.00,
    status: 'completed',
    transaction_id: 'txn-123',
    purchase_date: '2023-01-01T00:00:00Z',
    confirmed_at: '2023-01-01T01:00:00Z',
    shipped_at: '2023-01-02T00:00:00Z',
    delivered_at: '2023-01-03T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };
}

describe('SupabasePurchaseRepository', () => {
  let repository: SupabasePurchaseRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue(mockFrom);
    repository = new SupabasePurchaseRepository(mockSupabaseClient as any);
  });

  describe('create', () => {
    it('should create purchase successfully', async () => {
      // Arrange
      const purchase = new Purchase(
        'purchase-123',
        'buyer-1',
        'card-123',
        1,
        50.00,
        50.00,
        'completed',
        'txn-123',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        new Date('2023-01-02'),
        new Date('2023-01-03'),
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );

      const mockCreatedRow = createMockPurchaseRow();
      mockFrom.single.mockResolvedValue({ data: mockCreatedRow, error: null });

      // Act
      const result = await repository.create(purchase);

      // Assert
      expect(result).toBeInstanceOf(Purchase);
      expect(result.id).toBe('purchase-123');
      expect(result.totalPrice).toBe(50.00);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('purchases');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      // Arrange
      const purchase = new Purchase(
        'purchase-123',
        'buyer-1',
        'card-123',
        1,
        50.00,
        50.00,
        'completed',
        'txn-123',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        new Date('2023-01-02'),
        new Date('2023-01-03'),
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Insert failed') });

      // Act & Assert
      await expect(repository.create(purchase)).rejects.toThrow('Error al crear compra: Insert failed');
    });
  });

  describe('findById', () => {
    it('should find purchase by ID successfully', async () => {
      // Arrange
      const purchaseId = 'purchase-123';
      const mockRow = createMockPurchaseRow();

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findById(purchaseId);

      // Assert
      expect(result).toBeInstanceOf(Purchase);
      expect(result?.id).toBe('purchase-123');
      expect(result?.buyerId).toBe('buyer-1');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', purchaseId);
    });

    it('should return null when purchase not found', async () => {
      // Arrange
      const purchaseId = 'nonexistent';

      mockFrom.single.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.findById(purchaseId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      // Arrange
      const purchaseId = 'purchase-123';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findById(purchaseId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByBuyerId', () => {
    it('should find purchases by buyer ID with default pagination', async () => {
      // Arrange
      const buyerId = 'buyer-1';
      const mockRows = [createMockPurchaseRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByBuyerId(buyerId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Purchase);
      expect(result[0].buyerId).toBe('buyer-1');
      expect(mockFrom.eq).toHaveBeenCalledWith('buyer_id', buyerId);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19);
      expect(mockFrom.order).toHaveBeenCalledWith('purchase_date', { ascending: false });
    });

    it('should find purchases by buyer ID with custom pagination', async () => {
      // Arrange
      const buyerId = 'buyer-1';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockPurchaseRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByBuyerId(buyerId, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no purchases found', async () => {
      // Arrange
      const buyerId = 'buyer-nonexistent';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findByBuyerId(buyerId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      const buyerId = 'buyer-1';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findByBuyerId(buyerId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findBySellerId', () => {
    it('should find purchases by seller ID with default pagination', async () => {
      // Arrange
      const sellerId = 'seller-1';
      const mockRows = [createMockPurchaseRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySellerId(sellerId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Purchase);
      expect(mockFrom.select).toHaveBeenCalledWith(expect.stringContaining('sales!inner(seller_id)'));
      expect(mockFrom.eq).toHaveBeenCalledWith('sales.seller_id', sellerId);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19);
      expect(mockFrom.order).toHaveBeenCalledWith('purchase_date', { ascending: false });
    });

    it('should find purchases by seller ID with custom pagination', async () => {
      // Arrange
      const sellerId = 'seller-1';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockPurchaseRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySellerId(sellerId, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no purchases found for seller', async () => {
      // Arrange
      const sellerId = 'seller-nonexistent';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findBySellerId(sellerId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database error in findBySellerId', async () => {
      // Arrange
      const sellerId = 'seller-1';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findBySellerId(sellerId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('should update status to confirmed successfully', async () => {
      // Arrange
      const purchaseId = 'purchase-123';
      const newStatus = 'confirmed';
      const mockUpdatedRow = {
        ...createMockPurchaseRow(),
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      };

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.updateStatus(purchaseId, newStatus);

      // Assert
      expect(result).toBeInstanceOf(Purchase);
      expect(result.status).toBe('confirmed');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', purchaseId);
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'confirmed',
          confirmed_at: expect.any(String),
          updated_at: expect.any(String)
        })
      );
    });

    it('should update status to shipped successfully', async () => {
      // Arrange
      const purchaseId = 'purchase-123';
      const newStatus = 'shipped';
      const mockUpdatedRow = {
        ...createMockPurchaseRow(),
        status: 'shipped',
        shipped_at: new Date().toISOString()
      };

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.updateStatus(purchaseId, newStatus);

      // Assert
      expect(result).toBeInstanceOf(Purchase);
      expect(result.status).toBe('shipped');
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'shipped',
          shipped_at: expect.any(String),
          updated_at: expect.any(String)
        })
      );
    });

    it('should update status to delivered successfully', async () => {
      // Arrange
      const purchaseId = 'purchase-123';
      const newStatus = 'delivered';
      const mockUpdatedRow = {
        ...createMockPurchaseRow(),
        status: 'delivered',
        delivered_at: new Date().toISOString()
      };

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.updateStatus(purchaseId, newStatus);

      // Assert
      expect(result).toBeInstanceOf(Purchase);
      expect(result.status).toBe('delivered');
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'delivered',
          delivered_at: expect.any(String),
          updated_at: expect.any(String)
        })
      );
    });

    it('should update status without timestamp for other statuses', async () => {
      // Arrange
      const purchaseId = 'purchase-123';
      const newStatus = 'cancelled';
      const mockUpdatedRow = {
        ...createMockPurchaseRow(),
        status: 'cancelled'
      };

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.updateStatus(purchaseId, newStatus);

      // Assert
      expect(result).toBeInstanceOf(Purchase);
      expect(result.status).toBe('cancelled');
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'cancelled',
          updated_at: expect.any(String)
        })
      );
    });

    it('should throw error when update status fails', async () => {
      // Arrange
      const purchaseId = 'purchase-123';
      const newStatus = 'confirmed';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Update failed') });

      // Act & Assert
      await expect(repository.updateStatus(purchaseId, newStatus)).rejects.toThrow('Error al actualizar estado de compra: Update failed');
    });

    it('should handle unknown error in updateStatus', async () => {
      // Arrange
      const purchaseId = 'purchase-123';
      const newStatus = 'confirmed';

      mockFrom.single.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(repository.updateStatus(purchaseId, newStatus)).rejects.toThrow('Error desconocido al actualizar estado de compra');
    });
  });

  describe('findByStatus', () => {
    it('should find purchases by status with default pagination', async () => {
      // Arrange
      const status = 'pending';
      const mockRows = [createMockPurchaseRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByStatus(status);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Purchase);
      expect(mockFrom.eq).toHaveBeenCalledWith('status', status);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19);
      expect(mockFrom.order).toHaveBeenCalledWith('purchase_date', { ascending: false });
    });

    it('should find purchases by status with custom pagination', async () => {
      // Arrange
      const status = 'completed';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockPurchaseRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByStatus(status, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no purchases found by status', async () => {
      // Arrange
      const status = 'nonexistent-status';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findByStatus(status);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database error in findByStatus', async () => {
      // Arrange
      const status = 'pending';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findByStatus(status);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getTotalSpentByBuyer', () => {
    const mockSelect = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn()
    };

    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue(mockSelect);
    });

    it('should calculate total spent by buyer successfully', async () => {
      // Arrange
      const buyerId = 'buyer-1';
      const mockData = [
        { total_price: 50.00 },
        { total_price: 75.00 },
        { total_price: 100.00 }
      ];

      mockSelect.in.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await repository.getTotalSpentByBuyer(buyerId);

      // Assert
      expect(result).toBe(225.00);
      expect(mockSelect.select).toHaveBeenCalledWith('total_price');
      expect(mockSelect.eq).toHaveBeenCalledWith('buyer_id', buyerId);
      expect(mockSelect.in).toHaveBeenCalledWith('status', ['confirmed', 'shipped', 'delivered']);
    });

    it('should return 0 when no purchases found', async () => {
      // Arrange
      const buyerId = 'buyer-nonexistent';

      mockSelect.in.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.getTotalSpentByBuyer(buyerId);

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when data is null', async () => {
      // Arrange
      const buyerId = 'buyer-1';

      mockSelect.in.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.getTotalSpentByBuyer(buyerId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle database error in getTotalSpentByBuyer', async () => {
      // Arrange
      const buyerId = 'buyer-1';

      mockSelect.in.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.getTotalSpentByBuyer(buyerId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle exception in getTotalSpentByBuyer', async () => {
      // Arrange
      const buyerId = 'buyer-1';

      mockSelect.in.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.getTotalSpentByBuyer(buyerId);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getTotalEarnedBySeller', () => {
    const mockSelectSales = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn()
    };

    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue(mockSelectSales);
    });

    it('should calculate total earned by seller successfully', async () => {
      // Arrange
      const sellerId = 'seller-1';
      const mockData = [
        { net_amount: 45.00 },
        { net_amount: 67.50 },
        { net_amount: 90.00 }
      ];

      mockSelectSales.in.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await repository.getTotalEarnedBySeller(sellerId);

      // Assert
      expect(result).toBe(202.50);
      expect(mockSelectSales.select).toHaveBeenCalledWith('net_amount');
      expect(mockSelectSales.eq).toHaveBeenCalledWith('seller_id', sellerId);
      expect(mockSelectSales.in).toHaveBeenCalledWith('status', ['confirmed', 'shipped', 'completed']);
    });

    it('should return 0 when no sales found', async () => {
      // Arrange
      const sellerId = 'seller-nonexistent';

      mockSelectSales.in.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.getTotalEarnedBySeller(sellerId);

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when data is null', async () => {
      // Arrange
      const sellerId = 'seller-1';

      mockSelectSales.in.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.getTotalEarnedBySeller(sellerId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle database error in getTotalEarnedBySeller', async () => {
      // Arrange
      const sellerId = 'seller-1';

      mockSelectSales.in.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.getTotalEarnedBySeller(sellerId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle exception in getTotalEarnedBySeller', async () => {
      // Arrange
      const sellerId = 'seller-1';

      mockSelectSales.in.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.getTotalEarnedBySeller(sellerId);

      // Assert
      expect(result).toBe(0);
    });
  });
});
