import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseCollectionRepository } from '../../../../../infrastructure/driven/repositories/SupabaseCollectionRepository';
import { CollectionEntry } from '../../../../../domain/entities/CollectionEntry';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn()
};

// Mock query builder methods
const mockFrom = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn(),
  single: vi.fn()
};

// Helper function to create mock collection row
function createMockCollectionRow() {
  return {
    id: 'collection-123',
    user_id: 'user-1',
    card_id: 'card-123',
    quantity: 2,
    condition: 'Near Mint',
    acquired_date: '2023-01-01T00:00:00Z',
    acquired_price: 25.00,
    current_value: 50.00,
    is_for_trade: true,
    notes: 'Great condition card',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };
}

describe('SupabaseCollectionRepository', () => {
  let repository: SupabaseCollectionRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue(mockFrom);
    repository = new SupabaseCollectionRepository(mockSupabaseClient as any);
  });

  describe('addCard', () => {
    it('should add card to collection successfully', async () => {
      // Arrange
      const collectionEntry = new CollectionEntry(
        'collection-123',
        'user-1',
        'card-123',
        2,
        'Near Mint',
        new Date('2023-01-01'),
        25.00,
        50.00,
        true,
        'Great condition card',
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );

      const mockCreatedRow = createMockCollectionRow();
      mockFrom.single.mockResolvedValue({ data: mockCreatedRow, error: null });

      // Act
      const result = await repository.addCard(collectionEntry);

      // Assert
      expect(result).toBeInstanceOf(CollectionEntry);
      expect(result.id).toBe('collection-123');
      expect(result.quantity).toBe(2);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('collections');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should throw error when adding card fails', async () => {
      // Arrange
      const collectionEntry = new CollectionEntry(
        'collection-123',
        'user-1',
        'card-123',
        2,
        'Near Mint',
        new Date('2023-01-01'),
        25.00,
        50.00,
        true,
        'Great condition card',
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Insert failed') });

      // Act & Assert
      await expect(repository.addCard(collectionEntry)).rejects.toThrow('Error al añadir carta a la colección: Insert failed');
    });
  });

  describe('findByUserId', () => {
    it('should find collection entries by user ID successfully', async () => {
      // Arrange
      const userId = 'user-1';
      const mockRows = [createMockCollectionRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(CollectionEntry);
      expect(result[0].userId).toBe('user-1');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array when no entries found', async () => {
      // Arrange
      const userId = 'user-nonexistent';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      const userId = 'user-1';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByUserIdAndCardId', () => {
    it('should find collection entry by user ID and card ID successfully', async () => {
      // Arrange
      const userId = 'user-1';
      const cardId = 'card-123';
      const mockRow = createMockCollectionRow();

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findByUserIdAndCardId(userId, cardId);

      // Assert
      expect(result).toBeInstanceOf(CollectionEntry);
      expect(result?.userId).toBe('user-1');
      expect(result?.cardId).toBe('card-123');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockFrom.eq).toHaveBeenCalledWith('card_id', cardId);
    });

    it('should return null when entry not found', async () => {
      // Arrange
      const userId = 'user-1';
      const cardId = 'nonexistent-card';

      mockFrom.single.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.findByUserIdAndCardId(userId, cardId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      // Arrange
      const userId = 'user-1';
      const cardId = 'card-123';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findByUserIdAndCardId(userId, cardId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity successfully', async () => {
      // Arrange
      const entryId = 'collection-123';
      const newQuantity = 5;
      const mockUpdatedRow = createMockCollectionRow();
      mockUpdatedRow.quantity = newQuantity;

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.updateQuantity(entryId, newQuantity);

      // Assert
      expect(result).toBeInstanceOf(CollectionEntry);
      expect(result.quantity).toBe(newQuantity);
      expect(mockFrom.eq).toHaveBeenCalledWith('id', entryId);
      expect(mockFrom.update).toHaveBeenCalledWith(expect.objectContaining({
        quantity: newQuantity
      }));
    });

    it('should throw error when update fails', async () => {
      // Arrange
      const entryId = 'collection-123';
      const newQuantity = 5;

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Update failed') });

      // Act & Assert
      await expect(repository.updateQuantity(entryId, newQuantity)).rejects.toThrow('Error al actualizar cantidad: Update failed');
    });

    it('should handle unknown error in updateQuantity', async () => {
      // Arrange
      const entryId = 'collection-123';
      const newQuantity = 5;

      mockFrom.single.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(repository.updateQuantity(entryId, newQuantity)).rejects.toThrow('Error desconocido al actualizar cantidad');
    });
  });

  describe('removeCard', () => {
    const mockDelete = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn()
    };

    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue(mockDelete);
    });

    it('should remove card from collection successfully', async () => {
      // Arrange
      const entryId = 'collection-123';
      mockDelete.eq.mockResolvedValue({ error: null });

      // Act
      const result = await repository.removeCard(entryId);

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('collections');
      expect(mockDelete.delete).toHaveBeenCalled();
      expect(mockDelete.eq).toHaveBeenCalledWith('id', entryId);
    });

    it('should return false when remove fails', async () => {
      // Arrange
      const entryId = 'collection-123';
      mockDelete.eq.mockResolvedValue({ error: new Error('Delete failed') });

      // Act
      const result = await repository.removeCard(entryId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle exception in removeCard', async () => {
      // Arrange
      const entryId = 'collection-123';
      mockDelete.eq.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.removeCard(entryId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('countUniqueCards', () => {
    const mockSelect = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn()
    };

    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue(mockSelect);
    });

    it('should count unique cards successfully', async () => {
      // Arrange
      const userId = 'user-1';
      mockSelect.eq.mockResolvedValue({ count: 15, error: null });

      // Act
      const result = await repository.countUniqueCards(userId);

      // Assert
      expect(result).toBe(15);
      expect(mockSelect.select).toHaveBeenCalledWith('card_id', { count: 'exact', head: true });
      expect(mockSelect.eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should return 0 when count is null', async () => {
      // Arrange
      const userId = 'user-1';
      mockSelect.eq.mockResolvedValue({ count: null, error: null });

      // Act
      const result = await repository.countUniqueCards(userId);

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when database error occurs', async () => {
      // Arrange
      const userId = 'user-1';
      mockSelect.eq.mockResolvedValue({ count: null, error: new Error('Database error') });

      // Act
      const result = await repository.countUniqueCards(userId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle exception in countUniqueCards', async () => {
      // Arrange
      const userId = 'user-1';
      mockSelect.eq.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.countUniqueCards(userId);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('countTotalCards', () => {
    const mockSelectTotal = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn()
    };

    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue(mockSelectTotal);
    });

    it('should count total cards successfully', async () => {
      // Arrange
      const userId = 'user-1';
      const mockData = [
        { quantity: 3 },
        { quantity: 2 },
        { quantity: 5 }
      ];
      mockSelectTotal.eq.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await repository.countTotalCards(userId);

      // Assert
      expect(result).toBe(10); // 3 + 2 + 5
      expect(mockSelectTotal.select).toHaveBeenCalledWith('quantity');
      expect(mockSelectTotal.eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should return 0 when no cards found', async () => {
      // Arrange
      const userId = 'user-1';
      mockSelectTotal.eq.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.countTotalCards(userId);

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when data is null', async () => {
      // Arrange
      const userId = 'user-1';
      mockSelectTotal.eq.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.countTotalCards(userId);

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when database error occurs', async () => {
      // Arrange
      const userId = 'user-1';
      mockSelectTotal.eq.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.countTotalCards(userId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle exception in countTotalCards', async () => {
      // Arrange
      const userId = 'user-1';
      mockSelectTotal.eq.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.countTotalCards(userId);

      // Assert
      expect(result).toBe(0);
    });
  });
});
