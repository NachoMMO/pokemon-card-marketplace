import type { SupabaseClient } from '@supabase/supabase-js';
import type { ICollectionRepository } from '../../../application/ports/repositories/ICollectionRepository';
import { CollectionEntry } from '../../../domain/entities/CollectionEntry';

// Tipo para mapear los datos de la base de datos
interface CollectionRow {
  id: string;
  user_id: string;
  card_id: string;
  quantity: number;
  condition: string;
  acquired_date: string;
  acquired_price: number;
  current_value: number;
  is_for_trade: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseCollectionRepository implements ICollectionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async addCard(collectionEntry: CollectionEntry): Promise<CollectionEntry> {
    try {
      const { data, error } = await this.supabase
        .from('collections')
        .insert({
          id: collectionEntry.id,
          user_id: collectionEntry.userId,
          card_id: collectionEntry.cardId,
          quantity: collectionEntry.quantity,
          condition: collectionEntry.condition,
          acquired_date: collectionEntry.acquiredDate.toISOString(),
          acquired_price: collectionEntry.acquiredPrice,
          current_value: collectionEntry.currentValue,
          is_for_trade: collectionEntry.isForTrade,
          notes: collectionEntry.notes
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error al añadir carta a la colección: ${error.message}`);
      }

      return this.mapRowToCollectionEntry(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al añadir carta a la colección'
      );
    }
  }

  async findByUserId(userId: string): Promise<CollectionEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener colección del usuario: ${error.message}`);
      }

      return data?.map(row => this.mapRowToCollectionEntry(row)) || [];
    } catch (error) {
      console.error('Error al obtener colección del usuario:', error);
      return [];
    }
  }

  async findByUserIdAndCardId(userId: string, cardId: string): Promise<CollectionEntry | null> {
    try {
      const { data, error } = await this.supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .eq('card_id', cardId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToCollectionEntry(data);
    } catch (error) {
      console.error('Error al buscar entrada de colección:', error);
      return null;
    }
  }

  async updateQuantity(id: string, quantity: number): Promise<CollectionEntry> {
    try {
      const { data, error } = await this.supabase
        .from('collections')
        .update({
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar cantidad: ${error.message}`);
      }

      return this.mapRowToCollectionEntry(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al actualizar cantidad'
      );
    }
  }

  async removeCard(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('collections')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error al eliminar carta de la colección:', error);
      return false;
    }
  }

  async countUniqueCards(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('collections')
        .select('card_id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Error al contar cartas únicas: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Error al contar cartas únicas:', error);
      return 0;
    }
  }

  async countTotalCards(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('collections')
        .select('quantity')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Error al contar cartas totales: ${error.message}`);
      }

      const totalCards = data?.reduce((total, row) => total + row.quantity, 0) || 0;
      return totalCards;
    } catch (error) {
      console.error('Error al contar cartas totales:', error);
      return 0;
    }
  }

  private mapRowToCollectionEntry(row: CollectionRow): CollectionEntry {
    return new CollectionEntry(
      row.id,
      row.user_id,
      row.card_id,
      row.quantity,
      row.condition,
      new Date(row.acquired_date),
      row.acquired_price,
      row.current_value,
      row.is_for_trade,
      row.notes,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
