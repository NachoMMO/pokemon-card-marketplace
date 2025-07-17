import { UserProfile } from '../../../domain/entities/UserProfile';

export interface IUserProfileRepository {
  /**
   * Crea un nuevo perfil de usuario
   * @param userProfile - Datos del perfil de usuario
   * @returns Perfil de usuario creado
   */
  create(userProfile: UserProfile): Promise<UserProfile>;

  /**
   * Obtiene un perfil de usuario por su ID
   * @param id - ID del perfil de usuario
   * @returns Perfil de usuario o null si no existe
   */
  findById(id: string): Promise<UserProfile | null>;

  /**
   * Obtiene un perfil de usuario por el ID del usuario de auth
   * @param userId - ID del usuario de Supabase Auth
   * @returns Perfil de usuario o null si no existe
   */
  findByUserId(userId: string): Promise<UserProfile | null>;

  /**
   * Actualiza un perfil de usuario existente
   * @param id - ID del perfil de usuario
   * @param updates - Campos a actualizar
   * @returns Perfil de usuario actualizado
   */
  update(id: string, updates: Partial<UserProfile>): Promise<UserProfile>;

  /**
   * Elimina un perfil de usuario
   * @param id - ID del perfil de usuario
   * @returns true si se eliminó correctamente
   */
  delete(id: string): Promise<boolean>;

  /**
   * Obtiene un perfil de usuario por su nombre de usuario (displayName)
   * @param displayName - Nombre de usuario único
   * @returns Perfil de usuario o null si no existe
   */
  findByDisplayName(displayName: string): Promise<UserProfile | null>;
}
