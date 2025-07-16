export class Message {
  constructor(
    public readonly id: string,
    public senderId: string,
    public recipientId: string,
    public subject: string,
    public content: string,
    public isRead: boolean,
    public readAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
