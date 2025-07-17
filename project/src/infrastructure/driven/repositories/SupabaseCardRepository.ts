import type { SupabaseClient } from '@supabase/supabase-js';
import type { ICardRepository, CardSearchCriteria } from '../../../application/ports/repositories/ICardRepository';
import { Card } from '../../../domain/entities/Card';

// Tipo para mapear los datos de la base de datos
interface CardRow {
  id: string;
  pokemon_tcg_id: string;
  name: string;
  image_url: string;
  image_url_hi_res?: string;
  set: string;
  set_name: string;
  rarity: string;
  types: string[];
  subtypes: string[];
  number: string;
  artist?: string;
  flavor_text?: string;
  national_pokedex_numbers?: number[];
  market_price?: number;
  created_at: string;
  updated_at: string;
}

export class SupabaseCardRepository implements ICardRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Card | null> {
    try {
      const { data, error } = await this.supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToCard(data);
    } catch (error) {
      console.error('Error al buscar carta por ID:', error);
      return null;
    }
  }

  async search(criteria: {
    name?: string;
    set?: string;
    rarity?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<Card[]> {
    try {
      let query = this.supabase.from('cards').select('*');

      // Aplicar filtros
      if (criteria.name) {
        query = query.ilike('name', `%${criteria.name}%`);
      }
      if (criteria.set) {
        query = query.eq('set', criteria.set);
      }
      if (criteria.rarity) {
        query = query.eq('rarity', criteria.rarity);
      }
      if (criteria.type) {
        query = query.contains('types', [criteria.type]);
      }

      // Aplicar paginación
      const limit = criteria.limit || 20;
      const offset = criteria.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Ordenar por nombre
      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al buscar cartas: ${error.message}`);
      }

      return data?.map(row => this.mapRowToCard(row)) || [];
    } catch (error) {
      console.error('Error al buscar cartas:', error);
      return [];
    }
  }

  async findAll(limit: number = 20, offset: number = 0): Promise<Card[]> {
    try {
      const { data, error } = await this.supabase
        .from('cards')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Error al obtener cartas: ${error.message}`);
      }

      return data?.map(row => this.mapRowToCard(row)) || [];
    } catch (error) {
      console.error('Error al obtener cartas:', error);
      return [];
    }
  }

  async findBySet(setId: string, limit: number = 20, offset: number = 0): Promise<Card[]> {
    try {
      const { data, error } = await this.supabase
        .from('cards')
        .select('*')
        .eq('set', setId)
        .range(offset, offset + limit - 1)
        .order('number', { ascending: true });

      if (error) {
        throw new Error(`Error al obtener cartas del set: ${error.message}`);
      }

      return data?.map(row => this.mapRowToCard(row)) || [];
    } catch (error) {
      console.error('Error al obtener cartas del set:', error);
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Error al contar cartas: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Error al contar cartas:', error);
      return 0;
    }
  }

  async searchMarketplace(criteria: CardSearchCriteria, limit: number = 20, offset: number = 0): Promise<Card[]> {
    try {
      let query = this.supabase
        .from('cards')
        .select('*');

      // Aplicar filtros
      if (criteria.name) {
        query = query.ilike('name', `%${criteria.name}%`);
      }
      if (criteria.type) {
        query = query.contains('types', [criteria.type]);
      }
      if (criteria.rarity) {
        query = query.eq('rarity', criteria.rarity);
      }
      if (criteria.set || criteria.expansion) {
        const setFilter = criteria.set || criteria.expansion;
        query = query.eq('set_name', setFilter);
      }

      // Aplicar paginación
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al buscar cartas del marketplace: ${error.message}`);
      }

      return data?.map(row => this.mapRowToCard(row)) || [];
    } catch (error) {
      console.error('Error al buscar cartas del marketplace:', error);
      return [];
    }
  }

  async countMarketplace(criteria: CardSearchCriteria): Promise<number> {
    try {
      let query = this.supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      // Aplicar filtros
      if (criteria.name) {
        query = query.ilike('name', `%${criteria.name}%`);
      }
      if (criteria.type) {
        query = query.contains('types', [criteria.type]);
      }
      if (criteria.rarity) {
        query = query.eq('rarity', criteria.rarity);
      }
      if (criteria.set || criteria.expansion) {
        const setFilter = criteria.set || criteria.expansion;
        query = query.eq('set_name', setFilter);
      }

      const { count, error } = await query;

      if (error) {
        throw new Error(`Error al contar cartas del marketplace: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Error al contar cartas del marketplace:', error);
      return 0;
    }
  }

  async findBySeller(sellerId: string, limit: number = 20, offset: number = 0): Promise<Card[]> {
    try {
      // Nota: Esta implementación es básica ya que las cartas base no tienen sellerId
      // En una implementación real, esto debería consultar una tabla de ventas/marketplace
      const { data, error } = await this.supabase
        .from('cards')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Error al buscar cartas por vendedor: ${error.message}`);
      }

      return data?.map(row => this.mapRowToCard(row)) || [];
    } catch (error) {
      console.error('Error al buscar cartas por vendedor:', error);
      return [];
    }
  }

  async create(card: Card): Promise<Card> {
    try {
      const { data, error } = await this.supabase
        .from('cards')
        .insert({
          id: card.id,
          name: card.name,
          types: [card.type],
          rarity: card.rarity,
          set_name: card.expansion,
          market_price: card.price,
          image_url: card.imageUrl,
          flavor_text: card.description,
          number: card.cardNumber,
          artist: card.artist
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear carta: ${error.message}`);
      }

      return this.mapRowToCard(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al crear carta'
      );
    }
  }

  async update(card: Card): Promise<Card> {
    try {
      const { data, error } = await this.supabase
        .from('cards')
        .update({
          name: card.name,
          types: [card.type],
          rarity: card.rarity,
          set_name: card.expansion,
          market_price: card.price,
          image_url: card.imageUrl,
          flavor_text: card.description,
          number: card.cardNumber,
          artist: card.artist,
          updated_at: new Date().toISOString()
        })
        .eq('id', card.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar carta: ${error.message}`);
      }

      return this.mapRowToCard(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al actualizar carta'
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('cards')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error al eliminar carta:', error);
      return false;
    }
  }

  private mapRowToCard(row: CardRow): Card {
    return new Card(
      row.id,
      row.name,
      row.types.join(', '), // Convertir array a string
      row.rarity,
      row.set_name, // expansion
      row.market_price || 0, // price
      1, // stock - TODO: esto debería venir de las ventas
      row.image_url,
      row.flavor_text || '', // description
      '', // sellerId - TODO: esto debería venir de las ventas
      'Near Mint', // condition - TODO: esto debería venir de las ventas
      row.number, // cardNumber
      row.artist || '',
      true, // isForSale - TODO: esto debería venir de las ventas
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
