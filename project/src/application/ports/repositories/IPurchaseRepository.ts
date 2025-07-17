import { Purchase } from '../../../domain/entities/Purchase';

export interface IPurchaseRepository {
  /**
   * Crea una nueva compra
   * @param purchase - Datos de la compra
   * @returns Compra creada
   */
  create(purchase: Purchase): Promise<Purchase>;

  /**
   * Obtiene una compra por su ID
   * @param id - ID de la compra
   * @returns Compra o null si no existe
   */
  findById(id: string): Promise<Purchase | null>;

  /**
   * Obtiene todas las compras de un usuario
   * @param buyerId - ID del comprador
   * @param limit - Número máximo de compras a retornar
   * @param offset - Número de compras a omitir
   * @returns Array de compras
   */
  findByBuyerId(buyerId: string, limit?: number, offset?: number): Promise<Purchase[]>;

  /**
   * Obtiene las compras de un vendedor
   * @param sellerId - ID del vendedor
   * @param limit - Número máximo de compras a retornar
   * @param offset - Número de compras a omitir
   * @returns Array de compras
   */
  findBySellerId(sellerId: string, limit?: number, offset?: number): Promise<Purchase[]>;

  /**
   * Actualiza el estado de una compra
   * @param id - ID de la compra
   * @param status - Nuevo estado
   * @returns Compra actualizada
   */
  updateStatus(id: string, status: string): Promise<Purchase>;

  /**
   * Obtiene compras por estado
   * @param status - Estado de las compras
   * @param limit - Número máximo de compras a retornar
   * @param offset - Número de compras a omitir
   * @returns Array de compras
   */
  findByStatus(status: string, limit?: number, offset?: number): Promise<Purchase[]>;

  /**
   * Obtiene el total gastado por un usuario
   * @param buyerId - ID del comprador
   * @returns Total gastado
   */
  getTotalSpentByBuyer(buyerId: string): Promise<number>;

  /**
   * Obtiene el total vendido por un usuario
   * @param sellerId - ID del vendedor
   * @returns Total vendido
   */
  getTotalEarnedBySeller(sellerId: string): Promise<number>;
}
