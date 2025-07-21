import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import LoginForm from './LoginForm.vue';

// Mock del composable useLogin
const mockLoginUser = vi.fn();
const mockClearError = vi.fn();
const mockIsLoading = ref(false);
const mockError = ref<string | null>(null);

vi.mock('../composables/useLogin', () => ({
  useLogin: () => ({
    isLoading: mockIsLoading,
    error: mockError,
    loginUser: mockLoginUser,
    clearError: mockClearError
  })
}));

// Helper para simular envío de formulario
const setFormData = (wrapper: any, data: { email?: string; password?: string }) => {
  const vm = wrapper.vm as any;
  if (data.email !== undefined) {
    vm.formData.email = data.email;
  }
  if (data.password !== undefined) {
    vm.formData.password = data.password;
  }
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading.value = false;
    mockError.value = null;
    mockLoginUser.mockResolvedValue(true);
  });

  it('should render login form with all fields', () => {
    const wrapper = mount(LoginForm);

    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="email-field"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="password-field"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="login-button"]').exists()).toBe(true);
  });

  it('should show email validation error for empty email', async () => {
    const wrapper = mount(LoginForm);

    // Intentar enviar formulario sin email
    await wrapper.find('[data-testid="login-form"]').trigger('submit');

    expect(wrapper.find('[data-testid="email-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="email-error"]').text()).toBe('Email is required');
  });

  it('should show email validation error for invalid email format', async () => {
    const wrapper = mount(LoginForm);

    setFormData(wrapper, { email: 'invalid-email' });
    await wrapper.find('[data-testid="login-form"]').trigger('submit');

    expect(wrapper.find('[data-testid="email-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="email-error"]').text()).toBe('Invalid email format');
  });

  it('should show password validation error for empty password', async () => {
    const wrapper = mount(LoginForm);

    setFormData(wrapper, { email: 'test@example.com' });
    await wrapper.find('[data-testid="login-form"]').trigger('submit');

    expect(wrapper.find('[data-testid="password-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="password-error"]').text()).toBe('Password is required');
  });

  it('should call loginUser with form data on valid submission', async () => {
    const wrapper = mount(LoginForm);

    setFormData(wrapper, {
      email: 'test@example.com',
      password: 'password123'
    });

    await wrapper.find('[data-testid="login-form"]').trigger('submit');

    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should show loading state during submission', async () => {
    mockIsLoading.value = true;
    const wrapper = mount(LoginForm);

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="login-button"]').text()).toContain('Signing In...');
    expect(wrapper.find('[data-testid="login-button"]').attributes('disabled')).toBeDefined();
  });

  it('should disable form fields during loading', async () => {
    mockIsLoading.value = true;
    const wrapper = mount(LoginForm);

    expect(wrapper.find('[data-testid="email-field"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('[data-testid="password-field"]').attributes('disabled')).toBeDefined();
  });

  it('should display service error from composable', async () => {
    mockError.value = 'Invalid email or password';
    const wrapper = mount(LoginForm);

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="error-message"]').text()).toBe('Invalid email or password');
  });

  it('should clear service error when user starts typing', async () => {
    mockError.value = 'Some error';
    const wrapper = mount(LoginForm);

    const emailField = wrapper.find('[data-testid="email-field"]') as any;
    await emailField.setValue('test@example.com');

    expect(mockClearError).toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    const wrapper = mount(LoginForm);

    const emailField = wrapper.find('[data-testid="email-field"]');
    const passwordField = wrapper.find('[data-testid="password-field"]');

    expect(emailField.attributes('aria-required')).toBe('true');
    expect(passwordField.attributes('aria-required')).toBe('true');
    expect(emailField.attributes('type')).toBe('email');
    expect(passwordField.attributes('type')).toBe('password');
  });

  it('should prevent multiple submissions during loading', async () => {
    const wrapper = mount(LoginForm);

    setFormData(wrapper, {
      email: 'test@example.com',
      password: 'password123'
    });

    // Simular que está cargando
    mockIsLoading.value = true;

    // Intentar enviar de nuevo
    await wrapper.find('[data-testid="login-form"]').trigger('submit');

    expect(mockLoginUser).toHaveBeenCalledTimes(0);
  });

  it('should clear validation errors when fixing invalid fields', async () => {
    const wrapper = mount(LoginForm);

    // Causar error de validación
    await wrapper.find('[data-testid="login-form"]').trigger('submit');
    expect(wrapper.find('[data-testid="email-error"]').exists()).toBe(true);

    // Corregir el campo
    setFormData(wrapper, { email: 'test@example.com' });
    const emailField = wrapper.find('[data-testid="email-field"]') as any;
    await emailField.trigger('input');

    // El error de validación debe desaparecer
    expect(wrapper.find('[data-testid="email-error"]').exists()).toBe(false);
  });

  it('should show validation error in general error if no service error exists', async () => {
    mockError.value = null;
    const wrapper = mount(LoginForm);

    // Intentar enviar sin datos
    await wrapper.find('[data-testid="login-form"]').trigger('submit');

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="error-message"]').text()).toBe('Email is required');
  });
});
