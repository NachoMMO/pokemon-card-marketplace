import { User } from '../entities/User'
import { UserProfile } from '../entities/UserProfile'
import { CompleteUser } from '../entities/CompleteUser'

export interface CreateUserAccountRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface CreateUserAccountResult {
  isSuccess: boolean
  data?: CompleteUser
  error?: string
}

export class CreateUserAccount {
  async execute(request: CreateUserAccountRequest): Promise<CreateUserAccountResult> {
    // Validate input data
    const validationErrors = this.validateInput(request)
    if (validationErrors.length > 0) {
      return {
        isSuccess: false,
        error: validationErrors.join(', ')
      }
    }

    try {
      // Create domain entities
      const user = User.create({
        email: request.email,
        status: 'pending_verification'
      })

      const profile = UserProfile.create({
        name: request.name,
        balance: 0
      })

      const completeUser = CompleteUser.create(user, profile)

      return {
        isSuccess: true,
        data: completeUser
      }
    } catch (error) {
      return {
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private validateInput(request: CreateUserAccountRequest): string[] {
    const errors: string[] = []

    // Required fields validation
    if (!request.name?.trim()) {
      errors.push('Name is required')
    }

    if (!request.email?.trim()) {
      errors.push('Email is required')
    }

    if (!request.password) {
      errors.push('Password is required')
    }

    // Email format validation
    if (request.email && !this.isValidEmail(request.email)) {
      errors.push('Invalid email format')
    }

    // Password strength validation
    if (request.password && request.password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    // Password confirmation validation
    if (request.password !== request.confirmPassword) {
      errors.push('Passwords do not match')
    }

    return errors
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
