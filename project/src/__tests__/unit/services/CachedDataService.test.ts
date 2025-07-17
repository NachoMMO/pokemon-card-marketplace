// Tests unitarios para CachedDataService
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CachedDataService } from '../../../application/services/CachedDataService';
import type { IDataService, DataServiceResult, PaginatedResult } from '../../../application/ports/services/IDataService';
import { createSuccessResponse, createErrorResponse, createPaginatedResult } from '../../mocks/supabase.mock';

// Mock del DataService base
const createMockDataService = (): IDataService => ({
  getMany: vi.fn(),
  getById: vi.fn(),
  getOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  createMany: vi.fn(),
  upsert: vi.fn(),
  count: vi.fn(),
  rpc: vi.fn(),
  executeQuery: vi.fn(),
});

describe('CachedDataService', () => {
  let mockDataService: IDataService;
  let cachedDataService: CachedDataService;

  beforeEach(() => {
    mockDataService = createMockDataService();
    cachedDataService = new CachedDataService(mockDataService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Limpiar cache después de cada test
    (cachedDataService as any).cache.clear();
  });

  describe('getMany', () => {
    it('should call underlying service and cache result', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      const mockResult = createPaginatedResult(mockData);

      vi.mocked(mockDataService.getMany).mockResolvedValue(mockResult);

      const result = await cachedDataService.getMany('test_table');

      expect(mockDataService.getMany).toHaveBeenCalledWith('test_table', undefined);
      expect(result).toEqual(mockResult);
    });

    it('should return cached result on second call', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      const mockResult = createPaginatedResult(mockData);

      vi.mocked(mockDataService.getMany).mockResolvedValue(mockResult);

      // Primera llamada
      await cachedDataService.getMany('test_table');

      // Segunda llamada
      const result = await cachedDataService.getMany('test_table');

      expect(mockDataService.getMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should respect different options in cache key', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      const mockResult = createPaginatedResult(mockData);

      vi.mocked(mockDataService.getMany).mockResolvedValue(mockResult);

      const options1 = { filters: [{ column: 'name', operator: 'eq' as const, value: 'test1' }] };
      const options2 = { filters: [{ column: 'name', operator: 'eq' as const, value: 'test2' }] };

      await cachedDataService.getMany('test_table', options1);
      await cachedDataService.getMany('test_table', options2);

      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
      expect(mockDataService.getMany).toHaveBeenNthCalledWith(1, 'test_table', options1);
      expect(mockDataService.getMany).toHaveBeenNthCalledWith(2, 'test_table', options2);
    });
  });

  describe('getById', () => {
    it('should cache individual record by id', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResult = createSuccessResponse(mockData);

      vi.mocked(mockDataService.getById).mockResolvedValue(mockResult);

      const result = await cachedDataService.getById('test_table', '123');

      expect(mockDataService.getById).toHaveBeenCalledWith('test_table', '123', undefined);
      expect(result).toEqual(mockResult);

      // Segunda llamada debería usar cache
      const result2 = await cachedDataService.getById('test_table', '123');
      expect(mockDataService.getById).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(mockResult);
    });
  });

  describe('create', () => {
    it('should invalidate cache when creating', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResult = createSuccessResponse(mockData);

      vi.mocked(mockDataService.create).mockResolvedValue(mockResult);

      // Primero cachear algunos datos
      vi.mocked(mockDataService.getMany).mockResolvedValue(createPaginatedResult([mockData]));
      await cachedDataService.getMany('test_table');

      // Crear nuevo registro
      await cachedDataService.create('test_table', { name: 'New' });

      // Cache debería estar invalidado
      await cachedDataService.getMany('test_table');
      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('should invalidate cache when updating', async () => {
      const mockData = { id: '123', name: 'Updated' };
      const mockResult = createSuccessResponse(mockData);

      vi.mocked(mockDataService.update).mockResolvedValue(mockResult);

      // Primero cachear el registro
      vi.mocked(mockDataService.getById).mockResolvedValue(createSuccessResponse({ id: '123', name: 'Original' }));
      await cachedDataService.getById('test_table', '123');

      // Actualizar registro
      await cachedDataService.update('test_table', '123', { name: 'Updated' });

      // Cache debería estar invalidado
      await cachedDataService.getById('test_table', '123');
      expect(mockDataService.getById).toHaveBeenCalledTimes(2);
    });
  });

  describe('delete', () => {
    it('should invalidate cache when deleting', async () => {
      vi.mocked(mockDataService.delete).mockResolvedValue(true);

      // Primero cachear algunos datos
      vi.mocked(mockDataService.getMany).mockResolvedValue(createPaginatedResult([{ id: '123' }]));
      await cachedDataService.getMany('test_table');

      // Eliminar registro
      await cachedDataService.delete('test_table', '123');

      // Cache debería estar invalidado
      await cachedDataService.getMany('test_table');
      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('count', () => {
    it('should not cache count results', async () => {
      vi.mocked(mockDataService.count).mockResolvedValue(5);

      await cachedDataService.count('test_table');
      await cachedDataService.count('test_table');

      // Count no debería usar cache
      expect(mockDataService.count).toHaveBeenCalledTimes(2);
    });
  });

  describe('rpc', () => {
    it('should not cache RPC results', async () => {
      const mockResult = createSuccessResponse({ result: 'test' });

      vi.mocked(mockDataService.rpc).mockResolvedValue(mockResult);

      await cachedDataService.rpc('test_function', { param: 'value' });
      await cachedDataService.rpc('test_function', { param: 'value' });

      // RPC no debería usar cache
      expect(mockDataService.rpc).toHaveBeenCalledTimes(2);
    });
  });
});
