# Pokemon Card Marketplace

Bienvenido a la documentación del **Pokemon Card Marketplace**, una aplicación web completa para comprar y vender cartas de Pokemon TCG.

## 🎯 Sobre el Proyecto

Este proyecto es una plataforma digital que permite a los usuarios:

- 🔍 **Explorar** un amplio catálogo de cartas Pokemon
- 🛒 **Comprar** cartas de otros usuarios
- 💰 **Vender** cartas de su colección personal
- 👥 **Interactuar** con otros coleccionistas
- 📊 **Gestionar** su colección y transacciones

## 🚀 Tecnologías

<div class="grid cards" markdown>

-   :material-web: **Aplicación**

    ---

    Vue 3 SPA con Composition API implementando Arquitectura Hexagonal

-   :material-server: **Backend Externo**

    ---

    Supabase como infraestructura externa (Database + Auth + Realtime + Storage)

-   :material-database: **Base de Datos**

    ---

    Supabase PostgreSQL con Row Level Security (RLS)

-   :material-test-tube: **Testing**

    ---

    Vitest y Playwright con TDD por capas de arquitectura hexagonal

-   :material-sitemap: **Arquitectura**

    ---

    Hexagonal Architecture con Domain-Driven Design

</div>

## 📋 Metodología

El proyecto sigue una metodología **Test-Driven Development (TDD)** estricta con **Arquitectura Hexagonal**:

1. **🎯 Domain Layer**: Tests de entidades y casos de uso puros
2. **🔌 Application Layer**: Tests de contratos e interfaces
3. **🏗️ Infrastructure Layer**: Tests de adaptadores y servicios externos
4. **🎨 Presentation Layer**: Tests de componentes Vue y E2E
3. **🔄 Refactor**: Optimizar manteniendo todos los tests

## 🗂️ Estructura de la Documentación

### 📖 [Plan del Proyecto](project_plan.md)
Detalles completos del plan de desarrollo, fases y metodología.

### 🏗️ [Entidades](entities/index.md)
Modelos de datos y estructura de la base de datos.

### ⚡ [Funcionalidades](features/index.md)
Descripción detallada de todas las características usando Gherkin.

### 🎨 [Vistas](views/index.md)
Documentación de la interfaz de usuario y experiencia.

### 🛣️ [Roadmap](roadmap.md)
Hoja de ruta del desarrollo del proyecto.

---

!!! tip "Navegación"
    Utiliza el menú lateral para navegar por las diferentes secciones de la documentación. Cada sección está organizada de manera lógica para facilitar la consulta.

!!! info "Desarrollo TDD"
    Esta documentación refleja el enfoque TDD del proyecto. Los archivos `.feature` en Gherkin sirven como fuente de verdad para los requerimientos.
