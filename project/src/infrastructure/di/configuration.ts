// Configuración del sistema de dependencias
// Aquí se registran todas las implementaciones concretas

import { container, DEPENDENCIES } from './container';
import { supabase } from '../supabase/client';

// Importar las implementaciones
import {
  SupabaseUserRepository,
  SupabaseUserProfileRepository,
  SupabaseCardRepository,
  SupabaseCollectionRepository,
  SupabaseCartRepository,
  SupabasePurchaseRepository,
  SupabaseSaleRepository,
  SupabaseMessageRepository
} from '../driven/repositories';
import {
  SupabaseAuthService,
  SupabaseStorageService,
  SupabaseRealtimeService,
  SupabaseNotificationService,
  SupabasePaymentService,
  SupabaseDataService
} from '../driven/services';
import { CachedDataService } from '../../application/services/CachedDataService';
import { DataServiceHelpers } from '../driven/services/helpers/DataServiceHelpers';
import {
  CreateUserAccountUseCase,
  CreateUserProfileUseCase,
  LoginUserUseCase,
  LogoutUserUseCase,
  GetCurrentUserUseCase,
  AddToCartUseCase,
  AddToCollectionUseCase,
  SearchCardsAdvancedUseCase,
  GetDashboardStatsUseCase,
  ProcessCardTransactionUseCase,
  RequestPasswordResetUseCase,
  ValidateResetTokenUseCase
} from '../../application/use-cases';
import { ResetPasswordUseCase } from '../../domain/use-cases/ResetPasswordUseCase';
import { CompleteUserOnboardingUseCase } from '../../application/use-cases/CompleteUserOnboardingUseCase';
import type { ISupabaseAuthService, IDataService } from '../../application/ports/services';
import type {
  IUserProfileRepository,
  ICartRepository,
  ICollectionRepository,
  ICardRepository
} from '../../application/ports/repositories';

// Esta función se llamará al inicializar la aplicación
export function configureDependencies(): void {
  // Registrar cliente de Supabase
  container.register(DEPENDENCIES.SUPABASE_CLIENT, supabase);

  // Registrar repositories
  container.register(DEPENDENCIES.USER_REPOSITORY, new SupabaseUserRepository(supabase));
  container.register(DEPENDENCIES.USER_PROFILE_REPOSITORY, new SupabaseUserProfileRepository(supabase));
  container.register(DEPENDENCIES.CARD_REPOSITORY, new SupabaseCardRepository(supabase));
  container.register(DEPENDENCIES.COLLECTION_REPOSITORY, new SupabaseCollectionRepository(supabase));
  container.register(DEPENDENCIES.CART_REPOSITORY, new SupabaseCartRepository(supabase));
  container.register(DEPENDENCIES.PURCHASE_REPOSITORY, new SupabasePurchaseRepository(supabase));
  container.register(DEPENDENCIES.SALE_REPOSITORY, new SupabaseSaleRepository(supabase));
  container.register(DEPENDENCIES.MESSAGE_REPOSITORY, new SupabaseMessageRepository(supabase));

  // Registrar services
  container.register(DEPENDENCIES.SUPABASE_AUTH_SERVICE, new SupabaseAuthService(supabase));
  container.register(DEPENDENCIES.STORAGE_SERVICE, new SupabaseStorageService(supabase));
  container.register(DEPENDENCIES.REALTIME_SERVICE, new SupabaseRealtimeService(supabase));
  container.register(DEPENDENCIES.NOTIFICATION_SERVICE, new SupabaseNotificationService(supabase));
  container.register(DEPENDENCIES.PAYMENT_SERVICE, new SupabasePaymentService(supabase));

  // Crear DataService base y envuelto con cache
  const baseDataService = new SupabaseDataService(supabase);
  const cachedDataService = new CachedDataService(baseDataService);
  container.register(DEPENDENCIES.DATA_SERVICE, cachedDataService);
  container.register(DEPENDENCIES.CACHED_DATA_SERVICE, cachedDataService);

  // Registrar helpers
  container.register(DEPENDENCIES.DATA_SERVICE_HELPERS, DataServiceHelpers);

  // Registrar use cases
  const authService = container.get<ISupabaseAuthService>(DEPENDENCIES.SUPABASE_AUTH_SERVICE);
  const userProfileRepository = container.get<IUserProfileRepository>(DEPENDENCIES.USER_PROFILE_REPOSITORY);
  const userRepository = container.get<any>(DEPENDENCIES.USER_REPOSITORY);
  const cartRepository = container.get<ICartRepository>(DEPENDENCIES.CART_REPOSITORY);
  const collectionRepository = container.get<ICollectionRepository>(DEPENDENCIES.COLLECTION_REPOSITORY);
  const cardRepository = container.get<ICardRepository>(DEPENDENCIES.CARD_REPOSITORY);
  const dataService = container.get<IDataService>(DEPENDENCIES.DATA_SERVICE);

  container.register(
    DEPENDENCIES.CREATE_USER_ACCOUNT_USE_CASE,
    new CreateUserAccountUseCase(authService, userRepository, userProfileRepository)
  );

  container.register(
    DEPENDENCIES.CREATE_USER_PROFILE_USE_CASE,
    new CreateUserProfileUseCase(dataService)
  );

  container.register(
    DEPENDENCIES.LOGIN_USER_USE_CASE,
    new LoginUserUseCase(authService, userProfileRepository)
  );

  container.register(
    DEPENDENCIES.LOGOUT_USER_USE_CASE,
    new LogoutUserUseCase(authService)
  );

  container.register(
    DEPENDENCIES.GET_CURRENT_USER_USE_CASE,
    new GetCurrentUserUseCase(authService, userProfileRepository)
  );

  container.register(
    DEPENDENCIES.COMPLETE_USER_ONBOARDING_USE_CASE,
    new CompleteUserOnboardingUseCase(authService, userProfileRepository)
  );

  container.register(
    DEPENDENCIES.ADD_TO_CART_USE_CASE,
    new AddToCartUseCase(cartRepository, cardRepository)
  );

  container.register(
    DEPENDENCIES.ADD_TO_COLLECTION_USE_CASE,
    new AddToCollectionUseCase(collectionRepository, cardRepository)
  );

  // Registrar casos de uso avanzados con DataService
  container.register(
    DEPENDENCIES.SEARCH_CARDS_ADVANCED_USE_CASE,
    new SearchCardsAdvancedUseCase(dataService)
  );

  container.register(
    DEPENDENCIES.GET_DASHBOARD_STATS_USE_CASE,
    new GetDashboardStatsUseCase(dataService)
  );

  container.register(
    DEPENDENCIES.PROCESS_CARD_TRANSACTION_USE_CASE,
    new ProcessCardTransactionUseCase(dataService)
  );

  // Registrar use cases de password recovery
  container.register(
    DEPENDENCIES.REQUEST_PASSWORD_RESET_USE_CASE,
    new RequestPasswordResetUseCase(authService)
  );

  container.register(
    DEPENDENCIES.RESET_PASSWORD_USE_CASE,
    new ResetPasswordUseCase(authService)
  );

  container.register(
    DEPENDENCIES.VALIDATE_RESET_TOKEN_USE_CASE,
    new ValidateResetTokenUseCase(authService)
  );

  console.log('✅ Dependency injection configured');
}
