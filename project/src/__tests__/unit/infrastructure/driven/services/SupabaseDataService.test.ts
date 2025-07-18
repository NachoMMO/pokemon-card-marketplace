import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseDataService } from '../../../../../infrastructure/driven/services/SupabaseDataService';
import type { QueryOptions } from '../../../../../application/ports/services/IDataService';

describe('SupabaseDataService', () => {
  let mockSupabaseClient: any;
  let mockFrom: any;
  let mockRpc: any;
  let service: SupabaseDataService;

  beforeEach(() => {
    mockFrom = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };

    mockRpc = vi.fn();

    mockSupabaseClient = {
      from: vi.fn(() => mockFrom),
      rpc: mockRpc,
    };

    service = new SupabaseDataService(mockSupabaseClient);
  });

  describe('getMany', () => {
    it('should get many records with default options', async () => {
      // Arrange
      const mockData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ];

      mockFrom.range.mockResolvedValue({
        data: mockData,
        error: null,
        count: 10
      });

      // Act
      const result = await service.getMany('test_table');

      // Assert
      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('test_table');
      expect(mockFrom.select).toHaveBeenCalledWith('*', { count: 'exact' });
    });

    it('should get many records with custom options', async () => {
      // Arrange
      const options: QueryOptions = {
        select: 'id, name',
        limit: 10,
        offset: 5,
        orderBy: { column: 'name', ascending: false },
        filters: [
          { column: 'status', operator: 'eq', value: 'active' },
          { column: 'age', operator: 'gt', value: 18 }
        ]
      };

      const mockData = [{ id: '1', name: 'Item 1' }];
      mockFrom.range.mockResolvedValue({
        data: mockData,
        error: null,
        count: 50
      });

      // Act
      const result = await service.getMany('test_table', options);

      // Assert
      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(50);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
      expect(mockFrom.select).toHaveBeenCalledWith('id, name', { count: 'exact' });
      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockFrom.gt).toHaveBeenCalledWith('age', 18);
      expect(mockFrom.order).toHaveBeenCalledWith('name', { ascending: false });
      expect(mockFrom.range).toHaveBeenCalledWith(5, 14);
    });

    it('should handle query error', async () => {
      // Arrange
      mockFrom.range.mockResolvedValue({
        data: null,
        error: { message: 'Query error' },
        count: null
      });

      // Act
      const result = await service.getMany('test_table');

      // Assert
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockFrom.range.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.getMany('test_table');

      // Assert
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should handle unlimited query when limit is 0', async () => {
      // Arrange
      const options: QueryOptions = { limit: 0 };
      const mockData = [{ id: '1' }, { id: '2' }];

      // For unlimited queries, the service should not call range()
      mockFrom.select.mockResolvedValue({
        data: mockData,
        error: null,
        count: 2
      });

      // Act
      const result = await service.getMany('test_table', options);

      // Assert
      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(2);
      // Verify range was not called for unlimited queries
      expect(mockFrom.range).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should get record by id successfully', async () => {
      // Arrange
      const mockData = { id: 'test-id', name: 'Test Item' };
      mockFrom.single.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Act
      const result = await service.getById('test_table', 'test-id');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'test-id');
      expect(mockFrom.single).toHaveBeenCalled();
    });

    it('should get record by id with custom select fields', async () => {
      // Arrange
      const mockData = { id: 'test-id', name: 'Test Item' };
      mockFrom.single.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Act
      const result = await service.getById('test_table', 'test-id', 'id, name');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockFrom.select).toHaveBeenCalledWith('id, name');
    });

    it('should handle record not found', async () => {
      // Arrange
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      });

      // Act
      const result = await service.getById('test_table', 'test-id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Registro no encontrado');
    });

    it('should handle other database errors', async () => {
      // Arrange
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'Database error' }
      });

      // Act
      const result = await service.getById('test_table', 'test-id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockFrom.single.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.getById('test_table', 'test-id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getOne', () => {
    it('should get one record with filters successfully', async () => {
      // Arrange
      const filters = [
        { column: 'email', operator: 'eq' as const, value: 'test@example.com' },
        { column: 'status', operator: 'eq' as const, value: 'active' }
      ];
      const mockData = { id: 'test-id', email: 'test@example.com' };
      mockFrom.single.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Act
      const result = await service.getOne('users', filters);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockFrom.eq).toHaveBeenCalledWith('email', 'test@example.com');
      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should handle record not found in getOne', async () => {
      // Arrange
      const filters = [{ column: 'email', operator: 'eq' as const, value: 'test@example.com' }];
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      });

      // Act
      const result = await service.getOne('users', filters);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Registro no encontrado');
    });

    it('should handle other errors in getOne', async () => {
      // Arrange
      const filters = [{ column: 'email', operator: 'eq' as const, value: 'test@example.com' }];
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'Database error' }
      });

      // Act
      const result = await service.getOne('users', filters);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('create', () => {
    it('should create record successfully', async () => {
      // Arrange
      const newData = { name: 'New Item', status: 'active' };
      const mockResult = { id: 'new-id', ...newData };
      mockFrom.single.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Act
      const result = await service.create('test_table', newData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockFrom.insert).toHaveBeenCalledWith(newData);
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.single).toHaveBeenCalled();
    });

    it('should create record with custom select fields', async () => {
      // Arrange
      const newData = { name: 'New Item' };
      const mockResult = { id: 'new-id', name: 'New Item' };
      mockFrom.single.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Act
      const result = await service.create('test_table', newData, 'id, name');

      // Assert
      expect(result.success).toBe(true);
      expect(mockFrom.select).toHaveBeenCalledWith('id, name');
    });

    it('should handle create error', async () => {
      // Arrange
      const newData = { name: 'New Item' };
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Insert error' }
      });

      // Act
      const result = await service.create('test_table', newData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insert error');
    });

    it('should handle unexpected errors in create', async () => {
      // Arrange
      const newData = { name: 'New Item' };
      mockFrom.single.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.create('test_table', newData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('update', () => {
    it('should update record successfully', async () => {
      // Arrange
      const updateData = { name: 'Updated Item' };
      const mockResult = { id: 'test-id', name: 'Updated Item' };
      mockFrom.single.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Act
      const result = await service.update('test_table', 'test-id', updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockFrom.update).toHaveBeenCalledWith(updateData);
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'test-id');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
    });

    it('should handle update error', async () => {
      // Arrange
      const updateData = { name: 'Updated Item' };
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Update error' }
      });

      // Act
      const result = await service.update('test_table', 'test-id', updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Update error');
    });

    it('should handle unexpected errors in update', async () => {
      // Arrange
      const updateData = { name: 'Updated Item' };
      mockFrom.single.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.update('test_table', 'test-id', updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateMany', () => {
    it('should update many records successfully', async () => {
      // Arrange
      const filters = [{ column: 'status', operator: 'eq' as const, value: 'pending' }];
      const updateData = { status: 'completed' };
      const mockResults = [
        { id: '1', status: 'completed' },
        { id: '2', status: 'completed' }
      ];
      mockFrom.select.mockResolvedValue({
        data: mockResults,
        error: null
      });

      // Act
      const result = await service.updateMany('test_table', filters, updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
      expect(mockFrom.update).toHaveBeenCalledWith(updateData);
      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'pending');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
    });

    it('should handle updateMany error', async () => {
      // Arrange
      const filters = [{ column: 'status', operator: 'eq' as const, value: 'pending' }];
      const updateData = { status: 'completed' };
      mockFrom.select.mockResolvedValue({
        data: null,
        error: { message: 'Update error' }
      });

      // Act
      const result = await service.updateMany('test_table', filters, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Update error');
    });
  });

  describe('delete', () => {
    it('should delete record successfully', async () => {
      // Arrange
      mockFrom.eq.mockResolvedValue({ error: null });

      // Act
      const result = await service.delete('test_table', 'test-id');

      // Assert
      expect(result).toBe(true);
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'test-id');
    });

    it('should handle delete error', async () => {
      // Arrange
      mockFrom.eq.mockResolvedValue({ error: { message: 'Delete error' } });

      // Act
      const result = await service.delete('test_table', 'test-id');

      // Assert
      expect(result).toBe(false);
    });

    it('should handle unexpected errors in delete', async () => {
      // Arrange
      mockFrom.eq.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.delete('test_table', 'test-id');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('deleteMany', () => {
    it('should delete many records successfully', async () => {
      // Arrange
      const filters = [{ column: 'status', operator: 'eq' as const, value: 'inactive' }];
      const mockDeletedRecords = [{ id: '1' }, { id: '2' }, { id: '3' }];
      mockFrom.select.mockResolvedValue({
        data: mockDeletedRecords,
        error: null
      });

      // Act
      const result = await service.deleteMany('test_table', filters);

      // Assert
      expect(result).toBe(3);
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'inactive');
      expect(mockFrom.select).toHaveBeenCalledWith('id');
    });

    it('should handle deleteMany error', async () => {
      // Arrange
      const filters = [{ column: 'status', operator: 'eq' as const, value: 'inactive' }];
      mockFrom.select.mockResolvedValue({
        data: null,
        error: { message: 'Delete error' }
      });

      // Act
      const result = await service.deleteMany('test_table', filters);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle unexpected errors in deleteMany', async () => {
      // Arrange
      const filters = [{ column: 'status', operator: 'eq' as const, value: 'inactive' }];
      mockFrom.select.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.deleteMany('test_table', filters);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('createMany', () => {
    it('should create many records successfully', async () => {
      // Arrange
      const newData = [
        { name: 'Item 1' },
        { name: 'Item 2' },
        { name: 'Item 3' }
      ];
      const mockResults = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' }
      ];
      mockFrom.select.mockResolvedValue({
        data: mockResults,
        error: null
      });

      // Act
      const result = await service.createMany('test_table', newData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
      expect(mockFrom.insert).toHaveBeenCalledWith(newData);
      expect(mockFrom.select).toHaveBeenCalledWith('*');
    });

    it('should handle createMany error', async () => {
      // Arrange
      const newData = [{ name: 'Item 1' }];
      mockFrom.select.mockResolvedValue({
        data: null,
        error: { message: 'Insert error' }
      });

      // Act
      const result = await service.createMany('test_table', newData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insert error');
    });

    it('should handle unexpected errors in createMany', async () => {
      // Arrange
      const newData = [{ name: 'Item 1' }];
      mockFrom.select.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.createMany('test_table', newData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('upsert', () => {
    it('should upsert record successfully with default conflict columns', async () => {
      // Arrange
      const data = { id: 'test-id', name: 'Upserted Item' };
      const mockResult = { id: 'test-id', name: 'Upserted Item' };
      mockFrom.single.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Act
      const result = await service.upsert('test_table', data);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockFrom.upsert).toHaveBeenCalledWith(data, {
        onConflict: 'id',
        ignoreDuplicates: false
      });
    });

    it('should upsert record with custom conflict columns', async () => {
      // Arrange
      const data = { email: 'test@example.com', name: 'Test User' };
      const conflictColumns = ['email', 'name'];
      const mockResult = { id: 'new-id', email: 'test@example.com', name: 'Test User' };
      mockFrom.single.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Act
      const result = await service.upsert('users', data, conflictColumns);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockFrom.upsert).toHaveBeenCalledWith(data, {
        onConflict: 'email,name',
        ignoreDuplicates: false
      });
    });

    it('should handle upsert error', async () => {
      // Arrange
      const data = { name: 'Test Item' };
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Upsert error' }
      });

      // Act
      const result = await service.upsert('test_table', data);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Upsert error');
    });

    it('should handle unexpected errors in upsert', async () => {
      // Arrange
      const data = { name: 'Test Item' };
      mockFrom.single.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.upsert('test_table', data);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('count', () => {
    it('should count records successfully', async () => {
      // Arrange - mockFrom debe ser awaitable
      mockFrom.select.mockReturnThis();
      // Hacer que mockFrom sea una promise cuando se await
      mockFrom.then = vi.fn((resolve) => {
        resolve({ count: 25, error: null });
        return Promise.resolve();
      });

      // Act
      const result = await service.count('test_table');

      // Assert
      expect(result).toBe(25);
      expect(mockFrom.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    });

    it('should count records with filters', async () => {
      // Arrange
      const filters = [{ column: 'status', operator: 'eq' as const, value: 'active' }];

      mockFrom.select.mockReturnThis();
      mockFrom.eq.mockReturnThis();
      mockFrom.then = vi.fn((resolve) => {
        resolve({ count: 10, error: null });
        return Promise.resolve();
      });

      // Act
      const result = await service.count('test_table', filters);

      // Assert
      expect(result).toBe(10);
      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should handle count error', async () => {
      // Arrange
      mockFrom.select.mockReturnThis();
      mockFrom.then = vi.fn((resolve) => {
        resolve({ count: null, error: { message: 'Count error' } });
        return Promise.resolve();
      });

      // Act
      const result = await service.count('test_table');

      // Assert
      expect(result).toBe(0);
    });

    it('should handle unexpected errors in count', async () => {
      // Arrange
      mockFrom.select.mockReturnThis();
      mockFrom.then = vi.fn(() => {
        throw new Error('Network error');
      });

      // Act
      const result = await service.count('test_table');

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('rpc', () => {
    it('should execute RPC function successfully', async () => {
      // Arrange
      const functionName = 'get_user_stats';
      const parameters = { user_id: 'test-user' };
      const mockResult = { total_sales: 10, total_purchases: 5 };

      mockRpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Act
      const result = await service.rpc(functionName, parameters);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRpc).toHaveBeenCalledWith(functionName, parameters);
    });

    it('should execute RPC function without parameters', async () => {
      // Arrange
      const functionName = 'cleanup_old_data';
      const mockResult = { deleted_count: 150 };

      mockRpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Act
      const result = await service.rpc(functionName);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRpc).toHaveBeenCalledWith(functionName, {});
    });

    it('should handle RPC error', async () => {
      // Arrange
      const functionName = 'invalid_function';

      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'Function not found' }
      });

      // Act
      const result = await service.rpc(functionName);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Function not found');
    });

    it('should handle unexpected errors in RPC', async () => {
      // Arrange
      const functionName = 'test_function';

      mockRpc.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.rpc(functionName);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('executeQuery', () => {
    it('should execute custom SQL query successfully', async () => {
      // Arrange
      const query = 'SELECT * FROM users WHERE age > $1';
      const parameters = { age_limit: 18 };
      const mockResult = [
        { id: '1', name: 'User 1', age: 25 },
        { id: '2', name: 'User 2', age: 30 }
      ];

      mockRpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Act
      const result = await service.executeQuery(query, parameters);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRpc).toHaveBeenCalledWith('execute_sql', {
        sql_query: query,
        query_params: parameters
      });
    });

    it('should execute query without parameters', async () => {
      // Arrange
      const query = 'SELECT COUNT(*) FROM users';
      const mockResult = [{ count: 42 }];

      mockRpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Act
      const result = await service.executeQuery(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRpc).toHaveBeenCalledWith('execute_sql', {
        sql_query: query,
        query_params: {}
      });
    });

    it('should handle executeQuery error', async () => {
      // Arrange
      const query = 'INVALID SQL';

      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'SQL syntax error' }
      });

      // Act
      const result = await service.executeQuery(query);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('SQL syntax error');
    });

    it('should handle unexpected errors in executeQuery', async () => {
      // Arrange
      const query = 'SELECT * FROM users';

      mockRpc.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.executeQuery(query);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('applyFilter (private method testing through public methods)', () => {
    it('should apply all filter operators correctly', async () => {
      // Arrange
      const filters = [
        { column: 'name', operator: 'eq' as const, value: 'Test' },
        { column: 'age', operator: 'neq' as const, value: 0 },
        { column: 'score', operator: 'gt' as const, value: 80 },
        { column: 'points', operator: 'gte' as const, value: 100 },
        { column: 'rating', operator: 'lt' as const, value: 5 },
        { column: 'level', operator: 'lte' as const, value: 10 },
        { column: 'description', operator: 'like' as const, value: '%test%' },
        { column: 'title', operator: 'ilike' as const, value: '%TEST%' },
        { column: 'category', operator: 'in' as const, value: ['A', 'B', 'C'] },
        { column: 'status', operator: 'is' as const, value: null }
      ];

      mockFrom.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0
      });

      // Act
      await service.getMany('test_table', { filters });

      // Assert
      expect(mockFrom.eq).toHaveBeenCalledWith('name', 'Test');
      expect(mockFrom.neq).toHaveBeenCalledWith('age', 0);
      expect(mockFrom.gt).toHaveBeenCalledWith('score', 80);
      expect(mockFrom.gte).toHaveBeenCalledWith('points', 100);
      expect(mockFrom.lt).toHaveBeenCalledWith('rating', 5);
      expect(mockFrom.lte).toHaveBeenCalledWith('level', 10);
      expect(mockFrom.like).toHaveBeenCalledWith('description', '%test%');
      expect(mockFrom.ilike).toHaveBeenCalledWith('title', '%TEST%');
      expect(mockFrom.in).toHaveBeenCalledWith('category', ['A', 'B', 'C']);
      expect(mockFrom.is).toHaveBeenCalledWith('status', null);
    });

    it('should handle unsupported filter operators gracefully', async () => {
      // Arrange
      const filters = [
        { column: 'test', operator: 'unsupported' as any, value: 'test' }
      ];

      // Mock console.warn to verify it's called
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockFrom.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0
      });

      // Act
      await service.getMany('test_table', { filters });

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Operador de filtro no soportado: unsupported');

      // Cleanup
      consoleSpy.mockRestore();
    });

    it('should handle "not" operator correctly', async () => {
      // Arrange
      const filters = [
        { column: 'status', operator: 'not' as const, value: 'deleted' }
      ];

      mockFrom.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0
      });

      // Act
      await service.getMany('test_table', { filters });

      // Assert
      expect(mockFrom.not).toHaveBeenCalledWith('status', 'not', 'deleted');
    });
  });

  describe('pagination logic', () => {
    it('should calculate pagination correctly for different scenarios', async () => {
      // Test page 2 with limit 10
      const options1: QueryOptions = { limit: 10, offset: 10 };
      mockFrom.range.mockResolvedValue({ data: [], error: null, count: 50 });

      const result1 = await service.getMany('test_table', options1);
      expect(result1.page).toBe(2);
      expect(result1.totalPages).toBe(5);
      expect(result1.hasNext).toBe(true);
      expect(result1.hasPrev).toBe(true);

      // Test last page
      const options2: QueryOptions = { limit: 10, offset: 40 };
      const result2 = await service.getMany('test_table', options2);
      expect(result2.page).toBe(5);
      expect(result2.hasNext).toBe(false);
      expect(result2.hasPrev).toBe(true);

      // Test first page
      const options3: QueryOptions = { limit: 10, offset: 0 };
      const result3 = await service.getMany('test_table', options3);
      expect(result3.page).toBe(1);
      expect(result3.hasNext).toBe(true);
      expect(result3.hasPrev).toBe(false);
    });
  });
});
