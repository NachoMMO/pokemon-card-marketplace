// Setup global para tests
import { vi } from 'vitest';

// Configurar timezone para tests consistentes
process.env.TZ = 'UTC';

// Mock de console para tests más limpios
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock de fetch global
global.fetch = vi.fn();

// Mock de URL y URLSearchParams para navegador
global.URL = URL;
global.URLSearchParams = URLSearchParams;
