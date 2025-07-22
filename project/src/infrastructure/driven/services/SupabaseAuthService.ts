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

      // Ensure user session is properly established for RLS policies
      if (data.session) {
        await this.supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });

        // Wait for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 50))
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
      // Usar la URL de redirección completa desde el principio
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('Error específico de Supabase:', error);
        throw new Error(error.message);
      }

      return true;
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
  }  onAuthStateChange(callback: (user: User | null) => void): void {
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

  async validateResetToken(token: string): Promise<{ isValid: boolean; email?: string }> {
    try {
      // En Supabase, podemos verificar el token intentando usarlo para recuperar información de sesión
      // Si el token es válido, nos dará información del usuario
      const { data, error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      });

      if (error || !data.user) {
        return { isValid: false };
      }

      return {
        isValid: true,
        email: data.user.email
      };
    } catch (error) {
      console.error('Error al validar token de recuperación:', error);
      return { isValid: false };
    }
  }

  async setSessionFromRecoveryToken(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error('Error setting recovery session:', error);
        return false;
      }

      return !!data.session;
    } catch (error) {
      console.error('Error al establecer sesión de recuperación:', error);
      return false;
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
