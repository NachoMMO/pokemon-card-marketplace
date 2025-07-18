import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseNotificationService } from '../../../../../infrastructure/driven/services/SupabaseNotificationService';
import type { NotificationData, NotificationPreferences } from '../../../../../application/ports/services/INotificationService';

describe('SupabaseNotificationService', () => {
  let mockSupabaseClient: any;
  let mockFrom: any;
  let service: SupabaseNotificationService;

  beforeEach(() => {
    mockFrom = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient = {
      from: vi.fn(() => mockFrom),
    };

    service = new SupabaseNotificationService(mockSupabaseClient);
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      // Arrange
      const notificationData: NotificationData = {
        userId: 'user-123',
        type: 'sale',
        title: 'Test notification',
        message: 'Test message',
        priority: 'high'
      };

      mockFrom.insert.mockReturnThis();
      mockFrom.select.mockReturnThis();
      mockFrom.single.mockResolvedValue({ data: { id: 'notif-123' }, error: null });

      // Act
      const result = await service.sendNotification(notificationData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.notificationId).toBe('notif-123');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notifications');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should handle notification creation error', async () => {
      // Arrange
      const notificationData: NotificationData = {
        userId: 'user-123',
        type: 'sale',
        title: 'Test notification',
        message: 'Test message',
        priority: 'high'
      };

      mockFrom.insert.mockReturnThis();
      mockFrom.select.mockReturnThis();
      mockFrom.single.mockResolvedValue({ data: null, error: { message: 'Insert error' } });

      // Act
      const result = await service.sendNotification(notificationData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insert error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const notificationData: NotificationData = {
        userId: 'user-123',
        type: 'sale',
        title: 'Test notification',
        message: 'Test message',
        priority: 'high'
      };

      mockFrom.insert.mockImplementation(() => {
        throw new Error('Network error');
      });

      // Act
      const result = await service.sendNotification(notificationData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('sendBulkNotification', () => {
    it('should send bulk notifications successfully', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];
      const notificationData: Omit<NotificationData, 'userId'> = {
        type: 'info',
        title: 'System Update',
        message: 'System will be updated',
        priority: 'medium'
      };

      mockFrom.insert.mockReturnThis();
      mockFrom.select.mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null });

      // Act
      const result = await service.sendBulkNotification(userIds, notificationData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(mockFrom.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ user_id: 'user-1' }),
          expect.objectContaining({ user_id: 'user-2' })
        ])
      );
    });

    it('should handle bulk notification error', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];
      const notificationData: Omit<NotificationData, 'userId'> = {
        type: 'info',
        title: 'System Update',
        message: 'System will be updated',
        priority: 'medium'
      };

      mockFrom.insert.mockReturnThis();
      mockFrom.select.mockResolvedValue({ data: null, error: { message: 'Bulk insert error' } });

      // Act
      const result = await service.sendBulkNotification(userIds, notificationData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.sentCount).toBe(0);
      expect(result.failedCount).toBe(2);
    });

    it('should handle unexpected errors in bulk send', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];
      const notificationData: Omit<NotificationData, 'userId'> = {
        type: 'info',
        title: 'System Update',
        message: 'System will be updated',
        priority: 'medium'
      };

      // Create a proper mock chain that handles insert().select()
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockRejectedValue(new Error('Network error'))
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      // Act
      const result = await service.sendBulkNotification(userIds, notificationData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.sentCount).toBe(0);
      expect(result.failedCount).toBe(2);
    });
  });

  describe('getUserNotifications', () => {
    it('should get user notifications successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-123',
          type: 'sale',
          title: 'Venta confirmada',
          message: 'Tu carta ha sido vendida',
          priority: 'high',
          data: {},
          action_url: '/test1',
          expires_at: null,
          is_read: false,
          read_at: null,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

      // Mock for the first query (notifications)
      const mockNotificationChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockNotifications,
          error: null,
          count: 1
        })
      };

      // Mock for the second query (unread count)
      const mockCountChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };

      // Configure the chain: .eq('user_id', userId).eq('is_read', false)
      mockCountChain.eq
        .mockReturnValueOnce(mockCountChain) // first .eq('user_id', userId) returns chain
        .mockResolvedValueOnce({ count: 1, error: null }); // second .eq('is_read', false) returns result

      // Mock the from method calls - first for notifications, second for count
      mockSupabaseClient.from
        .mockReturnValueOnce(mockNotificationChain)
        .mockReturnValueOnce(mockCountChain);

      // Act
      const result = await service.getUserNotifications(userId);

      // Assert
      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.unreadCount).toBe(1);
      expect(result.notifications[0].id).toBe('notif-1');
    });

    it('should filter unread notifications only', async () => {
      // Arrange
      const userId = 'user-123';
      const unreadOnly = true;

      const mockNotificationQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 })
      };

      const mockCountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };

      // Configure the chain for unread count query
      mockCountQuery.eq
        .mockReturnValueOnce(mockCountQuery) // first .eq('user_id', userId)
        .mockResolvedValueOnce({ count: 0, error: null }); // second .eq('is_read', false)

      mockSupabaseClient.from
        .mockReturnValueOnce(mockNotificationQuery)
        .mockReturnValueOnce(mockCountQuery);

      // Act
      const result = await service.getUserNotifications(userId, 20, 0, unreadOnly);

      // Assert
      expect(result.notifications).toEqual([]);
    });

    it('should handle notification query error', async () => {
      // Arrange
      const userId = 'user-123';

      mockFrom.range.mockResolvedValue({
        data: null,
        error: { message: 'Query error' }
      });

      // Act
      const result = await service.getUserNotifications(userId);

      // Assert
      expect(result.notifications).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.unreadCount).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      // Arrange
      const notificationId = 'notif-123';

      // Create a mock chain that properly handles multiple eq calls
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      // Last eq call should resolve the promise
      mockChain.eq
        .mockReturnValueOnce(mockChain) // First eq() for id
        .mockReturnValueOnce(mockChain) // Second eq() for user_id
        .mockResolvedValue({ error: null }); // Third eq() for is_read

      mockSupabaseClient.from.mockReturnValue(mockChain);

      // Act
      const result = await service.markAsRead(notificationId, 'user-123');

      // Assert
      expect(result).toBe(true);
      expect(mockChain.update).toHaveBeenCalledWith({
        is_read: true,
        read_at: expect.any(String)
      });
    });

    it('should handle mark as read error', async () => {
      // Arrange
      const notificationId = 'notif-123';

      mockFrom.update.mockReturnThis();
      mockFrom.eq.mockResolvedValue({ error: { message: 'Update error' } });

      // Act
      const result = await service.markAsRead(notificationId, 'user-123');

      // Assert
      expect(result).toBe(false);
    });

    it('should handle unexpected errors in mark as read', async () => {
      // Arrange
      const notificationId = 'notif-123';

      // Create a mock chain that properly handles multiple eq calls but throws error
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      // Configure the chain to throw error on the final call
      mockChain.eq
        .mockReturnValueOnce(mockChain) // First eq() for id
        .mockReturnValueOnce(mockChain) // Second eq() for user_id
        .mockRejectedValueOnce(new Error('Network error')); // Third eq() for is_read

      mockSupabaseClient.from.mockReturnValue(mockChain);

      // Act
      const result = await service.markAsRead(notificationId, 'user-123');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      // Arrange
      const userId = 'user-123';

      mockFrom.update.mockReturnThis();
      mockFrom.eq.mockReturnThis();
      mockFrom.select.mockResolvedValue({
        data: [{ id: '1' }, { id: '2' }],
        error: null
      });

      // Act
      const result = await service.markAllAsRead(userId);

      // Assert
      expect(result).toBe(2);
      expect(mockFrom.update).toHaveBeenCalledWith({
        is_read: true,
        read_at: expect.any(String)
      });
    });

    it('should handle mark all as read error', async () => {
      // Arrange
      const userId = 'user-123';

      mockFrom.update.mockReturnThis();
      mockFrom.eq.mockReturnThis();
      mockFrom.select.mockResolvedValue({
        data: null,
        error: { message: 'Update error' }
      });

      // Act
      const result = await service.markAllAsRead(userId);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      // Arrange
      const notificationId = 'notif-123';
      const userId = 'user-123';

      // Create a mock chain that properly handles multiple eq calls
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      // Setup eq calls: first for id, second for user_id
      mockChain.eq
        .mockReturnValueOnce(mockChain) // First eq() for id
        .mockResolvedValue({ error: null }); // Second eq() for user_id

      mockSupabaseClient.from.mockReturnValue(mockChain);

      // Act
      const result = await service.deleteNotification(notificationId, userId);

      // Assert
      expect(result).toBe(true);
      expect(mockChain.delete).toHaveBeenCalled();
    });

    it('should handle delete notification error', async () => {
      // Arrange
      const notificationId = 'notif-123';
      const userId = 'user-123';

      mockFrom.delete.mockReturnThis();
      mockFrom.eq.mockResolvedValue({ error: { message: 'Delete error' } });

      // Act
      const result = await service.deleteNotification(notificationId, userId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getUserPreferences', () => {
    it('should get user preferences successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockPreferences = {
        user_id: 'user-123',
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        notification_types: {
          sales: true,
          purchases: true,
          messages: true
        }
      };

      mockFrom.single.mockResolvedValue({
        data: mockPreferences,
        error: null
      });

      // Act
      const result = await service.getUserPreferences(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.userId).toBe('user-123');
      expect(result?.emailNotifications).toBe(true);
      expect(result?.notificationTypes.sales).toBe(true);
    });

    it('should return default preferences when not found', async () => {
      // Arrange
      const userId = 'user-123';

      mockFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      // Act
      const result = await service.getUserPreferences(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.userId).toBe('user-123');
      expect(result?.emailNotifications).toBe(true);
      expect(result?.pushNotifications).toBe(true);
    });

    it('should handle preferences query error', async () => {
      // Arrange
      const userId = 'user-123';

      mockFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Query error', code: 'OTHER' }
      });

      // Act
      const result = await service.getUserPreferences(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences successfully', async () => {
      // Arrange
      const preferences: NotificationPreferences = {
        userId: 'user-123',
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        notificationTypes: {
          sales: true,
          purchases: true,
          messages: false,
          trades: true,
          security: true,
          marketing: false
        }
      };

      mockFrom.upsert.mockResolvedValue({ error: null });

      // Act
      const result = await service.updateUserPreferences(preferences);

      // Assert
      expect(result).toBe(true);
      expect(mockFrom.upsert).toHaveBeenCalled();
    });

    it('should handle update preferences error', async () => {
      // Arrange
      const preferences: NotificationPreferences = {
        userId: 'user-123',
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        notificationTypes: {
          sales: true,
          purchases: true,
          messages: false,
          trades: true,
          security: true,
          marketing: false
        }
      };

      mockFrom.upsert.mockResolvedValue({ error: { message: 'Update error' } });

      // Act
      const result = await service.updateUserPreferences(preferences);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('sendEmailNotification', () => {
    it('should queue email notification successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const subject = 'Test Subject';
      const content = 'Test Content';

      mockFrom.insert.mockResolvedValue({ error: null });

      // Act
      const result = await service.sendEmailNotification(email, subject, content);

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('email_notifications');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should handle email notification error', async () => {
      // Arrange
      const email = 'test@example.com';
      const subject = 'Test Subject';
      const content = 'Test Content';

      mockFrom.insert.mockResolvedValue({ error: { message: 'Insert error' } });

      // Act
      const result = await service.sendEmailNotification(email, subject, content);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('scheduleNotification', () => {
    it('should schedule notification successfully', async () => {
      // Arrange
      const notification: NotificationData = {
        userId: 'user-123',
        type: 'info',
        title: 'Reminder',
        message: 'Don\'t forget',
        priority: 'medium'
      };
      const scheduleAt = new Date('2024-12-31T23:59:59Z');

      mockFrom.insert.mockReturnThis();
      mockFrom.select.mockReturnThis();
      mockFrom.single.mockResolvedValue({
        data: { id: 'scheduled-123' },
        error: null
      });

      // Act
      const result = await service.scheduleNotification(notification, scheduleAt);

      // Assert
      expect(result.success).toBe(true);
      expect(result.scheduledId).toBe('scheduled-123');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('scheduled_notifications');
    });

    it('should handle schedule notification error', async () => {
      // Arrange
      const notification: NotificationData = {
        userId: 'user-123',
        type: 'info',
        title: 'Reminder',
        message: 'Don\'t forget',
        priority: 'medium'
      };
      const scheduleAt = new Date('2024-12-31T23:59:59Z');

      mockFrom.insert.mockReturnThis();
      mockFrom.select.mockReturnThis();
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Schedule error' }
      });

      // Act
      const result = await service.scheduleNotification(notification, scheduleAt);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Schedule error');
    });
  });

  describe('cancelScheduledNotification', () => {
    it('should cancel scheduled notification successfully', async () => {
      // Arrange
      const scheduledId = 'scheduled-123';

      // Create a mock chain that properly handles multiple eq calls
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      // Setup eq calls: first for id, second for status
      mockChain.eq
        .mockReturnValueOnce(mockChain) // First eq() for id
        .mockResolvedValue({ error: null }); // Second eq() for status

      mockSupabaseClient.from.mockReturnValue(mockChain);

      // Act
      const result = await service.cancelScheduledNotification(scheduledId);

      // Assert
      expect(result).toBe(true);
      expect(mockChain.update).toHaveBeenCalledWith({ status: 'cancelled' });
    });

    it('should handle cancel scheduled notification error', async () => {
      // Arrange
      const scheduledId = 'scheduled-123';

      mockFrom.update.mockReturnThis();
      mockFrom.eq.mockResolvedValue({ error: { message: 'Cancel error' } });

      // Act
      const result = await service.cancelScheduledNotification(scheduledId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
