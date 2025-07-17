export interface NotificationData {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'sale' | 'purchase' | 'message' | 'trade';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  actionUrl?: string;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationTypes: {
    sales: boolean;
    purchases: boolean;
    messages: boolean;
    trades: boolean;
    security: boolean;
    marketing: boolean;
  };
}

export interface SendNotificationResponse {
  success: boolean;
  notificationId?: string;
  error?: string;
}

export interface INotificationService {
  /**
   * Envía una notificación a un usuario específico
   * @param notification - Datos de la notificación
   * @returns Resultado del envío
   */
  sendNotification(notification: NotificationData): Promise<SendNotificationResponse>;

  /**
   * Envía notificaciones masivas a múltiples usuarios
   * @param userIds - Lista de IDs de usuarios
   * @param notification - Datos de la notificación (sin userId)
   * @returns Resultado del envío masivo
   */
  sendBulkNotification(
    userIds: string[],
    notification: Omit<NotificationData, 'userId'>
  ): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    errors?: string[];
  }>;

  /**
   * Obtiene notificaciones de un usuario
   * @param userId - ID del usuario
   * @param limit - Límite de notificaciones a retornar
   * @param offset - Offset para paginación
   * @param unreadOnly - Solo notificaciones no leídas
   * @returns Lista de notificaciones
   */
  getUserNotifications(
    userId: string,
    limit?: number,
    offset?: number,
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
  }>;

  /**
   * Marca una notificación como leída
   * @param notificationId - ID de la notificación
   * @param userId - ID del usuario (para verificación)
   * @returns true si se marcó como leída
   */
  markAsRead(notificationId: string, userId: string): Promise<boolean>;

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param userId - ID del usuario
   * @returns número de notificaciones marcadas
   */
  markAllAsRead(userId: string): Promise<number>;

  /**
   * Elimina una notificación
   * @param notificationId - ID de la notificación
   * @param userId - ID del usuario (para verificación)
   * @returns true si se eliminó
   */
  deleteNotification(notificationId: string, userId: string): Promise<boolean>;

  /**
   * Obtiene preferencias de notificación de un usuario
   * @param userId - ID del usuario
   * @returns Preferencias de notificación
   */
  getUserPreferences(userId: string): Promise<NotificationPreferences | null>;

  /**
   * Actualiza preferencias de notificación de un usuario
   * @param preferences - Nuevas preferencias
   * @returns true si se actualizaron
   */
  updateUserPreferences(preferences: NotificationPreferences): Promise<boolean>;

  /**
   * Envía notificación por email
   * @param email - Email del destinatario
   * @param subject - Asunto del email
   * @param content - Contenido del email (HTML)
   * @returns true si se envió
   */
  sendEmailNotification(
    email: string,
    subject: string,
    content: string
  ): Promise<boolean>;

  /**
   * Programa una notificación para envío futuro
   * @param notification - Datos de la notificación
   * @param scheduleAt - Fecha y hora para enviar
   * @returns ID de la notificación programada
   */
  scheduleNotification(
    notification: NotificationData,
    scheduleAt: Date
  ): Promise<{
    success: boolean;
    scheduledId?: string;
    error?: string;
  }>;

  /**
   * Cancela una notificación programada
   * @param scheduledId - ID de la notificación programada
   * @returns true si se canceló
   */
  cancelScheduledNotification(scheduledId: string): Promise<boolean>;
}
