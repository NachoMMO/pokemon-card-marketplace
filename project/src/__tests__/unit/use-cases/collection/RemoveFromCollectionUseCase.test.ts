import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RemoveFromCollectionUseCase } from '../../../../application/use-cases/collection/RemoveFromCollectionUseCase';
import type { ICollectionRepository } from '../../../../application/ports/repositories/ICollectionRepository';

// Tipos locales para el test
interface CollectionEntry {
  id: string;
  userId: string;
  cardId: string;
  condition: 'mint' | 'near_mint' | 'excellent' | 'good' | 'lightly_played' | 'moderately_played' | 'heavily_played';
  purchasePrice: number;
  currentMarketValue: number;
  acquiredAt: Date;
}

describe('RemoveFromCollectionUseCase', () => {
  let useCase: RemoveFromCollectionUseCase;
  let mockCollectionRepository: any;

  beforeEach(() => {
    mockCollectionRepository = {
      findByUserIdAndCardId: vi.fn(),
      removeCard: vi.fn(),
      addCard: vi.fn(),
      findByUserId: vi.fn(),
      findById: vi.fn(),
      updateCardCondition: vi.fn(),
      getUserSummary: vi.fn()
    };

    useCase = new RemoveFromCollectionUseCase(mockCollectionRepository);
  });

  it('should successfully remove card from collection', async () => {
    // Arrange
    const userId = 'user-123';
    const cardId = 'card-456';

    const existingEntry: CollectionEntry = {
      id: 'entry-789',
      userId: 'user-123',
      cardId: 'card-456',
      condition: 'mint',
      purchasePrice: 50.00,
      currentMarketValue: 75.00,
      acquiredAt: new Date()
    };

    mockCollectionRepository.findByUserIdAndCardId.mockResolvedValue(existingEntry);
    mockCollectionRepository.removeCard.mockResolvedValue(true);

    // Act
    const result = await useCase.execute(userId, cardId);

    // Assert
    expect(result).toEqual({
      success: true
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).toHaveBeenCalledWith('user-123', 'card-456');
    expect(mockCollectionRepository.removeCard).toHaveBeenCalledWith('entry-789');
  });

  it('should fail when userId is empty', async () => {
    // Act
    const result = await useCase.execute('', 'card-456');

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'ID de usuario es requerido'
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).not.toHaveBeenCalled();
    expect(mockCollectionRepository.removeCard).not.toHaveBeenCalled();
  });

  it('should fail when userId is only whitespace', async () => {
    // Act
    const result = await useCase.execute('   ', 'card-456');

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'ID de usuario es requerido'
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).not.toHaveBeenCalled();
  });

  it('should fail when cardId is empty', async () => {
    // Act
    const result = await useCase.execute('user-123', '');

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'ID de carta es requerido'
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).not.toHaveBeenCalled();
    expect(mockCollectionRepository.removeCard).not.toHaveBeenCalled();
  });

  it('should fail when cardId is only whitespace', async () => {
    // Act
    const result = await useCase.execute('user-123', '   ');

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'ID de carta es requerido'
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).not.toHaveBeenCalled();
  });

  it('should fail when card is not found in collection', async () => {
    // Arrange
    mockCollectionRepository.findByUserIdAndCardId.mockResolvedValue(null);

    // Act
    const result = await useCase.execute('user-123', 'card-nonexistent');

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'La carta no se encuentra en la colección'
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).toHaveBeenCalledWith('user-123', 'card-nonexistent');
    expect(mockCollectionRepository.removeCard).not.toHaveBeenCalled();
  });

  it('should fail when repository removeCard returns false', async () => {
    // Arrange
    const existingEntry: CollectionEntry = {
      id: 'entry-fail',
      userId: 'user-123',
      cardId: 'card-456',
      condition: 'good',
      purchasePrice: 30.00,
      currentMarketValue: 25.00,
      acquiredAt: new Date()
    };

    mockCollectionRepository.findByUserIdAndCardId.mockResolvedValue(existingEntry);
    mockCollectionRepository.removeCard.mockResolvedValue(false);

    // Act
    const result = await useCase.execute('user-123', 'card-456');

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'No se pudo eliminar la carta de la colección'
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).toHaveBeenCalledWith('user-123', 'card-456');
    expect(mockCollectionRepository.removeCard).toHaveBeenCalledWith('entry-fail');
  });

  it('should handle repository findByUserIdAndCardId error gracefully', async () => {
    // Arrange
    const error = new Error('Database connection error');
    mockCollectionRepository.findByUserIdAndCardId.mockRejectedValue(error);

    // Act
    const result = await useCase.execute('user-123', 'card-456');

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Database connection error'
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).toHaveBeenCalledWith('user-123', 'card-456');
    expect(mockCollectionRepository.removeCard).not.toHaveBeenCalled();
  });

  it('should handle repository removeCard error gracefully', async () => {
    // Arrange
    const existingEntry: CollectionEntry = {
      id: 'entry-error',
      userId: 'user-123',
      cardId: 'card-456',
      condition: 'near_mint',
      purchasePrice: 100.00,
      currentMarketValue: 120.00,
      acquiredAt: new Date()
    };

    const removeError = new Error('Remove operation failed');

    mockCollectionRepository.findByUserIdAndCardId.mockResolvedValue(existingEntry);
    mockCollectionRepository.removeCard.mockRejectedValue(removeError);

    // Act
    const result = await useCase.execute('user-123', 'card-456');

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Remove operation failed'
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).toHaveBeenCalledWith('user-123', 'card-456');
    expect(mockCollectionRepository.removeCard).toHaveBeenCalledWith('entry-error');
  });

  it('should handle non-Error exceptions gracefully', async () => {
    // Arrange
    mockCollectionRepository.findByUserIdAndCardId.mockRejectedValue('String error');

    // Act
    const result = await useCase.execute('user-123', 'card-456');

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Error desconocido al eliminar de la colección'
    });

    expect(mockCollectionRepository.findByUserIdAndCardId).toHaveBeenCalledWith('user-123', 'card-456');
  });
});
