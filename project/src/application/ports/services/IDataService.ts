export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  filters?: {
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'not';
    value: any;
  }[];
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DataServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IDataService {
  /**
   * Obtiene registros de una tabla con opciones de consulta
   * @param table - Nombre de la tabla
   * @param options - Opciones de consulta (filtros, ordenamiento, paginación)
   * @returns Datos paginados
   */
  getMany<T>(
    table: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>>;

  /**
   * Obtiene un registro por ID
   * @param table - Nombre de la tabla
   * @param id - ID del registro
   * @param selectFields - Campos a seleccionar
   * @returns Registro encontrado o null
   */
  getById<T>(
    table: string,
    id: string,
    selectFields?: string
  ): Promise<DataServiceResult<T>>;

  /**
   * Obtiene un solo registro con filtros
   * @param table - Nombre de la tabla
   * @param filters - Filtros a aplicar
   * @param selectFields - Campos a seleccionar
   * @returns Primer registro encontrado o null
   */
  getOne<T>(
    table: string,
    filters: QueryOptions['filters'],
    selectFields?: string
  ): Promise<DataServiceResult<T>>;

  /**
   * Crea un nuevo registro
   * @param table - Nombre de la tabla
   * @param data - Datos del registro
   * @param selectFields - Campos a retornar del registro creado
   * @returns Registro creado
   */
  create<T>(
    table: string,
    data: Partial<T>,
    selectFields?: string
  ): Promise<DataServiceResult<T>>;

  /**
   * Actualiza un registro por ID
   * @param table - Nombre de la tabla
   * @param id - ID del registro
   * @param data - Datos a actualizar
   * @param selectFields - Campos a retornar del registro actualizado
   * @returns Registro actualizado
   */
  update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    selectFields?: string
  ): Promise<DataServiceResult<T>>;

  /**
   * Actualiza registros con filtros
   * @param table - Nombre de la tabla
   * @param filters - Filtros para identificar registros
   * @param data - Datos a actualizar
   * @param selectFields - Campos a retornar de los registros actualizados
   * @returns Registros actualizados
   */
  updateMany<T>(
    table: string,
    filters: QueryOptions['filters'],
    data: Partial<T>,
    selectFields?: string
  ): Promise<DataServiceResult<T[]>>;

  /**
   * Elimina un registro por ID
   * @param table - Nombre de la tabla
   * @param id - ID del registro
   * @returns true si se eliminó correctamente
   */
  delete(table: string, id: string): Promise<boolean>;

  /**
   * Elimina registros con filtros
   * @param table - Nombre de la tabla
   * @param filters - Filtros para identificar registros
   * @returns Número de registros eliminados
   */
  deleteMany(
    table: string,
    filters: QueryOptions['filters']
  ): Promise<number>;

  /**
   * Inserta múltiples registros
   * @param table - Nombre de la tabla
   * @param data - Array de datos a insertar
   * @param selectFields - Campos a retornar de los registros creados
   * @returns Registros creados
   */
  createMany<T>(
    table: string,
    data: Partial<T>[],
    selectFields?: string
  ): Promise<DataServiceResult<T[]>>;

  /**
   * Realiza un upsert (insert o update)
   * @param table - Nombre de la tabla
   * @param data - Datos del registro
   * @param conflictColumns - Columnas para detectar conflictos
   * @param selectFields - Campos a retornar del registro
   * @returns Registro creado o actualizado
   */
  upsert<T>(
    table: string,
    data: Partial<T>,
    conflictColumns?: string[],
    selectFields?: string
  ): Promise<DataServiceResult<T>>;

  /**
   * Cuenta registros en una tabla con filtros opcionales
   * @param table - Nombre de la tabla
   * @param filters - Filtros opcionales
   * @returns Número de registros
   */
  count(
    table: string,
    filters?: QueryOptions['filters']
  ): Promise<number>;

  /**
   * Ejecuta una función RPC de Supabase
   * @param functionName - Nombre de la función
   * @param parameters - Parámetros de la función
   * @returns Resultado de la función
   */
  rpc<T>(
    functionName: string,
    parameters?: Record<string, any>
  ): Promise<DataServiceResult<T>>;

  /**
   * Ejecuta una consulta SQL personalizada
   * @param query - Consulta SQL
   * @param parameters - Parámetros de la consulta
   * @returns Resultado de la consulta
   */
  executeQuery<T>(
    query: string,
    parameters?: Record<string, any>
  ): Promise<DataServiceResult<T[]>>;
}
