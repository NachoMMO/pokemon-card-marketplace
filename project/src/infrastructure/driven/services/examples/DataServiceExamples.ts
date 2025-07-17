import type { IDataService } from '../../../../application/ports/services/IDataService';

/**
 * Ejemplo de cómo usar el SupabaseDataService para operaciones CRUD genéricas
 */
export class DataServiceExamples {
  constructor(private readonly dataService: IDataService) {}

  /**
   * Ejemplo: Obtener todas las cartas con paginación y filtros
   */
  async getCardsExample() {
    const result = await this.dataService.getMany('cards', {
      select: 'id, name, type, rarity, price, image_url',
      limit: 10,
      offset: 0,
      orderBy: { column: 'created_at', ascending: false },
      filters: [
        { column: 'type', operator: 'eq', value: 'Pokemon' },
        { column: 'rarity', operator: 'in', value: ['rare', 'ultra-rare'] },
        { column: 'price', operator: 'gte', value: 10 }
      ]
    });

    console.log('Cartas encontradas:', result.data);
    console.log('Total:', result.count);
    console.log('Página actual:', result.page);
    console.log('¿Hay más páginas?:', result.hasNext);
  }

  /**
   * Ejemplo: Obtener detalles de una carta específica
   */
  async getCardDetailsExample(cardId: string) {
    const result = await this.dataService.getById('cards', cardId,
      'id, name, description, type, rarity, price, image_url, seller:users(username, avatar)'
    );

    if (result.success) {
      console.log('Carta encontrada:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  }

  /**
   * Ejemplo: Buscar usuarios por nombre
   */
  async searchUsersExample(searchTerm: string) {
    const result = await this.dataService.getMany('users', {
      select: 'id, username, email, avatar',
      filters: [
        { column: 'username', operator: 'ilike', value: `%${searchTerm}%` }
      ],
      orderBy: { column: 'username', ascending: true },
      limit: 20
    });

    return result.data;
  }

  /**
   * Ejemplo: Crear una nueva venta
   */
  async createSaleExample(saleData: any) {
    const result = await this.dataService.create('sales', {
      ...saleData,
      status: 'active',
      created_at: new Date().toISOString()
    }, 'id, card_id, seller_id, price, status, created_at');

    if (result.success) {
      console.log('Venta creada:', result.data);
      return result.data;
    } else {
      console.error('Error al crear venta:', result.error);
      return null;
    }
  }

  /**
   * Ejemplo: Actualizar estado de múltiples ventas
   */
  async updateSalesStatusExample(sellerId: string, newStatus: string) {
    const result = await this.dataService.updateMany('sales',
      [
        { column: 'seller_id', operator: 'eq', value: sellerId },
        { column: 'status', operator: 'eq', value: 'active' }
      ],
      { status: newStatus, updated_at: new Date().toISOString() },
      'id, status, updated_at'
    );

    if (result.success) {
      console.log(`${result.data?.length} ventas actualizadas`);
      return result.data;
    } else {
      console.error('Error al actualizar ventas:', result.error);
      return [];
    }
  }

  /**
   * Ejemplo: Contar mensajes no leídos
   */
  async getUnreadMessagesCountExample(userId: string) {
    const count = await this.dataService.count('messages', [
      { column: 'recipient_id', operator: 'eq', value: userId },
      { column: 'read_at', operator: 'is', value: null }
    ]);

    console.log(`Mensajes no leídos: ${count}`);
    return count;
  }

  /**
   * Ejemplo: Crear múltiples items del carrito
   */
  async addMultipleCartItemsExample(cartItems: any[]) {
    const result = await this.dataService.createMany('cart_items', cartItems,
      'id, user_id, card_id, quantity, added_at'
    );

    if (result.success) {
      console.log(`${result.data?.length} items añadidos al carrito`);
      return result.data;
    } else {
      console.error('Error al añadir items:', result.error);
      return [];
    }
  }

  /**
   * Ejemplo: Usar upsert para actualizar o crear perfil
   */
  async updateOrCreateProfileExample(profileData: any) {
    const result = await this.dataService.upsert('user_profiles', profileData,
      ['user_id'],
      'user_id, display_name, bio, location, updated_at'
    );

    if (result.success) {
      console.log('Perfil actualizado/creado:', result.data);
      return result.data;
    } else {
      console.error('Error al actualizar perfil:', result.error);
      return null;
    }
  }

  /**
   * Ejemplo: Ejecutar función RPC personalizada
   */
  async getPopularCardsExample() {
    const result = await this.dataService.rpc('get_popular_cards', {
      limit_count: 10,
      days_back: 30
    });

    if (result.success) {
      console.log('Cartas populares:', result.data);
      return result.data;
    } else {
      console.error('Error al obtener cartas populares:', result.error);
      return [];
    }
  }

  /**
   * Ejemplo: Obtener estadísticas del marketplace
   */
  async getMarketplaceStatsExample() {
    const [
      totalCards,
      totalUsers,
      activeSales,
      recentTransactions
    ] = await Promise.all([
      this.dataService.count('cards'),
      this.dataService.count('users'),
      this.dataService.count('sales', [
        { column: 'status', operator: 'eq', value: 'active' }
      ]),
      this.dataService.getMany('purchases', {
        select: 'id, amount, created_at, card:cards(name), buyer:users(username)',
        orderBy: { column: 'created_at', ascending: false },
        limit: 5
      })
    ]);

    return {
      totalCards,
      totalUsers,
      activeSales,
      recentTransactions: recentTransactions.data
    };
  }
}
