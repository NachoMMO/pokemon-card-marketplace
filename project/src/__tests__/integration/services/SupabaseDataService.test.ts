// Tests de integración para SupabaseDataService
import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { SupabaseDataService } from '../../../infrastructure/driven/services/SupabaseDataService';
import { createMockSupabaseClient } from '../../mocks/supabase.mock';

describe('SupabaseDataService Integration', () => {
  let mockSupabase: any;
  let dataService: SupabaseDataService;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    dataService = new SupabaseDataService(mockSupabase);
    vi.clearAllMocks();
  });

  describe('getMany', () => {
    it('should retrieve multiple records successfully', async () => {
      const mockData = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' },
      ];

      // Configurar mock chain: cada método retorna el mock para encadenar
      const finalResult = {
        data: mockData,
        error: null,
        count: mockData.length
      };

      // Crear un objeto que sea tanto un mock como una promesa
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: (resolve: Function) => resolve(finalResult),
        catch: () => {},
        finally: () => {}
      };

      // Hacer que el query final sea awaitable
      Object.defineProperty(mockQuery, Symbol.toStringTag, {
        value: 'Promise'
      });

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockQuery);

      // El range devuelve el mismo mockQuery que es awaitable
      mockQuery.range.mockReturnValue(mockQuery);

      const result = await dataService.getMany('test_table', {
        limit: 10,
        offset: 0,
        filters: [{ column: 'status', operator: 'eq', value: 'active' }],
        orderBy: { column: 'name', ascending: true }
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('test_table');
      expect(mockQuery.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockQuery.order).toHaveBeenCalledWith('name', { ascending: true });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);

      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(mockData.length);
      expect(result.totalPages).toBe(1);
    });

    it('should handle filters correctly', async () => {
      const mockData = [{ id: '1', name: 'Test', price: 10 }];

      const mockQuery = {
        ...mockSupabase,
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.gte.mockReturnValue(mockQuery);
      mockQuery.lte.mockReturnValue(mockQuery);
      mockQuery.like.mockReturnValue(mockQuery);
      mockQuery.in.mockReturnValue(mockQuery);

      mockQuery.count.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1
      });

      const filters = [
        { column: 'name', operator: 'like' as const, value: '%test%' },
        { column: 'price', operator: 'gte' as const, value: 5 },
        { column: 'price', operator: 'lte' as const, value: 15 },
        { column: 'category', operator: 'in' as const, value: ['a', 'b'] },
      ];

      await dataService.getMany('test_table', { filters });

      expect(mockQuery.like).toHaveBeenCalledWith('name', '%test%');
      expect(mockQuery.gte).toHaveBeenCalledWith('price', 5);
      expect(mockQuery.lte).toHaveBeenCalledWith('price', 15);
      expect(mockQuery.in).toHaveBeenCalledWith('category', ['a', 'b']);
    });
  });

  describe('getById', () => {
    it('should retrieve a single record by ID', async () => {
      const mockData = { id: '123', name: 'Test Record' };

      const mockQuery = {
        ...mockSupabase,
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await dataService.getById('test_table', '123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
    });

    it('should handle record not found', async () => {
      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockReturnValue(mockSupabase);
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Record not found' }
      });

      const result = await dataService.getById('test_table', '999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Record not found');
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const newData = { name: 'New Record', status: 'active' };
      const createdData = { id: '123', ...newData };

      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.insert.mockReturnValue(mockSupabase);
      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.single.mockResolvedValue({
        data: createdData,
        error: null
      });

      const result = await dataService.create('test_table', newData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdData);
      expect(mockSupabase.insert).toHaveBeenCalledWith(newData);
    });

    it('should handle creation errors', async () => {
      const newData = { name: 'Invalid Record' };

      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.insert.mockReturnValue(mockSupabase);
      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Validation failed' }
      });

      const result = await dataService.create('test_table', newData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const updateData = { name: 'Updated Record' };
      const updatedData = { id: '123', name: 'Updated Record', status: 'active' };

      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.update.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockReturnValue(mockSupabase);
      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.single.mockResolvedValue({
        data: updatedData,
        error: null
      });

      const result = await dataService.update('test_table', '123', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedData);
      expect(mockSupabase.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123');
    });
  });

  describe('delete', () => {
    it('should delete a record successfully', async () => {
      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.delete.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockResolvedValue({
        data: [{ id: '123' }],
        error: null
      });

      const result = await dataService.delete('test_table', '123');

      expect(result).toBe(true);
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123');
    });

    it('should handle delete errors', async () => {
      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.delete.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockResolvedValue({
        data: null,
        error: { message: 'Record not found' }
      });

      const result = await dataService.delete('test_table', '999');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count records with filters', async () => {
      const finalResult = {
        count: 42,
        error: null
      };

      // Crear un objeto que sea tanto un mock como una promesa para count
      const mockCountQuery = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: (resolve: Function) => resolve(finalResult),
        catch: () => {},
        finally: () => {}
      };

      mockSupabase.from.mockReturnValue(mockCountQuery);
      mockCountQuery.select.mockReturnValue(mockCountQuery);
      mockCountQuery.eq.mockReturnValue(mockCountQuery);

      const filters = [{ column: 'status', operator: 'eq' as const, value: 'active' }];
      const result = await dataService.count('test_table', filters);

      expect(result).toBe(42);
      expect(mockCountQuery.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    });
  });

  describe('rpc', () => {
    it('should call RPC function', async () => {
      const mockResult = { total: 100, average: 25 };

      mockSupabase.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const result = await dataService.rpc('calculate_stats', { table: 'sales' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('calculate_stats', { table: 'sales' });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.single.mockRejectedValue(new Error('Network error'));

      const result = await dataService.getById('test_table', '123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle malformed responses', async () => {
      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.single.mockResolvedValue(undefined);

      const result = await dataService.getById('test_table', '123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('destructur');
    });
  });
});
