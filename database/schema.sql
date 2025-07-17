-- Pokemon Card Marketplace Database Schema
-- Generated from YAML entity definitions in docs/entities/
-- Execute this in Supabase SQL Editor

-- ====================
-- 1. USERS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(50) NOT NULL CHECK (length(first_name) >= 2),
  last_name VARCHAR(50) NOT NULL CHECK (length(last_name) >= 2),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Supabase Auth will handle this
  date_of_birth DATE,
  address VARCHAR(200),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
  role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 2. USER_PROFILES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(50) UNIQUE NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(255),
  location VARCHAR(100),
  website VARCHAR(255),
  social_media_links JSONB DEFAULT '{}',
  trading_reputation INTEGER DEFAULT 0 CHECK (trading_reputation >= 0),
  total_trades INTEGER DEFAULT 0 CHECK (total_trades >= 0),
  successful_trades INTEGER DEFAULT 0 CHECK (successful_trades >= 0),
  privacy_settings JSONB DEFAULT '{"profile_public": true, "collection_public": false, "trade_history_public": false}',
  notification_preferences JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "trade_updates": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 3. CARDS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL CHECK (length(name) >= 1),
  type VARCHAR(20) NOT NULL CHECK (type IN ('Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Fighting', 'Darkness', 'Steel', 'Fairy', 'Dragon', 'Colorless', 'Trainer', 'Energy')),
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Rare_Holo', 'Ultra_Rare', 'Secret_Rare', 'Promo')),
  expansion VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT,
  image_url VARCHAR(255),
  energy_cost JSONB DEFAULT '{}',
  hp INTEGER CHECK (hp > 0),
  attacks JSONB DEFAULT '[]',
  weakness VARCHAR(20),
  resistance VARCHAR(20),
  retreat_cost INTEGER DEFAULT 0 CHECK (retreat_cost >= 0),
  artist VARCHAR(100),
  card_number VARCHAR(20),
  set_total INTEGER,
  release_date DATE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 4. COLLECTIONS TABLE (Collection Entries - User-Card Many-to-Many)
-- ====================
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  condition VARCHAR(20) DEFAULT 'Near_Mint' CHECK (condition IN ('Mint', 'Near_Mint', 'Excellent', 'Good', 'Light_Played', 'Played', 'Poor')),
  acquired_date DATE,
  acquired_price DECIMAL(10,2) CHECK (acquired_price >= 0),
  current_value DECIMAL(10,2) CHECK (current_value >= 0),
  notes TEXT,
  is_for_trade BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id, condition) -- User can have same card in different conditions
);

-- ====================
-- 5. CART_ITEMS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  condition VARCHAR(20) DEFAULT 'Near_Mint' CHECK (condition IN ('Mint', 'Near_Mint', 'Excellent', 'Good', 'Light_Played', 'Played', 'Poor')),
  seller_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id, seller_id) -- User can't have duplicate items from same seller
);

-- ====================
-- 6. PURCHASES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  shipping_address JSONB NOT NULL,
  tracking_number VARCHAR(100),
  shipping_status VARCHAR(20) DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shipped_date TIMESTAMP WITH TIME ZONE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 7. SALES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id),
  card_id UUID NOT NULL REFERENCES cards(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  condition VARCHAR(20) DEFAULT 'Near_Mint' CHECK (condition IN ('Mint', 'Near_Mint', 'Excellent', 'Good', 'Light_Played', 'Played', 'Poor')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  purchase_id UUID REFERENCES purchases(id),
  listed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sold_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 8. MESSAGES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  subject VARCHAR(200),
  content TEXT NOT NULL CHECK (length(content) >= 1),
  message_type VARCHAR(20) DEFAULT 'private' CHECK (message_type IN ('private', 'trade_inquiry', 'support', 'system')),
  parent_message_id UUID REFERENCES messages(id),
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  related_card_id UUID REFERENCES cards(id),
  related_purchase_id UUID REFERENCES purchases(id),
  sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- INDEXES FOR PERFORMANCE
-- ====================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- Cards
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_expansion ON cards(expansion);
CREATE INDEX IF NOT EXISTS idx_cards_price ON cards(price);
CREATE INDEX IF NOT EXISTS idx_cards_available ON cards(is_available);

-- Collections (Collection Entries)
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_card_id ON collections(card_id);
CREATE INDEX IF NOT EXISTS idx_collections_for_trade ON collections(is_for_trade);

-- Cart Items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_card_id ON cart_items(card_id);

-- Purchases
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);

-- Sales
CREATE INDEX IF NOT EXISTS idx_sales_seller_id ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_card_id ON sales(card_id);
CREATE INDEX IF NOT EXISTS idx_sales_active ON sales(is_active);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sent_date ON messages(sent_date);

-- ====================
-- UPDATE TRIGGERS
-- ====================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
