import { CollectionEntry } from '../../../domain/entities/CollectionEntry';

export interface ICollectionRepository {
  /**
   * Añade una carta a la colección de un usuario
   * @param collectionEntry - Entrada de colección a crear
   * @returns Entrada de colección creada
   */
  addCard(collectionEntry: CollectionEntry): Promise<CollectionEntry>;

  /**
   * Obtiene todas las cartas de la colección de un usuario
   * @param userId - ID del usuario
   * @returns Array de entradas de colección
   */
  findByUserId(userId: string): Promise<CollectionEntry[]>;

  /**
   * Obtiene una entrada específica de la colección
   * @param userId - ID del usuario
   * @param cardId - ID de la carta
   * @returns Entrada de colección o null si no existe
   */
  findByUserIdAndCardId(userId: string, cardId: string): Promise<CollectionEntry | null>;

  /**
   * Actualiza la cantidad de una carta en la colección
   * @param id - ID de la entrada de colección
   * @param quantity - Nueva cantidad
   * @returns Entrada de colección actualizada
   */
  updateQuantity(id: string, quantity: number): Promise<CollectionEntry>;

  /**
   * Elimina una carta de la colección
   * @param id - ID de la entrada de colección
   * @returns true si se eliminó correctamente
   */
  removeCard(id: string): Promise<boolean>;

  /**
   * Obtiene el número total de cartas únicas en la colección de un usuario
   * @param userId - ID del usuario
   * @returns Número de cartas únicas
   */
  countUniqueCards(userId: string): Promise<number>;

  /**
   * Obtiene el número total de cartas (incluyendo duplicados) en la colección
   * @param userId - ID del usuario
   * @returns Número total de cartas
   */
  countTotalCards(userId: string): Promise<number>;
}
