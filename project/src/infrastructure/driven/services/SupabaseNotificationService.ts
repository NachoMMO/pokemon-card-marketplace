import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  INotificationService,
  NotificationData,
  NotificationPreferences,
  SendNotificationResponse
} from '../../../application/ports/services/INotificationService';

export class SupabaseNotificationService implements INotificationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async sendNotification(notification: NotificationData): Promise<SendNotificationResponse> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          data: notification.data,
          action_url: notification.actionUrl,
          expires_at: notification.expiresAt ? new Date(notification.expiresAt).toISOString() : null,
          created_at: new Date().toISOString(),
          is_read: false
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error al enviar notificación:', error);
        return { success: false, error: error.message };
      }

      return { success: true, notificationId: data.id };
    } catch (error) {
      console.error('Error al crear notificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async sendBulkNotification(
    userIds: string[],
    notification: Omit<NotificationData, 'userId'>
  ): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    errors?: string[];
  }> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
        action_url: notification.actionUrl,
        expires_at: notification.expiresAt ? new Date(notification.expiresAt).toISOString() : null,
        created_at: new Date().toISOString(),
        is_read: false
      }));

      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notifications)
        .select('id');

      if (error) {
        console.error('Error al enviar notificaciones masivas:', error);
        return {
          success: false,
          sentCount: 0,
          failedCount: userIds.length,
          errors: [error.message]
        };
      }

      return {
        success: true,
        sentCount: data?.length || 0,
        failedCount: userIds.length - (data?.length || 0)
      };
    } catch (error) {
      console.error('Error al crear notificaciones masivas:', error);
      return {
        success: false,
        sentCount: 0,
        failedCount: userIds.length,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly?: boolean
  ): Promise<{
    notifications: (NotificationData & {
      id: string;
      isRead: boolean;
      createdAt: Date;
      readAt?: Date;
    })[];
    total: number;
    unreadCount: number;
  }> {
    try {
      let query = this.supabase
        .from('notifications')
        .select(`
          id,
          type,
          title,
          message,
          priority,
          data,
          action_url,
          expires_at,
          is_read,
          read_at,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error al obtener notificaciones del usuario:', error);
        throw error;
      }

      // Obtener conteo de no leídas por separado
      const { count: unreadCount } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      const notifications = (data || []).map(item => ({
        id: item.id,
        userId,
        title: item.title,
        message: item.message,
        type: item.type,
        priority: item.priority,
        data: item.data,
        actionUrl: item.action_url,
        expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
        isRead: item.is_read,
        createdAt: new Date(item.created_at),
        readAt: item.read_at ? new Date(item.read_at) : undefined
      }));

      return {
        notifications,
        total: count || 0,
        unreadCount: unreadCount || 0
      };
    } catch (error) {
      console.error('Error al consultar notificaciones:', error);
      return {
        notifications: [],
        total: 0,
        unreadCount: 0
      };
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error al marcar notificación como leída:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select('id');

      if (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error al actualizar todas las notificaciones:', error);
      return 0;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error al eliminar notificación:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      return false;
    }
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existe, devolver preferencias por defecto
          return {
            userId,
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            notificationTypes: {
              sales: true,
              purchases: true,
              messages: true,
              trades: true,
              security: true,
              marketing: false
            }
          };
        }
        console.error('Error al obtener preferencias:', error);
        return null;
      }

      return {
        userId: data.user_id,
        emailNotifications: data.email_notifications,
        pushNotifications: data.push_notifications,
        smsNotifications: data.sms_notifications,
        notificationTypes: data.notification_types
      };
    } catch (error) {
      console.error('Error al consultar preferencias:', error);
      return null;
    }
  }

  async updateUserPreferences(preferences: NotificationPreferences): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: preferences.userId,
          email_notifications: preferences.emailNotifications,
          push_notifications: preferences.pushNotifications,
          sms_notifications: preferences.smsNotifications,
          notification_types: preferences.notificationTypes,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error al actualizar preferencias:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      return false;
    }
  }

  async sendEmailNotification(
    email: string,
    subject: string,
    content: string
  ): Promise<boolean> {
    try {
      // Aquí integraríamos con un servicio de email como SendGrid, AWS SES, etc.
      // Por ahora, registramos el intento en la base de datos
      const { error } = await this.supabase
        .from('email_notifications')
        .insert({
          email,
          subject,
          content,
          sent_at: new Date().toISOString(),
          status: 'pending'
        });

      if (error) {
        console.error('Error al registrar notificación por email:', error);
        return false;
      }

      // TODO: Implementar envío real de email
      console.log(`Email notification queued for ${email}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Error al enviar notificación por email:', error);
      return false;
    }
  }

  async scheduleNotification(
    notification: NotificationData,
    scheduleAt: Date
  ): Promise<{
    success: boolean;
    scheduledId?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          data: notification.data,
          action_url: notification.actionUrl,
          expires_at: notification.expiresAt ? new Date(notification.expiresAt).toISOString() : null,
          scheduled_at: scheduleAt.toISOString(),
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error al programar notificación:', error);
        return { success: false, error: error.message };
      }

      return { success: true, scheduledId: data.id };
    } catch (error) {
      console.error('Error al crear notificación programada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async cancelScheduledNotification(scheduledId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('scheduled_notifications')
        .update({ status: 'cancelled' })
        .eq('id', scheduledId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error al cancelar notificación programada:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al cancelar notificación programada:', error);
      return false;
    }
  }
}
