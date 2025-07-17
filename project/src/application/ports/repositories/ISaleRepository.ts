import { Sale } from '../../../domain/entities/Sale';

export interface ISaleRepository {
  /**
   * Crea una nueva venta
   * @param sale - Datos de la venta
   * @returns Venta creada
   */
  create(sale: Sale): Promise<Sale>;

  /**
   * Obtiene una venta por su ID
   * @param id - ID de la venta
   * @returns Venta o null si no existe
   */
  findById(id: string): Promise<Sale | null>;

  /**
   * Obtiene todas las ventas de un usuario
   * @param sellerId - ID del vendedor
   * @param limit - Número máximo de ventas a retornar
   * @param offset - Número de ventas a omitir
   * @returns Array de ventas
   */
  findBySellerId(sellerId: string, limit?: number, offset?: number): Promise<Sale[]>;

  /**
   * Obtiene ventas por carta
   * @param cardId - ID de la carta
   * @param limit - Número máximo de ventas a retornar
   * @param offset - Número de ventas a omitir
   * @returns Array de ventas
   */
  findByCardId(cardId: string, limit?: number, offset?: number): Promise<Sale[]>;

  /**
   * Obtiene ventas disponibles (activas)
   * @param limit - Número máximo de ventas a retornar
   * @param offset - Número de ventas a omitir
   * @returns Array de ventas disponibles
   */
  findAvailable(limit?: number, offset?: number): Promise<Sale[]>;

  /**
   * Actualiza una venta
   * @param id - ID de la venta
   * @param updates - Campos a actualizar
   * @returns Venta actualizada
   */
  update(id: string, updates: Partial<Sale>): Promise<Sale>;

  /**
   * Elimina una venta
   * @param id - ID de la venta
   * @returns true si se eliminó correctamente
   */
  delete(id: string): Promise<boolean>;

  /**
   * Busca ventas por criterios
   * @param criteria - Criterios de búsqueda
   * @returns Array de ventas que coinciden con los criterios
   */
  search(criteria: {
    cardName?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Sale[]>;
}
