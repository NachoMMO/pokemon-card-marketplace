export interface SendMessageDTO {
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  relatedPurchaseId?: string;
  relatedSaleId?: string;
}

export interface MessageResponseDTO {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  isRead: boolean;
  relatedPurchaseId?: string;
  relatedSaleId?: string;
  sentAt: Date;
  readAt?: Date;
  // Información adicional incluida
  sender?: {
    displayName: string;
    avatarUrl?: string;
  };
  receiver?: {
    displayName: string;
    avatarUrl?: string;
  };
}

export interface ConversationDTO {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: MessageResponseDTO;
  unreadCount: number;
  totalMessages: number;
}

export interface MessageListDTO {
  messages: MessageResponseDTO[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
