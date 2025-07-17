# Guía de Implementación en Supabase

## 🎯 **Pasos para Crear las Tablas en Supabase**

### **1. Preparación**

1. **Accede a tu proyecto de Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Selecciona tu proyecto existente o crea uno nuevo

2. **Abre el SQL Editor**
   - En el panel lateral izquierdo, click en "SQL Editor"
   - Selecciona "New query"

### **2. Ejecución del Esquema**

#### **Opción A: Ejecutar Todo de Una Vez**
```sql
-- Copia y pega todo el contenido de database/schema.sql
-- y ejecuta con Ctrl+Enter o click en "Run"
```

#### **Opción B: Ejecutar Por Secciones (Recomendado)**

**Paso 1: Crear tabla user_profiles**
```sql
-- Ejecuta desde línea 14 hasta línea 35 del schema.sql
CREATE TABLE IF NOT EXISTS user_profiles (
  -- ... todo el contenido de la tabla
);
```

**Paso 2: Crear tabla cards**
```sql
-- Ejecuta desde línea 39 hasta línea 66 del schema.sql
CREATE TABLE IF NOT EXISTS cards (
  -- ... todo el contenido de la tabla
);
```

**Paso 3: Continuar con el resto de tablas**
- collection_entries
- cart_items  
- purchases
- sales
- messages

### **3. Verificación de Tablas Creadas**

Después de ejecutar el esquema, verifica:

1. **En la interfaz de Supabase:**
   - Ve a "Table Editor" en el panel lateral
   - Deberías ver todas las tablas listadas:
     - `user_profiles`
     - `cards`
     - `collection_entries`
     - `cart_items`
     - `purchases`
     - `sales`
     - `messages`

2. **Verificar estructura con SQL:**
```sql
-- Verificar que todas las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### **4. Configurar RLS (Row Level Security)**

**IMPORTANTE**: Después de crear las tablas, debes configurar RLS:

1. **Usa el archivo corregido:**
   - Usa `database/rls_policies_corrected.sql` en lugar del original
   - Este archivo tiene las correcciones para Supabase Auth

2. **Ejecuta las políticas RLS:**
   - Copia todo el contenido de `database/rls_policies_corrected.sql`
   - Pégalo en el SQL Editor de Supabase
   - Ejecuta el script completo

3. **Verificar RLS está activo:**
```sql
-- Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

⚠️ **ERROR COMÚN RESUELTO:**
- El archivo original `rls_policies.sql` tenía referencias a una tabla `users` que no existe
- Usamos `auth.users` de Supabase, no una tabla personalizada
- El archivo corregido elimina las políticas incorrectas para `auth.users`

### **5. Cargar Datos de Ejemplo (Opcional)**

Para probar el sistema:

1. **Ejecuta los datos de ejemplo:**
   - Copia el contenido de `database/sample_data.sql`
   - Ejecuta en el SQL Editor

2. **Verificar datos cargados:**
```sql
-- Verificar datos en cada tabla
SELECT 'cards' as table_name, COUNT(*) FROM cards
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL  
SELECT 'collection_entries', COUNT(*) FROM collection_entries;
```

## ⚠️ **Consideraciones Importantes**

### **Referencias a auth.users**
- Las tablas referencian `auth.users(id)` que es manejado por Supabase Auth
- **NO** intentes crear una tabla `users` personalizada
- Supabase Auth maneja automáticamente la tabla `auth.users`

### **Errores Comunes a Evitar**

1. **Error de permisos:**
   ```sql
   -- Si ves errores de permisos, asegúrate de estar ejecutando como superuser
   -- En Supabase, esto debería ser automático
   ```

2. **Error de foreign key:**
   ```sql
   -- Si hay errores con auth.users, verifica que:
   -- 1. Tengas usuarios registrados en Supabase Auth
   -- 2. Estés usando UUIDs válidos en sample_data.sql
   ```

3. **Error de RLS:**
   ```sql
   -- Si no puedes acceder a datos después de crear tablas:
   -- 1. Asegúrate de ejecutar rls_policies.sql
   -- 2. Verifica que RLS esté habilitado correctamente
   ```

## ✅ **Validación Final**

Después de completar la implementación:

1. **Verifica estructura:**
```sql
-- Contar tablas creadas
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
-- Debería devolver 7 tablas
```

2. **Verifica RLS:**
```sql
-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

3. **Test básico de inserción:**
```sql
-- Probar insertar un perfil de usuario
-- (requiere un usuario existente en auth.users)
INSERT INTO user_profiles (
  user_id, 
  first_name, 
  last_name, 
  display_name
) VALUES (
  auth.uid(), -- ID del usuario actual autenticado
  'Test',
  'User', 
  'testuser'
);
```

## 🚀 **Próximos Pasos**

Una vez que las tablas estén creadas exitosamente:

1. **Configurar variables de entorno** en tu aplicación Vue:
   ```env
   VITE_SUPABASE_URL=tu_url_de_proyecto
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

2. **Implementar repositorios** en la aplicación
3. **Crear casos de uso** para manejar la lógica de negocio
4. **Desarrollar componentes Vue** para la interfaz

¡El esquema está diseñado para funcionar perfectamente con Supabase Auth y las entidades simplificadas que acabamos de refactorizar!
