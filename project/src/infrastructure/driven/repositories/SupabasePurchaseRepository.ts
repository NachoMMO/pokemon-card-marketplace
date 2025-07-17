import type { SupabaseClient } from '@supabase/supabase-js';
import type { IPurchaseRepository } from '../../../application/ports/repositories/IPurchaseRepository';
import { Purchase } from '../../../domain/entities/Purchase';

// Tipo para mapear los datos de la base de datos
interface PurchaseRow {
  id: string;
  buyer_id: string;
  card_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  transaction_id: string;
  purchase_date: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export class SupabasePurchaseRepository implements IPurchaseRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(purchase: Purchase): Promise<Purchase> {
    try {
      const { data, error } = await this.supabase
        .from('purchases')
        .insert({
          id: purchase.id,
          buyer_id: purchase.buyerId,
          card_id: purchase.cardId,
          quantity: purchase.quantity,
          unit_price: purchase.unitPrice,
          total_price: purchase.totalPrice,
          status: purchase.status,
          transaction_id: purchase.transactionId,
          purchase_date: purchase.purchaseDate.toISOString(),
          confirmed_at: purchase.confirmedAt?.toISOString(),
          shipped_at: purchase.shippedAt?.toISOString(),
          delivered_at: purchase.deliveredAt?.toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear compra: ${error.message}`);
      }

      return this.mapRowToPurchase(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al crear compra'
      );
    }
  }

  async findById(id: string): Promise<Purchase | null> {
    try {
      const { data, error } = await this.supabase
        .from('purchases')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToPurchase(data);
    } catch (error) {
      console.error('Error al buscar compra por ID:', error);
      return null;
    }
  }

  async findByBuyerId(buyerId: string, limit: number = 20, offset: number = 0): Promise<Purchase[]> {
    try {
      const { data, error } = await this.supabase
        .from('purchases')
        .select('*')
        .eq('buyer_id', buyerId)
        .range(offset, offset + limit - 1)
        .order('purchase_date', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener compras del comprador: ${error.message}`);
      }

      return data?.map(row => this.mapRowToPurchase(row)) || [];
    } catch (error) {
      console.error('Error al obtener compras del comprador:', error);
      return [];
    }
  }

  async findBySellerId(sellerId: string, limit: number = 20, offset: number = 0): Promise<Purchase[]> {
    try {
      // Para obtener compras de un vendedor, necesitamos hacer join con sales
      const { data, error } = await this.supabase
        .from('purchases')
        .select(`
          *,
          sales!inner(seller_id)
        `)
        .eq('sales.seller_id', sellerId)
        .range(offset, offset + limit - 1)
        .order('purchase_date', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener compras del vendedor: ${error.message}`);
      }

      return data?.map(row => this.mapRowToPurchase(row)) || [];
    } catch (error) {
      console.error('Error al obtener compras del vendedor:', error);
      return [];
    }
  }

  async updateStatus(id: string, status: string): Promise<Purchase> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // Añadir timestamps según el estado
      const now = new Date().toISOString();
      switch (status) {
        case 'confirmed':
          updateData.confirmed_at = now;
          break;
        case 'shipped':
          updateData.shipped_at = now;
          break;
        case 'delivered':
          updateData.delivered_at = now;
          break;
      }

      const { data, error } = await this.supabase
        .from('purchases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar estado de compra: ${error.message}`);
      }

      return this.mapRowToPurchase(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al actualizar estado de compra'
      );
    }
  }

  async findByStatus(status: string, limit: number = 20, offset: number = 0): Promise<Purchase[]> {
    try {
      const { data, error } = await this.supabase
        .from('purchases')
        .select('*')
        .eq('status', status)
        .range(offset, offset + limit - 1)
        .order('purchase_date', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener compras por estado: ${error.message}`);
      }

      return data?.map(row => this.mapRowToPurchase(row)) || [];
    } catch (error) {
      console.error('Error al obtener compras por estado:', error);
      return [];
    }
  }

  async getTotalSpentByBuyer(buyerId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('purchases')
        .select('total_price')
        .eq('buyer_id', buyerId)
        .in('status', ['confirmed', 'shipped', 'delivered']);

      if (error) {
        throw new Error(`Error al calcular total gastado: ${error.message}`);
      }

      const totalSpent = data?.reduce((total, row) => total + row.total_price, 0) || 0;
      return totalSpent;
    } catch (error) {
      console.error('Error al calcular total gastado:', error);
      return 0;
    }
  }

  async getTotalEarnedBySeller(sellerId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('sales')
        .select('net_amount')
        .eq('seller_id', sellerId)
        .in('status', ['confirmed', 'shipped', 'completed']);

      if (error) {
        throw new Error(`Error al calcular total ganado: ${error.message}`);
      }

      const totalEarned = data?.reduce((total, row) => total + row.net_amount, 0) || 0;
      return totalEarned;
    } catch (error) {
      console.error('Error al calcular total ganado:', error);
      return 0;
    }
  }

  private mapRowToPurchase(row: PurchaseRow): Purchase {
    return new Purchase(
      row.id,
      row.buyer_id,
      row.card_id,
      row.quantity,
      row.unit_price,
      row.total_price,
      row.status,
      row.transaction_id,
      new Date(row.purchase_date),
      row.confirmed_at ? new Date(row.confirmed_at) : new Date(),
      row.shipped_at ? new Date(row.shipped_at) : new Date(),
      row.delivered_at ? new Date(row.delivered_at) : new Date(),
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
