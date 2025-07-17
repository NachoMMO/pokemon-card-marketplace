import { Card } from '../../../domain/entities/Card';

export interface CardSearchCriteria {
  name?: string;
  set?: string;
  rarity?: string;
  type?: string;
  expansion?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  isForSale?: boolean;
  sellerId?: string;
  limit?: number;
  offset?: number;
}

export interface ICardRepository {
  /**
   * Obtiene una carta por su ID
   * @param id - ID de la carta
   * @returns Carta o null si no existe
   */
  findById(id: string): Promise<Card | null>;

  /**
   * Busca cartas por criterios (versión legacy para compatibilidad)
   * @param criteria - Criterios de búsqueda básicos
   * @returns Array de cartas que coinciden con los criterios
   */
  search(criteria: {
    name?: string;
    set?: string;
    rarity?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<Card[]>;

  /**
   * Busca cartas por criterios extendidos (para marketplace)
   * @param criteria - Criterios de búsqueda extendidos
   * @param limit - Número máximo de cartas a retornar
   * @param offset - Número de cartas a omitir
   * @returns Array de cartas que coinciden con los criterios
   */
  searchMarketplace(criteria: CardSearchCriteria, limit?: number, offset?: number): Promise<Card[]>;

  /**
   * Cuenta cartas que coinciden con criterios extendidos
   * @param criteria - Criterios de búsqueda
   * @returns Número de cartas que coinciden
   */
  countMarketplace(criteria: CardSearchCriteria): Promise<number>;

  /**
   * Obtiene todas las cartas con paginación
   * @param limit - Número máximo de cartas a retornar
   * @param offset - Número de cartas a omitir
   * @returns Array de cartas
   */
  findAll(limit?: number, offset?: number): Promise<Card[]>;

  /**
   * Obtiene cartas por conjunto
   * @param setId - ID del conjunto
   * @param limit - Número máximo de cartas a retornar
   * @param offset - Número de cartas a omitir
   * @returns Array de cartas del conjunto
   */
  findBySet(setId: string, limit?: number, offset?: number): Promise<Card[]>;

  /**
   * Obtiene cartas por vendedor
   * @param sellerId - ID del vendedor
   * @param limit - Número máximo de cartas a retornar
   * @param offset - Número de cartas a omitir
   * @returns Array de cartas del vendedor
   */
  findBySeller(sellerId: string, limit?: number, offset?: number): Promise<Card[]>;

  /**
   * Obtiene el número total de cartas
   * @returns Número total de cartas en la base de datos
   */
  count(): Promise<number>;

  /**
   * Crea una nueva carta
   * @param card - Carta a crear
   * @returns Carta creada
   */
  create(card: Card): Promise<Card>;

  /**
   * Actualiza una carta existente
   * @param card - Carta a actualizar
   * @returns Carta actualizada
   */
  update(card: Card): Promise<Card>;

  /**
   * Elimina una carta
   * @param id - ID de la carta a eliminar
   * @returns true si se eliminó correctamente
   */
  delete(id: string): Promise<boolean>;
}
