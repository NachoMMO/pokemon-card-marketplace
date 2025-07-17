export interface RealtimeChannel {
  id: string;
  topic: string;
  unsubscribe(): void;
}

export interface RealtimeSubscriptionConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
}

export interface RealtimePayload<T = any> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: T;
  old?: T;
  errors?: string[];
}

export interface IRealtimeService {
  /**
   * Suscribirse a cambios en tiempo real en una tabla
   * @param config - Configuración de la suscripción
   * @param callback - Función que se ejecuta cuando hay cambios
   * @returns Canal de suscripción
   */
  subscribe<T>(
    config: RealtimeSubscriptionConfig,
    callback: (payload: RealtimePayload<T>) => void
  ): Promise<RealtimeChannel>;

  /**
   * Suscribirse a un canal específico (para chat, notificaciones, etc.)
   * @param channelName - Nombre del canal
   * @param callback - Función que se ejecuta cuando se recibe un mensaje
   * @returns Canal de suscripción
   */
  subscribeToChannel(
    channelName: string,
    callback: (payload: any) => void
  ): Promise<RealtimeChannel>;

  /**
   * Enviar un mensaje a un canal específico
   * @param channelName - Nombre del canal
   * @param event - Nombre del evento
   * @param payload - Datos a enviar
   * @returns true si se envió correctamente
   */
  broadcast(
    channelName: string,
    event: string,
    payload: any
  ): Promise<boolean>;

  /**
   * Suscribirse a presencia (usuarios conectados)
   * @param channelName - Nombre del canal
   * @param userState - Estado del usuario
   * @param callbacks - Callbacks para join, leave, sync
   * @returns Canal de suscripción
   */
  subscribeToPresence(
    channelName: string,
    userState: Record<string, any>,
    callbacks: {
      onJoin?: (key: string, currentPresence: any, newPresence: any) => void;
      onLeave?: (key: string, currentPresence: any, leftPresence: any) => void;
      onSync?: () => void;
    }
  ): Promise<RealtimeChannel>;

  /**
   * Obtener estado actual de presencia
   * @param channelName - Nombre del canal
   * @returns Estado actual de presencia
   */
  getPresenceState(channelName: string): Record<string, any>;

  /**
   * Desuscribirse de un canal
   * @param channel - Canal a desuscribir
   * @returns true si se desuscribió correctamente
   */
  unsubscribe(channel: RealtimeChannel): Promise<boolean>;

  /**
   * Desuscribirse de todos los canales
   * @returns true si se desuscribió de todos
   */
  unsubscribeAll(): Promise<boolean>;

  /**
   * Obtener estado de conexión
   * @returns Estado de la conexión realtime
   */
  getConnectionStatus(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';
}
