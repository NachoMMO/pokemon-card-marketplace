import type { IDataService, QueryOptions } from '../../../../application/ports/services/IDataService';

/**
 * Funciones auxiliares para consultas comunes del marketplace
 * Estas funciones encapsulan lógica de consulta reutilizable
 */
export class DataServiceHelpers {
  constructor(private readonly dataService: IDataService) {}

  /**
   * Obtener cartas más populares por ventas
   */
  async getPopularCards(limit: number = 10, days: number = 30) {
    const result = await this.dataService.rpc('get_popular_cards_by_sales', {
      limit_count: limit,
      days_back: days
    });

    return result.success ? result.data : [];
  }

  /**
   * Buscar cartas con filtros avanzados
   */
  async searchCards(searchOptions: {
    query?: string;
    type?: string;
    rarity?: string[];
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      query,
      type,
      rarity,
      minPrice,
      maxPrice,
      sellerId,
      page = 1,
      limit = 20
    } = searchOptions;

    const filters: NonNullable<QueryOptions['filters']> = [];

    // Filtro de búsqueda por nombre
    if (query) {
      filters.push({ column: 'name', operator: 'ilike', value: `%${query}%` });
    }

    // Filtro por tipo
    if (type) {
      filters.push({ column: 'type', operator: 'eq', value: type });
    }

    // Filtro por rareza
    if (rarity && rarity.length > 0) {
      filters.push({ column: 'rarity', operator: 'in', value: rarity });
    }

    // Filtro por precio mínimo
    if (minPrice !== undefined) {
      filters.push({ column: 'price', operator: 'gte', value: minPrice });
    }

    // Filtro por precio máximo
    if (maxPrice !== undefined) {
      filters.push({ column: 'price', operator: 'lte', value: maxPrice });
    }

    // Filtro por vendedor
    if (sellerId) {
      filters.push({ column: 'seller_id', operator: 'eq', value: sellerId });
    }

    // Solo cartas disponibles para venta
    filters.push({ column: 'status', operator: 'eq', value: 'available' });

    return this.dataService.getMany('cards', {
      select: `
        id, name, description, type, rarity, price, image_url, condition,
        seller:users(id, username, avatar)
      `,
      filters,
      orderBy: { column: 'created_at', ascending: false },
      limit,
      offset: (page - 1) * limit
    });
  }

