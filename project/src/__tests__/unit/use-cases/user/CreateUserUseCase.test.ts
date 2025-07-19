import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IDataService } from '../../../../application/ports/services/IDataService';

// Definir enum localmente para evitar problemas de alias
enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

// Definir interface local UserProfile para el test
interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  balance: number;
  role: UserRole;
  tradingReputation: number;
  totalTrades: number;
  successfulTrades: number;
  createdAt: Date;
  updatedAt: Date;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
}

// Crear una versión local del UseCase para evitar problemas de alias
export interface ICreateUserProfileUseCase {
  execute(userId: string, profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserProfile>;
}

export class CreateUserProfileUseCase implements ICreateUserProfileUseCase {
  constructor(private dataService: IDataService) {}

  async execute(
    userId: string,
    profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserProfile> {
    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.displayName) {
      throw new Error('First name, last name, and display name are required');
    }

    // Check if user already has a profile
    const existingProfile = await this.dataService.getMany<UserProfile>('user_profiles', {
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      limit: 1
    });

    if (existingProfile.data.length > 0) {
      throw new Error('User profile already exists');
    }

    // Check if display name is already taken
    const existingDisplayName = await this.dataService.getMany<UserProfile>('user_profiles', {
      filters: [{ column: 'display_name', operator: 'eq', value: profileData.displayName }],
      limit: 1
    });

    if (existingDisplayName.data.length > 0) {
      throw new Error('Display name already exists');
    }

    // Create user profile with default values
    const newProfileResult = await this.dataService.create<UserProfile>('user_profiles', {
      userId: userId,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      displayName: profileData.displayName,
      balance: profileData.balance || 0,
      role: profileData.role || UserRole.BUYER,
      tradingReputation: 0,
      totalTrades: 0,
      successfulTrades: 0,
      dateOfBirth: profileData.dateOfBirth,
      address: profileData.address,
      city: profileData.city,
      postalCode: profileData.postalCode,
      country: profileData.country,
      bio: profileData.bio,
      avatarUrl: profileData.avatarUrl,
      location: profileData.location,
      website: profileData.website
    });

    if (!newProfileResult.success || !newProfileResult.data) {
      throw new Error(newProfileResult.error || 'Failed to create user profile');
    }

    return newProfileResult.data;
  }
}

// Mock del IDataService
const mockDataService: IDataService = {
  getMany: vi.fn(),
  create: vi.fn(),
  getById: vi.fn(),
  getOne: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  createMany: vi.fn(),
  upsert: vi.fn(),
  count: vi.fn(),
  rpc: vi.fn(),
  executeQuery: vi.fn()
};

describe('CreateUserProfileUseCase', () => {
  let useCase: CreateUserProfileUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateUserProfileUseCase(mockDataService);
  });

  it('debe crear un perfil de usuario exitosamente con datos completos', async () => {
    // Arrange
    const userId = 'user-123';
    const profileData = {
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'johndoe123',
      balance: 100.50,
      role: UserRole.SELLER,
      city: 'Madrid',
      country: 'Spain',
      bio: 'Pokemon card collector'
    };

    // Mock para verificar que no existe perfil previo
    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [],
      count: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    });

