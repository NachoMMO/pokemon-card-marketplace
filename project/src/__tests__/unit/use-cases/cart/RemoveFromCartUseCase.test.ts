import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RemoveFromCartUseCase } from '../../../../application/use-cases/cart/RemoveFromCartUseCase';
import type { ICartRepository } from '../../../../application/ports/repositories/ICartRepository';

describe('RemoveFromCartUseCase', () => {
  let useCase: RemoveFromCartUseCase;
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

    useCase = new RemoveFromCartUseCase(mockCartRepository);
  });

  describe('execute', () => {
    it('should remove cart item successfully', async () => {
      // Arrange
      const cartItemId = 'cart-item-1';
      vi.mocked(mockCartRepository.removeItem).mockResolvedValue(true);

      // Act
      const result = await useCase.execute(cartItemId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockCartRepository.removeItem).toHaveBeenCalledWith(cartItemId);
    });

    it('should validate cart item ID parameter', async () => {
      // Empty string
      let result = await useCase.execute('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID del elemento del carrito es requerido');

      // Whitespace only
      result = await useCase.execute('   ');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID del elemento del carrito es requerido');

      // Null-like empty string
      result = await useCase.execute('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID del elemento del carrito es requerido');

      expect(mockCartRepository.removeItem).not.toHaveBeenCalled();
    });

    it('should return error when repository remove fails', async () => {
      // Arrange
      const cartItemId = 'cart-item-1';
      vi.mocked(mockCartRepository.removeItem).mockResolvedValue(false);

      // Act
      const result = await useCase.execute(cartItemId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('No se pudo eliminar el elemento del carrito');
      expect(mockCartRepository.removeItem).toHaveBeenCalledWith(cartItemId);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const cartItemId = 'cart-item-1';
      vi.mocked(mockCartRepository.removeItem).mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await useCase.execute(cartItemId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(mockCartRepository.removeItem).toHaveBeenCalledWith(cartItemId);
    });

    it('should handle unknown errors', async () => {
      // Arrange
      const cartItemId = 'cart-item-1';
      vi.mocked(mockCartRepository.removeItem).mockRejectedValue('Unknown error');

      // Act
      const result = await useCase.execute(cartItemId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido al eliminar del carrito');
      expect(mockCartRepository.removeItem).toHaveBeenCalledWith(cartItemId);
    });

    it('should handle valid non-empty cart item IDs', async () => {
      // Arrange
      const validIds = [
        'cart-item-123',
        'abc-def-456',
        'uuid-style-id-789',
        'simple_id'
      ];

      vi.mocked(mockCartRepository.removeItem).mockResolvedValue(true);

      // Act & Assert
      for (const cartItemId of validIds) {
        const result = await useCase.execute(cartItemId);
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        expect(mockCartRepository.removeItem).toHaveBeenCalledWith(cartItemId);
      }

      expect(mockCartRepository.removeItem).toHaveBeenCalledTimes(validIds.length);
    });
  });
});
