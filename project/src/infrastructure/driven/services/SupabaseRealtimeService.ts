import type { SupabaseClient, RealtimeChannel as SupabaseRealtimeChannel } from '@supabase/supabase-js';
import type {
  IRealtimeService,
  RealtimeChannel,
  RealtimeSubscriptionConfig,
  RealtimePayload
} from '../../../application/ports/services/IRealtimeService';

// Implementación del canal
class RealtimeChannelImpl implements RealtimeChannel {
  constructor(
    public readonly id: string,
    public readonly topic: string,
    private readonly supabaseChannel: SupabaseRealtimeChannel
  ) {}

  unsubscribe(): void {
    this.supabaseChannel.unsubscribe();
  }
}

export class SupabaseRealtimeService implements IRealtimeService {
  private channels = new Map<string, RealtimeChannelImpl>();

  constructor(private readonly supabase: SupabaseClient) {}

  async subscribe<T>(
    config: RealtimeSubscriptionConfig,
    callback: (payload: RealtimePayload<T>) => void
  ): Promise<RealtimeChannel> {
    try {
      const channelName = `table-${config.table}-${config.event || 'all'}`;

      const supabaseChannel = this.supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event: config.event || '*',
            schema: config.schema || 'public',
            table: config.table,
            filter: config.filter
          },
          (payload: any) => {
            const realtimePayload: RealtimePayload<T> = {
              schema: payload.schema,
              table: payload.table,
              commit_timestamp: payload.commit_timestamp,
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new as T,
              old: payload.old as T,
              errors: payload.errors
            };
            callback(realtimePayload);
          }
        )
        .subscribe();

      const channel = new RealtimeChannelImpl(
        channelName,
        `${config.table}:${config.event || '*'}`,
        supabaseChannel
      );

      this.channels.set(channelName, channel);
      return channel;
    } catch (error) {
      console.error('Error al suscribirse a cambios de tabla:', error);
      throw error;
    }
  }

  async subscribeToChannel(
    channelName: string,
    callback: (payload: any) => void
  ): Promise<RealtimeChannel> {
    try {
      const supabaseChannel = this.supabase
        .channel(channelName)
        .on('broadcast', { event: '*' }, callback)
        .subscribe();

      const channel = new RealtimeChannelImpl(
        channelName,
        channelName,
        supabaseChannel
      );

      this.channels.set(channelName, channel);
      return channel;
    } catch (error) {
      console.error('Error al suscribirse al canal:', error);
      throw error;
    }
  }

  async broadcast(
    channelName: string,
    event: string,
    payload: any
  ): Promise<boolean> {
    try {
      const channel = this.channels.get(channelName);
      if (!channel) {
        console.warn(`Canal ${channelName} no encontrado para broadcast`);
        return false;
      }

      const result = await channel['supabaseChannel'].send({
        type: 'broadcast',
        event,
        payload
      });

      return result === 'ok';
    } catch (error) {
      console.error('Error al enviar broadcast:', error);
      return false;
    }
  }

  async subscribeToPresence(
    channelName: string,
    userState: Record<string, any>,
    callbacks: {
      onJoin?: (key: string, currentPresence: any, newPresence: any) => void;
      onLeave?: (key: string, currentPresence: any, leftPresence: any) => void;
      onSync?: () => void;
    }
  ): Promise<RealtimeChannel> {
    try {
      const supabaseChannel = this.supabase.channel(channelName);

      if (callbacks.onJoin) {
        supabaseChannel.on('presence' as any, { event: 'join' }, (payload: any) => {
          callbacks.onJoin!(payload.key, payload.currentPresence, payload.newPresence);
        });
      }

      if (callbacks.onLeave) {
        supabaseChannel.on('presence' as any, { event: 'leave' }, (payload: any) => {
          callbacks.onLeave!(payload.key, payload.currentPresence, payload.leftPresence);
        });
      }

      if (callbacks.onSync) {
        supabaseChannel.on('presence' as any, { event: 'sync' }, () => {
          callbacks.onSync!();
        });
      }

      // Trackear presencia del usuario
      await supabaseChannel.track(userState);

      supabaseChannel.subscribe();

      const channel = new RealtimeChannelImpl(
        channelName,
        `presence:${channelName}`,
        supabaseChannel
      );

      this.channels.set(channelName, channel);
      return channel;
    } catch (error) {
      console.error('Error al suscribirse a presencia:', error);
      throw error;
    }
  }

  getPresenceState(channelName: string): Record<string, any> {
    const channel = this.channels.get(channelName);
    if (!channel) {
      console.warn(`Canal ${channelName} no encontrado para obtener presencia`);
      return {};
    }

    // En Supabase, esto sería accedido a través del canal
    return channel['supabaseChannel'].presenceState() || {};
  }

  async unsubscribe(channel: RealtimeChannel): Promise<boolean> {
    try {
      channel.unsubscribe();
      this.channels.delete(channel.id);
      return true;
    } catch (error) {
      console.error('Error al desuscribirse del canal:', error);
      return false;
    }
  }

  async unsubscribeAll(): Promise<boolean> {
    try {
      for (const channel of this.channels.values()) {
        channel.unsubscribe();
      }
      this.channels.clear();
      return true;
    } catch (error) {
      console.error('Error al desuscribirse de todos los canales:', error);
      return false;
    }
  }

  getConnectionStatus(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' {
    // Supabase no expone directamente el estado de conexión
    // Podríamos implementar nuestra propia lógica de estado
    return 'OPEN'; // Simplificado por ahora
  }
}
