export interface UploadFileDTO {
  file: File;
  bucket: string;
  path: string;
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  };
}

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface IStorageService {
  /**
   * Sube un archivo al storage
   * @param uploadData - Datos del archivo a subir
   * @returns Respuesta con URL del archivo subido
   */
  uploadFile(uploadData: UploadFileDTO): Promise<FileUploadResponse>;

  /**
   * Obtiene la URL pública de un archivo
   * @param bucket - Bucket donde está el archivo
   * @param path - Ruta del archivo
   * @returns URL pública del archivo
   */
  getPublicUrl(bucket: string, path: string): string;

  /**
   * Elimina un archivo del storage
   * @param bucket - Bucket donde está el archivo
   * @param path - Ruta del archivo a eliminar
   * @returns true si se eliminó correctamente
   */
  deleteFile(bucket: string, path: string): Promise<boolean>;

  /**
   * Lista archivos en un directorio
   * @param bucket - Bucket a consultar
   * @param path - Ruta del directorio
   * @param limit - Límite de archivos a retornar
   * @param offset - Offset para paginación
   * @returns Lista de archivos
   */
  listFiles(bucket: string, path?: string, limit?: number, offset?: number): Promise<{
    files: Array<{
      name: string;
      id: string;
      updated_at: string;
      created_at: string;
      last_accessed_at: string;
      metadata: Record<string, any>;
    }>;
    error?: string;
  }>;

  /**
   * Crea una URL firmada para acceso temporal
   * @param bucket - Bucket del archivo
   * @param path - Ruta del archivo
   * @param expiresIn - Tiempo de expiración en segundos
   * @returns URL firmada
   */
  createSignedUrl(bucket: string, path: string, expiresIn: number): Promise<{
    signedUrl?: string;
    error?: string;
  }>;
}
