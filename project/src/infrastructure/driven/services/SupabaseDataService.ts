import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IDataService,
  QueryOptions,
  PaginatedResult,
  DataServiceResult
} from '../../../application/ports/services/IDataService';

export class SupabaseDataService implements IDataService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getMany<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    try {
      const {
        select = '*',
        limit = 20,
        offset = 0,
        orderBy,
        filters = []
      } = options;

      const page = Math.floor(offset / limit) + 1;

      let query = this.supabase
        .from(table)
        .select(select, { count: 'exact' });

      // Aplicar filtros
      if (filters.length > 0) {
        filters.forEach(filter => {
          query = this.applyFilter(query, filter);
        });
      }

      // Aplicar ordenamiento
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Aplicar paginación
      if (limit > 0) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error(`Error al obtener datos de ${table}:`, error);
        return {
          data: [],
          count: 0,
          page,
          limit,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        };
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: data as T[] || [],
        count: totalCount,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error(`Error al consultar ${table}:`, error);
      return {
        data: [],
        count: 0,
        page: 1,
        limit: options.limit || 20,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      };
    }
  }

  async getById<T>(
    table: string,
    id: string,
    selectFields: string = '*'
  ): Promise<DataServiceResult<T>> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select(selectFields)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Registro no encontrado' };
        }
        console.error(`Error al obtener registro de ${table}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as T };
    } catch (error) {
      console.error(`Error al buscar en ${table}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getOne<T>(
    table: string,
    filters: QueryOptions['filters'] = [],
    selectFields: string = '*'
  ): Promise<DataServiceResult<T>> {
    try {
      let query = this.supabase
        .from(table)
        .select(selectFields);

      // Aplicar filtros
      filters.forEach(filter => {
        query = this.applyFilter(query, filter);
      });

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Registro no encontrado' };
        }
        console.error(`Error al obtener registro de ${table}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as T };
    } catch (error) {
      console.error(`Error al buscar en ${table}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async create<T>(
    table: string,
    data: Partial<T>,
    selectFields: string = '*'
  ): Promise<DataServiceResult<T>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select(selectFields)
        .single();

      if (error) {
        console.error(`Error al crear registro en ${table}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data: result as T };
    } catch (error) {
      console.error(`Error al insertar en ${table}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    selectFields: string = '*'
  ): Promise<DataServiceResult<T>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select(selectFields)
        .single();

      if (error) {
        console.error(`Error al actualizar registro en ${table}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data: result as T };
    } catch (error) {
      console.error(`Error al actualizar en ${table}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateMany<T>(
    table: string,
    filters: QueryOptions['filters'] = [],
    data: Partial<T>,
    selectFields: string = '*'
  ): Promise<DataServiceResult<T[]>> {
    try {
      let query = this.supabase
        .from(table)
        .update(data);

      // Aplicar filtros
      filters.forEach(filter => {
        query = this.applyFilter(query, filter);
      });

      const { data: result, error } = await query.select(selectFields);

      if (error) {
        console.error(`Error al actualizar registros en ${table}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data: result as T[] };
    } catch (error) {
      console.error(`Error al actualizar múltiples en ${table}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async delete(table: string, id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error al eliminar registro de ${table}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error al eliminar en ${table}:`, error);
      return false;
    }
  }

  async deleteMany(
    table: string,
    filters: QueryOptions['filters'] = []
  ): Promise<number> {
    try {
      let query = this.supabase
        .from(table)
        .delete();

      // Aplicar filtros
      filters.forEach(filter => {
        query = this.applyFilter(query, filter);
      });

      const { data, error } = await query.select('id');

      if (error) {
        console.error(`Error al eliminar registros de ${table}:`, error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error(`Error al eliminar múltiples en ${table}:`, error);
      return 0;
    }
  }

  async createMany<T>(
    table: string,
    data: Partial<T>[],
    selectFields: string = '*'
  ): Promise<DataServiceResult<T[]>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select(selectFields);

      if (error) {
        console.error(`Error al crear registros en ${table}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data: result as T[] };
    } catch (error) {
      console.error(`Error al insertar múltiples en ${table}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async upsert<T>(
    table: string,
    data: Partial<T>,
    conflictColumns: string[] = ['id'],
    selectFields: string = '*'
  ): Promise<DataServiceResult<T>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .upsert(data, {
          onConflict: conflictColumns.join(','),
          ignoreDuplicates: false
        })
        .select(selectFields)
        .single();

      if (error) {
        console.error(`Error al hacer upsert en ${table}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data: result as T };
    } catch (error) {
      console.error(`Error al hacer upsert en ${table}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async count(
    table: string,
    filters: QueryOptions['filters'] = []
  ): Promise<number> {
    try {
      let query = this.supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      // Aplicar filtros
      filters.forEach(filter => {
        query = this.applyFilter(query, filter);
      });

      const { count, error } = await query;

      if (error) {
        console.error(`Error al contar registros en ${table}:`, error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error(`Error al contar en ${table}:`, error);
      return 0;
    }
  }

  async rpc<T>(
    functionName: string,
    parameters: Record<string, any> = {}
  ): Promise<DataServiceResult<T>> {
    try {
      const { data, error } = await this.supabase
        .rpc(functionName, parameters);

      if (error) {
        console.error(`Error al ejecutar función ${functionName}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as T };
    } catch (error) {
      console.error(`Error al ejecutar RPC ${functionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async executeQuery<T>(
    query: string,
    parameters: Record<string, any> = {}
  ): Promise<DataServiceResult<T[]>> {
    try {
      // Para consultas SQL personalizadas, usaríamos rpc con una función que ejecute SQL
      // Por seguridad, Supabase no permite SQL directo, debe ser a través de funciones RPC
      const { data, error } = await this.supabase
        .rpc('execute_sql', {
          sql_query: query,
          query_params: parameters
        });

      if (error) {
        console.error('Error al ejecutar consulta personalizada:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as T[] };
    } catch (error) {
      console.error('Error al ejecutar consulta SQL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Método auxiliar para aplicar filtros a una consulta
   */
  private applyFilter(query: any, filter: NonNullable<QueryOptions['filters']>[0]): any {
    const { column, operator, value } = filter;

    switch (operator) {
      case 'eq':
        return query.eq(column, value);
      case 'neq':
        return query.neq(column, value);
      case 'gt':
        return query.gt(column, value);
      case 'gte':
        return query.gte(column, value);
      case 'lt':
        return query.lt(column, value);
      case 'lte':
        return query.lte(column, value);
      case 'like':
        return query.like(column, value);
      case 'ilike':
        return query.ilike(column, value);
      case 'in':
        return query.in(column, value);
      case 'is':
        return query.is(column, value);
      case 'not':
        return query.not(column, operator, value);
      default:
        console.warn(`Operador de filtro no soportado: ${operator}`);
        return query;
    }
  }
}
