export class User {
  constructor(
    public readonly id: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public dateOfBirth: Date,
    public address: string,
    public city: string,
    public postalCode: string,
    public country: string,
    public balance: number,
    public role: string,
    public isActive: boolean,
    public emailVerified: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
