import { User } from '../../../domain/entities/User';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  confirmPassword?: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface ISupabaseAuthService {
  /**
   * Registra un nuevo usuario
   * @param credentials - Credenciales de registro
   * @returns Respuesta de autenticación
   */
  signUp(credentials: SignUpCredentials): Promise<AuthResponse>;

  /**
   * Inicia sesión con email y contraseña
   * @param credentials - Credenciales de inicio de sesión
   * @returns Respuesta de autenticación
   */
  signIn(credentials: AuthCredentials): Promise<AuthResponse>;

  /**
   * Cierra la sesión del usuario actual
   * @returns true si se cerró sesión correctamente
   */
  signOut(): Promise<boolean>;

  /**
   * Obtiene el usuario autenticado actualmente
   * @returns Usuario autenticado o null
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Envía un email de recuperación de contraseña
   * @param email - Email del usuario
   * @returns true si se envió el email correctamente
   */
  resetPassword(email: string): Promise<boolean>;

  /**
   * Actualiza la contraseña del usuario autenticado
   * @param newPassword - Nueva contraseña
   * @returns true si se actualizó correctamente
   */
  updatePassword(newPassword: string): Promise<boolean>;

  /**
   * Valida un token de reset de contraseña
   * @param token - Token de reset
   * @returns Información de validación del token
   */
  validateResetToken(token: string): Promise<{ isValid: boolean; email?: string }>;

  /**
   * Escucha cambios en el estado de autenticación
   * @param callback - Función que se ejecuta cuando cambia el estado
   */
  onAuthStateChange(callback: (user: User | null) => void): void;

  /**
   * Obtiene el token de acceso del usuario autenticado
   * @returns Token de acceso o null si no hay sesión
   */
  getAccessToken(): Promise<string | null>;

  /**
   * Establece una sesión usando tokens de recuperación
   * @param accessToken - Token de acceso de recuperación
   * @param refreshToken - Token de refresco de recuperación
   * @returns true si se estableció la sesión correctamente
   */
  setSessionFromRecoveryToken?(accessToken: string, refreshToken: string): Promise<boolean>;
}
