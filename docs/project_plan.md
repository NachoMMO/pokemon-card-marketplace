# Project Plan: Pokemon Card Marketplace (TDD Approach)

## 1. Project Overview

This document outlines the project plan for creating a web application for buying and selling Pokemon TCG cards, following a Test-Driven Development (TDD) methodology. The application will allow users to browse a large catalog of cards, manage their collections, and interact with other users in a dedicated marketplace.

## 2. Technology Stack

*   **Application:** Vue 3 SPA with Composition API (Hexagonal Architecture)
*   **External Backend:** Supabase (Database + Edge Functions + Auth + Realtime + Storage)
*   **Database:** Supabase PostgreSQL
*   **Authentication:** Supabase Auth
*   **Real-time:** Supabase Realtime
*   **File Storage:** Supabase Storage (for card images)
*   **Testing:** Vitest for unit/integration tests, Playwright for E2E tests
*   **State Management:** Pinia
*   **Routing:** Vue Router
*   **Build Tool:** Vite
*   **Linting:** ESLint
*   **Formatting:** Prettier
*   **Version Control:** Git
*   **Hosting:** Vercel

## 3. Development Approach: Test-Driven Development (TDD)

The project will be built feature by feature, following a strict TDD cycle for Vue 3 hexagonal architecture development with Supabase integration. The Gherkin `.feature` files in the `docs/features` directory will serve as the primary source of truth for the requirements of each feature.

The TDD cycle will follow the hexagonal architecture layers:
1.  **Domain Layer TDD:** Write failing tests for business entities and use cases, then implement pure business logic.
2.  **Application Layer TDD:** Write tests for port interfaces and DTOs, ensuring proper contracts.
3.  **Infrastructure Layer TDD:** Write tests for Supabase adapters and Vue composables, implementing external integrations.
4.  **Presentation Layer TDD:** Write E2E tests for Vue components and user interactions.

## 4. Vue 3 Hexagonal Architecture with Supabase

The application will implement a complete hexagonal architecture within the Vue 3 SPA, using Supabase as external infrastructure:

*   **Domain Layer:** Pure TypeScript entities and use cases containing all business logic
*   **Application Layer:** Port interfaces defining contracts for external services
*   **Infrastructure Layer:** Concrete adapters implementing Supabase integrations
*   **Presentation Layer:** Vue 3 components consuming domain logic through ports

**Supabase Integration:**
*   **Database:** PostgreSQL with Row Level Security (RLS) accessed through repository adapters
*   **Authentication:** User management through authentication service adapters
*   **Edge Functions:** Complex business logic implementation through service adapters
*   **Real-time:** Live updates through real-time communication adapters
*   **Storage:** File management through storage service adapters
*   **API:** Data access through repository pattern implementations

## 5. Code Quality and Tooling

To ensure high-quality, consistent code, the project will use:
*   **ESLint:** For identifying and fixing problems in JavaScript code.
*   **Prettier:** For automated code formatting.
*   **Supabase CLI:** For local development and database migrations.
*   These tools will be configured to run automatically on pre-commit hooks to maintain code standards.

## 6. Project Phases

### Phase 1: Foundation and Setup

The goal of this phase is to establish the project structure, development environment, and Supabase backend configuration.

**Tasks:**

1.  **✅ Version Control Setup:** *(Completed)*
    *   ✅ Initialize a Git repository.
2.  **✅ Project Scaffolding:** *(Completed)*
    *   ✅ Initialize a Vue 3 project with Vite for optimal development experience.
    *   ✅ Configure TypeScript for type safety across all architecture layers.
    *   ✅ Install and configure Supabase JavaScript client for external service integration.
    *   ✅ Set up Pinia for state management and Vue Router for navigation.
    *   ✅ Configure dependency injection system for hexagonal architecture.
3.  **✅ Supabase Setup:** *(Completed)*
    *   ✅ Create Supabase project and configure environment variables.
    *   ⏭️ Set up local development environment with Supabase CLI. *(Skipped - using cloud only)*
