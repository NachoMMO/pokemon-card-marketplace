# Database Setup Instructions

This directory contains the database schema and setup files for the Pokemon Card Marketplace.

## Files Overview

- `schema.sql` - Main database schema with all tables, indexes, and triggers
- `rls_policies.sql` - Row Level Security policies for data protection
- `sample_data.sql` - Sample data for development and testing

## Setup Instructions

### 1. Execute in Supabase SQL Editor

Go to your Supabase project dashboard → SQL Editor and execute the files in this order:

#### Step 1: Create the Schema
```sql
-- Copy and paste the contents of schema.sql
-- This creates all tables, indexes, and triggers
```

#### Step 2: Set up Row Level Security
```sql
-- Copy and paste the contents of rls_policies.sql
-- This enables RLS and creates security policies
```

#### Step 3: (Optional) Add Sample Data
```sql
-- Copy and paste the contents of sample_data.sql
-- This adds test data for development
```

### 2. Verify Setup

After running the scripts, verify everything is working:

```sql
-- Check that all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Count sample data (if you loaded it)
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'cards', COUNT(*) FROM cards
UNION ALL  
SELECT 'collections', COUNT(*) FROM collections
UNION ALL
SELECT 'sales', COUNT(*) FROM sales;
```

## Database Schema Overview

### Core Tables

1. **users** - User accounts (integrated with Supabase Auth)
2. **user_profiles** - Extended user profile information
3. **cards** - Pokemon card catalog
4. **collections** - Individual card entries in user collections (many-to-many)
   - **Note**: Each row represents a single card entry, not the entire collection
   - A user's complete collection consists of multiple collection entries
   - Example: User has 3 Charizard cards = 3 separate collection entries
5. **cart_items** - Shopping cart items
6. **purchases** - Purchase transactions
7. **sales** - Card sales listings
8. **messages** - Private messaging between users

### Key Features

- **UUID Primary Keys** - All tables use UUID for better security
- **Automated Timestamps** - `created_at` and `updated_at` with triggers
- **Data Validation** - CHECK constraints for business rules
- **Foreign Key Relationships** - Proper relational integrity
- **Computed Columns** - Auto-calculated totals where appropriate
- **Full-Text Search Ready** - Indexes for search functionality

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User-based Access Control** - Users can only access their own data
- **Admin Privileges** - Special access for admin users
- **Public Data Control** - Cards catalog is publicly readable
- **Privacy Settings** - User-controlled visibility of profiles/collections

### Performance Optimizations

- **Strategic Indexes** - On frequently queried columns
- **Compound Indexes** - For complex queries
- **Trigger-based Updates** - Automatic timestamp management
- **Validation Functions** - Business logic at database level

## Integration with Supabase Auth

The `users` table is designed to work with Supabase Auth:

- User IDs should match `auth.uid()`
- Password handling is done by Supabase Auth
- RLS policies use `auth.uid()` for access control
- Email verification status is tracked

## Next Steps

After setting up the database:

1. Test the connection from your Vue.js application
2. Implement repository adapters in the infrastructure layer
3. Create domain entities matching the database schema
4. Set up automated testing against the database
5. Configure any additional Supabase features (Storage, Edge Functions)

## Troubleshooting

### Common Issues

1. **RLS Blocking Queries**: Make sure you're authenticated when testing
2. **Foreign Key Errors**: Ensure referenced records exist before creating relationships
3. **Permission Denied**: Check that RLS policies allow the operation you're trying to perform

### Useful Queries

```sql
-- Check current user in RLS context
SELECT auth.uid();

-- Disable RLS temporarily for testing (be careful!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- View all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```
