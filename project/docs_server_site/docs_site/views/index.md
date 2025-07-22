# Vistas del Sistema

Las vistas definen la estructura y contenido de cada pantalla de la aplicación Pokemon Card Marketplace. Cada archivo especifica los componentes, datos y interacciones de las interfaces de usuario.

## 🔐 Autenticación

### 🔑 [Login](login.view.md)
Pantalla de inicio de sesión para usuarios existentes.

### 📝 [Registro](register.view.md)
Formulario de registro para nuevos usuarios.

### 🔒 [Recuperación de Contraseña](password_recovery.view.md)
Interfaz para restablecer contraseñas olvidadas.

## 🏠 Pantallas Principales

### 🏡 [Inicio](home.view.md)
Página principal con resumen y navegación.

### 📚 [Catálogo de Cartas](card_catalog.view.md)
Vista principal del catálogo con filtros y búsqueda.

### 🔍 [Detalles de Carta](card_details.view.md)
Vista detallada de una carta específica.

## 👤 Perfil de Usuario

### 👥 [Mi Perfil](user_profile.view.md)
Vista del perfil personal del usuario actual.

### ✏️ [Editar Perfil](edit_user_profile.view.md)
Formulario de edición de información personal.

### 👁️ [Perfil de Otro Usuario](other_user_profile.view.md)
Vista del perfil público de otros usuarios.

## 📖 Colección

### 📋 [Mi Colección](collection.view.md)
Vista principal de la colección personal.

### 📑 [Detalles de Colección](collection_details.view.md)
Vista detallada de elementos específicos de la colección.

## 🛒 Comercio

### 🛍️ [Carrito de Compras](cart.view.md)
Vista del carrito con items seleccionados.

### 💳 [Proceso de Compra](purchase.view.md)
Pantalla de confirmación y pago.

### 🏪 [Vender Cartas](sell.view.md)
Interfaz para poner cartas en venta.

### 💰 [Gestión de Saldo](balance.view.md)
Vista del saldo actual y movimientos.

### 💸 [Recargar Saldo](recharge_balance.view.md)
Formulario para añadir fondos a la cuenta.

## 📊 Historial y Listas

### 🛒 [Historial de Compras](purchase_history.view.md)
Lista completa de compras realizadas.

### 💰 [Historial de Ventas](sales_history.view.md)
Lista completa de ventas realizadas.

### 📋 [Lista de Compras](purchase_list.view.md)
Vista resumida de compras recientes.

### 📋 [Lista de Ventas](sales_list.view.md)
Vista resumida de ventas recientes.

### 🔍 [Detalles de Compra](purchase_details.view.md)
Vista detallada de una compra específica.

### 🔍 [Detalles de Venta](sales_details.view.md)
Vista detallada de una venta específica.

### 🛍️ [Cartas Compradas](purchased_cards_list.view.md)
Lista de cartas adquiridas recientemente.

### 🏪 [Cartas Vendidas](sold_cards_list.view.md)
Lista de cartas vendidas recientemente.

### 🏪 [Cartas en Venta](cards_for_sale_list.view.md)
Lista de cartas actualmente en venta.

## 💬 Mensajería

### 📨 [Mensajes Privados](private_messages.view.md)
Bandeja de entrada de mensajes.

### 💬 [Detalles de Mensaje](private_message_details.view.md)
Vista completa de una conversación específica.

---

!!! info "Estructura de Vistas"
    Cada vista está definida en formato YAML especificando:
    - **Componentes**: Elementos de la interfaz
    - **Datos**: Información que se muestra
    - **Acciones**: Interacciones disponibles
    - **Navegación**: Enlaces y transiciones

!!! tip "Diseño Responsivo"
    Todas las vistas están diseñadas para funcionar correctamente en dispositivos móviles, tablets y escritorio.
