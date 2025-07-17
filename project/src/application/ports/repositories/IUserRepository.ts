import { User } from '../../../domain/entities/User';

export interface IUserRepository {
  /**
   * Obtiene un usuario por su ID de Supabase Auth
   * @param id - ID del usuario en Supabase Auth
   * @returns Usuario o null si no existe
   */
  findById(id: string): Promise<User | null>;

  /**
   * Obtiene un usuario por su email
   * @param email - Email del usuario
   * @returns Usuario o null si no existe
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Obtiene el usuario autenticado actualmente
   * @returns Usuario autenticado o null si no hay sesión
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Escucha cambios en el estado de autenticación
   * @param callback - Función que se ejecuta cuando cambia el estado de autenticación
   */
  onAuthStateChange(callback: (user: User | null) => void): void;
}
