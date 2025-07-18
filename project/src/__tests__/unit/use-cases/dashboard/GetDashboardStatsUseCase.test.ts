import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetDashboardStatsUseCase, type DashboardStats } from '../../../../application/use-cases/dashboard/GetDashboardStatsUseCase';
import type { IDataService } from '../../../../application/ports/services/IDataService';

describe('GetDashboardStatsUseCase', () => {
  let useCase: GetDashboardStatsUseCase;
  let mockDataService: any;

  beforeEach(() => {
    mockDataService = {
      count: vi.fn(),
      getMany: vi.fn(),
      rpc: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn()
    };

    useCase = new GetDashboardStatsUseCase(mockDataService);
  });

  it('should return complete dashboard stats successfully', async () => {
    // Arrange - removed timer mocking since it's not essential for this test

    // Mock todas las respuestas de count
    mockDataService.count
      .mockResolvedValueOnce(150) // totalCards
      .mockResolvedValueOnce(50)  // totalUsers
      .mockResolvedValueOnce(25)  // activeSales
      .mockResolvedValueOnce(100) // totalSales
      .mockResolvedValueOnce(12)  // usersThisMonth
      .mockResolvedValueOnce(8)   // usersLastMonth
      .mockResolvedValueOnce(30)  // salesThisMonth
      .mockResolvedValueOnce(20); // salesLastMonth

    // Mock revenue RPC
    mockDataService.rpc.mockResolvedValueOnce({
      success: true,
      data: { total_revenue: 5000.50 }
    });

    // Mock popular cards RPC
    mockDataService.rpc.mockResolvedValueOnce({
      success: true,
      data: [
        { id: 'card-1', name: 'Charizard', sales_count: 50 },
        { id: 'card-2', name: 'Pikachu', sales_count: 45 }
      ]
    });

    // Mock recent transactions
    mockDataService.getMany.mockResolvedValueOnce({
      data: [
        { id: 'trans-1', amount: 100.00, created_at: '2024-01-14T09:00:00Z' },
        { id: 'trans-2', amount: 75.50, created_at: '2024-01-13T15:30:00Z' }
      ]
    });

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual({
      totalCards: 150,
      totalUsers: 50,
      activeSales: 25,
      totalSales: 100,
      totalRevenue: 5000.50,
      popularCards: [
        { id: 'card-1', name: 'Charizard', sales_count: 50 },
        { id: 'card-2', name: 'Pikachu', sales_count: 45 }
      ],
      recentTransactions: [
        { id: 'trans-1', amount: 100.00, created_at: '2024-01-14T09:00:00Z' },
        { id: 'trans-2', amount: 75.50, created_at: '2024-01-13T15:30:00Z' }
      ],
      userGrowth: {
        thisMonth: 12,
        lastMonth: 8,
        growth: 50
      },
      salesGrowth: {
        thisMonth: 30,
        lastMonth: 20,
        growth: 50
      }
    });
  });

  it('should handle revenue calculation with basic data service calls', async () => {
    // Arrange - simple mocking approach
    mockDataService.count.mockResolvedValue(10);
    mockDataService.rpc
      .mockResolvedValueOnce({ success: true, data: { total_revenue: 500 } }) // revenue
      .mockResolvedValueOnce({ success: true, data: [] }); // popular cards
    mockDataService.getMany.mockResolvedValue({ data: [] });

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.totalRevenue).toBe(500);
    expect(result.totalCards).toBe(10);
    expect(result.popularCards).toEqual([]);
  });

  it('should handle basic successful scenario with all data', async () => {
    // Arrange
    mockDataService.count.mockResolvedValue(25);
    mockDataService.rpc
      .mockResolvedValueOnce({ success: true, data: { total_revenue: 1500 } })
      .mockResolvedValueOnce({ success: true, data: [{ id: 'card-1', name: 'Test Card' }] });
    mockDataService.getMany.mockResolvedValue({ data: [{ id: 'trans-1', amount: 100 }] });

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.totalCards).toBe(25);
    expect(result.totalRevenue).toBe(1500);
    expect(result.popularCards).toEqual([{ id: 'card-1', name: 'Test Card' }]);
    expect(result.recentTransactions).toEqual([{ id: 'trans-1', amount: 100 }]);
  });

  it('should calculate growth percentage correctly', async () => {
    // Arrange
    mockDataService.count
      .mockResolvedValueOnce(0) // totalCards
      .mockResolvedValueOnce(0) // totalUsers
      .mockResolvedValueOnce(0) // activeSales
      .mockResolvedValueOnce(0) // totalSales
      .mockResolvedValueOnce(20) // usersThisMonth
      .mockResolvedValueOnce(10) // usersLastMonth
      .mockResolvedValueOnce(60) // salesThisMonth
      .mockResolvedValueOnce(40); // salesLastMonth

    mockDataService.rpc
      .mockResolvedValueOnce({ success: true, data: { total_revenue: 0 } }) // revenue RPC
      .mockResolvedValueOnce({ success: true, data: [] }); // popular cards RPC

    mockDataService.getMany.mockResolvedValue({ data: [] }); // recent transactions

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.userGrowth.growth).toBe(100); // (20-10)/10 * 100 = 100%
    expect(result.salesGrowth.growth).toBe(50); // (60-40)/40 * 100 = 50%
  });

  it('should handle zero previous values in growth calculation', async () => {
    // Arrange
    mockDataService.count
      .mockResolvedValueOnce(0) // totalCards
      .mockResolvedValueOnce(0) // totalUsers
      .mockResolvedValueOnce(0) // activeSales
      .mockResolvedValueOnce(0) // totalSales
      .mockResolvedValueOnce(15) // usersThisMonth
      .mockResolvedValueOnce(0)  // usersLastMonth (zero)
      .mockResolvedValueOnce(0)  // salesThisMonth (zero)
      .mockResolvedValueOnce(5); // salesLastMonth

    mockDataService.rpc
      .mockResolvedValueOnce({ success: true, data: { total_revenue: 0 } }) // revenue RPC
      .mockResolvedValueOnce({ success: true, data: [] }); // popular cards RPC

    mockDataService.getMany.mockResolvedValue({ data: [] }); // recent transactions

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.userGrowth.growth).toBe(100); // previous 0, current > 0 = 100%
    expect(result.salesGrowth.growth).toBe(-100); // current 0, previous > 0 = -100%
  });

  it('should return default values when main execution fails', async () => {
    // Arrange
    mockDataService.count.mockRejectedValue(new Error('Database error'));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual({
      totalCards: 0,
      totalUsers: 0,
      activeSales: 0,
      totalSales: 0,
      totalRevenue: 0,
      popularCards: [],
      recentTransactions: [],
      userGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 },
      salesGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 }
    });
  });

  it('should handle getStatsByPeriod successfully', async () => {
    // Arrange
    mockDataService.count
      .mockResolvedValueOnce(5)  // newUsers
      .mockResolvedValueOnce(12) // newSales
      .mockResolvedValueOnce(8); // newCards

    mockDataService.getMany.mockResolvedValueOnce({
      data: [
        { amount: 150.00 },
        { amount: 200.50 }
      ]
    });

    // Act
    const result = await useCase.getStatsByPeriod(7);

    // Assert
    expect(result).toEqual({
      newUsers: 5,
      newSales: 12,
      revenue: 350.50,
      newCards: 8
    });

    expect(mockDataService.count).toHaveBeenCalledTimes(3);
    expect(mockDataService.getMany).toHaveBeenCalledWith('purchases', {
      select: 'amount',
      filters: [
        { column: 'created_at', operator: 'gte', value: expect.any(String) },
        { column: 'status', operator: 'eq', value: 'completed' }
      ]
    });
  });

  it('should handle getStatsByPeriod errors gracefully', async () => {
    // Arrange
    mockDataService.count.mockRejectedValue(new Error('Period stats error'));

    // Act
    const result = await useCase.getStatsByPeriod(30);

    // Assert
    expect(result).toEqual({
      newUsers: 0,
      newSales: 0,
      revenue: 0,
      newCards: 0
    });
  });

  it('should handle revenue calculation errors gracefully', async () => {
    // Arrange
    mockDataService.count.mockResolvedValue(0);

    // Revenue RPC fails on first call, popular cards RPC succeeds on second call
    mockDataService.rpc
      .mockRejectedValueOnce(new Error('RPC error')) // Revenue RPC fails
      .mockResolvedValueOnce({ success: true, data: [] }); // Popular cards RPC succeeds

    // Recent transactions getMany succeeds
    mockDataService.getMany.mockResolvedValueOnce({ data: [] });

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.totalRevenue).toBe(0);
  });

  it('should handle popular cards query errors gracefully', async () => {
    // Arrange
    mockDataService.count
      .mockResolvedValueOnce(0) // totalCards
      .mockResolvedValueOnce(0) // totalUsers
      .mockResolvedValueOnce(0) // activeSales
      .mockResolvedValueOnce(0) // totalSales
      .mockResolvedValueOnce(0) // usersThisMonth
      .mockResolvedValueOnce(0) // usersLastMonth
      .mockResolvedValueOnce(0) // salesThisMonth
      .mockResolvedValueOnce(0); // salesLastMonth

    mockDataService.rpc
      .mockResolvedValueOnce({ success: true, data: { total_revenue: 1000 } }) // revenue RPC
      .mockResolvedValueOnce({ success: false }); // popular cards RPC fails

    // Mock getMany calls: popular cards fallback fails, then recent transactions
    mockDataService.getMany
      .mockRejectedValueOnce(new Error('Popular cards error')) // popular cards fallback fails
      .mockResolvedValueOnce({ data: [] }); // recent transactions

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.popularCards).toEqual([]);
  });

  it('should handle recent transactions query errors gracefully', async () => {
    // Arrange
    mockDataService.count.mockResolvedValue(0);

    // Mock both RPC calls: revenue calculation and popular cards (both succeed)
    mockDataService.rpc
      .mockResolvedValueOnce({ success: true, data: { total_revenue: 0 } }) // Revenue RPC
      .mockResolvedValueOnce({ success: true, data: [] }); // Popular cards RPC succeeds

    // Only recent transactions getMany call fails
    mockDataService.getMany.mockRejectedValueOnce(new Error('Recent transactions error'));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.recentTransactions).toEqual([]);
  });
});
