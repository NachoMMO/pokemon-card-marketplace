import { CartItem } from '../../../domain/entities/CartItem';

export interface ICartRepository {
  /**
   * Añade un artículo al carrito
   * @param cartItem - Artículo del carrito a crear
   * @returns Artículo del carrito creado
   */
  addItem(cartItem: CartItem): Promise<CartItem>;

  /**
   * Obtiene todos los artículos del carrito de un usuario
   * @param userId - ID del usuario
   * @returns Array de artículos del carrito
   */
  findByUserId(userId: string): Promise<CartItem[]>;

  /**
   * Obtiene un artículo específico del carrito
   * @param userId - ID del usuario
   * @param cardId - ID de la carta
   * @returns Artículo del carrito o null si no existe
   */
  findByUserIdAndCardId(userId: string, cardId: string): Promise<CartItem | null>;

  /**
   * Actualiza la cantidad de un artículo en el carrito
   * @param id - ID del artículo del carrito
   * @param quantity - Nueva cantidad
   * @returns Artículo del carrito actualizado
   */
  updateQuantity(id: string, quantity: number): Promise<CartItem>;

  /**
   * Elimina un artículo del carrito
   * @param id - ID del artículo del carrito
   * @returns true si se eliminó correctamente
   */
  removeItem(id: string): Promise<boolean>;

  /**
   * Elimina todos los artículos del carrito de un usuario
   * @param userId - ID del usuario
   * @returns true si se eliminaron correctamente
   */
  clearCart(userId: string): Promise<boolean>;

  /**
   * Obtiene el número total de artículos en el carrito
   * @param userId - ID del usuario
   * @returns Número total de artículos
   */
  getTotalItems(userId: string): Promise<number>;

  /**
   * Obtiene el precio total del carrito
   * @param userId - ID del usuario
   * @returns Precio total del carrito
   */
  getTotalPrice(userId: string): Promise<number>;

  /**
   * Limpia artículos expirados del carrito
   * @returns Número de artículos eliminados
   */
  clearExpiredItems(): Promise<number>;
}
