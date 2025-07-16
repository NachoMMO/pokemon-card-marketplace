# Plan del Proyecto: Pokemon Card Marketplace (Enfoque TDD)

## 1. Resumen del Proyecto

Este documento describe el plan del proyecto para crear una aplicación web de compra y venta de cartas Pokemon TCG, siguiendo una metodología de Test-Driven Development (TDD). La aplicación permitirá a los usuarios explorar un amplio catálogo de cartas, gestionar sus colecciones e interactuar con otros usuarios en un marketplace dedicado.

## 2. Stack Tecnológico

*   **Frontend:** Astro con componentes en Vue.js
*   **Backend:** Node.js
*   **Base de Datos:** Supabase
*   **Autenticación:** Supabase Auth
*   **Testing:** Vitest para tests unitarios/integración, Playwright para tests E2E
*   **Linting:** ESLint
*   **Formateo:** Prettier
*   **Control de Versiones:** Git
*   **Hosting:** Vercel

## 3. Enfoque de Desarrollo: Test-Driven Development (TDD)

El proyecto se construirá característica por característica, siguiendo un ciclo TDD estricto tanto para desarrollo backend como frontend. Los archivos Gherkin `.feature` en el directorio `docs/features` servirán como la fuente principal de verdad para los requerimientos de cada característica.

El ciclo TDD para cada característica será:
1.  **🔴 Red:** Escribir un test que falle y defina una nueva funcionalidad.
2.  **🟢 Green:** Escribir el código más simple posible para hacer pasar el test.
3.  **🔄 Refactor:** Limpiar y optimizar el código mientras se asegura que todos los tests siguen pasando.

## 4. Calidad de Código y Herramientas

Para asegurar código de alta calidad y consistente, el proyecto utilizará:
*   **ESLint:** Para identificar y corregir problemas en código JavaScript.
*   **Prettier:** Para formateo automático de código.
*   Estas herramientas se configurarán para ejecutarse automáticamente en hooks de pre-commit para mantener estándares de código.

## 5. Fases del Proyecto

### Fase 1: Fundamentos y Configuración

El objetivo de esta fase es establecer la estructura del proyecto, entorno de desarrollo y esquema inicial de base de datos.

**Tareas:**

1.  **Configuración de Control de Versiones:**
    *   Inicializar un repositorio Git.
2.  **Scaffolding del Proyecto:**
    *   Inicializar un proyecto Node.js para el backend.
    *   Inicializar un proyecto Astro para el frontend y configurar integración con Vue.js.
3.  **Configuración de Herramientas:**
    *   Configurar frameworks de testing (Vitest, Playwright) para ambos proyectos.
    *   Configurar ESLint y Prettier para linting y formateo automático.
4.  **Configuración del Esquema de Base de Datos:**
    *   Traducir las definiciones de entidades YAML en `docs/entities` a un esquema inicial de base de datos en Supabase. Esto incluye tablas para `users`, `user_profiles`, `cards`, `collections`, `cart_items`, `purchases`, `sales`, y `messages`.
    *   Establecer relaciones iniciales entre tablas.

### Fase 2: Desarrollo de Características (Ciclos TDD Iterativos)

Esta fase involucra construir la aplicación una característica a la vez. El orden de implementación priorizará funcionalidad core primero.

**Flujo de Trabajo de Desarrollo para Cada Característica (ej. `user_account_creation.feature`):**

1.  **Backend TDD Cycle (Node.js API):**
    *   **Write Failing Test:** Create an integration test for the `POST /api/register` endpoint. The test will simulate an API call with user data and assert the expected outcome (e.g., a new user is created in the database, a success response is returned). This test will fail because the endpoint doesn't exist yet.
    *   **Write Implementation Code:** Create the `POST /api/register` endpoint and write the minimum amount of code required to pass the test.
    *   **Refactor:** Improve the code's structure, readability, and performance without changing its behavior. Ensure all tests still pass.

2.  **Frontend TDD Cycle (Astro/Vue.js UI):**
    *   **Write Failing Test:** Create an End-to-End (E2E) test that simulates a user visiting the registration page (`register.view.yaml`), filling out the form, and clicking the submit button. The test will assert that the user is redirected or a success message is shown. This test will fail.
    *   **Write Implementation Code:** Build the `register.view` page and the necessary Vue.js components (`RegistrationForm.vue`). Connect the form to the backend API. Write the minimum code to make the E2E test pass.
    *   **Refactor:** Refactor the frontend components and page structure. Ensure all tests still pass.

**Feature Implementation Order (Example):**

1.  **User Authentication:**
    *   `user_account_creation.feature`
    *   `user_login.feature`
    *   `password_recovery.feature`
2.  **Card & Collection Management:**
    *   `view_card_catalog.feature`
    *   `search_cards.feature`
    *   `view_card_details.feature`
    *   `view_card_collection.feature`
    *   `add_cards_to_collection.feature`
3.  **Marketplace:**
    *   `add_card_to_cart.feature`
    *   `remove_card_from_cart.feature`
    *   `purchase_cards_from_cart.feature`
    *   `sell_cards.feature`
4.  **User Profile & History:**
    *   `view_edit_user_profile.feature`
    *   `manage_account_balance.feature`
    *   `view_purchase_sales_history.feature`
5.  **Messaging:**
    *   `manage_private_messages.feature`
    *   `send_private_messages.feature`

### Phase 3: Deployment

This phase ensures the application is robust and ready for production.

**Tasks:**

1.  **Final Integration Testing:** Run all tests (unit, integration, E2E) to ensure the complete application works as expected.
2.  **Production Environment Setup:**
    *   Configure a production Supabase instance.
    *   Set up hosting on **Vercel** for the Node.js backend and the Astro frontend.
3.  **Deployment:**
    *   Deploy the backend and frontend applications to Vercel.
    *   Configure domain, SSL, and environment variables within the Vercel platform.

## 6. Timeline

A detailed timeline with specific deadlines for each feature will be created and maintained separately.
