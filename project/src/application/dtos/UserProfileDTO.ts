export interface CreateUserProfileDTO {
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  balance?: number;
}

export interface UpdateUserProfileDTO {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
}

export interface UserProfileResponseDTO {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}
