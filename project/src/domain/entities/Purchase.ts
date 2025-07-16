export class Purchase {
  constructor(
    public readonly id: string,
    public buyerId: string,
    public cardId: string,
    public quantity: number,
    public unitPrice: number,
    public totalPrice: number,
    public status: string,
    public transactionId: string,
    public readonly purchaseDate: Date,
    public confirmedAt: Date,
    public shippedAt: Date,
    public deliveredAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
