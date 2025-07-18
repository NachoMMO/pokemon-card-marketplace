// Tests unitarios para AddToCartUseCase
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AddToCartUseCase } from '../../../../application/use-cases/cart/AddToCartUseCase';
import type { AddToCartDTO } from '../../../../application/dtos/CartDTO';
import type { ICartRepository } from '../../../../application/ports/repositories/ICartRepository';
import type { ICardRepository } from '../../../../application/ports/repositories/ICardRepository';
import type { Card } from '../../../../domain/entities/Card';
import type { CartItem } from '../../../../domain/entities/CartItem';

describe('AddToCartUseCase', () => {
  let useCase: AddToCartUseCase;
  let mockCartRepository: Partial<ICartRepository>;
  let mockCardRepository: Partial<ICardRepository>;

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
      findById: vi.fn(),
      search: vi.fn(),
      searchMarketplace: vi.fn(),
      countMarketplace: vi.fn(),
      findAll: vi.fn(),
      findBySet: vi.fn(),
      findBySeller: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    useCase = new AddToCartUseCase(
      mockCartRepository as ICartRepository,
      mockCardRepository as ICardRepository
    );
  });

  describe('execute', () => {
    it('should add new item to cart successfully', async () => {
      const addToCartData: AddToCartDTO = {
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 2,
        priceAtTime: 25.99
      };

      const mockCard: Card = {
        id: 'card-456',
        name: 'Pikachu',
        type: 'Electric',
        rarity: 'Rare',
        expansion: 'Base Set',
        price: 25.99,
        stock: 5,
        imageUrl: 'https://example.com/pikachu.jpg',
        description: 'A cute electric Pokémon',
        sellerId: 'seller-1',
        condition: 'Near Mint',
        cardNumber: '025',
        artist: 'Ken Sugimori',
        isForSale: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      const mockCartItem: CartItem = {
        id: 'cart-item-789',
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 2,
        priceAtTime: 25.99,
        isActive: true,
        reservedUntil: new Date('2023-01-01T02:00:00Z'),
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      (mockCardRepository.findById! as any).mockResolvedValue(mockCard);
      (mockCartRepository.findByUserIdAndCardId! as any).mockResolvedValue(null);
      (mockCartRepository.addItem! as any).mockResolvedValue(mockCartItem);

      const result = await useCase.execute(addToCartData);

      expect(result.success).toBe(true);
      expect(result.cartItem).toBeDefined();
      expect(result.cartItem!.id).toBe('cart-item-789');
      expect(result.cartItem!.quantity).toBe(2);
      expect(result.cartItem!.card?.name).toBe('Pikachu');

      expect(mockCardRepository.findById).toHaveBeenCalledWith('card-456');
      expect(mockCartRepository.findByUserIdAndCardId).toHaveBeenCalledWith('user-123', 'card-456');
      expect(mockCartRepository.addItem).toHaveBeenCalled();
    });

    it('should update existing cart item quantity', async () => {
      const addToCartData: AddToCartDTO = {
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 1,
        priceAtTime: 25.99
      };

      const mockCard: Card = {
        id: 'card-456',
        name: 'Pikachu',
        type: 'Electric',
        rarity: 'Rare',
        expansion: 'Base Set',
        price: 25.99,
        stock: 5,
        imageUrl: 'https://example.com/pikachu.jpg',
        description: 'A cute electric Pokémon',
        sellerId: 'seller-1',
        condition: 'Near Mint',
        cardNumber: '025',
        artist: 'Ken Sugimori',
        isForSale: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      const existingCartItem: CartItem = {
        id: 'existing-item-123',
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 2,
        priceAtTime: 25.99,
        isActive: true,
        reservedUntil: new Date('2023-01-01T02:00:00Z'),
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      const updatedCartItem: CartItem = {
        ...existingCartItem,
        quantity: 3, // 2 + 1
        updatedAt: new Date('2023-01-01T01:00:00Z')
      };

      (mockCardRepository.findById! as any).mockResolvedValue(mockCard);
      (mockCartRepository.findByUserIdAndCardId! as any).mockResolvedValue(existingCartItem);
      (mockCartRepository.updateQuantity! as any).mockResolvedValue(updatedCartItem);

      const result = await useCase.execute(addToCartData);

      expect(result.success).toBe(true);
      expect(result.cartItem!.quantity).toBe(3);

      expect(mockCartRepository.updateQuantity).toHaveBeenCalledWith('existing-item-123', 3);
      expect(mockCartRepository.addItem).not.toHaveBeenCalled();
    });

    it('should return error when card does not exist', async () => {
      const addToCartData: AddToCartDTO = {
        userId: 'user-123',
        cardId: 'nonexistent-card',
        quantity: 1,
        priceAtTime: 25.99
      };

      (mockCardRepository.findById! as any).mockResolvedValue(null);

      const result = await useCase.execute(addToCartData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('La carta no existe');
      expect(mockCartRepository.findByUserIdAndCardId).not.toHaveBeenCalled();
      expect(mockCartRepository.addItem).not.toHaveBeenCalled();
    });

    it('should handle card repository errors', async () => {
      const addToCartData: AddToCartDTO = {
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 1,
        priceAtTime: 25.99
      };

      (mockCardRepository.findById! as any).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await useCase.execute(addToCartData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should handle cart repository add errors', async () => {
      const addToCartData: AddToCartDTO = {
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 1,
        priceAtTime: 25.99
      };

      const mockCard: Card = {
        id: 'card-456',
        name: 'Pikachu',
        type: 'Electric',
        rarity: 'Rare',
        expansion: 'Base Set',
        price: 25.99,
        stock: 5,
        imageUrl: 'https://example.com/pikachu.jpg',
        description: 'A cute electric Pokémon',
        sellerId: 'seller-1',
        condition: 'Near Mint',
        cardNumber: '025',
        artist: 'Ken Sugimori',
        isForSale: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      (mockCardRepository.findById! as any).mockResolvedValue(mockCard);
      (mockCartRepository.findByUserIdAndCardId! as any).mockResolvedValue(null);
      (mockCartRepository.addItem! as any).mockRejectedValue(
        new Error('Failed to add item to cart')
      );

      const result = await useCase.execute(addToCartData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to add item to cart');
    });

    it('should handle cart repository update errors', async () => {
      const addToCartData: AddToCartDTO = {
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 1,
        priceAtTime: 25.99
      };

      const mockCard: Card = {
        id: 'card-456',
        name: 'Pikachu',
        type: 'Electric',
        rarity: 'Rare',
        expansion: 'Base Set',
        price: 25.99,
        stock: 5,
        imageUrl: 'https://example.com/pikachu.jpg',
        description: 'A cute electric Pokémon',
        sellerId: 'seller-1',
        condition: 'Near Mint',
        cardNumber: '025',
        artist: 'Ken Sugimori',
        isForSale: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      const existingCartItem: CartItem = {
        id: 'existing-item-123',
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 2,
        priceAtTime: 25.99,
        isActive: true,
        reservedUntil: new Date('2023-01-01T02:00:00Z'),
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      (mockCardRepository.findById! as any).mockResolvedValue(mockCard);
      (mockCartRepository.findByUserIdAndCardId! as any).mockResolvedValue(existingCartItem);
      (mockCartRepository.updateQuantity! as any).mockRejectedValue(
        new Error('Failed to update cart item')
      );

      const result = await useCase.execute(addToCartData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update cart item');
    });

    it('should handle unknown errors', async () => {
      const addToCartData: AddToCartDTO = {
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 1,
        priceAtTime: 25.99
      };

      (mockCardRepository.findById! as any).mockRejectedValue('Unknown error');

      const result = await useCase.execute(addToCartData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido');
    });

    it('should include correct card information in response', async () => {
      const addToCartData: AddToCartDTO = {
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 1,
        priceAtTime: 25.99
      };

      const mockCard: Card = {
        id: 'card-456',
        name: 'Charizard',
        type: 'Fire',
        rarity: 'Holo Rare',
        expansion: 'Base Set',
        price: 350.00,
        stock: 1,
        imageUrl: 'https://example.com/charizard.jpg',
        description: 'A powerful fire Pokémon',
        sellerId: 'seller-2',
        condition: 'Mint',
        cardNumber: '006',
        artist: 'Mitsuhiro Arita',
        isForSale: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      const mockCartItem: CartItem = {
        id: 'cart-item-789',
        userId: 'user-123',
        cardId: 'card-456',
        quantity: 1,
        priceAtTime: 25.99,
        isActive: true,
        reservedUntil: new Date('2023-01-01T02:00:00Z'),
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      };

      (mockCardRepository.findById! as any).mockResolvedValue(mockCard);
      (mockCartRepository.findByUserIdAndCardId! as any).mockResolvedValue(null);
      (mockCartRepository.addItem! as any).mockResolvedValue(mockCartItem);

      const result = await useCase.execute(addToCartData);

      expect(result.success).toBe(true);
      expect(result.cartItem!.card).toEqual({
        id: 'card-456',
        name: 'Charizard',
        imageUrl: 'https://example.com/charizard.jpg',
        condition: 'Mint',
        sellerName: 'Vendedor' // TODO value from implementation
      });
    });
  });
});
