import type { ICartRepository } from '../../ports/repositories/ICartRepository';
import type { ICardRepository } from '../../ports/repositories/ICardRepository';
import type { CartSummaryDTO, CartItemResponseDTO } from '../../dtos/CartDTO';

export interface IGetCartUseCase {
  execute(userId: string): Promise<{
    success: boolean;
    cart?: CartSummaryDTO;
    error?: string;
  }>;
}

export class GetCartUseCase implements IGetCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly cardRepository: ICardRepository
  ) {}

  async execute(userId: string): Promise<{
    success: boolean;
    cart?: CartSummaryDTO;
    error?: string;
  }> {
    try {
      // Validar que el userId no esté vacío
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          error: 'ID de usuario es requerido'
        };
      }

      // Obtener elementos del carrito
      const cartItems = await this.cartRepository.findByUserId(userId);

      // Construir respuesta con información de las cartas
      const itemsWithCardInfo: CartItemResponseDTO[] = [];

      for (const item of cartItems) {
        // Obtener información de la carta
        const card = await this.cardRepository.findById(item.cardId);

        const cartItemResponse: CartItemResponseDTO = {
          id: item.id,
          userId: item.userId,
          cardId: item.cardId,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
          isActive: item.isActive,
          reservedUntil: item.reservedUntil,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          card: card ? {
            id: card.id,
            name: card.name,
            imageUrl: card.imageUrl,
            condition: card.condition,
            sellerName: card.sellerId // Aquí almacenamos el ID del vendedor
          } : undefined
        };

        itemsWithCardInfo.push(cartItemResponse);
      }

      // Calcular totales
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cartItems.reduce((sum, item) => sum + (item.quantity * item.priceAtTime), 0);
      const totalUniqueCards = cartItems.length;

      const cartSummary: CartSummaryDTO = {
        items: itemsWithCardInfo,
        totalItems,
        totalPrice,
        totalUniqueCards
      };

      return {
        success: true,
        cart: cartSummary
      };
    } catch (error) {
      console.error('Error en GetCartUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener el carrito'
      };
    }
  }
}
