import type { IDataService } from '../../../application/ports/services/IDataService';

export interface SearchFilters {
  query?: string;
  type?: 'Pokemon' | 'Trainer' | 'Energy';
  rarity?: ('common' | 'uncommon' | 'rare' | 'ultra-rare' | 'secret-rare')[];
  minPrice?: number;
  maxPrice?: number;
  condition?: 'mint' | 'near_mint' | 'excellent' | 'good' | 'light_played' | 'played' | 'poor';
  sellerId?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'oldest';
}

export interface SearchOptions {
  page?: number;
  limit?: number;
}

export interface SearchResult {
  cards: any[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Caso de uso para búsqueda avanzada de cartas usando el DataService
 */
export class SearchCardsAdvancedUseCase {
  constructor(private readonly dataService: IDataService) {}

  async execute(
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    try {
      const {
        query,
        type,
        rarity,
        minPrice,
        maxPrice,
        condition,
        sellerId,
        sortBy = 'newest'
      } = filters;

      const {
        page = 1,
        limit = 20
      } = options;

      // Construir filtros para la consulta
      const queryFilters = [];

      // Solo cartas disponibles para venta
      queryFilters.push({ column: 'status', operator: 'eq' as const, value: 'available' });

      // Filtro de búsqueda por nombre
      if (query) {
        queryFilters.push({
          column: 'name',
          operator: 'ilike' as const,
          value: `%${query.trim()}%`
        });
      }

      // Filtro por tipo
      if (type) {
        queryFilters.push({ column: 'type', operator: 'eq' as const, value: type });
      }

      // Filtro por rareza
      if (rarity && rarity.length > 0) {
        queryFilters.push({ column: 'rarity', operator: 'in' as const, value: rarity });
      }

      // Filtro por precio mínimo
      if (minPrice !== undefined && minPrice >= 0) {
        queryFilters.push({ column: 'price', operator: 'gte' as const, value: minPrice });
      }

      // Filtro por precio máximo
      if (maxPrice !== undefined && maxPrice >= 0) {
        queryFilters.push({ column: 'price', operator: 'lte' as const, value: maxPrice });
      }

      // Filtro por condición
      if (condition) {
        queryFilters.push({ column: 'condition', operator: 'eq' as const, value: condition });
      }

      // Filtro por vendedor
      if (sellerId) {
        queryFilters.push({ column: 'seller_id', operator: 'eq' as const, value: sellerId });
      }

      // Determinar ordenamiento
      const orderBy = this.getSortOrder(sortBy);

      // Ejecutar búsqueda
      const result = await this.dataService.getMany('cards', {
        select: `
          id,
          name,
          description,
          type,
          rarity,
          price,
          condition,
          image_url,
          created_at,
          seller:users(id, username, avatar)
        `,
        filters: queryFilters,
        orderBy,
        limit,
        offset: (page - 1) * limit
      });

      return {
        cards: result.data,
        totalCount: result.count,
        page: result.page,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      };
    } catch (error) {
      console.error('Error en búsqueda avanzada de cartas:', error);
      return {
        cards: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      };
    }
  }

  private getSortOrder(sortBy: string): { column: string; ascending: boolean } {
    switch (sortBy) {
      case 'price_asc':
        return { column: 'price', ascending: true };
      case 'price_desc':
        return { column: 'price', ascending: false };
      case 'name_asc':
        return { column: 'name', ascending: true };
      case 'name_desc':
        return { column: 'name', ascending: false };
      case 'oldest':
        return { column: 'created_at', ascending: true };
      case 'newest':
      default:
        return { column: 'created_at', ascending: false };
    }
  }
}
