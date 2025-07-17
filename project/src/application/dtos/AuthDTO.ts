export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface AuthResponseDTO {
  user: {
    id: string;
    email: string;
    emailConfirmed: boolean;
  } | null;
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    location?: string;
    balance: number;
  } | null;
  error: string | null;
  requiresEmailConfirmation?: boolean;
}
