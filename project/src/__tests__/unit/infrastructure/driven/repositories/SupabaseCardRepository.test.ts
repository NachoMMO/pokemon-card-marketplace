import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseCardRepository } from '../../../../../infrastructure/driven/repositories/SupabaseCardRepository';
import { Card } from '../../../../../domain/entities/Card';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn()
};

// Mock query builder methods
const mockFrom = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  order: vi.fn(),
  single: vi.fn(),
  limit: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis()
};

// Helper function to create mock card row
function createMockCardRow() {
  return {
    id: 'card-123',
    pokemon_tcg_id: 'base1-1',
    name: 'Alakazam',
    image_url: 'https://example.com/alakazam.jpg',
    image_url_hi_res: 'https://example.com/alakazam-hires.jpg',
    set: 'base1',
    set_name: 'Base Set',
    rarity: 'Rare Holo',
    types: ['Psychic'],
    subtypes: ['Stage 2'],
    number: '1',
    artist: 'Ken Sugimori',
    flavor_text: 'Its brain can outperform a supercomputer.',
    national_pokedex_numbers: [65],
    market_price: 50.00,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };
}

describe('SupabaseCardRepository', () => {
  let repository: SupabaseCardRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue(mockFrom);
    repository = new SupabaseCardRepository(mockSupabaseClient as any);
  });

  describe('findById', () => {
    it('should find card by ID successfully', async () => {
      // Arrange
      const cardId = 'card-123';
      const mockRow = createMockCardRow();

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findById(cardId);

      // Assert
      expect(result).toBeInstanceOf(Card);
      expect(result?.id).toBe('card-123');
      expect(result?.name).toBe('Alakazam');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', cardId);
    });

    it('should return null when card not found', async () => {
      // Arrange
      const cardId = 'nonexistent';

      mockFrom.single.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.findById(cardId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      // Arrange
      const cardId = 'card-123';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findById(cardId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should search cards by name successfully', async () => {
      // Arrange
      const criteria = { name: 'Alakazam', limit: 10 };
      const mockRows = [createMockCardRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Card);
      expect(result[0].name).toBe('Alakazam');
      expect(mockFrom.ilike).toHaveBeenCalledWith('name', '%Alakazam%');
      expect(mockFrom.range).toHaveBeenCalledWith(0, 9);
    });

    it('should search cards by set successfully', async () => {
      // Arrange
      const criteria = { set: 'base1', limit: 5 };
      const mockRows = [createMockCardRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.eq).toHaveBeenCalledWith('set', 'base1');
      expect(mockFrom.range).toHaveBeenCalledWith(0, 4);
    });

    it('should search cards by rarity successfully', async () => {
      // Arrange
      const criteria = { rarity: 'Rare Holo' };
      const mockRows = [createMockCardRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.eq).toHaveBeenCalledWith('rarity', 'Rare Holo');
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19); // default limit
    });

    it('should search cards by type successfully', async () => {
      // Arrange
      const criteria = { type: 'Psychic' };
      const mockRows = [createMockCardRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.contains).toHaveBeenCalledWith('types', ['Psychic']);
    });

    it('should search with multiple criteria', async () => {
      // Arrange
      const criteria = {
        name: 'Alakazam',
        set: 'base1',
        rarity: 'Rare Holo',
        type: 'Psychic',
        limit: 15,
        offset: 5
      };
      const mockRows = [createMockCardRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.ilike).toHaveBeenCalledWith('name', '%Alakazam%');
      expect(mockFrom.eq).toHaveBeenCalledWith('set', 'base1');
      expect(mockFrom.eq).toHaveBeenCalledWith('rarity', 'Rare Holo');
      expect(mockFrom.contains).toHaveBeenCalledWith('types', ['Psychic']);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 19);
    });

    it('should return empty array when search fails', async () => {
      // Arrange
      const criteria = { name: 'Nonexistent' };

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Search failed') });

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should find all cards with default pagination', async () => {
      // Arrange
      const mockRows = [createMockCardRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Card);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19); // default limit 20
      expect(mockFrom.order).toHaveBeenCalledWith('name', { ascending: true });
    });

    it('should find all cards with custom pagination', async () => {
      // Arrange
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockCardRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findAll(limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no cards found', async () => {
      // Arrange
      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findBySet', () => {
    it('should find cards by set successfully', async () => {
      // Arrange
      const setId = 'base1';
      const mockRows = [createMockCardRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySet(setId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Card);
      expect(mockFrom.eq).toHaveBeenCalledWith('set', setId);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19); // default limit 20
      expect(mockFrom.order).toHaveBeenCalledWith('number', { ascending: true });
    });

    it('should find cards by set with custom pagination', async () => {
      // Arrange
      const setId = 'base1';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockCardRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySet(setId, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.eq).toHaveBeenCalledWith('set', setId);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no cards found in set', async () => {
      // Arrange
      const setId = 'nonexistent';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findBySet(setId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      const setId = 'base1';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findBySet(setId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('count', () => {
    it('should count cards successfully', async () => {
      // Arrange
      const mockFrom2 = {
        select: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockFrom2);
      mockFrom2.select.mockResolvedValue({ count: 100, error: null });

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(100);
      expect(mockFrom2.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    });

    it('should return 0 when no cards found', async () => {
      // Arrange
      const mockFrom2 = {
        select: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockFrom2);
      mockFrom2.select.mockResolvedValue({ count: 0, error: null });

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when count is null', async () => {
      // Arrange
      const mockFrom2 = {
        select: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockFrom2);
      mockFrom2.select.mockResolvedValue({ count: null, error: null });

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when database error occurs', async () => {
      // Arrange
      const mockFrom2 = {
        select: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockFrom2);
      mockFrom2.select.mockResolvedValue({ count: null, error: new Error('Database error') });

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(0);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const mockFrom2 = {
        select: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockFrom2);
      mockFrom2.select.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('searchMarketplace', () => {
    it('should search marketplace cards by name', async () => {
      // Arrange
      const criteria = { name: 'Alakazam' };
      const mockRows = [createMockCardRow()];

      // Mock the chain of methods
      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.searchMarketplace(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Card);
      expect(mockQuery.ilike).toHaveBeenCalledWith('name', '%Alakazam%');
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19);
    });

    it('should search marketplace cards by type', async () => {
      // Arrange
      const criteria = { type: 'Psychic' };
      const mockRows = [createMockCardRow()];

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.searchMarketplace(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockQuery.contains).toHaveBeenCalledWith('types', ['Psychic']);
    });

    it('should search marketplace cards by rarity', async () => {
      // Arrange
      const criteria = { rarity: 'Rare Holo' };
      const mockRows = [createMockCardRow()];

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.searchMarketplace(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockQuery.eq).toHaveBeenCalledWith('rarity', 'Rare Holo');
    });

    it('should search marketplace cards by set', async () => {
      // Arrange
      const criteria = { set: 'Base Set' };
      const mockRows = [createMockCardRow()];

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.searchMarketplace(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockQuery.eq).toHaveBeenCalledWith('set_name', 'Base Set');
    });

    it('should search marketplace cards by expansion', async () => {
      // Arrange
      const criteria = { expansion: 'Base Set' };
      const mockRows = [createMockCardRow()];

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.searchMarketplace(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockQuery.eq).toHaveBeenCalledWith('set_name', 'Base Set');
    });

    it('should search marketplace cards with custom pagination', async () => {
      // Arrange
      const criteria = { name: 'Alakazam' };
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockCardRow()];

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.searchMarketplace(criteria, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockQuery.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when search fails', async () => {
      // Arrange
      const criteria = { name: 'Nonexistent' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({ data: null, error: new Error('Search failed') });

      // Act
      const result = await repository.searchMarketplace(criteria);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const criteria = { name: 'Alakazam' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.range.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await repository.searchMarketplace(criteria);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('countMarketplace', () => {
    it('should count marketplace cards with criteria', async () => {
      // Arrange
      const criteria = { name: 'Alakazam' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockResolvedValue({ count: 5, error: null });

      // Act
      const result = await repository.countMarketplace(criteria);

      // Assert
      expect(result).toBe(5);
      expect(mockFrom.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(mockQuery.ilike).toHaveBeenCalledWith('name', '%Alakazam%');
    });

    it('should count marketplace cards by type', async () => {
      // Arrange
      const criteria = { type: 'Psychic' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockResolvedValue({ count: 3, error: null });

      // Act
      const result = await repository.countMarketplace(criteria);

      // Assert
      expect(result).toBe(3);
      expect(mockQuery.contains).toHaveBeenCalledWith('types', ['Psychic']);
    });

    it('should count marketplace cards by rarity', async () => {
      // Arrange
      const criteria = { rarity: 'Rare Holo' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockResolvedValue({ count: 2, error: null });

      // Act
      const result = await repository.countMarketplace(criteria);

      // Assert
      expect(result).toBe(2);
      expect(mockQuery.eq).toHaveBeenCalledWith('rarity', 'Rare Holo');
    });

    it('should count marketplace cards by set', async () => {
      // Arrange
      const criteria = { set: 'Base Set' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockResolvedValue({ count: 4, error: null });

      // Act
      const result = await repository.countMarketplace(criteria);

      // Assert
      expect(result).toBe(4);
      expect(mockQuery.eq).toHaveBeenCalledWith('set_name', 'Base Set');
    });

    it('should count marketplace cards by expansion', async () => {
      // Arrange
      const criteria = { expansion: 'Base Set' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockResolvedValue({ count: 4, error: null });

      // Act
      const result = await repository.countMarketplace(criteria);

      // Assert
      expect(result).toBe(4);
      expect(mockQuery.eq).toHaveBeenCalledWith('set_name', 'Base Set');
    });

    it('should return 0 when count is null', async () => {
      // Arrange
      const criteria = { name: 'Alakazam' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockResolvedValue({ count: null, error: null });

      // Act
      const result = await repository.countMarketplace(criteria);

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when database error occurs', async () => {
      // Arrange
      const criteria = { name: 'Alakazam' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockResolvedValue({ count: null, error: new Error('Database error') });

      // Act
      const result = await repository.countMarketplace(criteria);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const criteria = { name: 'Alakazam' };

      const mockQuery = {
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
      mockFrom.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await repository.countMarketplace(criteria);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('findBySeller', () => {
    it('should find cards by seller successfully', async () => {
      // Arrange
      const sellerId = 'seller-123';
      const mockRows = [createMockCardRow()];

      mockFrom.range.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySeller(sellerId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Card);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19);
    });

    it('should find cards by seller with custom pagination', async () => {
      // Arrange
      const sellerId = 'seller-123';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockCardRow()];

      mockFrom.range.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySeller(sellerId, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no cards found', async () => {
      // Arrange
      const sellerId = 'seller-123';

      mockFrom.range.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findBySeller(sellerId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      const sellerId = 'seller-123';

      mockFrom.range.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findBySeller(sellerId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const sellerId = 'seller-123';

      mockFrom.range.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await repository.findBySeller(sellerId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create card successfully', async () => {
      // Arrange
      const card = new Card(
        'card-123',
        'Alakazam',
        'Psychic',
        'Rare Holo',
        'Base Set',
        50.00,
        1,
        'https://example.com/alakazam.jpg',
        'Its brain can outperform a supercomputer.',
        'seller-123',
        'Near Mint',
        '1',
        'Ken Sugimori',
        true,
        new Date(),
        new Date()
      );
      const mockRow = createMockCardRow();

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockInsert);
      mockInsert.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.create(card);

      // Assert
      expect(result).toBeInstanceOf(Card);
      expect(result.id).toBe('card-123');
      expect(mockInsert.insert).toHaveBeenCalledWith({
        id: card.id,
        name: card.name,
        types: [card.type],
        rarity: card.rarity,
        set_name: card.expansion,
        market_price: card.price,
        image_url: card.imageUrl,
        flavor_text: card.description,
        number: card.cardNumber,
        artist: card.artist
      });
    });

    it('should throw error when database error occurs', async () => {
      // Arrange
      const card = new Card(
        'card-123',
        'Alakazam',
        'Psychic',
        'Rare Holo',
        'Base Set',
        50.00,
        1,
        'https://example.com/alakazam.jpg',
        'Its brain can outperform a supercomputer.',
        'seller-123',
        'Near Mint',
        '1',
        'Ken Sugimori',
        true,
        new Date(),
        new Date()
      );

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockInsert);
      mockInsert.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act & Assert
      await expect(repository.create(card)).rejects.toThrow('Error al crear carta: Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const card = new Card(
        'card-123',
        'Alakazam',
        'Psychic',
        'Rare Holo',
        'Base Set',
        50.00,
        1,
        'https://example.com/alakazam.jpg',
        'Its brain can outperform a supercomputer.',
        'seller-123',
        'Near Mint',
        '1',
        'Ken Sugimori',
        true,
        new Date(),
        new Date()
      );

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockInsert);
      mockInsert.single.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(repository.create(card)).rejects.toThrow('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      const card = new Card(
        'card-123',
        'Alakazam',
        'Psychic',
        'Rare Holo',
        'Base Set',
        50.00,
        1,
        'https://example.com/alakazam.jpg',
        'Its brain can outperform a supercomputer.',
        'seller-123',
        'Near Mint',
        '1',
        'Ken Sugimori',
        true,
        new Date(),
        new Date()
      );

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockInsert);
      mockInsert.single.mockRejectedValue('String error');

      // Act & Assert
      await expect(repository.create(card)).rejects.toThrow('Error desconocido al crear carta');
    });
  });

  describe('update', () => {
    it('should update card successfully', async () => {
      // Arrange
      const card = new Card(
        'card-123',
        'Updated Alakazam',
        'Psychic',
        'Rare Holo',
        'Base Set',
        60.00,
        1,
        'https://example.com/alakazam-updated.jpg',
        'Updated description.',
        'seller-123',
        'Near Mint',
        '1',
        'Ken Sugimori',
        true,
        new Date(),
        new Date()
      );
      const mockRow = createMockCardRow();

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockUpdate);
      mockUpdate.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.update(card);

      // Assert
      expect(result).toBeInstanceOf(Card);
      expect(result.id).toBe('card-123');
      expect(mockUpdate.update).toHaveBeenCalledWith({
        name: card.name,
        types: [card.type],
        rarity: card.rarity,
        set_name: card.expansion,
        market_price: card.price,
        image_url: card.imageUrl,
        flavor_text: card.description,
        number: card.cardNumber,
        artist: card.artist,
        updated_at: expect.any(String)
      });
      expect(mockUpdate.eq).toHaveBeenCalledWith('id', card.id);
    });

    it('should throw error when database error occurs', async () => {
      // Arrange
      const card = new Card(
        'card-123',
        'Updated Alakazam',
        'Psychic',
        'Rare Holo',
        'Base Set',
        60.00,
        1,
        'https://example.com/alakazam-updated.jpg',
        'Updated description.',
        'seller-123',
        'Near Mint',
        '1',
        'Ken Sugimori',
        true,
        new Date(),
        new Date()
      );

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockUpdate);
      mockUpdate.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act & Assert
      await expect(repository.update(card)).rejects.toThrow('Error al actualizar carta: Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const card = new Card(
        'card-123',
        'Updated Alakazam',
        'Psychic',
        'Rare Holo',
        'Base Set',
        60.00,
        1,
        'https://example.com/alakazam-updated.jpg',
        'Updated description.',
        'seller-123',
        'Near Mint',
        '1',
        'Ken Sugimori',
        true,
        new Date(),
        new Date()
      );

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockUpdate);
      mockUpdate.single.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(repository.update(card)).rejects.toThrow('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      const card = new Card(
        'card-123',
        'Updated Alakazam',
        'Psychic',
        'Rare Holo',
        'Base Set',
        60.00,
        1,
        'https://example.com/alakazam-updated.jpg',
        'Updated description.',
        'seller-123',
        'Near Mint',
        '1',
        'Ken Sugimori',
        true,
        new Date(),
        new Date()
      );

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockUpdate);
      mockUpdate.single.mockRejectedValue('String error');

      // Act & Assert
      await expect(repository.update(card)).rejects.toThrow('Error desconocido al actualizar carta');
    });
  });

  describe('delete', () => {
    it('should delete card successfully', async () => {
      // Arrange
      const cardId = 'card-123';

      const mockDelete = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockDelete);
      mockDelete.eq.mockResolvedValue({ error: null });

      // Act
      const result = await repository.delete(cardId);

      // Assert
      expect(result).toBe(true);
      expect(mockDelete.eq).toHaveBeenCalledWith('id', cardId);
    });

    it('should return false when database error occurs', async () => {
      // Arrange
      const cardId = 'card-123';

      const mockDelete = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockDelete);
      mockDelete.eq.mockResolvedValue({ error: new Error('Database error') });

      // Act
      const result = await repository.delete(cardId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when unexpected error occurs', async () => {
      // Arrange
      const cardId = 'card-123';

      const mockDelete = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn()
      };
      mockSupabaseClient.from.mockReturnValue(mockDelete);
      mockDelete.eq.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await repository.delete(cardId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('mapRowToCard (private method)', () => {
    it('should map row to card correctly through public methods', async () => {
      // Arrange - Test the mapping through findById
      const cardId = 'card-123';
      const mockRow = {
        id: 'card-123',
        pokemon_tcg_id: 'base1-1',
        name: 'Alakazam',
        image_url: 'https://example.com/alakazam.jpg',
        image_url_hi_res: 'https://example.com/alakazam-hires.jpg',
        set: 'base1',
        set_name: 'Base Set',
        rarity: 'Rare Holo',
        types: ['Psychic'],
        subtypes: ['Stage 2'],
        number: '1',
        artist: 'Ken Sugimori',
        flavor_text: 'Its brain can outperform a supercomputer.',
        national_pokedex_numbers: [65],
        market_price: 50.00,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findById(cardId);

      // Assert
      expect(result).toBeInstanceOf(Card);
      expect(result?.id).toBe('card-123');
      expect(result?.name).toBe('Alakazam');
      expect(result?.type).toBe('Psychic'); // types.join(', ')
      expect(result?.rarity).toBe('Rare Holo');
      expect(result?.expansion).toBe('Base Set'); // set_name
      expect(result?.price).toBe(50.00); // market_price
      expect(result?.stock).toBe(1); // default
      expect(result?.imageUrl).toBe('https://example.com/alakazam.jpg');
      expect(result?.description).toBe('Its brain can outperform a supercomputer.'); // flavor_text
      expect(result?.sellerId).toBe(''); // default
      expect(result?.condition).toBe('Near Mint'); // default
      expect(result?.cardNumber).toBe('1'); // number
      expect(result?.artist).toBe('Ken Sugimori');
      expect(result?.isForSale).toBe(true); // default
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle row with null/undefined values', async () => {
      // Arrange - Test mapping with minimal data
      const cardId = 'card-123';
      const mockRow = {
        id: 'card-123',
        pokemon_tcg_id: 'base1-1',
        name: 'Alakazam',
        image_url: 'https://example.com/alakazam.jpg',
        image_url_hi_res: null,
        set: 'base1',
        set_name: 'Base Set',
        rarity: 'Rare Holo',
        types: ['Psychic'],
        subtypes: null,
        number: '1',
        artist: null, // null artist
        flavor_text: null, // null flavor_text
        national_pokedex_numbers: null,
        market_price: null, // null price
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findById(cardId);

      // Assert
      expect(result).toBeInstanceOf(Card);
      expect(result?.price).toBe(0); // null market_price becomes 0
      expect(result?.description).toBe(''); // null flavor_text becomes ''
      expect(result?.artist).toBe(''); // null artist becomes ''
    });
  });
});
