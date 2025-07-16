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

-   :material-web: **Frontend**

    ---

    Astro con componentes Vue.js para una experiencia moderna y rápida

-   :material-server: **Backend**

    ---

    Node.js con APIs RESTful robustas y escalables

-   :material-database: **Base de Datos**

    ---

    Supabase para gestión de datos y autenticación

-   :material-test-tube: **Testing**

    ---

    Vitest y Playwright para garantizar calidad

</div>

## 📋 Metodología

El proyecto sigue una metodología **Test-Driven Development (TDD)** estricta:

1. **🔴 Red**: Escribir tests que fallen
2. **🟢 Green**: Implementar código mínimo para pasar
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
