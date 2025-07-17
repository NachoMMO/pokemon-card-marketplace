import type { ICartRepository } from '../../ports/repositories/ICartRepository';

export interface IRemoveFromCartUseCase {
  execute(cartItemId: string): Promise<{
    success: boolean;
    error?: string;
  }>;
}

export class RemoveFromCartUseCase implements IRemoveFromCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository
  ) {}

  async execute(cartItemId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Validar que el ID no esté vacío
      if (!cartItemId || cartItemId.trim() === '') {
        return {
          success: false,
          error: 'ID del elemento del carrito es requerido'
        };
      }

      // Eliminar el elemento del carrito
      const deleteSuccess = await this.cartRepository.removeItem(cartItemId);

      if (!deleteSuccess) {
        return {
          success: false,
          error: 'No se pudo eliminar el elemento del carrito'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error en RemoveFromCartUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar del carrito'
      };
    }
  }
}
