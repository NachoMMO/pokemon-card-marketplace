export class UserProfile {
  constructor(
    public readonly id: string,
    public userId: string,
    public avatarUrl: string,
    public bio: string,
    public location: string,
    public favoriteCardType: string,
    public tradingPreferences: Record<string, unknown>,
    public isPublic: boolean,
    public allowMessages: boolean,
    public showCollection: boolean,
    public showTradeList: boolean,
    public totalTrades: number,
    public rating: number,
    public ratingCount: number,
    public readonly joinedDate: Date,
    public lastActiveAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
