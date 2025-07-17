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
});
