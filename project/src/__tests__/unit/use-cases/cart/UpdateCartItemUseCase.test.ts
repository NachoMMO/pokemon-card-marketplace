import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateCartItemUseCase, type UpdateCartItemDTO } from '../../../../application/use-cases/cart/UpdateCartItemUseCase';
import type { ICartRepository } from '../../../../application/ports/repositories/ICartRepository';
import { CartItem } from '../../../../domain/entities/CartItem';

describe('UpdateCartItemUseCase', () => {
  let useCase: UpdateCartItemUseCase;
  let mockCartRepository: ICartRepository;

  const mockUpdatedCartItem: CartItem = new CartItem(
    'cart-item-1',
    'user-1',
    'card-1',
    5, // Updated quantity
    25.99,
    true,
    new Date(Date.now() + 3600000), // 1 hour from now
    new Date(),
    new Date()
  );

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

    useCase = new UpdateCartItemUseCase(mockCartRepository);
  });

  describe('execute', () => {
    const validUpdateData: UpdateCartItemDTO = {
      cartItemId: 'cart-item-1',
      quantity: 5
    };

    it('should update cart item quantity successfully', async () => {
      // Arrange
      (mockCartRepository.updateQuantity as any).mockResolvedValue(mockUpdatedCartItem);

      // Act
      const result = await useCase.execute(validUpdateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.cartItem).toBeDefined();
      expect(result.cartItem!.id).toBe(mockUpdatedCartItem.id);
      expect(result.cartItem!.quantity).toBe(5);
      expect(result.cartItem!.userId).toBe(mockUpdatedCartItem.userId);
      expect(result.cartItem!.cardId).toBe(mockUpdatedCartItem.cardId);
      expect(result.cartItem!.priceAtTime).toBe(mockUpdatedCartItem.priceAtTime);
      expect(result.cartItem!.isActive).toBe(mockUpdatedCartItem.isActive);
      expect(result.cartItem!.reservedUntil).toBe(mockUpdatedCartItem.reservedUntil);
      expect(result.cartItem!.createdAt).toBe(mockUpdatedCartItem.createdAt);
      expect(result.cartItem!.updatedAt).toBe(mockUpdatedCartItem.updatedAt);
      expect(result.error).toBeUndefined();

      expect(mockCartRepository.updateQuantity).toHaveBeenCalledWith('cart-item-1', 5);
    });

    it('should validate cartItemId parameter', async () => {
      // Empty string
      let result = await useCase.execute({ cartItemId: '', quantity: 5 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID del elemento del carrito es requerido');

      // Whitespace only
      result = await useCase.execute({ cartItemId: '   ', quantity: 5 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID del elemento del carrito es requerido');

      expect(mockCartRepository.updateQuantity).not.toHaveBeenCalled();
    });

    it('should validate quantity parameter - positive integers only', async () => {
      const cartItemId = 'cart-item-1';

      // Zero quantity
      let result = await useCase.execute({ cartItemId, quantity: 0 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('La cantidad debe ser un número entero mayor a 0');

      // Negative quantity
      result = await useCase.execute({ cartItemId, quantity: -1 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('La cantidad debe ser un número entero mayor a 0');

      // Decimal quantity
      result = await useCase.execute({ cartItemId, quantity: 2.5 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('La cantidad debe ser un número entero mayor a 0');

      expect(mockCartRepository.updateQuantity).not.toHaveBeenCalled();
    });

    it('should validate maximum quantity limit', async () => {
      // Arrange
      const updateData: UpdateCartItemDTO = {
        cartItemId: 'cart-item-1',
        quantity: 100 // Over the limit of 99
      };

      // Act
      const result = await useCase.execute(updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('La cantidad máxima permitida es 99');
      expect(mockCartRepository.updateQuantity).not.toHaveBeenCalled();
    });

    it('should accept valid quantity ranges', async () => {
      // Arrange
      const validQuantities = [1, 10, 50, 99]; // Edge cases and valid values
      (mockCartRepository.updateQuantity as any).mockResolvedValue(mockUpdatedCartItem);

      // Act & Assert
      for (const quantity of validQuantities) {
        const result = await useCase.execute({ cartItemId: 'cart-item-1', quantity });
        expect(result.success).toBe(true);
        expect(result.cartItem!.quantity).toBe(mockUpdatedCartItem.quantity);
        expect(mockCartRepository.updateQuantity).toHaveBeenCalledWith('cart-item-1', quantity);
      }

      expect(mockCartRepository.updateQuantity).toHaveBeenCalledTimes(validQuantities.length);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      (mockCartRepository.updateQuantity as any).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(validUpdateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.cartItem).toBeUndefined();
      expect(mockCartRepository.updateQuantity).toHaveBeenCalledWith('cart-item-1', 5);
    });

    it('should handle cart item not found errors', async () => {
      // Arrange
      (mockCartRepository.updateQuantity as any).mockRejectedValue(new Error('Cart item not found'));

      // Act
      const result = await useCase.execute(validUpdateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cart item not found');
      expect(result.cartItem).toBeUndefined();
    });

    it('should handle unknown errors', async () => {
      // Arrange
      (mockCartRepository.updateQuantity as any).mockRejectedValue('Unknown error');

      // Act
      const result = await useCase.execute(validUpdateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido al actualizar el carrito');
      expect(result.cartItem).toBeUndefined();
    });

    it('should update different cart items correctly', async () => {
      // Arrange
      const updateCases = [
        { cartItemId: 'cart-item-1', quantity: 1 },
        { cartItemId: 'cart-item-2', quantity: 10 },
        { cartItemId: 'cart-item-abc', quantity: 25 },
        { cartItemId: 'uuid-style-id', quantity: 99 }
      ];

      (mockCartRepository.updateQuantity as any).mockResolvedValue(mockUpdatedCartItem);

      // Act & Assert
      for (const updateData of updateCases) {
        const result = await useCase.execute(updateData);
        expect(result.success).toBe(true);
        expect(result.cartItem).toBeDefined();
        expect(mockCartRepository.updateQuantity).toHaveBeenCalledWith(
          updateData.cartItemId,
          updateData.quantity
        );
      }

      expect(mockCartRepository.updateQuantity).toHaveBeenCalledTimes(updateCases.length);
    });
  });
});
