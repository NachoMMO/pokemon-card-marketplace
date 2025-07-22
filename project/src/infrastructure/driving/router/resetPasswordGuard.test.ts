import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetPasswordGuard } from './guards'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

// Mock de window.location.hash
Object.defineProperty(window, 'location', {
  value: {
    hash: ''
  },
  writable: true
})

describe('resetPasswordGuard', () => {
  let to: RouteLocationNormalized
  let from: RouteLocationNormalized
  let next: NavigationGuardNext

  beforeEach(() => {
    to = {
      path: '/reset-password',
      query: {},
      params: {},
      hash: '',
      fullPath: '/reset-password',
      matched: [],
      meta: {},
      name: undefined,
      redirectedFrom: undefined
    }

    from = {
      path: '/',
      query: {},
      params: {},
      hash: '',
      fullPath: '/',
      matched: [],
      meta: {},
      name: undefined,
      redirectedFrom: undefined
    }

    next = vi.fn()

    // Reset window.location.hash
    window.location.hash = ''
  })

  it('should allow access when recovery token is present in hash', async () => {
    // Arrange
    window.location.hash = '#access_token=abc123&type=recovery&refresh_token=def456'

    // Act
    await resetPasswordGuard(to, from, next)

    // Assert
    expect(next).toHaveBeenCalledWith()
  })

  it('should allow access when token is present in query params', async () => {
    // Arrange
    to.query.token = 'reset-token-123'

    // Act
    await resetPasswordGuard(to, from, next)

    // Assert
    expect(next).toHaveBeenCalledWith()
  })

  it('should redirect to forgot password when no token is present', async () => {
    // Act
    await resetPasswordGuard(to, from, next)

    // Assert
    expect(next).toHaveBeenCalledWith('/forgot-password')
  })

  it('should redirect to forgot password when hash does not contain recovery type', async () => {
    // Arrange
    window.location.hash = '#access_token=abc123&type=signin&refresh_token=def456'

    // Act
    await resetPasswordGuard(to, from, next)

    // Assert
    expect(next).toHaveBeenCalledWith('/forgot-password')
  })

  it('should handle errors gracefully and redirect to forgot password', async () => {
    // Arrange
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Simulate error by making URLSearchParams throw
    const originalURLSearchParams = window.URLSearchParams
    window.URLSearchParams = vi.fn(() => {
      throw new Error('Test error')
    })

    // Act
    await resetPasswordGuard(to, from, next)

    // Assert
    expect(consoleError).toHaveBeenCalledWith('Error checking reset password access:', expect.any(Error))
    expect(next).toHaveBeenCalledWith('/forgot-password')

    // Cleanup
    window.URLSearchParams = originalURLSearchParams
    consoleError.mockRestore()
  })

  it('should allow access when recovery token is present without access_token', async () => {
    // Arrange
    window.location.hash = '#type=recovery&other_param=value'

    // Act
    await resetPasswordGuard(to, from, next)

    // Assert
    expect(next).toHaveBeenCalledWith()
  })
})
