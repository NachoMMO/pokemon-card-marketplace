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

*   **Frontend:** Astro with Vue.js components
*   **Backend:** Supabase (Database + Edge Functions + Auth + Realtime + Storage)
*   **Testing:** Vitest for unit/integration tests, Playwright for E2E tests

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

```
├── docs/                          # Architecture documentation
│   ├── architecture.md
│   ├── entities/                  # Domain model definitions
│   ├── features/                  # Use case specifications
│   └── views/                     # UI contracts
├── src/
│   ├── domain/                    # THE HEXAGON (pure business logic)
│   │   ├── entities/              # Business entities with rules
│   │   ├── use-cases/             # Application-specific business rules
│   │   │   ├── user/              # User-related use cases
│   │   │   ├── card/              # Card-related use cases
│   │   │   └── purchase/          # Purchase-related use cases
│   │   └── shared/                # Shared domain concepts
│   ├── application/               # PORTS (interfaces/contracts)
│   │   ├── ports/
│   │   │   ├── driving/           # Inbound port interfaces
│   │   │   │   ├── use-cases/     # Use case interfaces
│   │   │   │   └── queries/       # Query interfaces
│   │   │   └── driven/            # Outbound port interfaces
│   │   │       ├── repositories/  # Storage contracts
│   │   │       ├── services/      # External service contracts
│   │   │       └── events/        # Event publishing contracts
│   │   └── dto/                   # Data transfer objects
│   └── infrastructure/            # ADAPTERS (implementations)
│       ├── driving/               # Inbound adapters
│       │   ├── api/               # REST API (Supabase Edge Functions)
│       │   ├── graphql/           # GraphQL resolvers (if needed)
│       │   └── cli/               # CLI commands
│       ├── driven/                # Outbound adapters
│       │   ├── database/          # Database implementations
│       │   │   ├── supabase/      # Supabase-specific implementations
│       │   │   └── repositories/  # Repository implementations
│       │   ├── auth/              # Authentication adapters
│       │   ├── storage/           # File storage adapters
│       │   ├── email/             # Email service adapters
│       │   └── events/            # Event publishing adapters
│       └── shared/                # Shared infrastructure utilities
└── tests/
    ├── unit/                      # Domain layer tests (pure)
    │   ├── entities/              # Entity business rule tests
    │   └── use-cases/             # Use case logic tests
    ├── integration/               # Application layer tests
    │   ├── use-cases/             # Use cases with real adapters
    │   └── repositories/          # Repository integration tests
    └── e2e/                       # Infrastructure layer tests
        ├── api/                   # End-to-end API tests
        └── flows/                 # Complete user flow tests
```

## 8. Dependency Rule and Technology Abstraction

### 8.1. Strict Dependency Rule
**All dependencies point inward toward the domain:**
- Infrastructure layer depends on Application layer
- Application layer depends on Domain layer  
- Domain layer depends on **nothing external**

### 8.2. Technology Independence
**The domain must remain technology-agnostic:**
- No Supabase-specific code in domain or application layers
- All external technology interactions through **port interfaces**
- Easy substitution of Supabase with other technologies if needed

### 8.3. Interface Segregation
**Each port interface should be:**
- **Single responsibility:** Each interface serves one specific purpose
- **Minimal:** Contains only the methods actually needed
- **Stable:** Changes to implementations don't affect domain logic

## 9. Implementation Guidelines

### 9.1. Development Workflow
1. **Start with Domain:** Always implement entities and use cases first
2. **Define Ports:** Create interfaces for external dependencies
3. **Test-First:** Write tests before implementations
4. **Implement Adapters:** Create concrete implementations last

## 10. Conclusion

This **corrected architecture** now properly implements Hexagonal Architecture principles with a robust TDD strategy:

**Key Improvements Made:**
- **Clear Port/Adapter Separation:** Interfaces vs implementations properly distinguished
- **Technology Independence:** Domain layer completely isolated from external dependencies  
- **Layer-Specific TDD:** Testing strategy tailored to each architectural layer
- **Proper Dependency Flow:** All dependencies point inward toward the domain
- **Comprehensive Structure:** Directory organization reflects hexagonal principles

This architecture provides a **technically sound foundation** for building a robust, scalable, and maintainable Pokemon Card Marketplace while adhering to **true hexagonal architecture** and **disciplined TDD practices**.
