import type { ICartRepository } from '../../ports/repositories/ICartRepository';

export interface IClearCartUseCase {
  execute(userId: string): Promise<{
    success: boolean;
    error?: string;
  }>;
}

export class ClearCartUseCase implements IClearCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository
  ) {}

  async execute(userId: string): Promise<{
    success: boolean;
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

      // Limpiar el carrito del usuario
      const clearSuccess = await this.cartRepository.clearCart(userId);

      if (!clearSuccess) {
        return {
          success: false,
          error: 'No se pudo limpiar el carrito'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error en ClearCartUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al limpiar el carrito'
      };
    }
  }
}
