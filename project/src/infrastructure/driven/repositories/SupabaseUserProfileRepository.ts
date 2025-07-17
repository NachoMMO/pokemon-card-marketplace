import type { SupabaseClient } from '@supabase/supabase-js';
import type { IUserProfileRepository } from '../../../application/ports/repositories/IUserProfileRepository';
import { UserProfile, UserRole, PrivacySettings, NotificationPreferences } from '../../../domain/entities/UserProfile';

// Tipo para mapear los datos de la base de datos
interface UserProfileRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  balance: number;
  role: string;
  trading_reputation: number;
  total_trades: number;
  successful_trades: number;
  created_at: string;
  updated_at: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  social_media_links: Record<string, string>;
  privacy_settings: {
    profile_public: boolean;
    collection_public: boolean;
    trade_history_public: boolean;
  };
  notification_preferences: {
    email_notifications: boolean;
    push_notifications: boolean;
    trade_updates: boolean;
  };
}

export class SupabaseUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(userProfile: UserProfile): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert({
          id: userProfile.id,
          user_id: userProfile.userId,
          first_name: userProfile.firstName,
          last_name: userProfile.lastName,
          display_name: userProfile.displayName,
          balance: userProfile.balance,
          role: userProfile.role,
          trading_reputation: userProfile.tradingReputation,
          total_trades: userProfile.totalTrades,
          successful_trades: userProfile.successfulTrades,
          date_of_birth: userProfile.dateOfBirth?.toISOString(),
          address: userProfile.address,
          city: userProfile.city,
          postal_code: userProfile.postalCode,
          country: userProfile.country,
          bio: userProfile.bio,
          avatar_url: userProfile.avatarUrl,
          location: userProfile.location,
          website: userProfile.website,
          social_media_links: userProfile.socialMediaLinks,
          privacy_settings: {
            profile_public: userProfile.privacySettings.profilePublic,
            collection_public: userProfile.privacySettings.collectionPublic,
            trade_history_public: userProfile.privacySettings.tradeHistoryPublic
          },
          notification_preferences: {
            email_notifications: userProfile.notificationPreferences.emailNotifications,
            push_notifications: userProfile.notificationPreferences.pushNotifications,
            trade_updates: userProfile.notificationPreferences.tradeUpdates
          }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear perfil de usuario: ${error.message}`);
      }

      return this.mapRowToUserProfile(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al crear perfil de usuario'
      );
    }
  }

  async findById(id: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToUserProfile(data);
    } catch (error) {
      console.error('Error al buscar perfil por ID:', error);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToUserProfile(data);
    } catch (error) {
      console.error('Error al buscar perfil por user_id:', error);
      return null;
    }
  }

  async findByDisplayName(displayName: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('display_name', displayName)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToUserProfile(data);
    } catch (error) {
      console.error('Error al buscar perfil por display_name:', error);
      return null;
    }
  }

  async update(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const updateData: Partial<Record<string, any>> = {};

      // Mapear los campos de la entidad a los campos de la base de datos
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
      if (updates.balance !== undefined) updateData.balance = updates.balance;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.website !== undefined) updateData.website = updates.website;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.city !== undefined) updateData.city = updates.city;
      if (updates.postalCode !== undefined) updateData.postal_code = updates.postalCode;
      if (updates.country !== undefined) updateData.country = updates.country;
      if (updates.socialMediaLinks !== undefined) updateData.social_media_links = updates.socialMediaLinks;

      if (updates.privacySettings !== undefined) {
        updateData.privacy_settings = {
          profile_public: updates.privacySettings.profilePublic,
          collection_public: updates.privacySettings.collectionPublic,
          trade_history_public: updates.privacySettings.tradeHistoryPublic
        };
      }

      if (updates.notificationPreferences !== undefined) {
        updateData.notification_preferences = {
          email_notifications: updates.notificationPreferences.emailNotifications,
          push_notifications: updates.notificationPreferences.pushNotifications,
          trade_updates: updates.notificationPreferences.tradeUpdates
        };
      }

      // Siempre actualizar el timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar perfil de usuario: ${error.message}`);
      }

      return this.mapRowToUserProfile(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al actualizar perfil de usuario'
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error al eliminar perfil de usuario:', error);
      return false;
    }
  }

  private mapRowToUserProfile(row: UserProfileRow): UserProfile {
    return new UserProfile(
      row.id,
      row.user_id,
      row.first_name,
      row.last_name,
      row.display_name,
      row.balance,
      row.role as UserRole,
      row.trading_reputation,
      row.total_trades,
      row.successful_trades,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.date_of_birth ? new Date(row.date_of_birth) : undefined,
      row.address,
      row.city,
      row.postal_code,
      row.country,
      row.bio,
      row.avatar_url,
      row.location,
      row.website,
      row.social_media_links || {},
      new PrivacySettings(
        row.privacy_settings?.profile_public ?? true,
        row.privacy_settings?.collection_public ?? false,
        row.privacy_settings?.trade_history_public ?? false
      ),
      new NotificationPreferences(
        row.notification_preferences?.email_notifications ?? true,
        row.notification_preferences?.push_notifications ?? true,
        row.notification_preferences?.trade_updates ?? true
      )
    );
  }
}
