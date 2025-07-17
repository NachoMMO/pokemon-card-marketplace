// Tests unitarios para el contenedor DI
import { describe, it, expect, beforeEach } from 'vitest';
import { container, DEPENDENCIES } from '../../../infrastructure/di/container';

describe('DI Container', () => {
  beforeEach(() => {
    // Limpiar el container antes de cada test
    (container as any).dependencies.clear();
  });

  describe('register', () => {
    it('should register a dependency', () => {
      const testService = { name: 'TestService' };

      container.register('TEST_SERVICE', testService);

      const retrieved = container.get('TEST_SERVICE');
      expect(retrieved).toBe(testService);
    });

    it('should allow overriding dependencies', () => {
      const service1 = { name: 'Service1' };
      const service2 = { name: 'Service2' };

      container.register('TEST_SERVICE', service1);
      container.register('TEST_SERVICE', service2);

      const retrieved = container.get('TEST_SERVICE');
      expect(retrieved).toBe(service2);
    });
  });

  describe('get', () => {
    it('should retrieve registered dependency', () => {
      const testService = { name: 'TestService' };
      container.register('TEST_SERVICE', testService);

      const retrieved = container.get('TEST_SERVICE');
      expect(retrieved).toBe(testService);
    });

    it('should throw error for unregistered dependency', () => {
      expect(() => {
        container.get('UNKNOWN_SERVICE');
      }).toThrow('Dependency UNKNOWN_SERVICE not found');
    });

    it('should work with generic types', () => {
      interface ITestService {
        getName(): string;
      }

      const testService: ITestService = {
        getName: () => 'TestService'
      };

      container.register('TEST_SERVICE', testService);

      const retrieved = container.get<ITestService>('TEST_SERVICE');
      expect(retrieved.getName()).toBe('TestService');
    });
  });

  describe('DEPENDENCIES constants', () => {
    it('should have all required dependency identifiers', () => {
      expect(DEPENDENCIES.SUPABASE_CLIENT).toBe('SupabaseClient');
      expect(DEPENDENCIES.DATA_SERVICE).toBe('DataService');
      expect(DEPENDENCIES.USER_REPOSITORY).toBe('UserRepository');
      expect(DEPENDENCIES.CARD_REPOSITORY).toBe('CardRepository');
      expect(DEPENDENCIES.SEARCH_CARDS_ADVANCED_USE_CASE).toBe('SearchCardsAdvancedUseCase');
      expect(DEPENDENCIES.CACHED_DATA_SERVICE).toBe('CachedDataService');
      expect(DEPENDENCIES.DATA_SERVICE_HELPERS).toBe('DataServiceHelpers');
    });

    it('should have unique dependency identifiers', () => {
      const values = Object.values(DEPENDENCIES);
      const uniqueValues = new Set(values);

      expect(values.length).toBe(uniqueValues.size);
    });
  });

  describe('real dependencies integration', () => {
    it('should handle complex dependency registration', () => {
      // Simular registro de dependencias como en la aplicación real
      const mockSupabase = { from: () => ({ select: () => ({}) }) };
      const mockDataService = { getMany: () => Promise.resolve({ data: [] }) };
      const mockUseCase = { execute: () => Promise.resolve({ cards: [] }) };

      container.register(DEPENDENCIES.SUPABASE_CLIENT, mockSupabase);
      container.register(DEPENDENCIES.DATA_SERVICE, mockDataService);
      container.register(DEPENDENCIES.SEARCH_CARDS_ADVANCED_USE_CASE, mockUseCase);

      expect(container.get(DEPENDENCIES.SUPABASE_CLIENT)).toBe(mockSupabase);
      expect(container.get(DEPENDENCIES.DATA_SERVICE)).toBe(mockDataService);
      expect(container.get(DEPENDENCIES.SEARCH_CARDS_ADVANCED_USE_CASE)).toBe(mockUseCase);
    });
  });
});
