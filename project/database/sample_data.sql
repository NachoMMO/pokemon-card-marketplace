-- Sample Data for Pokemon Card Marketplace
-- Execute this AFTER creating schema and RLS policies
-- This creates test data for development

-- ====================
-- SAMPLE USER PROFILES (using actual Supabase auth user)
-- ====================

-- Note: Using the actual Supabase user ID provided: d4531d11-7723-4d93-aa8b-ae8117c3c8a2
-- In production, these profiles will be created when users sign up through Supabase Auth

INSERT INTO user_profiles (user_id, first_name, last_name, display_name, bio, location, balance, role, trading_reputation, total_trades, successful_trades) VALUES
('d4531d11-7723-4d93-aa8b-ae8117c3c8a2', 'Test', 'User', 'TestUser2024', 'This is a test user profile for development.', 'Madrid, Spain', 150.00, 'buyer', 5, 2, 2);

-- Additional test profiles (these would need actual Supabase user IDs in production)
-- For now, using placeholder UUIDs - replace with real Supabase user IDs when available

-- ====================
-- SAMPLE CARDS
-- ====================

INSERT INTO cards (id, name, type, rarity, expansion, price, stock, description, hp, artist, card_number, set_total, release_date, is_available) VALUES
-- Base Set Classics
('550e8400-e29b-41d4-a716-446655440001', 'Charizard', 'Fire', 'Rare_Holo', 'Base Set', 599.99, 3, 'The iconic fire-type dragon Pokemon. Breathes fire that is hot enough to melt almost anything.', 120, 'Mitsuhiro Arita', '4/102', 102, '1998-10-20', true),
('550e8400-e29b-41d4-a716-446655440002', 'Blastoise', 'Water', 'Rare_Holo', 'Base Set', 299.99, 5, 'A brutally vicious Pokemon that is very difficult to train. Known for its powerful water attacks.', 100, 'Ken Sugimori', '2/102', 102, '1998-10-20', true),
('550e8400-e29b-41d4-a716-446655440003', 'Venusaur', 'Grass', 'Rare_Holo', 'Base Set', 249.99, 4, 'Its plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight.', 100, 'Ken Sugimori', '15/102', 102, '1998-10-20', true),
('550e8400-e29b-41d4-a716-446655440004', 'Pikachu', 'Electric', 'Common', 'Base Set', 15.99, 25, 'When several of these Pokemon gather, their electricity could build and cause lightning storms.', 40, 'Atsuko Nishida', '58/102', 102, '1998-10-20', true),

-- Modern Cards
('550e8400-e29b-41d4-a716-446655440005', 'Charizard VMAX', 'Fire', 'Ultra_Rare', 'Champions Path', 89.99, 2, 'Gigantamax Charizard. Its flames have become even more intense.', 330, '5ban Graphics', '20/73', 73, '2020-09-25', true),
('550e8400-e29b-41d4-a716-446655440006', 'Pikachu VMAX', 'Electric', 'Ultra_Rare', 'Vivid Voltage', 45.99, 6, 'Gigantamax Pikachu with incredible electric power.', 310, '5ban Graphics', '44/185', 185, '2020-11-13', true),
('550e8400-e29b-41d4-a716-446655440007', 'Eevee', 'Colorless', 'Common', 'Evolving Skies', 2.99, 50, 'Thanks to its unstable genetic makeup, this special Pokemon conceals many different possible evolutions.', 50, 'Kouki Saitou', '125/203', 203, '2021-08-27', true),

-- Trainer Cards
('550e8400-e29b-41d4-a716-446655440008', 'Professor Oak', 'Trainer', 'Uncommon', 'Base Set', 8.99, 15, 'Discard your hand and draw 7 cards.', null, 'Ken Sugimori', '88/102', 102, '1998-10-20', true),
('550e8400-e29b-41d4-a716-446655440009', 'Energy Retrieval', 'Trainer', 'Uncommon', 'Base Set', 3.99, 20, 'Trade 1 of the other cards in your hand for 2 basic Energy cards from your discard pile.', null, 'Keiji Kinebuchi', '81/102', 102, '1998-10-20', true),

-- Energy Cards
('550e8400-e29b-41d4-a716-446655440010', 'Fire Energy', 'Energy', 'Common', 'Base Set', 0.99, 100, 'Basic Fire Energy card.', null, 'Keiji Kinebuchi', '98/102', 102, '1998-10-20', true);

-- ====================
-- SAMPLE COLLECTIONS (using actual user ID)
-- ====================

INSERT INTO collection_entries (user_id, card_id, quantity, condition, acquired_price, current_value, is_for_trade) VALUES
-- Test User's Collection
('d4531d11-7723-4d93-aa8b-ae8117c3c8a2', '550e8400-e29b-41d4-a716-446655440004', 3, 'Near_Mint', 12.99, 15.99, false),
('d4531d11-7723-4d93-aa8b-ae8117c3c8a2', '550e8400-e29b-41d4-a716-446655440007', 5, 'Mint', 2.50, 2.99, true),
('d4531d11-7723-4d93-aa8b-ae8117c3c8a2', '550e8400-e29b-41d4-a716-446655440010', 20, 'Near_Mint', 0.75, 0.99, false);

-- ====================
-- SAMPLE SALES LISTINGS (using actual user ID)
-- ====================

INSERT INTO sales (seller_id, card_id, quantity, unit_price, condition, description, is_active) VALUES
('d4531d11-7723-4d93-aa8b-ae8117c3c8a2', '550e8400-e29b-41d4-a716-446655440007', 1, 2.80, 'Mint', 'Perfect condition Eevee. Pulled from pack and immediately sleeved.', true);

-- ====================
-- SAMPLE CART ITEMS (using actual user ID)
-- ====================

INSERT INTO cart_items (user_id, card_id, quantity, unit_price, condition, seller_id) VALUES
('d4531d11-7723-4d93-aa8b-ae8117c3c8a2', '550e8400-e29b-41d4-a716-446655440004', 2, 15.99, 'Near_Mint', null);
