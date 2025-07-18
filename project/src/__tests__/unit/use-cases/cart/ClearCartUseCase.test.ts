import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClearCartUseCase } from '../../../../application/use-cases/cart/ClearCartUseCase';
import type { ICartRepository } from '../../../../application/ports/repositories/ICartRepository';

describe('ClearCartUseCase', () => {
  let useCase: ClearCartUseCase;
  let mockCartRepository: ICartRepository;

  beforeEach(() => {
    mockCartRepository = {
      addItem: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdAndCardId: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      getTotalItems: vi.fn(),
      getTotalPrice: vi.fn(),
      clearExpiredItems: vi.fn()
    };

    useCase = new ClearCartUseCase(mockCartRepository);
  });

  describe('execute', () => {
    it('should clear cart successfully', async () => {
      // Arrange
      const userId = 'user-1';
      (mockCartRepository.clearCart as any).mockResolvedValue(true);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(userId);
    });

    it('should validate userId parameter', async () => {
      // Empty string
      let result = await useCase.execute('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de usuario es requerido');

      // Whitespace only
      result = await useCase.execute('   ');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de usuario es requerido');

      // Null-like empty string
      result = await useCase.execute('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de usuario es requerido');

      expect(mockCartRepository.clearCart).not.toHaveBeenCalled();
    });

    it('should return error when repository clear fails', async () => {
      // Arrange
      const userId = 'user-1';
      (mockCartRepository.clearCart as any).mockResolvedValue(false);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('No se pudo limpiar el carrito');
      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(userId);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const userId = 'user-1';
      (mockCartRepository.clearCart as any).mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(userId);
    });

    it('should handle unknown errors', async () => {
      // Arrange
      const userId = 'user-1';
      (mockCartRepository.clearCart as any).mockRejectedValue('Unknown error');

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido al limpiar el carrito');
      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(userId);
    });

    it('should handle valid user IDs', async () => {
      // Arrange
      const validIds = [
        'user-123',
        'abc-def-456',
        'uuid-style-id-789',
        'simple_user_id'
      ];

      (mockCartRepository.clearCart as any).mockResolvedValue(true);

      // Act & Assert
      for (const userId of validIds) {
        const result = await useCase.execute(userId);
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        expect(mockCartRepository.clearCart).toHaveBeenCalledWith(userId);
      }

      expect(mockCartRepository.clearCart).toHaveBeenCalledTimes(validIds.length);
    });

    it('should clear cart even for users with no items', async () => {
      // Arrange
      const userId = 'empty-cart-user';
      (mockCartRepository.clearCart as any).mockResolvedValue(true);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(userId);
    });
  });
});
