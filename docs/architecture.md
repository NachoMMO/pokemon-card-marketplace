# Architecture Document: Pokemon Card Marketplace

## 1. Introduction

This document outlines the architecture for the Pokemon Card Marketplace, a web application for buying and selling Pokemon TCG cards. The architecture is designed to be modular, scalable, and maintainable, following the principles of **Hexagonal Architecture** and a **Test-Driven Development (TDD)** approach.

## 2. Guiding Principles

*   **Separation of Concerns:** The core application logic is independent of external technologies and frameworks.
*   **Testability:** The architecture is designed to be easily testable, with a clear separation between the application's core and its external dependencies.
*   **Scalability:** The architecture allows for easy scaling of individual components as the application grows.
*   **Maintainability:** The modular design makes it easy to understand, modify, and extend the application.

## 3. Hexagonal Architecture Overview

The Hexagonal Architecture (also known as Ports and Adapters) is an architectural pattern that isolates the core application logic from external concerns such as databases, user interfaces, and third-party services.

The architecture is divided into three main parts:

*   **Inside (The Hexagon):** This is the core of the application, containing the domain logic and business rules. It is completely independent of any external technology.
*   **Ports:** These are the interfaces that define how the outside world can interact with the application. There are two types of ports:
    *   **Driving Ports (Inbound):** These are the entry points to the application, such as a REST API or a message queue.
    *   **Driven Ports (Outbound):** These are the exit points from the application, such as a database or a third-party service.
*   **Adapters:** These are the implementations of the ports. They are responsible for translating between the application's core and the external technologies.

![Hexagonal Architecture](https.res.cloudinary.com/practicaldev/image/fetch/s--xG0D0c2k--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https.dev-to-uploads.s3.amazonaws.com/uploads/articles/y63ie6e1ylsk5629g2fk.png)

## 4. Application Layers

The application is structured into the following layers, which correspond to the Hexagonal Architecture pattern:

### 4.1. Domain Layer (The Hexagon)

This is the heart of the application. It contains the core business logic, entities, and use cases. It has no dependencies on any other layer.

*   **Entities:** These are the core business objects of the application, such as `User`, `Card`, and `Purchase`. They are defined in the `docs/entities` directory.
*   **Use Cases (Interactors):** These are the application-specific business rules. They orchestrate the flow of data between the entities and the outside world. Each use case corresponds to a feature defined in the `docs/features` directory.

### 4.2. Application Layer (Ports)

This layer defines the interfaces (ports) that the application uses to interact with the outside world. **Ports are pure interfaces/contracts with no implementation.**

*   **Driving Ports (Inbound):** These are **interfaces** that define how external actors can invoke application use cases. For example:
    *   `CreateUserUseCase` interface - defines the contract for user creation
    *   `AuthenticateUserUseCase` interface - defines the contract for user authentication
    *   These ports are **implemented by use cases** in the domain layer.

*   **Driven Ports (Outbound):** These are **interfaces** that define how the application interacts with external services, **implemented by adapters** in the infrastructure layer. For example:
    *   `UserRepository` interface - defines storage contracts
    *   `EmailService` interface - defines notification contracts
    *   `FileStorageService` interface - defines file management contracts

### 4.3. Infrastructure Layer (Adapters)

This layer contains the **concrete implementations** of the ports defined in the application layer. **Adapters translate between the domain and external technologies.**

*   **Driving Adapters (Inbound):** These are the **concrete implementations** that receive external requests and invoke the appropriate use cases:
    *   **REST API Controllers** (implemented with Supabase Edge Functions)
    *   **GraphQL Resolvers** (if applicable)
    *   **CLI Commands** (for administrative tasks)
    *   **Message Queue Consumers** (for async processing)

*   **Driven Adapters (Outbound):** These are the **concrete implementations** of outbound ports:
    *   **PostgreSQL Repository Implementation** (using Supabase client)
    *   **Supabase Auth Adapter** (implements authentication contracts)
    *   **Supabase Storage Adapter** (implements file storage contracts)
    *   **Email Service Adapter** (implements notification contracts)
    *   **Supabase Realtime Adapter** (implements real-time communication contracts)

## 5. Technology Stack

*   **Frontend:** Vue 3 with Composition API (Hexagonal Architecture)
*   **External Backend:** Supabase (Database + Edge Functions + Auth + Realtime + Storage)
*   **Testing:** Vitest for unit/integration tests, Playwright for E2E tests

## 5.1. Frontend Architecture with Vue 3

