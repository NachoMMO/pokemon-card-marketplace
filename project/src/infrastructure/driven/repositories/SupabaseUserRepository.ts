import type { SupabaseClient } from '@supabase/supabase-js';
import type { IUserRepository } from '../../../application/ports/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';

export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.auth.admin.getUserById(id);

      if (error || !data.user) {
        return null;
      }

      return new User(
        data.user.id,
        data.user.email || '',
        data.user.email_confirmed_at ? true : false,
        new Date(data.user.created_at),
        new Date(data.user.updated_at || data.user.created_at)
      );
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      // Nota: Supabase no tiene un método directo para buscar por email
      // Esto requeriría permisos de admin o usar RLS apropiadas
      // Por ahora, retornamos null ya que esta funcionalidad es limitada en Supabase
      console.warn('findByEmail no está disponible con la API de Supabase Auth');
      return null;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      return null;
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
}