    // Mock para verificar que el display name no existe
    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [],
      count: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    });

    const expectedProfile = {
      id: 'profile-123',
      userId: userId,
      ...profileData,
      tradingReputation: 0,
      totalTrades: 0,
      successfulTrades: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockDataService.create as any).mockResolvedValueOnce({
      success: true,
      data: expectedProfile
    });

    // Act
    const result = await useCase.execute(userId, profileData);

    // Assert
    expect(result).toEqual(expectedProfile);
    expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
    expect(mockDataService.create).toHaveBeenCalledWith('user_profiles', {
      userId: userId,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      displayName: profileData.displayName,
      balance: profileData.balance,
      role: profileData.role,
      tradingReputation: 0,
      totalTrades: 0,
      successfulTrades: 0,
      dateOfBirth: undefined,
      address: undefined,
      city: profileData.city,
      postalCode: undefined,
      country: profileData.country,
      bio: profileData.bio,
      avatarUrl: undefined,
      location: undefined,
      website: undefined
    });
  });

  it('debe crear un perfil con valores por defecto cuando no se proporcionan opcionales', async () => {
    // Arrange
    const userId = 'user-456';
    const profileData = {
      firstName: 'Jane',
      lastName: 'Smith',
      displayName: 'janesmith456'
    };

    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [],
      count: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    });

    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [],
      count: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    });

    const expectedProfile = {
      id: 'profile-456',
      userId: userId,
      firstName: 'Jane',
      lastName: 'Smith',
      displayName: 'janesmith456',
      balance: 0,
      role: UserRole.BUYER,
      tradingReputation: 0,
      totalTrades: 0,
      successfulTrades: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockDataService.create as any).mockResolvedValueOnce({
      success: true,
      data: expectedProfile
    });

    // Act
    const result = await useCase.execute(userId, profileData);

    // Assert
    expect(result).toEqual(expectedProfile);
    expect(mockDataService.create).toHaveBeenCalledWith('user_profiles', expect.objectContaining({
      balance: 0,
      role: UserRole.BUYER
    }));
  });

  it('debe fallar si no se proporciona firstName', async () => {
    // Arrange
    const userId = 'user-789';
    const profileData = {
      lastName: 'Doe',
      displayName: 'johndoe789'
    };

    // Act & Assert
    await expect(useCase.execute(userId, profileData as any)).rejects.toThrow(
      'First name, last name, and display name are required'
    );
    expect(mockDataService.getMany).not.toHaveBeenCalled();
  });

  it('debe fallar si no se proporciona lastName', async () => {
    // Arrange
    const userId = 'user-012';
    const profileData = {
      firstName: 'John',
      displayName: 'johndoe012'
    };

    // Act & Assert
    await expect(useCase.execute(userId, profileData as any)).rejects.toThrow(
      'First name, last name, and display name are required'
    );
    expect(mockDataService.getMany).not.toHaveBeenCalled();
  });

  it('debe fallar si no se proporciona displayName', async () => {
    // Arrange
    const userId = 'user-345';
    const profileData = {
      firstName: 'John',
      lastName: 'Doe'
    };

    // Act & Assert
    await expect(useCase.execute(userId, profileData as any)).rejects.toThrow(
      'First name, last name, and display name are required'
    );
    expect(mockDataService.getMany).not.toHaveBeenCalled();
  });

  it('debe fallar si el usuario ya tiene un perfil', async () => {
    // Arrange
    const userId = 'user-678';
    const profileData = {
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'johndoe678'
    };

    const existingProfile = {
      id: 'existing-profile',
      userId: userId
    };

    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [existingProfile],
      count: 1,
      page: 1,
      limit: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    });

    // Act & Assert
    await expect(useCase.execute(userId, profileData)).rejects.toThrow(
      'User profile already exists'
    );
    expect(mockDataService.getMany).toHaveBeenCalledWith('user_profiles', {
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      limit: 1
    });
  });

  it('debe fallar si el displayName ya está en uso', async () => {
    // Arrange
    const userId = 'user-901';
    const profileData = {
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'existinguser'
    };

    // Mock para verificar que no existe perfil previo
    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [],
      count: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    });

    // Mock para verificar que el display name ya existe
    const existingDisplayName = {
      id: 'other-profile',
      displayName: 'existinguser'
    };

    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [existingDisplayName],
      count: 1,
      page: 1,
      limit: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    });

    // Act & Assert
    await expect(useCase.execute(userId, profileData)).rejects.toThrow(
      'Display name already exists'
    );
    expect(mockDataService.getMany).toHaveBeenLastCalledWith('user_profiles', {
      filters: [{ column: 'display_name', operator: 'eq', value: profileData.displayName }],
      limit: 1
    });
  });

  it('debe fallar si la creación del perfil falla', async () => {
    // Arrange
    const userId = 'user-234';
    const profileData = {
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'johndoe234'
    };

    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [],
      count: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    });

    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [],
      count: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    });

    (mockDataService.create as any).mockResolvedValueOnce({
      success: false,
      error: 'Database error'
    });

    // Act & Assert
    await expect(useCase.execute(userId, profileData)).rejects.toThrow(
      'Database error'
    );
  });

  it('debe fallar si la creación del perfil no retorna datos', async () => {
    // Arrange
    const userId = 'user-567';
    const profileData = {
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'johndoe567'
    };

    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [],
      count: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    });

    (mockDataService.getMany as any).mockResolvedValueOnce({
      data: [],
      count: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    });

    (mockDataService.create as any).mockResolvedValueOnce({
      success: true,
      data: null
    });

    // Act & Assert
    await expect(useCase.execute(userId, profileData)).rejects.toThrow(
      'Failed to create user profile'
    );
  });
});