The application will be built as a **Vue 3 Single Page Application (SPA)** that implements **Hexagonal Architecture** internally, with **Supabase** serving as the external backend infrastructure.

### 5.1.1. Vue 3's Role in the Hexagonal Architecture

The Vue 3 application **IS** the hexagonal architecture implementation. The entire business logic, domain rules, and application use cases reside within the Vue 3 application:

*   **Domain Layer (The Hexagon):** Pure business logic implemented with TypeScript classes and functions
*   **Application Layer (Ports):** Interfaces that define contracts for external services
*   **Infrastructure Layer (Adapters):** Concrete implementations that communicate with Supabase

### 5.1.2. Communication with External Services

The Vue 3 application communicates with external services through well-defined adapters:

*   **Supabase Database:** Through Repository pattern implementations
*   **Supabase Auth:** Through Authentication service adapters
*   **Supabase Storage:** Through File storage adapters
*   **Supabase Realtime:** Through Real-time communication adapters

### 5.1.3. Vue 3 Hexagonal Architecture Integration

The frontend implements hexagonal architecture using Vue 3 ecosystem:

*   **Domain Layer:** TypeScript entities and use cases (framework-agnostic)
*   **Application Layer:** Port interfaces and DTOs
*   **Infrastructure Layer:** Vue composables, Pinia stores, and service implementations
*   **Presentation Layer:** Vue components that consume the domain through ports


## 6. Test-Driven Development (TDD) Strategy per Layer

The project will follow a **layer-specific TDD approach** that respects the hexagonal architecture:

### 6.1. Domain Layer Testing (Pure Unit Tests)
1.  **Entity Tests:** Test business rules and invariants in isolation
2.  **Use Case Tests:** Test business logic with **mocked ports** (no external dependencies)
3.  **TDD Cycle:** Red → Green → Refactor with **no I/O operations**

### 6.2. Application Layer Testing (Contract Tests)
1.  **Port Interface Tests:** Verify that contracts are properly defined
2.  **Integration Tests:** Test use cases with **real adapters** but controlled environments
3.  **TDD Cycle:** Focus on **interface contracts** and **data flow**

### 6.3. Infrastructure Layer Testing (Adapter Tests)
1.  **Adapter Unit Tests:** Test each adapter implementation in isolation
2.  **Integration Tests:** Test adapters against **real external services** (test databases, etc.)
3.  **End-to-End Tests:** Test complete flows through all layers

### 6.4. TDD Testing Strategy
- **Test Pyramid Distribution:**
  - 70% Domain Layer (fast unit tests)
  - 20% Application Layer (integration tests)
  - 10% Infrastructure Layer (E2E tests)
- **Test Isolation:** Each layer tested independently with appropriate mocking strategies
- **Dependency Direction:** Tests follow the same dependency rule as the architecture (inward)

## 7. Directory Structure (Hexagonal Architecture Compliant)

### 7.1. Vue 3 Application Structure (Hexagonal Architecture)

