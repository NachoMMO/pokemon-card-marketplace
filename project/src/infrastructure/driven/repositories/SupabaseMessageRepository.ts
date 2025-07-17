import type { SupabaseClient } from '@supabase/supabase-js';
import type { IMessageRepository } from '../../../application/ports/repositories/IMessageRepository';
import { Message } from '../../../domain/entities/Message';

// Tipo para mapear los datos de la base de datos
interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseMessageRepository implements IMessageRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(message: Message): Promise<Message> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          id: message.id,
          sender_id: message.senderId,
          recipient_id: message.recipientId,
          subject: message.subject,
          content: message.content,
          is_read: message.isRead,
          read_at: message.readAt?.toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear mensaje: ${error.message}`);
      }

      return this.mapRowToMessage(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al crear mensaje'
      );
    }
  }

  async findById(id: string): Promise<Message | null> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToMessage(data);
    } catch (error) {
      console.error('Error al buscar mensaje por ID:', error);
      return null;
    }
  }

  async findConversation(userId1: string, userId2: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener conversación: ${error.message}`);
      }

      return data?.map(row => this.mapRowToMessage(row)) || [];
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      return [];
    }
  }

  async findByReceiverId(receiverId: string, limit: number = 20, offset: number = 0): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', receiverId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener mensajes recibidos: ${error.message}`);
      }

      return data?.map(row => this.mapRowToMessage(row)) || [];
    } catch (error) {
      console.error('Error al obtener mensajes recibidos:', error);
      return [];
    }
  }

  async findBySenderId(senderId: string, limit: number = 20, offset: number = 0): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('sender_id', senderId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener mensajes enviados: ${error.message}`);
      }

      return data?.map(row => this.mapRowToMessage(row)) || [];
    } catch (error) {
      console.error('Error al obtener mensajes enviados:', error);
      return [];
    }
  }

  async markAsRead(id: string): Promise<Message> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al marcar mensaje como leído: ${error.message}`);
      }

      return this.mapRowToMessage(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al marcar mensaje como leído'
      );
    }
  }

  async findUnreadByReceiverId(receiverId: string): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', receiverId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener mensajes no leídos: ${error.message}`);
      }

      return data?.map(row => this.mapRowToMessage(row)) || [];
    } catch (error) {
      console.error('Error al obtener mensajes no leídos:', error);
      return [];
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      return false;
    }
  }

  async getUnreadCount(receiverId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', receiverId)
        .eq('is_read', false);

      if (error) {
        throw new Error(`Error al contar mensajes no leídos: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Error al contar mensajes no leídos:', error);
      return 0;
    }
  }

  async getConversations(userId: string): Promise<Message[]> {
    try {
      // Esta consulta es más compleja, necesitamos obtener el último mensaje de cada conversación
      const { data, error } = await this.supabase
        .rpc('get_latest_messages_by_conversation', { user_id: userId });

      if (error) {
        throw new Error(`Error al obtener conversaciones: ${error.message}`);
      }

      return data?.map((row: MessageRow) => this.mapRowToMessage(row)) || [];
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      // Fallback: obtener todos los mensajes del usuario y procesarlos en el cliente
      return this.getConversationsFallback(userId);
    }
  }

  private async getConversationsFallback(userId: string): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error en fallback de conversaciones: ${error.message}`);
      }

      // Procesar para obtener solo el último mensaje por conversación
      const conversationMap = new Map<string, MessageRow>();

      data?.forEach((row: MessageRow) => {
        const otherUserId = row.sender_id === userId ? row.recipient_id : row.sender_id;
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, row);
        }
      });

      return Array.from(conversationMap.values()).map(row => this.mapRowToMessage(row));
    } catch (error) {
      console.error('Error en fallback de conversaciones:', error);
      return [];
    }
  }

  private mapRowToMessage(row: MessageRow): Message {
    return new Message(
      row.id,
      row.sender_id,
      row.recipient_id,
      row.subject,
      row.content,
      row.is_read,
      row.read_at ? new Date(row.read_at) : new Date(),
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
