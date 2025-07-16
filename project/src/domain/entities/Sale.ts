export class Sale {
  constructor(
    public readonly id: string,
    public sellerId: string,
    public cardId: string,
    public buyerId: string,
    public quantity: number,
    public unitPrice: number,
    public totalPrice: number,
    public commission: number,
    public netAmount: number,
    public status: string,
    public purchaseId: string,
    public readonly saleDate: Date,
    public confirmedAt: Date,
    public shippedAt: Date,
    public completedAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