```
├── docs/                          # Architecture documentation
│   ├── architecture.md
│   ├── entities/                  # Domain model definitions
│   ├── features/                  # Use case specifications
│   └── views/                     # UI contracts
├── public/                        # Static assets
├── src/
│   ├── main.ts                    # Application entry point
│   ├── App.vue                    # Root component
│   ├── domain/                    # THE HEXAGON (pure business logic)
│   │   ├── entities/              # Business entities with rules
│   │   │   ├── User.ts            # User entity
│   │   │   ├── Card.ts            # Card entity
│   │   │   ├── Purchase.ts        # Purchase entity
│   │   │   └── index.ts           # Entity exports
│   │   ├── use-cases/             # Application-specific business rules
│   │   │   ├── user/              # User-related use cases
│   │   │   │   ├── CreateUser.ts
│   │   │   │   ├── AuthenticateUser.ts
│   │   │   │   └── UpdateUserProfile.ts
│   │   │   ├── card/              # Card-related use cases
│   │   │   │   ├── SearchCards.ts
│   │   │   │   ├── AddCardToCart.ts
│   │   │   │   └── PurchaseCards.ts
│   │   │   └── purchase/          # Purchase-related use cases
│   │   │       ├── CreatePurchase.ts
│   │   │       └── GetPurchaseHistory.ts
│   │   └── shared/                # Shared domain concepts
│   │       ├── ValueObjects.ts    # Value objects
│   │       └── DomainEvents.ts    # Domain events
│   ├── application/               # PORTS (interfaces/contracts)
│   │   ├── ports/
│   │   │   ├── driving/           # Inbound port interfaces
│   │   │   │   ├── use-cases/     # Use case interfaces
│   │   │   │   │   ├── ICreateUser.ts
│   │   │   │   │   ├── ISearchCards.ts
│   │   │   │   │   └── IPurchaseCards.ts
│   │   │   │   └── queries/       # Query interfaces
│   │   │   │       ├── IUserQueries.ts
│   │   │   │       └── ICardQueries.ts
│   │   │   └── driven/            # Outbound port interfaces
│   │   │       ├── repositories/  # Storage contracts
│   │   │       │   ├── IUserRepository.ts
│   │   │       │   ├── ICardRepository.ts
│   │   │       │   └── IPurchaseRepository.ts
│   │   │       ├── services/      # External service contracts
│   │   │       │   ├── IAuthService.ts
│   │   │       │   ├── IStorageService.ts
│   │   │       │   └── INotificationService.ts
│   │   │       └── events/        # Event publishing contracts
│   │   │           └── IEventPublisher.ts
│   │   └── dto/                   # Data transfer objects
│   │       ├── UserDTO.ts
│   │       ├── CardDTO.ts
│   │       └── PurchaseDTO.ts
│   ├── infrastructure/            # ADAPTERS (implementations)
│   │   ├── driving/               # Inbound adapters
│   │   │   ├── vue/               # Vue-specific adapters
│   │   │   │   ├── composables/   # Vue composables
│   │   │   │   │   ├── useAuth.ts
│   │   │   │   │   ├── useCards.ts
│   │   │   │   │   └── useCart.ts
│   │   │   │   └── stores/        # Pinia stores
│   │   │   │       ├── auth.ts
│   │   │   │       ├── cards.ts
│   │   │   │       └── cart.ts
│   │   │   └── router/            # Vue Router setup
│   │   │       ├── index.ts
│   │   │       └── guards.ts
│   │   ├── driven/                # Outbound adapters
│   │   │   ├── repositories/      # Repository implementations
│   │   │   │   ├── SupabaseUserRepository.ts
│   │   │   │   ├── SupabaseCardRepository.ts
│   │   │   │   └── SupabasePurchaseRepository.ts
│   │   │   ├── services/          # Service implementations
│   │   │   │   ├── SupabaseAuthService.ts
│   │   │   │   ├── SupabaseStorageService.ts
│   │   │   │   └── SupabaseRealtimeService.ts
│   │   │   └── api/               # API client configurations
│   │   │       ├── supabase.ts    # Supabase client setup
│   │   │       └── interceptors.ts
│   │   └── shared/                # Shared infrastructure utilities
│   │       ├── mappers/           # Data mappers
│   │       ├── validators/        # Input validators
│   │       └── utils/             # Utility functions
│   ├── presentation/              # PRESENTATION LAYER
│   │   ├── components/            # Reusable UI components
│   │   │   ├── common/            # Generic components
│   │   │   ├── forms/             # Form components
│   │   │   ├── cards/             # Card-related components
│   │   │   └── layout/            # Layout components
│   │   ├── views/                 # Page components (routes)
│   │   │   ├── auth/              # Authentication pages
│   │   │   ├── cards/             # Card-related pages
│   │   │   ├── profile/           # User profile pages
│   │   │   └── marketplace/       # Marketplace pages
│   │   ├── styles/                # Styling
│   │   │   ├── globals.css
│   │   │   └── components/
│   │   └── assets/                # Static assets
│   └── types/                     # Global TypeScript definitions
│       ├── global.types.ts
│       └── supabase.types.ts
├── tests/
│   ├── unit/                      # Domain layer tests (pure)
│   │   ├── entities/              # Entity business rule tests
│   │   └── use-cases/             # Use case logic tests
│   ├── integration/               # Application layer tests
│   │   ├── composables/           # Composable integration tests
│   │   └── repositories/          # Repository integration tests
│   └── e2e/                       # End-to-end tests
│       ├── auth/                  # Authentication flows
│       └── marketplace/           # Marketplace flows
├── package.json
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── vitest.config.ts               # Testing configuration
└── .env.example                   # Environment variables template
```

## 8. Vue 3 Integration with Hexagonal Architecture

### 8.1. Frontend as Hexagonal Application
**The Vue 3 application IS the hexagonal architecture implementation:**
- All business logic, entities, and use cases reside within the Vue 3 app
- Supabase serves as external infrastructure (database, auth, storage)
- The application follows strict hexagonal architecture principles

