import type { IDataService } from '@/application/ports/services/IDataService';
import type { Sale } from '@/domain/entities/Sale';
import type { Purchase } from '@/domain/entities/Purchase';
import type { Card } from '@/domain/entities/Card';
import type { CollectionEntry } from '@/domain/entities/CollectionEntry';
import type { UserProfile } from '@/domain/entities/UserProfile';

export interface TransactionDetails {
  buyerId: string;
  sellerId: string;
  cardId: string;
  quantity: number;
  price: number;
}

export interface IProcessCardTransactionUseCase {
  execute(transaction: TransactionDetails): Promise<{ sale: Sale; purchase: Purchase }>;
}

export class ProcessCardTransactionUseCase implements IProcessCardTransactionUseCase {
  constructor(private dataService: IDataService) {}

  async execute(transaction: TransactionDetails): Promise<{ sale: Sale; purchase: Purchase }> {
    const { buyerId, sellerId, cardId, quantity, price } = transaction;

    // Validate that buyer and seller are different
    if (buyerId === sellerId) {
      throw new Error('Buyer and seller cannot be the same user');
    }

    // Verify card exists
    const cardResult = await this.dataService.getById<Card>('cards', cardId);
    if (!cardResult.success || !cardResult.data) {
      throw new Error('Card not found');
    }

    // Get seller's card collection to verify ownership
    const sellerCards = await this.dataService.getMany<CollectionEntry>('collections', {
      filters: [
        { column: 'user_id', operator: 'eq', value: sellerId },
        { column: 'card_id', operator: 'eq', value: cardId }
      ],
      limit: 1
    });

    if (sellerCards.data.length === 0) {
      throw new Error('Seller does not own this card');
    }

    const sellerCard = sellerCards.data[0];
    if (sellerCard.quantity < quantity) {
      throw new Error('Seller does not have enough cards in stock');
    }

    // Check if buyer has sufficient balance
    const buyerProfile = await this.dataService.getMany<UserProfile>('user_profiles', {
      filters: [{ column: 'user_id', operator: 'eq', value: buyerId }],
      limit: 1
    });

    if (buyerProfile.data.length === 0) {
      throw new Error('Buyer profile not found');
    }

    const totalPrice = price * quantity;
    if (buyerProfile.data[0].balance < totalPrice) {
      throw new Error('Insufficient balance');
    }

    // Create sale record
    const saleResult = await this.dataService.create<Sale>('sales', {
      sellerId: sellerId,
      cardId: cardId,
      quantity: quantity,
      unitPrice: price,
      totalPrice: totalPrice,
      status: 'completed'
    });

    if (!saleResult.success || !saleResult.data) {
      throw new Error(saleResult.error || 'Failed to create sale');
    }

    // Create purchase record
    const purchaseResult = await this.dataService.create<Purchase>('purchases', {
      buyerId: buyerId,
      cardId: cardId,
      quantity: quantity,
      unitPrice: price,
      totalPrice: totalPrice,
      status: 'completed',
      transactionId: saleResult.data.id
    });

    if (!purchaseResult.success || !purchaseResult.data) {
      throw new Error(purchaseResult.error || 'Failed to create purchase');
    }

    return { sale: saleResult.data, purchase: purchaseResult.data };
  }
}
