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
  limit: vi.fn().mockReturnThis()
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
});