### 8.2. Hexagonal Architecture Layers in Vue 3

**Domain Layer (The Hexagon):**
- Pure TypeScript entities with business rules
- Use cases that orchestrate business operations
- No dependencies on Vue, Supabase, or any external framework

**Application Layer (Ports):**
- Interfaces that define contracts for external services
- DTOs for data transfer between layers
- Port interfaces for repositories, services, and events

**Infrastructure Layer (Adapters):**
- Concrete implementations of port interfaces
- Supabase repository implementations
- Vue-specific adapters (composables, stores)
- API client configurations

**Presentation Layer (Vue Components):**
- Vue components that consume domain logic through ports
- UI state management with reactive properties
- User interaction handling

### 8.3. Implementation Strategy

**Domain Layer Implementation:**
```typescript
// domain/entities/User.ts
export class User {
  constructor(
    private readonly id: string,
    private readonly email: string,
    private readonly username: string,
    private balance: number
  ) {}

  public canPurchase(amount: number): boolean {
    return this.balance >= amount;
  }

  public deductBalance(amount: number): void {
    if (!this.canPurchase(amount)) {
      throw new Error('Insufficient balance');
    }
    this.balance -= amount;
  }
}

// domain/use-cases/user/CreateUser.ts
export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(userData: CreateUserDTO): Promise<User> {
    // Pure business logic without external dependencies
  }
}
```

**Application Layer (Ports):**
```typescript
// application/ports/driven/repositories/IUserRepository.ts
export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

// application/ports/driven/services/IAuthService.ts
export interface IAuthService {
  signUp(email: string, password: string): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
}
```

**Infrastructure Layer (Adapters):**
```typescript
// infrastructure/driven/repositories/SupabaseUserRepository.ts
export class SupabaseUserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(user: User): Promise<void> {
    // Supabase-specific implementation
  }
}

// infrastructure/driving/vue/composables/useAuth.ts
export function useAuth() {
  const authService = inject<IAuthService>('authService')!
  const createUserUseCase = inject<CreateUserUseCase>('createUserUseCase')!
  
  const signUp = async (userData: CreateUserDTO) => {
    return await createUserUseCase.execute(userData);
  }
  
  return { signUp }
}
```

### 8.4. Dependency Injection in Vue 3

**Setup in main.ts:**
```typescript
// main.ts
import { createApp } from 'vue'
import { createSupabaseClient } from './infrastructure/api/supabase'

const app = createApp(App)

// Setup dependency injection
const supabase = createSupabaseClient()
const userRepository = new SupabaseUserRepository(supabase)
const authService = new SupabaseAuthService(supabase)
const createUserUseCase = new CreateUserUseCase(userRepository, authService)

app.provide('userRepository', userRepository)
app.provide('authService', authService)
app.provide('createUserUseCase', createUserUseCase)

app.mount('#app')
```

## 9. Dependency Rule and Technology Abstraction

### 9.1. Strict Dependency Rule
**All dependencies point inward toward the domain:**
- Infrastructure layer depends on Application layer
- Application layer depends on Domain layer  
- Domain layer depends on **nothing external**

### 9.2. Technology Independence
**The domain must remain technology-agnostic:**
- No Supabase-specific code in domain or application layers
- All external technology interactions through **port interfaces**
- Easy substitution of Supabase with other technologies if needed

### 9.3. Interface Segregation
**Each port interface should be:**
- **Single responsibility:** Each interface serves one specific purpose
- **Minimal:** Contains only the methods actually needed
- **Stable:** Changes to implementations don't affect domain logic

## 10. Implementation Guidelines

### 10.1. Development Workflow
1. **Start with Domain:** Always implement entities and use cases first
2. **Define Ports:** Create interfaces for external dependencies
3. **Test-First:** Write tests before implementations
4. **Implement Adapters:** Create concrete implementations last

## 11. Conclusion

This **corrected architecture** now properly implements Hexagonal Architecture principles with a robust TDD strategy:

**Key Improvements Made:**
- **Clear Port/Adapter Separation:** Interfaces vs implementations properly distinguished
- **Technology Independence:** Domain layer completely isolated from external dependencies  
- **Layer-Specific TDD:** Testing strategy tailored to each architectural layer
- **Proper Dependency Flow:** All dependencies point inward toward the domain
- **Comprehensive Structure:** Directory organization reflects hexagonal principles

This architecture provides a **technically sound foundation** for building a robust, scalable, and maintainable Pokemon Card Marketplace while adhering to **true hexagonal architecture** and **disciplined TDD practices**.
