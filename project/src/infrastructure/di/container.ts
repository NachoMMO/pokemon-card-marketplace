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
  USER_PROFILE_REPOSITORY: 'UserProfileRepository',
  CARD_REPOSITORY: 'CardRepository',
  COLLECTION_REPOSITORY: 'CollectionRepository',
  CART_REPOSITORY: 'CartRepository',
  PURCHASE_REPOSITORY: 'PurchaseRepository',
  SALE_REPOSITORY: 'SaleRepository',
  MESSAGE_REPOSITORY: 'MessageRepository',

  // Services
  SUPABASE_AUTH_SERVICE: 'SupabaseAuthService',
  STORAGE_SERVICE: 'StorageService',
  REALTIME_SERVICE: 'RealtimeService',
  NOTIFICATION_SERVICE: 'NotificationService',
  PAYMENT_SERVICE: 'PaymentService',
  DATA_SERVICE: 'DataService',

  // Use Cases
  CREATE_USER_ACCOUNT_USE_CASE: 'CreateUserAccountUseCase',
  CREATE_USER_PROFILE_USE_CASE: 'CreateUserProfileUseCase',
  COMPLETE_USER_ONBOARDING_USE_CASE: 'CompleteUserOnboardingUseCase',
  LOGIN_USER_USE_CASE: 'LoginUserUseCase',
  LOGOUT_USER_USE_CASE: 'LogoutUserUseCase',
  GET_CURRENT_USER_USE_CASE: 'GetCurrentUserUseCase',

  // Advanced Data Service Use Cases
  SEARCH_CARDS_ADVANCED_USE_CASE: 'SearchCardsAdvancedUseCase',
  GET_DASHBOARD_STATS_USE_CASE: 'GetDashboardStatsUseCase',
  PROCESS_CARD_TRANSACTION_USE_CASE: 'ProcessCardTransactionUseCase',

  // Cart Use Cases
  ADD_TO_CART_USE_CASE: 'AddToCartUseCase',
  REMOVE_FROM_CART_USE_CASE: 'RemoveFromCartUseCase',
  UPDATE_CART_ITEM_USE_CASE: 'UpdateCartItemUseCase',
  GET_CART_USE_CASE: 'GetCartUseCase',
  CLEAR_CART_USE_CASE: 'ClearCartUseCase',

  // Collection Use Cases
  ADD_TO_COLLECTION_USE_CASE: 'AddToCollectionUseCase',
  REMOVE_FROM_COLLECTION_USE_CASE: 'RemoveFromCollectionUseCase',
  GET_USER_COLLECTION_USE_CASE: 'GetUserCollectionUseCase',

  // Card Use Cases
  GET_CARD_DETAILS_USE_CASE: 'GetCardDetailsUseCase',
  SEARCH_CARDS_USE_CASE: 'SearchCardsUseCase',
  GET_CARD_CATALOG_USE_CASE: 'GetCardCatalogUseCase',

  // Services and Helpers
  CACHED_DATA_SERVICE: 'CachedDataService',
  DATA_SERVICE_HELPERS: 'DataServiceHelpers',

  // External dependencies
  SUPABASE_CLIENT: 'SupabaseClient',
} as const
