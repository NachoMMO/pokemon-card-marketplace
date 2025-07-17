// Configuración del sistema de dependencias
// Aquí se registran todas las implementaciones concretas

import { container, DEPENDENCIES } from './container'
import { supabase } from '../supabase/client'

// Esta función se llamará al inicializar la aplicación
export function configureDependencies(): void {
  // TODO: Registrar repositories una vez que los implementemos
  // container.register(DEPENDENCIES.USER_REPOSITORY, new SupabaseUserRepository(supabase))

  // TODO: Registrar services una vez que los implementemos
  // container.register(DEPENDENCIES.AUTH_SERVICE, new SupabaseAuthService(supabase))

  // TODO: Registrar use cases una vez que los implementemos
  // container.register(DEPENDENCIES.USER_REGISTRATION_USE_CASE, new UserRegistrationUseCase(...))

  console.log('✅ Dependency injection configured')
}
