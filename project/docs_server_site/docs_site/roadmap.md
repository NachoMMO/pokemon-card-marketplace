# 🛣️ Roadmap del Proyecto

## 📋 Descripción General

Este proyecto consiste en una aplicación web que permite a los usuarios comprar y vender cartas de Pokemon TCG. La aplicación se desarrolla siguiendo metodología **TDD (Test-Driven Development)** y está orientada a crear un marketplace completo y funcional.

## 🎯 Funcionalidades Principales

### 👤 Gestión de Usuarios
- Registro e inicio de sesión de usuarios
- Perfiles personalizables con información detallada
- Sistema de roles (comprador, vendedor, administrador)
- Gestión de saldo virtual y recarga

### 🃏 Catálogo de Cartas
- Visualización completa del catálogo disponible
- Búsqueda avanzada por múltiples criterios:
  - Nombre de la carta
  - Tipo de Pokemon
  - Rareza
  - Expansión
  - Rango de precios
- Vista detallada de cada carta con imágenes y descripción

### 🛒 Sistema de Compras
- Carrito de compras funcional
- Proceso de checkout completo
- Historial detallado de compras realizadas
- Sistema de pagos integrado

### 💰 Sistema de Ventas
- Publicación de cartas para venta
- Gestión de inventario personal
- Historial de ventas realizadas
- Sistema de comisiones

### 📚 Colección Personal
- Gestión de colección personal de cartas
- Seguimiento del valor de la colección
- Organización por categorías

### 💬 Características Sociales
- Perfiles públicos de otros usuarios
- Sistema de mensajería privada
- Valoraciones y reseñas

## 🏗️ Arquitectura del Sistema

### Entidades Principales
#### 👤 **User** (Usuario)
- Información personal y autenticación
- Datos de contacto y dirección
- Saldo virtual para transacciones
- Roles y permisos del sistema

#### 🃏 **Card** (Carta)
- Detalles de cartas Pokemon (nombre, tipo, rareza)
- Información de expansión y colección
- Precio y disponibilidad en stock
- Imágenes y descripciones detalladas

#### 💬 **Message** (Mensaje)
- Sistema de mensajería entre usuarios
- Gestión de conversaciones privadas
- Estados de lectura y notificaciones

#### 💳 **Purchase** (Compra)
- Registro de transacciones de compra
- Detalles de precio y fecha
- Vinculación con compradores y cartas

#### 💰 **Sale** (Venta)
- Registro de transacciones de venta
- Gestión de comisiones y ganancias
- Historial de ventas por vendedor

#### 📚 **Collection** (Colección)
- Cartas pertenecientes a cada usuario
- Organización personal de inventario
- Seguimiento del valor de colección

#### 🛒 **CartItem** (Carrito)
- Items temporales antes de compra
- Reserva temporal de cartas
- Gestión de cantidades y precios

#### 👤 **UserProfile** (Perfil de Usuario)
- Información extendida del perfil
- Preferencias y configuración social
- Avatar y datos públicos

## ⚡ Funcionalidades Implementadas

### 🔐 Autenticación y Seguridad
- ✅ Registro de usuarios con validación
- ✅ Inicio de sesión seguro
- ✅ Recuperación de contraseña
- ✅ Verificación de email

### 🎯 Navegación y Búsqueda
- ✅ Catálogo completo de cartas
- ✅ Búsqueda avanzada multi-criterio
- ✅ Filtros por tipo, rareza, expansión, precio
- ✅ Vista detallada de cartas individuales

### 🛒 Sistema de Compras
- ✅ Carrito de compras funcional
- ✅ Añadir/remover cartas del carrito
- ✅ Proceso de checkout completo
- ✅ Historial de compras realizadas

### 💰 Sistema de Ventas
- ✅ Publicación de cartas para venta
- ✅ Gestión de inventario de vendedor
- ✅ Historial de ventas realizadas

