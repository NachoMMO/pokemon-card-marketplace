# Project Plan: Pokemon Card Marketplace (TDD Approach)

## 1. Project Overview

This document outlines the project plan for creating a web application for buying and selling Pokemon TCG cards, following a Test-Driven Development (TDD) methodology. The application will allow users to browse a large catalog of cards, manage their collections, and interact with other users in a dedicated marketplace.

## 2. Technology Stack

*   **Frontend:** Astro with Vue.js components
*   **Backend:** Supabase (Database + Edge Functions + Auth)
*   **Database:** Supabase PostgreSQL
*   **Authentication:** Supabase Auth
*   **Real-time:** Supabase Realtime
*   **File Storage:** Supabase Storage (for card images)
*   **Testing:** Vitest for unit/integration tests, Playwright for E2E tests
*   **Linting:** ESLint
*   **Formatting:** Prettier
*   **Version Control:** Git
*   **Hosting:** Vercel (Frontend)

## 3. Development Approach: Test-Driven Development (TDD)

The project will be built feature by feature, following a strict TDD cycle for frontend development with Supabase integration. The Gherkin `.feature` files in the `docs/features` directory will serve as the primary source of truth for the requirements of each feature.

The TDD cycle for each feature will be:
1.  **Red:** Write a failing test that defines a new piece of functionality.
2.  **Green:** Write the simplest possible code to make the test pass.
3.  **Refactor:** Clean up and optimize the code while ensuring all tests continue to pass.

## 4. Supabase Architecture

The application will leverage Supabase's comprehensive backend-as-a-service platform:

*   **Database:** PostgreSQL with Row Level Security (RLS) for data protection
*   **Authentication:** Built-in user management with email/password and social providers
*   **Edge Functions:** Serverless functions for complex business logic (payments, notifications)
*   **Real-time:** Live updates for messaging and marketplace activities
*   **Storage:** Secure file storage for card images and user avatars
*   **API:** Auto-generated REST and GraphQL APIs with real-time subscriptions

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

1.  **Version Control Setup:**
    *   Initialize a Git repository.
2.  **Project Scaffolding:**
    *   Initialize an Astro project for the frontend, configuring Vue.js integration.
    *   Install and configure Supabase JavaScript client.
3.  **Supabase Setup:**
    *   Create Supabase project and configure environment variables.
    *   Set up local development environment with Supabase CLI.
4.  **Tooling Setup:**
    *   Set up testing frameworks (Vitest, Playwright) for the frontend project.
    *   Configure ESLint and Prettier for automated linting and formatting.
5.  **Database Schema Setup:**
    *   Create database tables based on YAML entity definitions in `docs/entities`: `users`, `user_profiles`, `cards`, `collections`, `cart_items`, `purchases`, `sales`, and `messages`.
    *   Configure Row Level Security (RLS) policies for data protection.
    *   Set up database relationships and constraints.
    *   Create database functions for complex queries and business logic.

### Phase 2: Feature Development (Iterative TDD Cycles)

This phase involves building the application one feature at a time using Supabase as the complete backend solution. The order of implementation will prioritize core functionality first.

**Development Workflow for Each Feature (e.g., `user_account_creation.feature`):**

1.  **Frontend TDD Cycle (Astro + Vue.js + Supabase):**
    *   **Write Failing Test:** Create an E2E test (Playwright) that simulates user interactions with the feature in the browser, asserting the expected outcome. This test will fail because the feature isn't implemented yet.
    *   **Write Implementation Code:** Develop the feature using Astro and Vue.js components, interacting directly with Supabase using the JavaScript client library. Implement any required Edge Functions for complex business logic.
    *   **Refactor:** Refine the code for better structure, readability, and performance, ensuring all tests still pass.

**Feature Implementation Order:**

1.  **User Authentication (Supabase Auth):**
    *   `user_account_creation.feature`: User registration using Supabase Auth with email confirmation.
    *   `user_login.feature`: Authentication flow with Supabase Auth including session management.
    *   `password_recovery.feature`: Password reset functionality using Supabase Auth email templates.

2.  **Card & Collection Management:**
    *   `view_card_catalog.feature`: Fetch and display card data from Supabase with pagination and filtering.
    *   `search_cards.feature`: Implement full-text search using Supabase database functions.
    *   `view_card_details.feature`: Fetch detailed card information with related data.
    *   `view_card_collection.feature`: Display user's personal collection with real-time updates.
    *   `add_cards_to_collection.feature`: Update collection data in Supabase with RLS enforcement.

3.  **Marketplace Features:**
    *   `add_card_to_cart.feature`: Manage shopping cart state in Supabase with user sessions.
    *   `remove_card_from_cart.feature`: Update cart items with optimistic UI updates.
    *   `purchase_cards_from_cart.feature`: Process transactions using Supabase Edge Functions for payment logic.
    *   `sell_cards.feature`: Create sale listings with inventory management in Supabase.

4.  **User Profile & Account Management:**
    *   `view_edit_user_profile.feature`: CRUD operations for user profiles with image upload to Supabase Storage.
    *   `manage_account_balance.feature`: Balance management with transaction history using Edge Functions.
    *   `view_purchase_sales_history.feature`: Display transaction history with advanced filtering.

5.  **Real-time Messaging (Supabase Realtime):**
    *   `manage_private_messages.feature`: Real-time messaging system using Supabase Realtime subscriptions.
    *   `send_private_messages.feature`: Message creation with live updates and notifications.

### Phase 3: Production Optimization and Deployment

This phase ensures the application is robust, performant, and ready for production deployment.

**Tasks:**

1.  **Performance Optimization:**
    *   Implement caching strategies for card data and user collections.
    *   Optimize Supabase queries and add database indexes.
    *   Configure Supabase Edge Functions for optimal performance.

2.  **Security Hardening:**
    *   Review and refine Row Level Security (RLS) policies.
    *   Implement rate limiting using Supabase Edge Functions.
    *   Configure proper CORS and security headers.

3.  **Final Integration Testing:**
    *   Run comprehensive test suite (unit, integration, E2E).
    *   Test real-time features and Edge Function performance.
    *   Validate all user flows and error handling.

4.  **Production Deployment:**
    *   Deploy Astro frontend to Vercel with optimized build configuration.
    *   Configure production Supabase project with proper environment variables.
    *   Set up monitoring and logging for both frontend and Supabase services.
    *   Configure custom domain, SSL certificates, and CDN optimization.

## 7. Supabase-Specific Considerations

**Database Design:**
*   Leverage PostgreSQL features like JSON columns for flexible card metadata.
*   Use database triggers for maintaining data consistency.
*   Implement soft deletes for audit trails.

**Edge Functions Use Cases:**
*   Payment processing and transaction validation.
*   Complex business logic for card trading rules.
*   Email notifications and webhooks.
*   Data aggregation and reporting.

**Real-time Features:**
*   Live chat and messaging updates.
*   Real-time marketplace activity feeds.
*   Live auction functionality (future enhancement).

**Security:**
*   Row Level Security for user data isolation.
*   API key management and rate limiting.
*   Input validation and sanitization.

## 8. Timeline

A detailed timeline with specific deadlines for each feature will be created and maintained separately, taking into account the streamlined development process enabled by Supabase's comprehensive backend services.
