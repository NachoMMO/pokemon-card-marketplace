import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseMessageRepository } from '../../../../../infrastructure/driven/repositories/SupabaseMessageRepository';
import { Message } from '../../../../../domain/entities/Message';

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
  or: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  order: vi.fn(),
  single: vi.fn()
};

// Helper function to create mock message row
function createMockMessageRow() {
  return {
    id: 'message-123',
    sender_id: 'user-1',
    recipient_id: 'user-2',
    subject: 'Test Subject',
    content: 'Test message content',
    is_read: false,
    read_at: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };
}

describe('SupabaseMessageRepository', () => {
  let repository: SupabaseMessageRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue(mockFrom);
    repository = new SupabaseMessageRepository(mockSupabaseClient as any);
  });

  describe('create', () => {
    it('should create message successfully', async () => {
      // Arrange
      const message = new Message(
        'message-123',
        'user-1',
        'user-2',
        'Test Subject',
        'Test message content',
        false,
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );

      const mockCreatedRow = createMockMessageRow();
      mockFrom.single.mockResolvedValue({ data: mockCreatedRow, error: null });

      // Act
      const result = await repository.create(message);

      // Assert
      expect(result).toBeInstanceOf(Message);
      expect(result.id).toBe('message-123');
      expect(result.subject).toBe('Test Subject');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      // Arrange
      const message = new Message(
        'message-123',
        'user-1',
        'user-2',
        'Test Subject',
        'Test message content',
        false,
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Insert failed') });

      // Act & Assert
      await expect(repository.create(message)).rejects.toThrow('Error al crear mensaje: Insert failed');
    });
  });

  describe('findById', () => {
    it('should find message by ID successfully', async () => {
      // Arrange
      const messageId = 'message-123';
      const mockRow = createMockMessageRow();

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findById(messageId);

      // Assert
      expect(result).toBeInstanceOf(Message);
      expect(result?.id).toBe('message-123');
      expect(result?.senderId).toBe('user-1');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', messageId);
    });

    it('should return null when message not found', async () => {
      // Arrange
      const messageId = 'nonexistent';

      mockFrom.single.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.findById(messageId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      // Arrange
      const messageId = 'message-123';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findById(messageId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findConversation', () => {
    it('should find conversation messages with default pagination', async () => {
      // Arrange
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const mockRows = [createMockMessageRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findConversation(userId1, userId2);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Message);
      expect(result[0].senderId).toBe('user-1');
      expect(mockFrom.range).toHaveBeenCalledWith(0, 49);
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should find conversation messages with custom pagination', async () => {
      // Arrange
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockMessageRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findConversation(userId1, userId2, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no messages found', async () => {
      // Arrange
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findConversation(userId1, userId2);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findConversation(userId1, userId2);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByReceiverId', () => {
    it('should find messages by receiver ID with default pagination', async () => {
      // Arrange
      const receiverId = 'user-2';
      const mockRows = [createMockMessageRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByReceiverId(receiverId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Message);
      expect(result[0].recipientId).toBe('user-2');
      expect(mockFrom.eq).toHaveBeenCalledWith('recipient_id', receiverId);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19);
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should find messages by receiver ID with custom pagination', async () => {
      // Arrange
      const receiverId = 'user-2';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockMessageRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findByReceiverId(receiverId, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no messages found', async () => {
      // Arrange
      const receiverId = 'user-nonexistent';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findByReceiverId(receiverId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      const receiverId = 'user-2';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findByReceiverId(receiverId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findBySenderId', () => {
    it('should find messages by sender ID with default pagination', async () => {
      // Arrange
      const senderId = 'user-1';
      const mockRows = [createMockMessageRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySenderId(senderId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Message);
      expect(result[0].senderId).toBe('user-1');
      expect(mockFrom.eq).toHaveBeenCalledWith('sender_id', senderId);
      expect(mockFrom.range).toHaveBeenCalledWith(0, 19);
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should find messages by sender ID with custom pagination', async () => {
      // Arrange
      const senderId = 'user-1';
      const limit = 10;
      const offset = 5;
      const mockRows = [createMockMessageRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findBySenderId(senderId, limit, offset);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should return empty array when no messages found', async () => {
      // Arrange
      const senderId = 'user-nonexistent';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findBySenderId(senderId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when database error occurs', async () => {
      // Arrange
      const senderId = 'user-1';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findBySenderId(senderId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
