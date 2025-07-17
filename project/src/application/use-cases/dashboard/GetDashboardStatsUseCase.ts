import type { IDataService } from '../../../application/ports/services/IDataService';

export interface DashboardStats {
  totalCards: number;
  totalUsers: number;
  activeSales: number;
  totalSales: number;
  totalRevenue: number;
  popularCards: any[];
  recentTransactions: any[];
  userGrowth: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  salesGrowth: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

/**
 * Caso de uso para obtener estadísticas del dashboard usando el DataService
 */
export class GetDashboardStatsUseCase {
  constructor(private readonly dataService: IDataService) {}

  async execute(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

      // Ejecutar consultas en paralelo para mejor performance
      const [
        totalCards,
        totalUsers,
        activeSales,
        totalSales,
        totalRevenue,
        popularCards,
        recentTransactions,
        usersThisMonth,
        usersLastMonth,
        salesThisMonth,
        salesLastMonth
      ] = await Promise.all([
        // Estadísticas básicas
        this.dataService.count('cards'),
        this.dataService.count('users'),
        this.dataService.count('sales', [
          { column: 'status', operator: 'eq', value: 'active' }
        ]),
        this.dataService.count('purchases'),

        // Revenue total (suma de todas las compras)
        this.getTotalRevenue(),

        // Cartas más populares (por número de ventas)
        this.getPopularCards(),

        // Transacciones recientes
        this.getRecentTransactions(),

        // Crecimiento de usuarios
        this.dataService.count('users', [
          { column: 'created_at', operator: 'gte', value: thisMonth.toISOString() }
        ]),
        this.dataService.count('users', [
          { column: 'created_at', operator: 'gte', value: lastMonth.toISOString() },
          { column: 'created_at', operator: 'lt', value: thisMonth.toISOString() }
        ]),

        // Crecimiento de ventas
        this.dataService.count('purchases', [
          { column: 'created_at', operator: 'gte', value: thisMonth.toISOString() }
        ]),
        this.dataService.count('purchases', [
          { column: 'created_at', operator: 'gte', value: lastMonth.toISOString() },
          { column: 'created_at', operator: 'lt', value: thisMonth.toISOString() }
        ])
      ]);

      // Calcular crecimiento porcentual
      const userGrowth = this.calculateGrowthPercentage(usersLastMonth, usersThisMonth);
      const salesGrowth = this.calculateGrowthPercentage(salesLastMonth, salesThisMonth);

      return {
        totalCards,
        totalUsers,
        activeSales,
        totalSales,
        totalRevenue,
        popularCards,
        recentTransactions,
        userGrowth: {
          thisMonth: usersThisMonth,
          lastMonth: usersLastMonth,
          growth: userGrowth
        },
        salesGrowth: {
          thisMonth: salesThisMonth,
          lastMonth: salesLastMonth,
          growth: salesGrowth
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);

      // Retornar valores por defecto en caso de error
      return {
        totalCards: 0,
        totalUsers: 0,
        activeSales: 0,
        totalSales: 0,
        totalRevenue: 0,
        popularCards: [],
        recentTransactions: [],
        userGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 },
        salesGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 }
      };
    }
  }

  private async getTotalRevenue(): Promise<number> {
    try {
      // Usar función RPC para calcular la suma total de ventas
      const result = await this.dataService.rpc('calculate_total_revenue');

      if (result.success && result.data) {
        return (result.data as any).total_revenue || 0;
      }

      // Fallback: consultar todas las compras y sumar manualmente
      const purchases = await this.dataService.getMany('purchases', {
        select: 'amount',
        filters: [
          { column: 'status', operator: 'eq', value: 'completed' }
        ]
      });

      return purchases.data.reduce((total: number, purchase: any) => {
        return total + (purchase.amount || 0);
      }, 0);
    } catch (error) {
      console.error('Error al calcular revenue total:', error);
      return 0;
    }
  }

  private async getPopularCards(): Promise<any[]> {
    try {
      // Intentar usar función RPC para obtener cartas populares
      const result = await this.dataService.rpc('get_popular_cards_dashboard', {
        limit_count: 10
      });

      if (result.success && result.data) {
        return result.data as any[];
      }

      // Fallback: obtener cartas ordenadas por ventas recientes
      const cards = await this.dataService.getMany('cards', {
        select: `
          id,
          name,
          type,
          rarity,
          price,
          image_url,
          sales_count
        `,
        filters: [
          { column: 'status', operator: 'eq', value: 'available' }
        ],
        orderBy: { column: 'sales_count', ascending: false },
        limit: 10
      });

      return cards.data;
    } catch (error) {
      console.error('Error al obtener cartas populares:', error);
      return [];
    }
  }

  private async getRecentTransactions(): Promise<any[]> {
    try {
      const result = await this.dataService.getMany('purchases', {
        select: `
          id,
          amount,
          created_at,
          status,
          card:cards(id, name, image_url),
          buyer:users(id, username, avatar),
          seller:sales(seller:users(username))
        `,
        filters: [
          { column: 'status', operator: 'eq', value: 'completed' }
        ],
        orderBy: { column: 'created_at', ascending: false },
        limit: 10
      });

      return result.data;
    } catch (error) {
      console.error('Error al obtener transacciones recientes:', error);
      return [];
    }
  }

  private calculateGrowthPercentage(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Obtener estadísticas adicionales por período
   */
  async getStatsByPeriod(days: number): Promise<{
    newUsers: number;
    newSales: number;
    revenue: number;
    newCards: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [newUsers, newSales, newCards] = await Promise.all([
        this.dataService.count('users', [
          { column: 'created_at', operator: 'gte', value: startDate.toISOString() }
        ]),
        this.dataService.count('purchases', [
          { column: 'created_at', operator: 'gte', value: startDate.toISOString() }
        ]),
        this.dataService.count('cards', [
          { column: 'created_at', operator: 'gte', value: startDate.toISOString() }
        ])
      ]);

      // Calcular revenue del período
      const purchases = await this.dataService.getMany('purchases', {
        select: 'amount',
        filters: [
          { column: 'created_at', operator: 'gte', value: startDate.toISOString() },
          { column: 'status', operator: 'eq', value: 'completed' }
        ]
      });

      const revenue = purchases.data.reduce((total: number, purchase: any) => {
        return total + (purchase.amount || 0);
      }, 0);

      return { newUsers, newSales, revenue, newCards };
    } catch (error) {
      console.error('Error al obtener estadísticas por período:', error);
      return { newUsers: 0, newSales: 0, revenue: 0, newCards: 0 };
    }
  }
}
