import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IStorageService,
  UploadFileDTO,
  FileUploadResponse
} from '../../../application/ports/services/IStorageService';

export class SupabaseStorageService implements IStorageService {
  constructor(private readonly supabase: SupabaseClient) {}

  async uploadFile(uploadData: UploadFileDTO): Promise<FileUploadResponse> {
    try {
      const { file, bucket, path, options } = uploadData;

      // Validaciones
      if (!file) {
        return {
          success: false,
          error: 'Archivo es requerido'
        };
      }

      if (!bucket || !path) {
        return {
          success: false,
          error: 'Bucket y ruta son requeridos'
        };
      }

      // Subir archivo
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          contentType: options?.contentType || file.type,
          upsert: options?.upsert || false
        });

      if (error) {
        return {
          success: false,
          error: `Error al subir archivo: ${error.message}`
        };
      }

      // Obtener URL pública
      const publicUrl = this.getPublicUrl(bucket, data.path);

      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Error en uploadFile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al subir archivo'
      };
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path]);

      return !error;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      return false;
    }
  }

  async listFiles(
    bucket: string,
    path?: string,
    limit?: number,
    offset?: number
  ): Promise<{
    files: Array<{
      name: string;
      id: string;
      updated_at: string;
      created_at: string;
      last_accessed_at: string;
      metadata: Record<string, any>;
    }>;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(path, {
          limit: limit || 100,
          offset: offset || 0
        });

      if (error) {
        return {
          files: [],
          error: error.message
        };
      }

      return {
        files: data || []
      };
    } catch (error) {
      console.error('Error al listar archivos:', error);
      return {
        files: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number
  ): Promise<{
    signedUrl?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        return {
          error: error.message
        };
      }

      return {
        signedUrl: data.signedUrl
      };
    } catch (error) {
      console.error('Error al crear URL firmada:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
