import { User } from './User'
import { UserProfile } from './UserProfile'

// CompleteUser aggregate combining User (Supabase Auth) and UserProfile (business data)
export class CompleteUser {
  constructor(
    public readonly user: User,
    public readonly profile: UserProfile
  ) {}

  static create(user: User, profile: UserProfile): CompleteUser {
    return new CompleteUser(user, profile)
  }

  get id(): string {
    return this.user.id
  }

  get email(): string {
    return this.user.email
  }

  get name(): string {
    return `${this.profile.firstName} ${this.profile.lastName}`
  }

  get displayName(): string {
    return this.profile.displayName
  }

  get isEmailConfirmed(): boolean {
    return this.user.emailConfirmed
  }

  get status(): string {
    return this.user.emailConfirmed ? 'active' : 'pending_verification'
  }
}