### 👤 Gestión de Perfiles
- ✅ Visualización de perfil personal
- ✅ Edición de información de usuario
- ✅ Gestión de saldo virtual
- ✅ Recarga de saldo

### 📚 Gestión de Colecciones
- ✅ Visualización de colección personal
- ✅ Añadir cartas a la colección
- ✅ Organización y categorización

### 💬 Características Sociales
- ✅ Perfiles públicos de usuarios
- ✅ Sistema de mensajería privada
- ✅ Gestión de conversaciones

## 🎭 Roles de Usuario

### 🛒 **Comprador**
- Explorar catálogo completo de cartas
- Buscar y filtrar cartas por múltiples criterios
- Gestionar carrito de compras
- Realizar compras y gestionar historial
- Comunicarse con vendedores
- Gestionar colección personal

### 💰 **Vendedor** 
- Todas las funcionalidades de comprador
- Publicar cartas para venta
- Gestionar inventario y precios
- Recibir pagos y comisiones
- Ver estadísticas de ventas
- Gestionar órdenes de venta

### 👑 **Administrador**
- Gestión completa de usuarios
- Moderación de contenido
- Gestión de catálogo maestro
- Configuración de comisiones
- Reportes y analytics
- Soporte al cliente

## 🎨 Páginas Principales

### 🔐 **Autenticación**
- **Inicio** - Landing page con información del marketplace
- **Registro** - Formulario de creación de cuenta
- **Login** - Acceso para usuarios existentes
- **Recuperación** - Restablecimiento de contraseña

### 🎯 **Navegación y Catálogo**
- **Catálogo** - Exploración completa de cartas disponibles
- **Búsqueda** - Filtros avanzados y resultados
- **Detalle de Carta** - Información completa de carta individual

### 🛒 **Compras**
- **Carrito** - Gestión de items seleccionados
- **Checkout** - Proceso de compra y pago
- **Confirmación** - Detalles de compra realizada

### 💰 **Ventas**
- **Vender** - Formulario para publicar cartas
- **Mis Ventas** - Gestión de cartas en venta
- **Historial** - Registro de ventas realizadas

### 👤 **Perfil y Cuenta**
- **Mi Perfil** - Información personal y configuración
- **Saldo** - Gestión de dinero virtual
- **Colección** - Cartas pertenecientes al usuario
- **Historial** - Compras y ventas realizadas

### 💬 **Social**
- **Mensajes** - Bandeja de entrada y conversaciones
- **Otros Perfiles** - Información pública de usuarios
- **Comunidad** - Interacciones entre usuarios

## 🚀 Próximos Pasos

### 🔮 Funcionalidades Futuras
- Sistema de valoraciones y reseñas
- Subastas de cartas raras
- Intercambios directos entre usuarios
- Integración con APIs de precios de mercado
- Sistema de notificaciones push
- App móvil nativa

### 🛠️ Mejoras Técnicas
- Optimización de rendimiento
- Implementación de cache
- Monitoreo y analytics avanzados
- Pruebas de carga y escalabilidad
- Integración continua/despliegue continuo

!!! info "Desarrollo Iterativo"
    Este roadmap se actualiza continuamente conforme avanza el desarrollo del proyecto, siguiendo los principios ágiles y TDD.

!!! tip "Contribuciones"
    Cada funcionalidad se desarrolla siguiendo el ciclo Red-Green-Refactor, asegurando calidad y mantenibilidad del código.
  - Página de venta de cartas
  - Página de historial de compras
  - Página de historial de ventas
  - Página de perfil de usuario
  - Página de edición de perfil de usuario
  - Página de saldo de dinero
  - Página de recarga de saldo de dinero
  - Página de colección de cartas
  - Página de detalle de una colección
  - Página de perfil de otro usuario
  - Página de mensajes privados
  - Página de detalle de un mensaje privado
  - Página de lista de compras
  - Página de detalle de una compra
  - Página de lista de ventas
  - Página de detalle de una venta
  - Página de lista de cartas vendidas
  - Página de lista de cartas compradas
  - Página de lista de cartas en venta