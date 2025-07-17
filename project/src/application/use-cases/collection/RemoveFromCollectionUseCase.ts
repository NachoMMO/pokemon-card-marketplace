import type { ICollectionRepository } from '../../ports/repositories/ICollectionRepository';
import type { CollectionEntryResponseDTO } from '../../dtos/CollectionDTO';

export interface IRemoveFromCollectionUseCase {
  execute(userId: string, cardId: string): Promise<{
    success: boolean;
    error?: string;
  }>;
}

export class RemoveFromCollectionUseCase implements IRemoveFromCollectionUseCase {
  constructor(
    private readonly collectionRepository: ICollectionRepository
  ) {}

  async execute(userId: string, cardId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Validaciones
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          error: 'ID de usuario es requerido'
        };
      }

      if (!cardId || cardId.trim() === '') {
        return {
          success: false,
          error: 'ID de carta es requerido'
        };
      }

      // Verificar que el elemento existe en la colección
      const existingEntry = await this.collectionRepository.findByUserIdAndCardId(userId, cardId);
      if (!existingEntry) {
        return {
          success: false,
          error: 'La carta no se encuentra en la colección'
        };
      }

      // Eliminar la entrada de la colección
      const removeSuccess = await this.collectionRepository.removeCard(existingEntry.id);

      if (!removeSuccess) {
        return {
          success: false,
          error: 'No se pudo eliminar la carta de la colección'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error en RemoveFromCollectionUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar de la colección'
      };
    }
  }
}
