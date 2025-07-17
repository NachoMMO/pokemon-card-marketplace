import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProcessCardTransactionUseCase, type TransactionDetails } from '../../../../application/use-cases/transaction/ProcessCardTransactionUseCase';
import type { IDataService } from '../../../../application/ports/services/IDataService';

// Tipos locales para el test
interface Card {
  id: string;
  name: string;
  type: string;
  rarity: string;
  price: number;
}

interface CollectionEntry {
  id: string;
  userId: string;
  cardId: string;
  quantity: number;
  condition: string;
}

interface UserProfile {
  id: string;
  userId: string;
  balance: number;
  firstName: string;
  lastName: string;
}

interface Sale {
  id: string;
  sellerId: string;
  cardId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
}

interface Purchase {
  id: string;
  buyerId: string;
  cardId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  transactionId: string;
}

describe('ProcessCardTransactionUseCase', () => {
  let useCase: ProcessCardTransactionUseCase;
  let mockDataService: any;

  beforeEach(() => {
    mockDataService = {
      getById: vi.fn(),
      getMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      search: vi.fn(),
      rpc: vi.fn()
    };

    useCase = new ProcessCardTransactionUseCase(mockDataService);
  });

  it('should successfully process a card transaction', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'buyer-123',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 2,
      price: 50.00
    };

    const mockCard: Card = {
      id: 'card-789',
      name: 'Charizard',
      type: 'Fire',
      rarity: 'Rare',
      price: 50.00
    };

    const mockSellerCollection: CollectionEntry = {
      id: 'collection-1',
      userId: 'seller-456',
      cardId: 'card-789',
      quantity: 5,
      condition: 'mint'
    };

    const mockBuyerProfile: UserProfile = {
      id: 'profile-1',
      userId: 'buyer-123',
      balance: 500.00,
      firstName: 'John',
      lastName: 'Doe'
    };

    const mockSale: Sale = {
      id: 'sale-1',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 2,
      unitPrice: 50.00,
      totalPrice: 100.00,
      status: 'completed'
    };

    const mockPurchase: Purchase = {
      id: 'purchase-1',
      buyerId: 'buyer-123',
      cardId: 'card-789',
      quantity: 2,
      unitPrice: 50.00,
      totalPrice: 100.00,
      status: 'completed',
      transactionId: 'sale-1'
    };

    // Mock data service calls
    mockDataService.getById.mockResolvedValue({ success: true, data: mockCard });
    mockDataService.getMany
      .mockResolvedValueOnce({ data: [mockSellerCollection] }) // seller collection
      .mockResolvedValueOnce({ data: [mockBuyerProfile] }); // buyer profile
    mockDataService.create
      .mockResolvedValueOnce({ success: true, data: mockSale }) // sale creation
      .mockResolvedValueOnce({ success: true, data: mockPurchase }); // purchase creation

    // Act
    const result = await useCase.execute(transaction);

    // Assert
    expect(result).toEqual({
      sale: mockSale,
      purchase: mockPurchase
    });

    expect(mockDataService.getById).toHaveBeenCalledWith('cards', 'card-789');
    expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
    expect(mockDataService.create).toHaveBeenCalledTimes(2);
  });

  it('should throw error when buyer and seller are the same', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'user-123',
      sellerId: 'user-123',
      cardId: 'card-789',
      quantity: 1,
      price: 50.00
    };

    // Act & Assert
    await expect(useCase.execute(transaction)).rejects.toThrow('Buyer and seller cannot be the same user');

    expect(mockDataService.getById).not.toHaveBeenCalled();
  });

  it('should throw error when card is not found', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'buyer-123',
      sellerId: 'seller-456',
      cardId: 'nonexistent-card',
      quantity: 1,
      price: 50.00
    };

    mockDataService.getById.mockResolvedValue({ success: false, data: null });

    // Act & Assert
    await expect(useCase.execute(transaction)).rejects.toThrow('Card not found');

    expect(mockDataService.getById).toHaveBeenCalledWith('cards', 'nonexistent-card');
    expect(mockDataService.getMany).not.toHaveBeenCalled();
  });

  it('should throw error when seller does not own the card', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'buyer-123',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 1,
      price: 50.00
    };

    const mockCard: Card = {
      id: 'card-789',
      name: 'Charizard',
      type: 'Fire',
      rarity: 'Rare',
      price: 50.00
    };

    mockDataService.getById.mockResolvedValue({ success: true, data: mockCard });
    mockDataService.getMany.mockResolvedValueOnce({ data: [] }); // no cards in seller collection

    // Act & Assert
    await expect(useCase.execute(transaction)).rejects.toThrow('Seller does not own this card');

    expect(mockDataService.getById).toHaveBeenCalledWith('cards', 'card-789');
    expect(mockDataService.getMany).toHaveBeenCalledWith('collections', {
      filters: [
        { column: 'user_id', operator: 'eq', value: 'seller-456' },
        { column: 'card_id', operator: 'eq', value: 'card-789' }
      ],
      limit: 1
    });
  });

  it('should throw error when seller does not have enough cards in stock', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'buyer-123',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 5,
      price: 50.00
    };

    const mockCard: Card = {
      id: 'card-789',
      name: 'Charizard',
      type: 'Fire',
      rarity: 'Rare',
      price: 50.00
    };

    const mockSellerCollection: CollectionEntry = {
      id: 'collection-1',
      userId: 'seller-456',
      cardId: 'card-789',
      quantity: 3, // Only 3 cards, but buyer wants 5
      condition: 'mint'
    };

    mockDataService.getById.mockResolvedValue({ success: true, data: mockCard });
    mockDataService.getMany.mockResolvedValueOnce({ data: [mockSellerCollection] });

    // Act & Assert
    await expect(useCase.execute(transaction)).rejects.toThrow('Seller does not have enough cards in stock');
  });

  it('should throw error when buyer profile is not found', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'nonexistent-buyer',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 1,
      price: 50.00
    };

    const mockCard: Card = {
      id: 'card-789',
      name: 'Charizard',
      type: 'Fire',
      rarity: 'Rare',
      price: 50.00
    };

    const mockSellerCollection: CollectionEntry = {
      id: 'collection-1',
      userId: 'seller-456',
      cardId: 'card-789',
      quantity: 5,
      condition: 'mint'
    };

    mockDataService.getById.mockResolvedValue({ success: true, data: mockCard });
    mockDataService.getMany
      .mockResolvedValueOnce({ data: [mockSellerCollection] }) // seller collection
      .mockResolvedValueOnce({ data: [] }); // buyer profile not found

    // Act & Assert
    await expect(useCase.execute(transaction)).rejects.toThrow('Buyer profile not found');
  });

  it('should throw error when buyer has insufficient balance', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'buyer-123',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 2,
      price: 100.00 // Total: 200.00
    };

    const mockCard: Card = {
      id: 'card-789',
      name: 'Charizard',
      type: 'Fire',
      rarity: 'Rare',
      price: 100.00
    };

    const mockSellerCollection: CollectionEntry = {
      id: 'collection-1',
      userId: 'seller-456',
      cardId: 'card-789',
      quantity: 5,
      condition: 'mint'
    };

    const mockBuyerProfile: UserProfile = {
      id: 'profile-1',
      userId: 'buyer-123',
      balance: 150.00, // Insufficient for 200.00 total
      firstName: 'John',
      lastName: 'Doe'
    };

    mockDataService.getById.mockResolvedValue({ success: true, data: mockCard });
    mockDataService.getMany
      .mockResolvedValueOnce({ data: [mockSellerCollection] })
      .mockResolvedValueOnce({ data: [mockBuyerProfile] });

    // Act & Assert
    await expect(useCase.execute(transaction)).rejects.toThrow('Insufficient balance');
  });

  it('should throw error when sale creation fails', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'buyer-123',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 1,
      price: 50.00
    };

    const mockCard: Card = {
      id: 'card-789',
      name: 'Charizard',
      type: 'Fire',
      rarity: 'Rare',
      price: 50.00
    };

    const mockSellerCollection: CollectionEntry = {
      id: 'collection-1',
      userId: 'seller-456',
      cardId: 'card-789',
      quantity: 5,
      condition: 'mint'
    };

    const mockBuyerProfile: UserProfile = {
      id: 'profile-1',
      userId: 'buyer-123',
      balance: 500.00,
      firstName: 'John',
      lastName: 'Doe'
    };

    mockDataService.getById.mockResolvedValue({ success: true, data: mockCard });
    mockDataService.getMany
      .mockResolvedValueOnce({ data: [mockSellerCollection] })
      .mockResolvedValueOnce({ data: [mockBuyerProfile] });
    mockDataService.create.mockResolvedValueOnce({ success: false, error: 'Database error' });

    // Act & Assert
    await expect(useCase.execute(transaction)).rejects.toThrow('Database error');
  });

  it('should throw error when purchase creation fails', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'buyer-123',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 1,
      price: 50.00
    };

    const mockCard: Card = {
      id: 'card-789',
      name: 'Charizard',
      type: 'Fire',
      rarity: 'Rare',
      price: 50.00
    };

    const mockSellerCollection: CollectionEntry = {
      id: 'collection-1',
      userId: 'seller-456',
      cardId: 'card-789',
      quantity: 5,
      condition: 'mint'
    };

    const mockBuyerProfile: UserProfile = {
      id: 'profile-1',
      userId: 'buyer-123',
      balance: 500.00,
      firstName: 'John',
      lastName: 'Doe'
    };

    const mockSale: Sale = {
      id: 'sale-1',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 1,
      unitPrice: 50.00,
      totalPrice: 50.00,
      status: 'completed'
    };

    mockDataService.getById.mockResolvedValue({ success: true, data: mockCard });
    mockDataService.getMany
      .mockResolvedValueOnce({ data: [mockSellerCollection] })
      .mockResolvedValueOnce({ data: [mockBuyerProfile] });
    mockDataService.create
      .mockResolvedValueOnce({ success: true, data: mockSale }) // sale succeeds
      .mockResolvedValueOnce({ success: false, error: 'Purchase creation failed' }); // purchase fails

    // Act & Assert
    await expect(useCase.execute(transaction)).rejects.toThrow('Purchase creation failed');
  });

  it('should handle transaction with exact balance', async () => {
    // Arrange
    const transaction: TransactionDetails = {
      buyerId: 'buyer-123',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 2,
      price: 25.00 // Total: 50.00
    };

    const mockCard: Card = {
      id: 'card-789',
      name: 'Pikachu',
      type: 'Electric',
      rarity: 'Common',
      price: 25.00
    };

    const mockSellerCollection: CollectionEntry = {
      id: 'collection-1',
      userId: 'seller-456',
      cardId: 'card-789',
      quantity: 2,
      condition: 'near_mint'
    };

    const mockBuyerProfile: UserProfile = {
      id: 'profile-1',
      userId: 'buyer-123',
      balance: 50.00, // Exact balance
      firstName: 'Jane',
      lastName: 'Smith'
    };

    const mockSale: Sale = {
      id: 'sale-2',
      sellerId: 'seller-456',
      cardId: 'card-789',
      quantity: 2,
      unitPrice: 25.00,
      totalPrice: 50.00,
      status: 'completed'
    };

    const mockPurchase: Purchase = {
      id: 'purchase-2',
      buyerId: 'buyer-123',
      cardId: 'card-789',
      quantity: 2,
      unitPrice: 25.00,
      totalPrice: 50.00,
      status: 'completed',
      transactionId: 'sale-2'
    };

    mockDataService.getById.mockResolvedValue({ success: true, data: mockCard });
    mockDataService.getMany
      .mockResolvedValueOnce({ data: [mockSellerCollection] })
      .mockResolvedValueOnce({ data: [mockBuyerProfile] });
    mockDataService.create
      .mockResolvedValueOnce({ success: true, data: mockSale })
      .mockResolvedValueOnce({ success: true, data: mockPurchase });

    // Act
    const result = await useCase.execute(transaction);

    // Assert
    expect(result.sale.totalPrice).toBe(50.00);
    expect(result.purchase.totalPrice).toBe(50.00);
    expect(result.sale.quantity).toBe(2);
    expect(result.purchase.quantity).toBe(2);
  });
});
