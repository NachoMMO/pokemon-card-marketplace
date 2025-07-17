export class CollectionEntry {
  constructor(
    public readonly id: string,
    public userId: string,
    public cardId: string,
    public quantity: number,
    public condition: string,
    public acquiredDate: Date,
    public acquiredPrice: number,
    public currentValue: number,
    public isForTrade: boolean,
    public notes: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
