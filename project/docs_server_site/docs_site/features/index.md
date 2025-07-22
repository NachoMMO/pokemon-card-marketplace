# Funcionalidades del Sistema

Las funcionalidades describen todas las características y comportamientos del Pokemon Card Marketplace utilizando el formato Gherkin. Cada archivo `.feature` define escenarios específicos que guían el desarrollo mediante TDD.

## 🔐 Autenticación y Cuenta

### 👤 [Creación de Cuenta](user_account_creation.feature)
Registro de nuevos usuarios en la plataforma.

### 🔑 [Inicio de Sesión](user_login.feature)
Autenticación de usuarios existentes.

### 🔒 [Recuperación de Contraseña](password_recovery.feature)
Proceso de restablecimiento de contraseñas olvidadas.

### 👥 [Ver/Editar Perfil](view_edit_user_profile.feature)
Gestión de información personal del usuario.

## 🃏 Catálogo y Búsqueda

### 📚 [Ver Catálogo de Cartas](view_card_catalog.feature)
Exploración del catálogo completo de cartas disponibles.

### 🔍 [Buscar Cartas](search_cards.feature)
Sistema de búsqueda avanzada por múltiples criterios.

### 🔎 [Ver Detalles de Carta](view_card_details.feature)
Información detallada de cartas individuales.

## 📖 Colección Personal

### 📋 [Ver Colección](view_card_collection.feature)
Visualización de la colección personal del usuario.

### ➕ [Añadir Cartas a Colección](add_cards_to_collection.feature)
Gestión de cartas en la colección personal.

## 🛒 Sistema de Compras

### 🛍️ [Añadir Carta al Carrito](add_card_to_cart.feature)
Agregar cartas seleccionadas al carrito de compras.

### ❌ [Remover Carta del Carrito](remove_card_from_cart.feature)
Eliminar cartas del carrito antes de la compra.

### 💳 [Comprar Cartas del Carrito](purchase_cards_from_cart.feature)
Proceso completo de compra y pago.

## 💰 Sistema de Ventas

### 🏪 [Vender Cartas](sell_cards.feature)
Poner cartas propias en venta en el marketplace.

## 💵 Gestión Financiera

### 💸 [Gestionar Saldo de Cuenta](manage_account_balance.feature)
Administración del saldo virtual del usuario.

### 📊 [Ver Historial de Compras y Ventas](view_purchase_sales_history.feature)
Registro completo de todas las transacciones.

## 💬 Sistema de Mensajes

### 📤 [Enviar Mensajes Privados](send_private_messages.feature)
Comunicación directa entre usuarios.

### 📨 [Gestionar Mensajes Privados](manage_private_messages.feature)
Administración de la bandeja de mensajes.

---

!!! note "Formato Gherkin"
    Todos los archivos utilizan la sintaxis Gherkin estándar con:
    - **Feature**: Descripción de la funcionalidad
    - **Scenario**: Casos de uso específicos
    - **Given/When/Then**: Pasos del escenario

!!! tip "Desarrollo TDD"
    Estos archivos son la fuente de verdad para el desarrollo. Cada escenario se convierte en tests automatizados que guían la implementación.
