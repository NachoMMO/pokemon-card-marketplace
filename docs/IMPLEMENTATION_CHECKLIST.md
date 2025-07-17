# Checklist de Validación Pre-Implementación

## ✅ **Verificación de Consistencia Entity ↔ Database**

### **User.ts ↔ auth.users (Supabase)**
- ✅ `id: string` → `auth.users.id (UUID)`
- ✅ `email: string` → `auth.users.email`
- ✅ `emailConfirmed: boolean` → `auth.users.email_confirmed_at IS NOT NULL`
- ✅ `createdAt: Date` → `auth.users.created_at`
- ✅ `updatedAt: Date` → `auth.users.updated_at`

### **UserProfile.ts ↔ user_profiles**
- ✅ `id: string` → `user_profiles.id (UUID PRIMARY KEY)`
- ✅ `userId: string` → `user_profiles.user_id (REFERENCES auth.users.id)`
- ✅ `firstName: string` → `user_profiles.first_name (VARCHAR 50)`
- ✅ `lastName: string` → `user_profiles.last_name (VARCHAR 50)`
- ✅ `displayName: string` → `user_profiles.display_name (VARCHAR 50 UNIQUE)`
- ✅ `balance: number` → `user_profiles.balance (DECIMAL 10,2)`
- ✅ `role: UserRole` → `user_profiles.role (VARCHAR 20)`
- ✅ `tradingReputation: number` → `user_profiles.trading_reputation (INTEGER)`
- ✅ `totalTrades: number` → `user_profiles.total_trades (INTEGER)`
- ✅ `successfulTrades: number` → `user_profiles.successful_trades (INTEGER)`
- ✅ `createdAt: Date` → `user_profiles.created_at (TIMESTAMP)`
- ✅ `updatedAt: Date` → `user_profiles.updated_at (TIMESTAMP)`
- ✅ `dateOfBirth?: Date` → `user_profiles.date_of_birth (DATE)`
- ✅ `address?: string` → `user_profiles.address (VARCHAR 200)`
- ✅ `city?: string` → `user_profiles.city (VARCHAR 100)`
- ✅ `postalCode?: string` → `user_profiles.postal_code (VARCHAR 20)`
- ✅ `country?: string` → `user_profiles.country (VARCHAR 100)`
- ✅ `bio?: string` → `user_profiles.bio (TEXT)`
- ✅ `avatarUrl?: string` → `user_profiles.avatar_url (VARCHAR 255)`
- ✅ `location?: string` → `user_profiles.location (VARCHAR 100)`
- ✅ `website?: string` → `user_profiles.website (VARCHAR 255)`
- ✅ `socialMediaLinks: Record<string, string>` → `user_profiles.social_media_links (JSONB)`
- ✅ `privacySettings: PrivacySettings` → `user_profiles.privacy_settings (JSONB)`
- ✅ `notificationPreferences: NotificationPreferences` → `user_profiles.notification_preferences (JSONB)`

## 🎯 **Pasos de Implementación Recomendados**

### **Fase 1: Tablas Básicas**
1. **Ejecutar schema básico:**
   ```sql
   -- Solo user_profiles y cards para empezar
   ```

2. **Verificar conexión desde aplicación:**
   ```typescript
   // Test de conexión básica con Supabase
   ```

3. **Probar RLS básico:**
   ```sql
   -- Políticas para user_profiles
   ```

### **Fase 2: Tablas de Relación**  
1. **Agregar collection_entries**
2. **Agregar cart_items**
3. **Probar foreign keys**

### **Fase 3: Tablas de Transacciones**
1. **Agregar purchases**
2. **Agregar sales**
3. **Agregar messages**

### **Fase 4: Datos de Ejemplo**
1. **Cargar cards de ejemplo**
2. **Crear perfiles de usuario de prueba**
3. **Probar flujos completos**

## ⚠️ **Puntos Críticos a Validar**

### **En Supabase Dashboard:**
1. ✅ **Auth habilitado:** Verificar que Supabase Auth esté configurado
2. ✅ **Políticas RLS:** Verificar que las políticas permitan acceso apropiado
3. ✅ **Foreign Keys:** Verificar que las referencias a auth.users funcionen
4. ✅ **Triggers:** Verificar que updated_at se actualice automáticamente

### **En la Aplicación:**
1. ✅ **Variables ENV:** VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
2. ✅ **Cliente Supabase:** Configuración correcta del cliente
3. ✅ **Tipos TypeScript:** Generar tipos desde Supabase
4. ✅ **Repositorios:** Implementar interfaces para acceso a datos

## 🔍 **Queries de Validación**

### **Verificar Estructura:**
```sql
-- Contar tablas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar foreign keys
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
```

### **Verificar RLS:**
```sql
-- Verificar que RLS está activo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Listar políticas
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **Test de Datos:**
```sql
-- Verificar que podemos insertar un perfil
INSERT INTO user_profiles (
  user_id, first_name, last_name, display_name
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Test', 'User', 'testuser123'
) RETURNING id;
```

## 🚀 **Comandos para Desarrollo Local**

### **Generar Tipos TypeScript:**
```bash
# Una vez que las tablas estén creadas
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

### **Backup del Schema:**
```bash
# Para respaldar tu schema después de crearlo
pg_dump --schema-only --no-owner --no-privileges YOUR_DB_URL > backup-schema.sql
```

## ✅ **Lista de Verificación Final**

Antes de proceder con la implementación de la aplicación:

- [ ] ✅ Todas las tablas creadas sin errores
- [ ] ✅ RLS habilitado y políticas configuradas  
- [ ] ✅ Foreign keys funcionando correctamente
- [ ] ✅ Datos de ejemplo cargados exitosamente
- [ ] ✅ Conexión desde aplicación establecida
- [ ] ✅ Tipos TypeScript generados
- [ ] ✅ Primera consulta exitosa desde la app

Una vez completados estos pasos, estarás listo para implementar los repositorios y casos de uso en la aplicación Vue.
