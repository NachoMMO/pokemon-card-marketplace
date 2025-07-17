-- Row Level Security (RLS) Policies - CORRECTED VERSION
-- Execute this AFTER creating the schema
-- These policies ensure users can only access their own data

-- ====================
-- ENABLE RLS ON ALL TABLES
-- ====================
-- NOTE: We don't enable RLS on auth.users because it's managed by Supabase Auth

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ====================
-- USER_PROFILES TABLE POLICIES
-- ====================

-- Users can view their own profile
CREATE POLICY "Users can view own user_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view public profiles
CREATE POLICY "Users can view public profiles" ON user_profiles
  FOR SELECT USING (
    (privacy_settings->>'profilePublic')::boolean = true
  );

-- Users can update their own profile
CREATE POLICY "Users can update own user_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own user_profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ====================
-- CARDS TABLE POLICIES
-- ====================

-- Everyone can view available cards (public catalog)
CREATE POLICY "Anyone can view available cards" ON cards
  FOR SELECT USING (is_available = true);

-- Admins can manage all cards
CREATE POLICY "Admins can manage cards" ON cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ====================
-- COLLECTION_ENTRIES TABLE POLICIES
-- ====================

-- Users can view their own collection entries
CREATE POLICY "Users can view own collection entries" ON collection_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view collection entries that are marked for trade
CREATE POLICY "Users can view tradeable collection entries" ON collection_entries
  FOR SELECT USING (is_for_trade = true);

-- Users can manage their own collection entries
CREATE POLICY "Users can manage own collection entries" ON collection_entries
  FOR ALL USING (auth.uid() = user_id);

-- ====================
-- CART_ITEMS TABLE POLICIES
-- ====================

-- Users can only access their own cart
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- ====================
-- PURCHASES TABLE POLICIES
-- ====================

-- Users can view purchases where they are buyer or seller
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Users can insert purchases as buyer
CREATE POLICY "Users can create purchases as buyer" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update purchase status
CREATE POLICY "Sellers can update purchase status" ON purchases
  FOR UPDATE USING (auth.uid() = seller_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases" ON purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ====================
-- SALES TABLE POLICIES
-- ====================

-- Everyone can view active sales
CREATE POLICY "Anyone can view active sales" ON sales
  FOR SELECT USING (is_active = true);

-- Users can manage their own sales
CREATE POLICY "Users can manage own sales" ON sales
  FOR ALL USING (auth.uid() = seller_id);

-- ====================
-- MESSAGES TABLE POLICIES
-- ====================

-- Users can view messages where they are sender or recipient
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Users can send messages (insert as sender)
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read, archive)
CREATE POLICY "Users can update received messages" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Users can update messages they sent (before being read)
CREATE POLICY "Users can update sent messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id AND is_read = false);

-- ====================
-- HELPER FUNCTIONS
-- ====================

-- Function to check if user has admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view another user's collection
CREATE OR REPLACE FUNCTION can_view_collection(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Can view own collection
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Can view if collection is public
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = target_user_id 
    AND (privacy_settings->>'collectionPublic')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
