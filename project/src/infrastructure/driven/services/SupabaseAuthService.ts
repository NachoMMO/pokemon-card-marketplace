import type { SupabaseClient } from '@supabase/supabase-js';
import type { ISupabaseAuthService, AuthCredentials, SignUpCredentials, AuthResponse } from '../../../application/ports/services/ISupabaseAuthService';
import { User } from '../../../domain/entities/User';

export class SupabaseAuthService implements ISupabaseAuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          user: null,
          error: this.translateAuthError(error.message)
        };
      }

      if (!data.user) {
        return {
          user: null,
          error: 'Error al crear la cuenta'
        };
      }

      return {
        user: new User(
          data.user.id,
          data.user.email || '',
          data.user.email_confirmed_at ? true : false,
          new Date(data.user.created_at),
          new Date(data.user.updated_at || data.user.created_at)
        ),
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async signIn(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          user: null,
          error: this.translateAuthError(error.message)
        };
      }

      if (!data.user) {
        return {
          user: null,
          error: 'Error al iniciar sesión'
        };
      }

      return {
        user: new User(
          data.user.id,
          data.user.email || '',
          data.user.email_confirmed_at ? true : false,
          new Date(data.user.created_at),
          new Date(data.user.updated_at || data.user.created_at)
        ),
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async signOut(): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.signOut();
      return !error;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return new User(
        user.id,
        user.email || '',
        user.email_confirmed_at ? true : false,
        new Date(user.created_at),
        new Date(user.updated_at || user.created_at)
      );
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return !error;
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      return false;
    }
  }

  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      return !error;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      return false;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): void {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = new User(
          session.user.id,
          session.user.email || '',
          session.user.email_confirmed_at ? true : false,
          new Date(session.user.created_at),
          new Date(session.user.updated_at || session.user.created_at)
        );
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      return session.access_token;
    } catch (error) {
      console.error('Error al obtener token de acceso:', error);
      return null;
    }
  }

  private translateAuthError(error: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
      'Email not confirmed': 'Email no confirmado',
      'User not found': 'Usuario no encontrado',
      'Invalid email': 'Email inválido',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Signup requires a valid password': 'El registro requiere una contraseña válida',
      'Unable to validate email address': 'No se puede validar la dirección de email',
      'Email address is invalid': 'La dirección de email es inválida',
      'Password is too weak': 'La contraseña es muy débil',
      'Email rate limit exceeded': 'Límite de emails excedido',
      'User already registered': 'This email is already registered',
    };

    return errorMap[error] || error;
  }
}
