import { Message } from '../../../domain/entities/Message';

export interface IMessageRepository {
  /**
   * Envía un nuevo mensaje
   * @param message - Datos del mensaje
   * @returns Mensaje creado
   */
  create(message: Message): Promise<Message>;

  /**
   * Obtiene un mensaje por su ID
   * @param id - ID del mensaje
   * @returns Mensaje o null si no existe
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Obtiene mensajes entre dos usuarios
   * @param userId1 - ID del primer usuario
   * @param userId2 - ID del segundo usuario
   * @param limit - Número máximo de mensajes a retornar
   * @param offset - Número de mensajes a omitir
   * @returns Array de mensajes
   */
  findConversation(userId1: string, userId2: string, limit?: number, offset?: number): Promise<Message[]>;

  /**
   * Obtiene todos los mensajes recibidos por un usuario
   * @param receiverId - ID del receptor
   * @param limit - Número máximo de mensajes a retornar
   * @param offset - Número de mensajes a omitir
   * @returns Array de mensajes
   */
  findByReceiverId(receiverId: string, limit?: number, offset?: number): Promise<Message[]>;

  /**
   * Obtiene todos los mensajes enviados por un usuario
   * @param senderId - ID del remitente
   * @param limit - Número máximo de mensajes a retornar
   * @param offset - Número de mensajes a omitir
   * @returns Array de mensajes
   */
  findBySenderId(senderId: string, limit?: number, offset?: number): Promise<Message[]>;

  /**
   * Marca un mensaje como leído
   * @param id - ID del mensaje
   * @returns Mensaje actualizado
   */
  markAsRead(id: string): Promise<Message>;

  /**
   * Obtiene mensajes no leídos de un usuario
   * @param receiverId - ID del receptor
   * @returns Array de mensajes no leídos
   */
  findUnreadByReceiverId(receiverId: string): Promise<Message[]>;

  /**
   * Elimina un mensaje
   * @param id - ID del mensaje
   * @returns true si se eliminó correctamente
   */
  delete(id: string): Promise<boolean>;

  /**
   * Obtiene el número de mensajes no leídos
   * @param receiverId - ID del receptor
   * @returns Número de mensajes no leídos
   */
  getUnreadCount(receiverId: string): Promise<number>;

  /**
   * Obtiene las conversaciones de un usuario (últimos mensajes únicos por conversación)
   * @param userId - ID del usuario
   * @returns Array de últimos mensajes por conversación
   */
  getConversations(userId: string): Promise<Message[]>;
}
