import type { ICartRepository } from '../../ports/repositories/ICartRepository';
import type { ICardRepository } from '../../ports/repositories/ICardRepository';
import type { AddToCartDTO, CartItemResponseDTO } from '../../dtos/CartDTO';
import { CartItem } from '../../../domain/entities/CartItem';

export interface IAddToCartUseCase {
  execute(addToCartData: AddToCartDTO): Promise<{
    success: boolean;
    cartItem?: CartItemResponseDTO;
    error?: string;
  }>;
}

export class AddToCartUseCase implements IAddToCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly cardRepository: ICardRepository
  ) {}

  async execute(addToCartData: AddToCartDTO): Promise<{
    success: boolean;
    cartItem?: CartItemResponseDTO;
    error?: string;
  }> {
    try {
      // Verificar que la carta existe
      const card = await this.cardRepository.findById(addToCartData.cardId);
      if (!card) {
        return {
          success: false,
          error: 'La carta no existe'
        };
      }

      // Verificar si ya existe un item en el carrito para esta carta
      const existingItem = await this.cartRepository.findByUserIdAndCardId(
        addToCartData.userId,
        addToCartData.cardId
      );

      if (existingItem) {
        // Si existe, actualizar la cantidad
        const updatedItem = await this.cartRepository.updateQuantity(
          existingItem.id,
          existingItem.quantity + addToCartData.quantity
        );

        return {
          success: true,
          cartItem: {
            id: updatedItem.id,
            userId: updatedItem.userId,
            cardId: updatedItem.cardId,
            quantity: updatedItem.quantity,
            priceAtTime: updatedItem.priceAtTime,
            isActive: updatedItem.isActive,
            reservedUntil: updatedItem.reservedUntil,
            createdAt: updatedItem.createdAt,
            updatedAt: updatedItem.updatedAt,
            card: {
              id: card.id,
              name: card.name,
              imageUrl: card.imageUrl,
              condition: card.condition,
              sellerName: 'Vendedor' // TODO: Obtener nombre del vendedor
            }
          }
        };
      }

      // Si no existe, crear nuevo item
      const reservedUntil = new Date();
      reservedUntil.setHours(reservedUntil.getHours() + 2); // Reservar por 2 horas

      const cartItem = new CartItem(
        crypto.randomUUID(),
        addToCartData.userId,
        addToCartData.cardId,
        addToCartData.quantity,
        addToCartData.priceAtTime,
        true,
        reservedUntil,
        new Date(),
        new Date()
      );

      const createdItem = await this.cartRepository.addItem(cartItem);

      return {
        success: true,
        cartItem: {
          id: createdItem.id,
          userId: createdItem.userId,
          cardId: createdItem.cardId,
          quantity: createdItem.quantity,
          priceAtTime: createdItem.priceAtTime,
          isActive: createdItem.isActive,
          reservedUntil: createdItem.reservedUntil,
          createdAt: createdItem.createdAt,
          updatedAt: createdItem.updatedAt,
          card: {
            id: card.id,
            name: card.name,
            imageUrl: card.imageUrl,
            condition: card.condition,
            sellerName: 'Vendedor' // TODO: Obtener nombre del vendedor
          }
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
