import { describe, it, expect, beforeEach } from 'vitest'
import { CreateUserAccount } from './CreateUserAccount'
import { User } from '../entities/User'
import { UserProfile } from '../entities/UserProfile'
import { CompleteUser } from '../entities/CompleteUser'

describe('CreateUserAccount Use Case', () => {
  let createUserAccount: CreateUserAccount

  beforeEach(() => {
    createUserAccount = new CreateUserAccount()
  })

  describe('Business Rules Validation', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      }

      const result = await createUserAccount.execute(invalidData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain('Name is required')
      expect(result.error).toContain('Email is required')
      expect(result.error).toContain('Password is required')
    })

    it('should validate email format', async () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'invalid-email',
        password: 'MiPassword123!',
        confirmPassword: 'MiPassword123!'
      }

      const result = await createUserAccount.execute(invalidData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain('Invalid email format')
    })

    it('should validate password strength', async () => {
      const weakPasswordData = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: '123',
        confirmPassword: '123'
      }

      const result = await createUserAccount.execute(weakPasswordData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain('Password must be at least 8 characters long')
    })

    it('should validate password confirmation match', async () => {
      const mismatchData = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'MiPassword123!',
        confirmPassword: 'DifferentPassword456!'
      }

      const result = await createUserAccount.execute(mismatchData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain('Passwords do not match')
    })

    it('should create valid domain entities when all validations pass', async () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'MiPassword123!',
        confirmPassword: 'MiPassword123!'
      }

      const result = await createUserAccount.execute(validData)

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeInstanceOf(CompleteUser)
      expect(result.data?.user.email).toBe('juan.perez@example.com')
      expect(result.data?.name).toBe('Juan Pérez') // Using CompleteUser getter
    })

    it('should set initial account status to pending verification', async () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'MiPassword123!',
        confirmPassword: 'MiPassword123!'
      }

      const result = await createUserAccount.execute(validData)

      expect(result.isSuccess).toBe(true)
      expect(result.data?.status).toBe('pending_verification') // Using CompleteUser getter
    })
  })
})
