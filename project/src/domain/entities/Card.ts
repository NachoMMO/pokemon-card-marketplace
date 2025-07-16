export class Card {
  constructor(
    public readonly id: string,
    public name: string,
    public type: string,
    public rarity: string,
    public expansion: string,
    public price: number,
    public stock: number,
    public imageUrl: string,
    public description: string,
    public sellerId: string,
    public condition: string,
    public cardNumber: string,
    public artist: string,
    public isForSale: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