4.  **✅ Tooling Setup:** *(Completed)*
    *   ✅ Set up testing frameworks (Vitest, Playwright) for the frontend project.
    *   ✅ Configure ESLint and Prettier for automated linting and formatting.
5.  **✅ Database Schema Setup:** *(Completed)*
    *   ✅ Create database tables based on YAML entity definitions in `docs/entities`: `user_profiles` (users managed by Supabase Auth), `cards`, `collections`, `cart_items`, `purchases`, `sales`, and `messages`.
    *   ✅ Configure Row Level Security (RLS) policies for data protection.
    *   ✅ Set up database relationships and constraints.
    *   ✅ Create database functions for complex queries and business logic.
6.  **🔄 Hexagonal Architecture Foundation:** *(In Progress)*
    *   ✅ Configure dependency injection and inversion of control patterns.
    *   ✅ Set up domain layer structure with entities and use cases.
        - ✅ User.ts (Supabase Auth entity)
        - ✅ UserProfile.ts (Business logic entity) 
        - ✅ CompleteUser.ts (Domain aggregate)
        - ✅ Card.ts, CollectionEntry.ts
        - ✅ Purchase.ts, Sale.ts, CartItem.ts, Message.ts
    *   🔄 Create application layer with port interfaces for repositories and services.
        - 🔄 IUserRepository, IUserProfileRepository interfaces
        - 🔄 ISupabaseAuthService interface
        - 🔄 Use case interfaces (ICreateUserProfile, ILoginUser, etc.)
    *   🔄 Implement infrastructure layer with Supabase adapter implementations.
        - 🔄 SupabaseAuthUserRepository implementation
        - 🔄 SupabaseUserProfileRepository implementation
        - 🔄 SupabaseAuthService implementation

### Phase 2: Feature Development (Iterative TDD Cycles)

This phase involves building the application one feature at a time using hexagonal architecture principles with Supabase as external infrastructure. The order of implementation will prioritize core functionality first.

**Development Workflow for Each Feature (e.g., `user_account_creation.feature`):**

1.  **Domain Layer TDD:**
    *   **Write Failing Tests:** Create unit tests for business entities and use cases with no external dependencies.
    *   **Implement Domain Logic:** Write pure TypeScript classes and functions containing business rules.
    *   **Refactor:** Clean up domain code ensuring business logic remains framework-agnostic.

2.  **Application Layer TDD:**
    *   **Write Port Interface Tests:** Define contracts for repositories and services.
    *   **Create DTOs:** Define data transfer objects for layer communication.
    *   **Validate Contracts:** Ensure port interfaces are properly designed.

3.  **Infrastructure Layer TDD:**
    *   **Write Adapter Tests:** Test Supabase repository implementations and service adapters.
    *   **Implement Adapters:** Create concrete implementations of port interfaces using Supabase client.
    *   **Integration Testing:** Test adapters against real Supabase services in controlled environments.

4.  **Presentation Layer TDD:**
    *   **Write Component Tests:** Test Vue components in isolation using mocked dependencies.
    *   **Write E2E Tests:** Create Playwright tests simulating complete user interactions.
    *   **Implement UI:** Develop Vue components consuming domain logic through composables.

**Feature Implementation Order:**

1.  **User Authentication (Domain-Driven with Supabase Adapters):**
    *   `user_account_creation.feature`: User registration use case with Supabase Auth adapter and email confirmation.
    *   `user_login.feature`: Authentication domain logic with Supabase Auth adapter for session management.
    *   `password_recovery.feature`: Password reset use case using Supabase Auth email service adapter.

2.  **Card & Collection Management (Repository Pattern):**
    *   `view_card_catalog.feature`: Card query use cases with Supabase repository implementations and pagination.
    *   `search_cards.feature`: Search domain logic with Supabase full-text search adapter.
    *   `view_card_details.feature`: Card detail use case with Supabase repository for related data.
    *   `view_card_collection.feature`: Collection management use case with real-time Supabase adapter.
    *   `add_cards_to_collection.feature`: Collection update use case with Supabase repository and RLS enforcement.

