export class CreateUserAccountRequest {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly confirmPassword: string
  ) {}

  validate(): string[] {
    const errors: string[] = []

    // Required fields validation
    if (!this.name?.trim()) {
      errors.push('Name is required')
    }

    if (!this.email?.trim()) {
      errors.push('Email is required')
    }

    if (!this.password) {
      errors.push('Password is required')
    }

    // Email format validation
    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Invalid email format')
    }

    // Password strength validation
    if (this.password && this.password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    // Password confirmation validation
    if (this.password !== this.confirmPassword) {
      errors.push('Passwords do not match')
    }

    return errors
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
