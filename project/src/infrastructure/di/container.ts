// Dependency Injection Container
// Este sistema permite invertir el control de las dependencias
// manteniendo la arquitectura hexagonal limpia

export interface Container {
  get<T>(identifier: string): T
  register<T>(identifier: string, implementation: T): void
}

class DIContainer implements Container {
  private dependencies = new Map<string, any>()

  register<T>(identifier: string, implementation: T): void {
    this.dependencies.set(identifier, implementation)
  }

  get<T>(identifier: string): T {
    const dependency = this.dependencies.get(identifier)
    if (!dependency) {
      throw new Error(`Dependency ${identifier} not found`)
    }
    return dependency
  }
}

// Singleton del contenedor
export const container = new DIContainer()

// Identificadores de dependencias
export const DEPENDENCIES = {
  // Repositories
  USER_REPOSITORY: 'UserRepository',
  CARD_REPOSITORY: 'CardRepository',
  COLLECTION_REPOSITORY: 'CollectionRepository',
  CART_REPOSITORY: 'CartRepository',
  PURCHASE_REPOSITORY: 'PurchaseRepository',
  SALE_REPOSITORY: 'SaleRepository',
  MESSAGE_REPOSITORY: 'MessageRepository',

  // Services
  AUTH_SERVICE: 'AuthService',
  STORAGE_SERVICE: 'StorageService',
  REALTIME_SERVICE: 'RealtimeService',
  NOTIFICATION_SERVICE: 'NotificationService',

  // Use Cases
  USER_REGISTRATION_USE_CASE: 'UserRegistrationUseCase',
  USER_LOGIN_USE_CASE: 'UserLoginUseCase',
  // ... más use cases se añadirán según vayamos implementando features
} as const
