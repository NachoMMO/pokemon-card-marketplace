import type { ICartRepository } from '../../ports/repositories/ICartRepository';
import type { CartItemResponseDTO } from '../../dtos/CartDTO';

export interface UpdateCartItemDTO {
  cartItemId: string;
  quantity: number;
}

export interface IUpdateCartItemUseCase {
  execute(updateData: UpdateCartItemDTO): Promise<{
    success: boolean;
    cartItem?: CartItemResponseDTO;
    error?: string;
  }>;
}

export class UpdateCartItemUseCase implements IUpdateCartItemUseCase {
  constructor(
    private readonly cartRepository: ICartRepository
  ) {}

  async execute(updateData: UpdateCartItemDTO): Promise<{
    success: boolean;
    cartItem?: CartItemResponseDTO;
    error?: string;
  }> {
    try {
      const { cartItemId, quantity } = updateData;

      // Validaciones
      if (!cartItemId || cartItemId.trim() === '') {
        return {
          success: false,
          error: 'ID del elemento del carrito es requerido'
        };
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return {
          success: false,
          error: 'La cantidad debe ser un número entero mayor a 0'
        };
      }

      if (quantity > 99) {
        return {
          success: false,
          error: 'La cantidad máxima permitida es 99'
        };
      }

      // Actualizar la cantidad del elemento en el carrito
      const updatedCartItem = await this.cartRepository.updateQuantity(cartItemId, quantity);

      const cartItemResponse: CartItemResponseDTO = {
        id: updatedCartItem.id,
        userId: updatedCartItem.userId,
        cardId: updatedCartItem.cardId,
        quantity: updatedCartItem.quantity,
        priceAtTime: updatedCartItem.priceAtTime,
        isActive: updatedCartItem.isActive,
        reservedUntil: updatedCartItem.reservedUntil,
        createdAt: updatedCartItem.createdAt,
        updatedAt: updatedCartItem.updatedAt
      };

      return {
        success: true,
        cartItem: cartItemResponse
      };
    } catch (error) {
      console.error('Error en UpdateCartItemUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar el carrito'
      };
    }
  }
}
