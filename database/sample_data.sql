-- Sample Data for Pokemon Card Marketplace
-- Execute this AFTER creating schema and RLS policies
-- This creates test data for development

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
('550e8400-e29b-41d4-a716-446655440005', 'Charizard VMAX', 'Fire', 'Ultra_Rare', 'Champion\'s Path', 89.99, 2, 'Gigantamax Charizard. Its flames have become even more intense.', 330, '5ban Graphics', '20/73', 73, '2020-09-25', true),
('550e8400-e29b-41d4-a716-446655440006', 'Pikachu VMAX', 'Electric', 'Ultra_Rare', 'Vivid Voltage', 45.99, 6, 'Gigantamax Pikachu with incredible electric power.', 310, '5ban Graphics', '44/185', 185, '2020-11-13', true),
('550e8400-e29b-41d4-a716-446655440007', 'Eevee', 'Colorless', 'Common', 'Evolving Skies', 2.99, 50, 'Thanks to its unstable genetic makeup, this special Pokemon conceals many different possible evolutions.', 50, 'Kouki Saitou', '125/203', 203, '2021-08-27', true),

-- Trainer Cards
('550e8400-e29b-41d4-a716-446655440008', 'Professor Oak', 'Trainer', 'Uncommon', 'Base Set', 8.99, 15, 'Discard your hand and draw 7 cards.', null, 'Ken Sugimori', '88/102', 102, '1998-10-20', true),
('550e8400-e29b-41d4-a716-446655440009', 'Energy Retrieval', 'Trainer', 'Uncommon', 'Base Set', 3.99, 20, 'Trade 1 of the other cards in your hand for 2 basic Energy cards from your discard pile.', null, 'Keiji Kinebuchi', '81/102', 102, '1998-10-20', true),

-- Energy Cards
('550e8400-e29b-41d4-a716-446655440010', 'Fire Energy', 'Energy', 'Common', 'Base Set', 0.99, 100, 'Basic Fire Energy card.', null, 'Keiji Kinebuchi', '98/102', 102, '1998-10-20', true);

-- ====================
-- SAMPLE USERS (for testing - passwords will be handled by Supabase Auth)
-- ====================

-- Note: In production, users will be created through Supabase Auth
-- These are just for reference and testing the database structure

INSERT INTO users (id, first_name, last_name, email, password_hash, role, balance, is_active, email_verified) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'John', 'Trainer', 'john.trainer@example.com', 'hashed_password_here', 'buyer', 150.00, true, true),
('123e4567-e89b-12d3-a456-426614174001', 'Sarah', 'Collector', 'sarah.collector@example.com', 'hashed_password_here', 'seller', 320.50, true, true),
('123e4567-e89b-12d3-a456-426614174002', 'Mike', 'Champion', 'mike.champion@example.com', 'hashed_password_here', 'seller', 1250.75, true, true),
('123e4567-e89b-12d3-a456-426614174003', 'Admin', 'User', 'admin@pokecards.com', 'hashed_password_here', 'admin', 0.00, true, true);

-- ====================
-- SAMPLE USER PROFILES
-- ====================

INSERT INTO user_profiles (user_id, display_name, bio, location, trading_reputation, total_trades, successful_trades) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'PokeMaster2024', 'Just started collecting! Looking for Base Set cards.', 'New York, USA', 5, 2, 2),
('123e4567-e89b-12d3-a456-426614174001', 'CardCollectorSarah', 'Veteran collector with over 1000 cards. Specializing in holographics.', 'Los Angeles, USA', 95, 47, 45),
('123e4567-e89b-12d3-a456-426614174002', 'ChampionMike', 'Tournament player and serious collector. Have rare cards from every set.', 'Tokyo, Japan', 150, 89, 87),
('123e4567-e89b-12d3-a456-426614174003', 'AdminAccount', 'Platform administrator account.', 'Remote', 0, 0, 0);

-- ====================
-- SAMPLE COLLECTIONS
-- ====================

INSERT INTO collections (user_id, card_id, quantity, condition, acquired_price, current_value, is_for_trade) VALUES
-- John's Collection
('123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440004', 3, 'Near_Mint', 12.99, 15.99, false),
('123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440007', 5, 'Mint', 2.50, 2.99, true),
('123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440010', 20, 'Near_Mint', 0.75, 0.99, false),

-- Sarah's Collection
('123e4567-e89b-12d3-a456-426614174001', '550e8400-e29b-41d4-a716-446655440001', 1, 'Excellent', 450.00, 599.99, true),
('123e4567-e89b-12d3-a456-426614174001', '550e8400-e29b-41d4-a716-446655440002', 1, 'Near_Mint', 280.00, 299.99, false),
('123e4567-e89b-12d3-a456-426614174001', '550e8400-e29b-41d4-a716-446655440005', 2, 'Mint', 85.00, 89.99, true),

-- Mike's Collection
('123e4567-e89b-12d3-a456-426614174002', '550e8400-e29b-41d4-a716-446655440001', 3, 'Mint', 500.00, 599.99, false),
('123e4567-e89b-12d3-a456-426614174002', '550e8400-e29b-41d4-a716-446655440003', 2, 'Mint', 220.00, 249.99, true),
('123e4567-e89b-12d3-a456-446655440006', 1, 'Near_Mint', 42.00, 45.99, true);

-- ====================
-- SAMPLE SALES LISTINGS
-- ====================

INSERT INTO sales (seller_id, card_id, quantity, unit_price, condition, description, is_active) VALUES
('123e4567-e89b-12d3-a456-426614174001', '550e8400-e29b-41d4-a716-446655440001', 1, 580.00, 'Excellent', 'Beautiful Base Set Charizard. Small whitening on back corners but front is pristine.', true),
('123e4567-e89b-12d3-a456-426614174001', '550e8400-e29b-41d4-a716-446655440005', 1, 85.00, 'Mint', 'Perfect condition Charizard VMAX. Pulled from pack and immediately sleeved.', true),
('123e8400-e29b-12d3-a456-426614174002', '550e8400-e29b-41d4-a716-446655440003', 1, 240.00, 'Mint', 'Mint condition Base Set Venusaur. Never played.', true),
('123e4567-e89b-12d3-a456-426614174002', '550e8400-e29b-41d4-a716-446655440006', 1, 44.00, 'Near_Mint', 'Near mint Pikachu VMAX. Tiny edge wear but otherwise perfect.', true);

-- ====================
-- SAMPLE MESSAGES
-- ====================

INSERT INTO messages (sender_id, recipient_id, subject, content, message_type, related_card_id) VALUES
('123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001', 'Interest in your Charizard', 'Hi! I''m very interested in your Base Set Charizard. Would you consider $560? I can pay immediately.', 'trade_inquiry', '550e8400-e29b-41d4-a716-446655440001'),
('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Re: Interest in your Charizard', 'Thanks for your interest! The condition is excellent with only minor back whitening. I could do $570. Let me know if that works for you.', 'trade_inquiry', '550e8400-e29b-41d4-a716-446655440001'),
('123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Welcome to the community!', 'I saw you''re new here. If you have any questions about card grading or trading, feel free to ask! Happy collecting!', 'private', null);

-- ====================
-- SAMPLE CART ITEMS
-- ====================

INSERT INTO cart_items (user_id, card_id, quantity, unit_price, condition, seller_id) VALUES
('123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440004', 2, 15.99, 'Near_Mint', null),
('123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440008', 1, 8.99, 'Near_Mint', null);
