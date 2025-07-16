export class CartItem {
  constructor(
    public readonly id: string,
    public userId: string,
    public cardId: string,
    public quantity: number,
    public priceAtTime: number,
    public isActive: boolean,
    public reservedUntil: Date,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
