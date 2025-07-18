import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseMessageRepository } from '../../../../../infrastructure/driven/repositories/SupabaseMessageRepository';
import { Message } from '../../../../../domain/entities/Message';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn()
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

  describe('markAsRead', () => {
    it('should mark message as read successfully', async () => {
      // Arrange
      const messageId = 'message-123';
      const mockUpdatedRow = {
        ...createMockMessageRow(),
        is_read: true,
        read_at: new Date().toISOString()
      };

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.markAsRead(messageId);

      // Assert
      expect(result).toBeInstanceOf(Message);
      expect(result.isRead).toBe(true);
      expect(mockFrom.eq).toHaveBeenCalledWith('id', messageId);
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_read: true,
          read_at: expect.any(String),
          updated_at: expect.any(String)
        })
      );
    });

    it('should throw error when mark as read fails', async () => {
      // Arrange
      const messageId = 'message-123';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Update failed') });

      // Act & Assert
      await expect(repository.markAsRead(messageId)).rejects.toThrow('Error al marcar mensaje como leído: Update failed');
    });

    it('should handle unknown error in markAsRead', async () => {
      // Arrange
      const messageId = 'message-123';

      mockFrom.single.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(repository.markAsRead(messageId)).rejects.toThrow('Error desconocido al marcar mensaje como leído');
    });
  });

  describe('findUnreadByReceiverId', () => {
    it('should find unread messages by receiver ID successfully', async () => {
      // Arrange
      const receiverId = 'user-2';
      const mockRows = [createMockMessageRow()];

      mockFrom.order.mockResolvedValue({ data: mockRows, error: null });

      // Act
      const result = await repository.findUnreadByReceiverId(receiverId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Message);
      expect(result[0].recipientId).toBe('user-2');
      expect(mockFrom.eq).toHaveBeenCalledWith('recipient_id', receiverId);
      expect(mockFrom.eq).toHaveBeenCalledWith('is_read', false);
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array when no unread messages found', async () => {
      // Arrange
      const receiverId = 'user-2';

      mockFrom.order.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await repository.findUnreadByReceiverId(receiverId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database error in findUnreadByReceiverId', async () => {
      // Arrange
      const receiverId = 'user-2';

      mockFrom.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findUnreadByReceiverId(receiverId);

      // Assert
      expect(result).toEqual([]);
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

    it('should delete message successfully', async () => {
      // Arrange
      const messageId = 'message-123';
      mockDelete.eq.mockResolvedValue({ error: null });

      // Act
      const result = await repository.delete(messageId);

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
      expect(mockDelete.delete).toHaveBeenCalled();
      expect(mockDelete.eq).toHaveBeenCalledWith('id', messageId);
    });

    it('should return false when delete fails', async () => {
      // Arrange
      const messageId = 'message-123';
      mockDelete.eq.mockResolvedValue({ error: new Error('Delete failed') });

      // Act
      const result = await repository.delete(messageId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle exception in delete', async () => {
      // Arrange
      const messageId = 'message-123';
      mockDelete.eq.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.delete(messageId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    const mockSelect = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis()
    };

    it('should get unread count successfully', async () => {
      // Arrange
      const receiverId = 'user-2';
      mockSupabaseClient.from.mockReturnValue(mockSelect);
      mockSelect.eq.mockReturnValueOnce(mockSelect); // First .eq() call
      mockSelect.eq.mockResolvedValueOnce({ count: 5, error: null }); // Second .eq() call

      // Act
      const result = await repository.getUnreadCount(receiverId);

      // Assert
      expect(result).toBe(5);
      expect(mockSelect.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(mockSelect.eq).toHaveBeenCalledWith('recipient_id', receiverId);
      expect(mockSelect.eq).toHaveBeenCalledWith('is_read', false);
    });

    it('should return 0 when count is null', async () => {
      // Arrange
      const receiverId = 'user-2';
      mockSupabaseClient.from.mockReturnValue(mockSelect);
      mockSelect.eq.mockReturnValueOnce(mockSelect);
      mockSelect.eq.mockResolvedValueOnce({ count: null, error: null });

      // Act
      const result = await repository.getUnreadCount(receiverId);

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when database error occurs', async () => {
      // Arrange
      const receiverId = 'user-2';
      mockSupabaseClient.from.mockReturnValue(mockSelect);
      mockSelect.eq.mockReturnValueOnce(mockSelect);
      mockSelect.eq.mockResolvedValueOnce({ count: null, error: new Error('Database error') });

      // Act
      const result = await repository.getUnreadCount(receiverId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle exception in getUnreadCount', async () => {
      // Arrange
      const receiverId = 'user-2';
      mockSupabaseClient.from.mockReturnValue(mockSelect);
      mockSelect.eq.mockReturnValueOnce(mockSelect);
      mockSelect.eq.mockRejectedValueOnce(new Error('Database error'));

      // Act
      const result = await repository.getUnreadCount(receiverId);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getConversations', () => {
    it('should get conversations successfully using RPC', async () => {
      // Arrange
      const userId = 'user-1';
      const mockData = [createMockMessageRow()];
      mockSupabaseClient.rpc.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await repository.getConversations(userId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Message);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_latest_messages_by_conversation', { user_id: userId });
    });

    it('should fallback when RPC fails', async () => {
      // Arrange
      const userId = 'user-1';
      mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: new Error('RPC failed') });

      // Mock fallback method
      const mockFallbackData = [
        { ...createMockMessageRow(), sender_id: 'user-1', recipient_id: 'user-2' },
        { ...createMockMessageRow(), id: 'message-456', sender_id: 'user-3', recipient_id: 'user-1' }
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFallbackData, error: null })
      });

      // Act
      const result = await repository.getConversations(userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Message);
    });

    it('should handle fallback database error', async () => {
      // Arrange
      const userId = 'user-1';
      mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: new Error('RPC failed') });

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('Fallback failed') })
      });

      // Act
      const result = await repository.getConversations(userId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle fallback exception', async () => {
      // Arrange
      const userId = 'user-1';
      mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: new Error('RPC failed') });

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockRejectedValue(new Error('Fallback exception'))
      });

      // Act
      const result = await repository.getConversations(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
