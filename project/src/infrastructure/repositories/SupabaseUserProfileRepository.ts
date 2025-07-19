import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { IUserProfileRepository } from '../../application/ports/repositories/IUserProfileRepository'
import { UserProfile, UserRole, PrivacySettings, NotificationPreferences } from '../../domain/entities/UserProfile'

export class SupabaseUserProfileRepository implements IUserProfileRepository {
  private client: SupabaseClient

  constructor() {
    // In a real implementation, these would come from environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    this.client = createClient(supabaseUrl, supabaseKey)
  }

  async create(userProfile: UserProfile): Promise<UserProfile> {
    const { data, error } = await this.client
      .from('user_profiles')
      .insert({
        user_id: userProfile.userId,
        first_name: userProfile.firstName,
        last_name: userProfile.lastName,
        display_name: userProfile.displayName,
        balance: userProfile.balance,
        role: userProfile.role,
        trading_reputation: userProfile.tradingReputation,
        total_trades: userProfile.totalTrades,
        successful_trades: userProfile.successfulTrades,
        date_of_birth: userProfile.dateOfBirth,
        address: userProfile.address,
        city: userProfile.city,
        postal_code: userProfile.postalCode,
        country: userProfile.country,
        bio: userProfile.bio,
        avatar_url: userProfile.avatarUrl,
        location: userProfile.location,
        website: userProfile.website,
        social_media_links: userProfile.socialMediaLinks,
        privacy_settings: this.serializePrivacySettings(userProfile.privacySettings),
        notification_preferences: this.serializeNotificationPreferences(userProfile.notificationPreferences)
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null
      }
      throw new Error(`Failed to find user profile: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null
      }
      throw new Error(`Failed to find user profile by user ID: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async findByDisplayName(displayName: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('display_name', displayName)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null
      }
      throw new Error(`Failed to find user profile by display name: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async update(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const updateData: any = {}

    if (updates.firstName) updateData.first_name = updates.firstName
    if (updates.lastName) updateData.last_name = updates.lastName
    if (updates.displayName) updateData.display_name = updates.displayName
    if (updates.balance !== undefined) updateData.balance = updates.balance
    if (updates.role) updateData.role = updates.role
    if (updates.bio) updateData.bio = updates.bio
    if (updates.avatarUrl) updateData.avatar_url = updates.avatarUrl
    if (updates.location) updateData.location = updates.location
    // Add other fields as needed

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await this.client
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete user profile: ${error.message}`)
    }

    return true
  }

  private mapToEntity(data: any): UserProfile {
    return new UserProfile(
      data.id,
      data.user_id,
      data.first_name,
      data.last_name,
      data.display_name,
      data.balance || 0,
      data.role || UserRole.BUYER,
      data.trading_reputation || 0,
      data.total_trades || 0,
      data.successful_trades || 0,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      data.address,
      data.city,
      data.postal_code,
      data.country,
      data.bio,
      data.avatar_url,
      data.location,
      data.website,
      data.social_media_links || {},
      data.privacy_settings ? this.deserializePrivacySettings(data.privacy_settings) : new PrivacySettings(),
      data.notification_preferences ? this.deserializeNotificationPreferences(data.notification_preferences) : new NotificationPreferences()
    )
  }

  private serializePrivacySettings(settings: PrivacySettings): any {
    return {
      profilePublic: settings.profilePublic,
      collectionPublic: settings.collectionPublic,
      tradeHistoryPublic: settings.tradeHistoryPublic
    }
  }

  private deserializePrivacySettings(data: any): PrivacySettings {
    return new PrivacySettings(
      data.profilePublic ?? true,
      data.collectionPublic ?? false,
      data.tradeHistoryPublic ?? false
    )
  }

  private serializeNotificationPreferences(preferences: NotificationPreferences): any {
    return {
      emailNotifications: preferences.emailNotifications,
      pushNotifications: preferences.pushNotifications,
      tradeUpdates: preferences.tradeUpdates
    }
  }

  private deserializeNotificationPreferences(data: any): NotificationPreferences {
    return new NotificationPreferences(
      data.emailNotifications ?? true,
      data.pushNotifications ?? true,
      data.tradeUpdates ?? true
    )
  }
}