  /**
   * Obtener cartas de un usuario específico
   */
  async getUserCards(userId: string, includeInCollection: boolean = true) {
    const filters: NonNullable<QueryOptions['filters']> = [
      { column: 'owner_id', operator: 'eq', value: userId }
    ];

    if (!includeInCollection) {
      filters.push({ column: 'status', operator: 'neq', value: 'in_collection' });
    }

    return this.dataService.getMany('cards', {
      select: 'id, name, type, rarity, condition, status, price, image_url, created_at',
      filters,
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  /**
   * Obtener historial de transacciones de un usuario
   */
  async getUserTransactionHistory(userId: string, page: number = 1, limit: number = 20) {
    return this.dataService.getMany('purchases', {
      select: `
        id, amount, created_at, status,
        card:cards(id, name, image_url),
        seller:users(username)
      `,
      filters: [
        { column: 'buyer_id', operator: 'eq', value: userId }
      ],
      orderBy: { column: 'created_at', ascending: false },
      limit,
      offset: (page - 1) * limit
    });
  }

  /**
   * Obtener ventas activas de un usuario
   */
  async getUserActiveSales(userId: string) {
    return this.dataService.getMany('sales', {
      select: `
        id, price, status, created_at, views_count,
        card:cards(id, name, type, rarity, image_url)
      `,
      filters: [
        { column: 'seller_id', operator: 'eq', value: userId },
        { column: 'status', operator: 'eq', value: 'active' }
      ],
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  /**
   * Obtener mensajes no leídos de un usuario
   */
  async getUnreadMessages(userId: string) {
    return this.dataService.getMany('messages', {
      select: `
        id, subject, content, created_at,
        sender:users(id, username, avatar)
      `,
      filters: [
        { column: 'recipient_id', operator: 'eq', value: userId },
        { column: 'read_at', operator: 'is', value: null }
      ],
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  /**
   * Obtener items del carrito de un usuario
   */
  async getUserCartItems(userId: string) {
    return this.dataService.getMany('cart_items', {
      select: `
        id, quantity, added_at,
        card:cards(id, name, price, image_url, seller:users(username))
      `,
      filters: [
        { column: 'user_id', operator: 'eq', value: userId }
      ],
      orderBy: { column: 'added_at', ascending: false }
    });
  }

  /**
   * Buscar usuarios por nombre de usuario
   */
  async searchUsers(searchTerm: string, limit: number = 20) {
    return this.dataService.getMany('users', {
      select: 'id, username, avatar, created_at',
      filters: [
        { column: 'username', operator: 'ilike', value: `%${searchTerm}%` }
      ],
      orderBy: { column: 'username', ascending: true },
      limit
    });
  }

  /**
   * Obtener estadísticas del marketplace
   */
  async getMarketplaceStats() {
    const [
      totalCards,
      totalUsers,
      activeSales,
      totalSales,
      recentTransactions
    ] = await Promise.all([
      this.dataService.count('cards'),
      this.dataService.count('users'),
      this.dataService.count('sales', [
        { column: 'status', operator: 'eq', value: 'active' }
      ]),
      this.dataService.count('purchases'),
      this.dataService.getMany('purchases', {
        select: `
          id, amount, created_at,
          card:cards(name, image_url),
          buyer:users(username)
        `,
        orderBy: { column: 'created_at', ascending: false },
        limit: 10
      })
    ]);

    return {
      totalCards,
      totalUsers,
      activeSales,
      totalSales,
      recentTransactions: recentTransactions.data
    };
  }

  /**
   * Obtener cartas por rareza
   */
  async getCardsByRarity(rarity: string, limit: number = 50) {
    return this.dataService.getMany('cards', {
      select: 'id, name, type, price, image_url, seller:users(username)',
      filters: [
        { column: 'rarity', operator: 'eq', value: rarity },
        { column: 'status', operator: 'eq', value: 'available' }
      ],
      orderBy: { column: 'price', ascending: false },
      limit
    });
  }

  /**
   * Obtener actividad reciente de un usuario
   */
  async getUserRecentActivity(userId: string, limit: number = 20) {
    // Esta función combinaría múltiples consultas para mostrar actividad reciente
    const [sales, purchases, messages] = await Promise.all([
      this.dataService.getMany('sales', {
        select: 'id, created_at, card:cards(name), "sale" as activity_type',
        filters: [{ column: 'seller_id', operator: 'eq', value: userId }],
        orderBy: { column: 'created_at', ascending: false },
        limit: Math.floor(limit / 3)
      }),
      this.dataService.getMany('purchases', {
        select: 'id, created_at, card:cards(name), "purchase" as activity_type',
        filters: [{ column: 'buyer_id', operator: 'eq', value: userId }],
        orderBy: { column: 'created_at', ascending: false },
        limit: Math.floor(limit / 3)
      }),
      this.dataService.getMany('messages', {
        select: 'id, created_at, subject, "message" as activity_type',
        filters: [{ column: 'recipient_id', operator: 'eq', value: userId }],
        orderBy: { column: 'created_at', ascending: false },
        limit: Math.floor(limit / 3)
      })
    ]);

    // Combinar y ordenar por fecha
    const allActivity = [
      ...sales.data.map((item: any) => ({ ...item, type: 'sale' })),
      ...purchases.data.map((item: any) => ({ ...item, type: 'purchase' })),
      ...messages.data.map((item: any) => ({ ...item, type: 'message' }))
    ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return allActivity.slice(0, limit);
  }

  /**
   * Verificar si una carta está disponible para compra
   */
  async isCardAvailable(cardId: string) {
    const result = await this.dataService.getById('cards', cardId, 'id, status, seller_id');

    if (!result.success) {
      return false;
    }

    return result.data && (result.data as any).status === 'available';
  }

  /**
   * Obtener recomendaciones basadas en historial de compras
   */
  async getRecommendations(userId: string, limit: number = 10) {
    // Esta función usaría una función RPC para obtener recomendaciones
    // basadas en el historial de compras del usuario
    const result = await this.dataService.rpc('get_user_recommendations', {
      user_id: userId,
      limit_count: limit
    });

    return result.success ? result.data : [];
  }
}
