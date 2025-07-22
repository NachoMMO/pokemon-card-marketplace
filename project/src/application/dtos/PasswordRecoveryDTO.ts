/**
 * DTO for password recovery request
 */
export class RequestPasswordResetDTO {
  constructor(
    public readonly email: string
  ) {}

  validate(): string[] {
    const errors: string[] = []

    // Required field validation
    if (!this.email?.trim()) {
      errors.push('Email is required')
    }

    // Email format validation
    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Invalid email format')
    }

    return errors
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

/**
 * DTO for password reset completion
 */
export class ResetPasswordDTO {
  constructor(
    public readonly token: string,
    public readonly newPassword: string,
    public readonly confirmPassword: string
  ) {}

  validate(): string[] {
    const errors: string[] = []

    // Required fields validation
    if (!this.token?.trim()) {
      errors.push('Reset token is required')
    }

    if (!this.newPassword) {
      errors.push('New password is required')
    }

    if (!this.confirmPassword) {
      errors.push('Password confirmation is required')
    }

    // Password strength validation
    if (this.newPassword && this.newPassword.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (this.newPassword && !this.isStrongPassword(this.newPassword)) {
      errors.push('Password must include uppercase, lowercase, numbers and symbols')
    }

    // Password confirmation validation
    if (this.newPassword !== this.confirmPassword) {
      errors.push('Passwords do not match')
    }

    return errors
  }

  private isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
  }
}

/**
 * Response DTO for password recovery operations
 */
export class PasswordRecoveryResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly message: string,
    public readonly error?: string
  ) {}

  static success(message: string): PasswordRecoveryResult {
    return new PasswordRecoveryResult(true, message)
  }

  static failure(error: string): PasswordRecoveryResult {
    return new PasswordRecoveryResult(false, '', error)
  }
}

/**
 * Result DTO for token validation
 */
export class TokenValidationResult {
  constructor(
    public readonly isValid: boolean,
    public readonly email?: string
  ) {}

  static valid(email: string): TokenValidationResult {
    return new TokenValidationResult(true, email)
  }

  static invalid(): TokenValidationResult {
    return new TokenValidationResult(false)
  }
}
