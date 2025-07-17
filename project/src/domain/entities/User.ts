// User entity representing Supabase Auth user
// This entity represents the core user data managed by Supabase Auth
export class User {
  constructor(
    public readonly id: string, // UUID from auth.users
    public readonly email: string, // Managed by Supabase Auth
    public readonly emailConfirmed: boolean, // email_confirmed_at !== null
    public readonly createdAt: Date, // From auth.users.created_at
    public readonly updatedAt: Date  // From auth.users.updated_at
  ) {}
}