3.  **Marketplace Features (Business Logic Separation):**
    *   `add_card_to_cart.feature`: Shopping cart domain logic with Supabase state persistence adapter.
    *   `remove_card_from_cart.feature`: Cart management use case with optimistic UI through Vue composables.
    *   `purchase_cards_from_cart.feature`: Transaction use case with Supabase Edge Functions adapter for payment logic.
    *   `sell_cards.feature`: Sales listing use case with inventory management through Supabase repository.

4.  **User Profile & Account Management (Clean Architecture):**
    *   `view_edit_user_profile.feature`: Profile management use case with Supabase repository and Storage adapter.
    *   `manage_account_balance.feature`: Balance domain logic with transaction service using Edge Functions adapter.
    *   `view_purchase_sales_history.feature`: History query use case with advanced filtering through Supabase repository.

5.  **Real-time Messaging (Event-Driven Architecture):**
    *   `manage_private_messages.feature`: Messaging domain logic with Supabase Realtime adapter for live updates.
    *   `send_private_messages.feature`: Message creation use case with real-time notification service adapter.

### Phase 3: Production Optimization and Deployment

This phase ensures the application is robust, performant, and ready for production deployment.

**Tasks:**

1.  **Performance Optimization:**
    *   Implement caching strategies at the domain layer for frequently accessed data.
    *   Optimize Supabase repository implementations with efficient queries and indexes.
    *   Configure Supabase Edge Functions adapters for optimal performance.
    *   Implement Vue 3 performance optimizations (lazy loading, component splitting).

2.  **Security Hardening:**
    *   Review and refine domain layer business rules for security compliance.
    *   Strengthen Supabase adapter implementations with proper error handling.
    *   Configure Row Level Security (RLS) policies through repository adapters.
    *   Implement rate limiting in service adapters using Supabase Edge Functions.

3.  **Final Integration Testing:**
    *   Run comprehensive test suite across all hexagonal architecture layers.
    *   Test real-time adapters and Edge Function service implementations.
    *   Validate all use cases and domain logic with integration tests.
    *   Perform end-to-end testing of complete user journeys.

4.  **Production Deployment:**
    *   Deploy Vue 3 SPA to Vercel with optimized Vite build configuration.
    *   Configure production Supabase project with proper adapter configurations.
    *   Set up monitoring for domain layer performance and adapter reliability.
    *   Configure custom domain, SSL certificates, and CDN optimization for Vue SPA.

## 7. Hexagonal Architecture with Supabase Integration

**Domain Layer Design:**
*   Pure TypeScript entities with business rules and invariants.
*   Use cases that orchestrate business operations without external dependencies.
*   Value objects for domain concepts like Money, Email, etc.
*   Domain events for decoupled communication between bounded contexts.

**Application Layer Contracts:**
*   Repository interfaces defining data persistence contracts.
*   Service interfaces for external integrations (auth, storage, notifications).
*   Query interfaces for read-only operations and data projections.
*   Event publisher interfaces for domain event handling.

**Infrastructure Layer Implementations:**
*   Supabase repository adapters implementing domain repository contracts.
*   Supabase service adapters for authentication, storage, and real-time features.
*   Vue composables as driving adapters that consume use cases.
*   Pinia stores for presentation state management.

**Presentation Layer Integration:**
*   Vue components that consume domain logic through composables.
*   Reactive state management with clear separation from business logic.
*   Route guards implementing domain-level authorization rules.
*   Form validation using domain entities and value objects.

## 8. Timeline

A detailed timeline with specific deadlines for each feature will be created and maintained separately, taking into account the hexagonal architecture development approach and the streamlined external service integration enabled by Supabase's comprehensive backend services.
