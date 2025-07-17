import type { SupabaseClient } from '@supabase/supabase-js';
import type { ICartRepository } from '../../../application/ports/repositories/ICartRepository';
import { CartItem } from '../../../domain/entities/CartItem';

// Tipo para mapear los datos de la base de datos
interface CartRow {
  id: string;
  user_id: string;
  card_id: string;
  quantity: number;
  price_at_time: number;
  is_active: boolean;
  reserved_until: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseCartRepository implements ICartRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async addItem(cartItem: CartItem): Promise<CartItem> {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .insert({
          id: cartItem.id,
          user_id: cartItem.userId,
          card_id: cartItem.cardId,
          quantity: cartItem.quantity,
          price_at_time: cartItem.priceAtTime,
          is_active: cartItem.isActive,
          reserved_until: cartItem.reservedUntil.toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error al añadir artículo al carrito: ${error.message}`);
      }

      return this.mapRowToCartItem(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al añadir artículo al carrito'
      );
    }
  }

  async findByUserId(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('reserved_until', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener carrito del usuario: ${error.message}`);
      }

      return data?.map(row => this.mapRowToCartItem(row)) || [];
    } catch (error) {
      console.error('Error al obtener carrito del usuario:', error);
      return [];
    }
  }

  async findByUserIdAndCardId(userId: string, cardId: string): Promise<CartItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('card_id', cardId)
        .eq('is_active', true)
        .gt('reserved_until', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToCartItem(data);
    } catch (error) {
      console.error('Error al buscar artículo del carrito:', error);
      return null;
    }
  }

  async updateQuantity(id: string, quantity: number): Promise<CartItem> {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .update({
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar cantidad del carrito: ${error.message}`);
      }

      return this.mapRowToCartItem(data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Error desconocido al actualizar cantidad del carrito'
      );
    }
  }

  async removeItem(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('cart_items')
        .update({ is_active: false })
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error al eliminar artículo del carrito:', error);
      return false;
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('cart_items')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      return !error;
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
      return false;
    }
  }

  async getTotalItems(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('reserved_until', new Date().toISOString());

      if (error) {
        throw new Error(`Error al contar artículos del carrito: ${error.message}`);
      }

      const totalItems = data?.reduce((total, row) => total + row.quantity, 0) || 0;
      return totalItems;
    } catch (error) {
      console.error('Error al contar artículos del carrito:', error);
      return 0;
    }
  }

  async getTotalPrice(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .select('quantity, price_at_time')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('reserved_until', new Date().toISOString());

      if (error) {
        throw new Error(`Error al calcular precio total del carrito: ${error.message}`);
      }

      const totalPrice = data?.reduce((total, row) => total + (row.quantity * row.price_at_time), 0) || 0;
      return totalPrice;
    } catch (error) {
      console.error('Error al calcular precio total del carrito:', error);
      return 0;
    }
  }

  async clearExpiredItems(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .update({ is_active: false })
        .eq('is_active', true)
        .lt('reserved_until', new Date().toISOString())
        .select('id');

      if (error) {
        throw new Error(`Error al limpiar artículos expirados: ${error.message}`);
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error al limpiar artículos expirados:', error);
      return 0;
    }
  }

  private mapRowToCartItem(row: CartRow): CartItem {
    return new CartItem(
      row.id,
      row.user_id,
      row.card_id,
      row.quantity,
      row.price_at_time,
      row.is_active,
      new Date(row.reserved_until),
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
