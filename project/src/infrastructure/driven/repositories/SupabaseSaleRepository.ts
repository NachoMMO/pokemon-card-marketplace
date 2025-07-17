import type { SupabaseClient } from '@supabase/supabase-js';
import type { ISaleRepository } from '../../../application/ports/repositories/ISaleRepository';
import { Sale } from '../../../domain/entities/Sale';

// Tipo para mapear los datos de la base de datos
interface SaleRow {
  id: string;
  seller_id: string;
  card_id: string;
  buyer_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  commission: number;
  net_amount: number;
  status: string;
  purchase_id: string;
  sale_date: string;
  confirmed_at?: string;
  shipped_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseSaleRepository implements ISaleRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(sale: Sale): Promise<Sale> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .insert({
          id: sale.id,
          seller_id: sale.sellerId,
          card_id: sale.cardId,
          buyer_id: sale.buyerId,
          quantity: sale.quantity,
          unit_price: sale.unitPrice,
          total_price: sale.totalPrice,
          commission: sale.commission,
          net_amount: sale.netAmount,
          status: sale.status,
          purchase_id: sale.purchaseId,
          sale_date: sale.saleDate.toISOString(),
          confirmed_at: sale.confirmedAt?.toISOString(),
          shipped_at: sale.shippedAt?.toISOString(),
          completed_at: sale.completedAt?.toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear venta: ${error.message}`);
      }

      return this.mapRowToSale(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al crear venta'
      );
    }
  }

  async findById(id: string): Promise<Sale | null> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToSale(data);
    } catch (error) {
      console.error('Error al buscar venta por ID:', error);
      return null;
    }
  }

  async findBySellerId(sellerId: string, limit: number = 20, offset: number = 0): Promise<Sale[]> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .select('*')
        .eq('seller_id', sellerId)
        .range(offset, offset + limit - 1)
        .order('sale_date', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener ventas del vendedor: ${error.message}`);
      }

      return data?.map(row => this.mapRowToSale(row)) || [];
    } catch (error) {
      console.error('Error al obtener ventas del vendedor:', error);
      return [];
    }
  }

  async findByCardId(cardId: string, limit: number = 20, offset: number = 0): Promise<Sale[]> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .select('*')
        .eq('card_id', cardId)
        .range(offset, offset + limit - 1)
        .order('sale_date', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener ventas de la carta: ${error.message}`);
      }

      return data?.map(row => this.mapRowToSale(row)) || [];
    } catch (error) {
      console.error('Error al obtener ventas de la carta:', error);
      return [];
    }
  }

  async findAvailable(limit: number = 20, offset: number = 0): Promise<Sale[]> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .select('*')
        .eq('status', 'available')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener ventas disponibles: ${error.message}`);
      }

      return data?.map(row => this.mapRowToSale(row)) || [];
    } catch (error) {
      console.error('Error al obtener ventas disponibles:', error);
      return [];
    }
  }

  async update(id: string, updates: Partial<Sale>): Promise<Sale> {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };

      // Mapear los campos de la entidad a los campos de la base de datos
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.unitPrice !== undefined) updateData.unit_price = updates.unitPrice;
      if (updates.totalPrice !== undefined) updateData.total_price = updates.totalPrice;
      if (updates.commission !== undefined) updateData.commission = updates.commission;
      if (updates.netAmount !== undefined) updateData.net_amount = updates.netAmount;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { data, error } = await this.supabase
        .from('sales')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar venta: ${error.message}`);
      }

      return this.mapRowToSale(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al actualizar venta'
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('sales')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      return false;
    }
  }

  async search(criteria: {
    cardName?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Sale[]> {
    try {
      let query = this.supabase
        .from('sales')
        .select(`
          *,
          cards(name, condition)
        `);

      // Aplicar filtros
      if (criteria.cardName) {
        query = query.ilike('cards.name', `%${criteria.cardName}%`);
      }
      if (criteria.condition) {
        query = query.eq('cards.condition', criteria.condition);
      }
      if (criteria.minPrice) {
        query = query.gte('unit_price', criteria.minPrice);
      }
      if (criteria.maxPrice) {
        query = query.lte('unit_price', criteria.maxPrice);
      }
      if (criteria.sellerId) {
        query = query.eq('seller_id', criteria.sellerId);
      }

      // Solo ventas disponibles
      query = query.eq('status', 'available');

      // Aplicar paginación
      const limit = criteria.limit || 20;
      const offset = criteria.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Ordenar por fecha de creación
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al buscar ventas: ${error.message}`);
      }

      return data?.map(row => this.mapRowToSale(row)) || [];
    } catch (error) {
      console.error('Error al buscar ventas:', error);
      return [];
    }
  }

  private mapRowToSale(row: SaleRow): Sale {
    return new Sale(
      row.id,
      row.seller_id,
      row.card_id,
      row.buyer_id,
      row.quantity,
      row.unit_price,
      row.total_price,
      row.commission,
      row.net_amount,
      row.status,
      row.purchase_id,
      new Date(row.sale_date),
      row.confirmed_at ? new Date(row.confirmed_at) : new Date(),
      row.shipped_at ? new Date(row.shipped_at) : new Date(),
      row.completed_at ? new Date(row.completed_at) : new Date(),
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
