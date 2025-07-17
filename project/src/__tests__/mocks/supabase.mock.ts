// Mock de Supabase para tests
import { vi } from 'vitest';

export const createMockSupabaseClient = () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    count: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis(),

    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },

    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      createSignedUrl: vi.fn(),
      getPublicUrl: vi.fn(),
    },

    channel: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
    removeChannel: vi.fn(),
  };

  return mockSupabase;
};

// Datos de prueba comunes
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  aud: 'authenticated',
  role: 'authenticated',
};

export const mockUserProfile = {
  id: 'profile-123',
  user_id: 'user-123',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  bio: 'Test bio',
  location: 'Test Location',
  website: null,
  balance: 100.00,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

export const mockCard = {
  id: 'card-123',
  name: 'Pikachu',
  set_name: 'Base Set',
  set_number: '25',
  rarity: 'Common',
  type: 'Electric',
  hp: 60,
  image_url: 'https://example.com/pikachu.jpg',
  market_price: 10.00,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

export const mockCartItem = {
  id: 'cart-item-123',
  user_id: 'user-123',
  card_id: 'card-123',
  sale_id: 'sale-123',
  quantity: 2,
  created_at: '2023-01-01T00:00:00Z',
};

export const mockSale = {
  id: 'sale-123',
  seller_id: 'user-456',
  card_id: 'card-123',
  quantity: 10,
  price_per_unit: 10.00,
  condition: 'Near Mint',
  status: 'active',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

// Helpers para respuestas de Supabase
export const createSuccessResponse = <T>(data: T): { success: true; data: T; error?: undefined } => ({
  success: true,
  data,
});

export const createErrorResponse = (message: string): { success: false; data?: undefined; error: string } => ({
  success: false,
  error: message,
});

export const createPaginatedResult = <T>(data: T[], page = 1, limit = 20): {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} => ({
  data,
  count: data.length,
  page,
  limit,
  totalPages: Math.ceil(data.length / limit),
  hasNext: page * limit < data.length,
  hasPrev: page > 1,
});
