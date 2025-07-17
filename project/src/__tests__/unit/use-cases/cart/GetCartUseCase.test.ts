import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetCartUseCase } from '../../../../application/use-cases/cart/GetCartUseCase';
import type { ICartRepository } from '../../../../application/ports/repositories/ICartRepository';
import type { ICardRepository } from '../../../../application/ports/repositories/ICardRepository';
import { CartItem } from '../../../../domain/entities/CartItem';
import { Card } from '../../../../domain/entities/Card';

describe('GetCartUseCase', () => {
  let useCase: GetCartUseCase;
  let mockCartRepository: ICartRepository;
  let mockCardRepository: ICardRepository;

  const mockCard: Card = new Card(
    'card-1',
    'Pikachu',
    'Electric',
    'Common',
    'Base Set',
    25.99,
    10,
    'https://example.com/pikachu.jpg',
    'A cute electric mouse Pokémon',
    'seller-1',
    'Near Mint',
    '25/102',
    'Atsuko Nishida',
    true,
    new Date(),
    new Date()
  );

  const mockCartItem: CartItem = new CartItem(
    'cart-item-1',
    'user-1',
    'card-1',
    2,
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

    mockCardRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      search: vi.fn(),
      findBySet: vi.fn(),
      findBySeller: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      searchMarketplace: vi.fn(),
      countMarketplace: vi.fn()
    };

    useCase = new GetCartUseCase(mockCartRepository, mockCardRepository);
  });

  describe('execute', () => {
    it('should get cart successfully with items', async () => {
      // Arrange
      const userId = 'user-1';
      const cartItems = [mockCartItem];

      vi.mocked(mockCartRepository.findByUserId).mockResolvedValue(cartItems);
      vi.mocked(mockCardRepository.findById).mockResolvedValue(mockCard);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.cart).toBeDefined();
      expect(result.cart!.items).toHaveLength(1);
      expect(result.cart!.items[0]).toEqual({
        id: mockCartItem.id,
        userId: mockCartItem.userId,
        cardId: mockCartItem.cardId,
        quantity: mockCartItem.quantity,
        priceAtTime: mockCartItem.priceAtTime,
        isActive: mockCartItem.isActive,
        reservedUntil: mockCartItem.reservedUntil,
        createdAt: mockCartItem.createdAt,
        updatedAt: mockCartItem.updatedAt,
        card: {
          id: mockCard.id,
          name: mockCard.name,
          imageUrl: mockCard.imageUrl,
          condition: mockCard.condition,
          sellerName: mockCard.sellerId
        }
      });
      expect(result.cart!.totalItems).toBe(2); // quantity
      expect(result.cart!.totalPrice).toBe(51.98); // 2 * 25.99
      expect(result.cart!.totalUniqueCards).toBe(1);

      expect(mockCartRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockCardRepository.findById).toHaveBeenCalledWith(mockCartItem.cardId);
    });

    it('should return empty cart when no items found', async () => {
      // Arrange
      const userId = 'user-1';

      vi.mocked(mockCartRepository.findByUserId).mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.cart).toBeDefined();
      expect(result.cart!.items).toHaveLength(0);
      expect(result.cart!.totalItems).toBe(0);
      expect(result.cart!.totalPrice).toBe(0);
      expect(result.cart!.totalUniqueCards).toBe(0);

      expect(mockCartRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockCardRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle missing card data gracefully', async () => {
      // Arrange
      const userId = 'user-1';
      const cartItems = [mockCartItem];

      vi.mocked(mockCartRepository.findByUserId).mockResolvedValue(cartItems);
      vi.mocked(mockCardRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.cart).toBeDefined();
      expect(result.cart!.items).toHaveLength(1);
      expect(result.cart!.items[0].card).toBeUndefined();
      expect(result.cart!.totalItems).toBe(2);
      expect(result.cart!.totalPrice).toBe(51.98);
      expect(result.cart!.totalUniqueCards).toBe(1);
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

      // Null/undefined-like empty string
      result = await useCase.execute('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de usuario es requerido');

      expect(mockCartRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should handle multiple cart items correctly', async () => {
      // Arrange
      const userId = 'user-1';
      const mockCard2 = new Card(
        'card-2',
        'Charizard',
        'Fire',
        'Rare',
        'Base Set',
        199.99,
        5,
        'https://example.com/charizard.jpg',
        'A powerful fire-breathing dragon Pokémon',
        'seller-2',
        'Lightly Played',
        '4/102',
        'Mitsuhiro Arita',
        true,
        new Date(),
        new Date()
      );

      const mockCartItem2 = new CartItem(
        'cart-item-2',
        'user-1',
        'card-2',
        1,
        199.99,
        true,
        new Date(Date.now() + 3600000),
        new Date(),
        new Date()
      );

      const cartItems = [mockCartItem, mockCartItem2];

      vi.mocked(mockCartRepository.findByUserId).mockResolvedValue(cartItems);
      vi.mocked(mockCardRepository.findById)
        .mockResolvedValueOnce(mockCard)
        .mockResolvedValueOnce(mockCard2);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.cart!.items).toHaveLength(2);
      expect(result.cart!.totalItems).toBe(3); // 2 + 1
      expect(result.cart!.totalPrice).toBe(251.97); // (2 * 25.99) + (1 * 199.99)
      expect(result.cart!.totalUniqueCards).toBe(2);
    });

    it('should handle cart repository errors gracefully', async () => {
      // Arrange
      const userId = 'user-1';
      vi.mocked(mockCartRepository.findByUserId).mockRejectedValue(new Error('Database connection error'));

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection error');
      expect(result.cart).toBeUndefined();
    });

    it('should handle card repository errors gracefully', async () => {
      // Arrange
      const userId = 'user-1';
      const cartItems = [mockCartItem];

      vi.mocked(mockCartRepository.findByUserId).mockResolvedValue(cartItems);
      vi.mocked(mockCardRepository.findById).mockRejectedValue(new Error('Card service error'));

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Card service error');
      expect(result.cart).toBeUndefined();
    });

    it('should handle unknown errors', async () => {
      // Arrange
      const userId = 'user-1';
      vi.mocked(mockCartRepository.findByUserId).mockRejectedValue('Unknown error');

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido al obtener el carrito');
      expect(result.cart).toBeUndefined();
    });
  });
});
