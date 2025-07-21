import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import LogoutButton from './LogoutButton.vue';

// Mock del composable useLogout
const mockLogout = vi.fn();
const mockClearError = vi.fn();
const mockIsLoading = ref(false);
const mockError = ref<string | null>(null);

vi.mock('../composables/useLogout', () => ({
  useLogout: () => ({
    isLoading: mockIsLoading,
    error: mockError,
    logout: mockLogout,
    clearError: mockClearError
  })
}));

// Mock de Vue Router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

describe('LogoutButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading.value = false;
    mockError.value = null;
  });

  describe('Basic Rendering', () => {
    it('should render logout button', () => {
      const wrapper = mount(LogoutButton);

      const button = wrapper.find('[data-testid="logout-button"]');
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe('Cerrar Sesión');
    });

    it('should have logout button class', () => {
      const wrapper = mount(LogoutButton);

      const button = wrapper.find('[data-testid="logout-button"]');
      expect(button.classes()).toContain('logout-button');
    });
  });

  describe('User Interactions', () => {
    it('should call logout when button is clicked', async () => {
      mockLogout.mockResolvedValueOnce(true);
      const wrapper = mount(LogoutButton);

      const button = wrapper.find('[data-testid="logout-button"]');
      await button.trigger('click');

      expect(mockLogout).toHaveBeenCalledOnce();
      expect(mockLogout).toHaveBeenCalledWith('/');
    });

    it('should call logout with custom redirect path when provided', async () => {
      mockLogout.mockResolvedValueOnce(true);
      const wrapper = mount(LogoutButton, {
        props: {
          redirectPath: '/login'
        }
      });

      const button = wrapper.find('[data-testid="logout-button"]');
      await button.trigger('click');

      expect(mockLogout).toHaveBeenCalledOnce();
      expect(mockLogout).toHaveBeenCalledWith('/login');
    });
  });

  describe('Loading State', () => {
    it('should show loading state when logout is in progress', async () => {
      mockIsLoading.value = true;

      const wrapper = mount(LogoutButton);
      await nextTick();

      const button = wrapper.find('[data-testid="logout-button"]');
      expect(button.attributes('disabled')).toBeDefined();
      expect(button.text()).toContain('Cerrando sesión...');
    });

    it('should disable button during loading', async () => {
      mockIsLoading.value = true;

      const wrapper = mount(LogoutButton);
      await nextTick();

      const button = wrapper.find('[data-testid="logout-button"]');
      expect(button.attributes('disabled')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when logout fails', async () => {
      mockError.value = 'Error al cerrar sesión';

      const wrapper = mount(LogoutButton);
      await nextTick();

      const errorMessage = wrapper.find('[data-testid="logout-error"]');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toContain('Error al cerrar sesión');
    });

    it('should clear error when clear error is called', async () => {
      mockError.value = 'Error al cerrar sesión';

      const wrapper = mount(LogoutButton);
      await nextTick();

      const clearButton = wrapper.find('[data-testid="clear-error-button"]');
      await clearButton.trigger('click');

      expect(mockClearError).toHaveBeenCalledOnce();
    });
  });

  describe('Props', () => {
    it('should accept custom redirect path prop', () => {
      const wrapper = mount(LogoutButton, {
        props: {
          redirectPath: '/custom-path'
        }
      });

      expect(wrapper.props('redirectPath')).toBe('/custom-path');
    });

    it('should use default redirect path when not provided', () => {
      const wrapper = mount(LogoutButton);

      expect(wrapper.props('redirectPath')).toBe('/');
    });

    it('should accept custom button text prop', () => {
      const wrapper = mount(LogoutButton, {
        props: {
          buttonText: 'Salir'
        }
      });

      const button = wrapper.find('[data-testid="logout-button"]');
      expect(button.text()).toBe('Salir');
    });
  });
});
