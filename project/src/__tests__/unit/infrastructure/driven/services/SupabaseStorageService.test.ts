import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseStorageService } from '../../../../../infrastructure/driven/services/SupabaseStorageService';
import type { UploadFileDTO } from '../../../../../application/ports/services/IStorageService';

// Mock Supabase client
const mockSupabaseClient = {
  storage: {
    from: vi.fn()
  }
};

// Mock storage bucket methods
const mockStorageBucket = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
  remove: vi.fn(),
  list: vi.fn(),
  createSignedUrl: vi.fn()
};

// Helper function to create mock file
function createMockFile(name: string = 'test.jpg', type: string = 'image/jpeg', size: number = 1024): File {
  const blob = new Blob(['test content'], { type });
  return new File([blob], name, { type });
}

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.storage.from.mockReturnValue(mockStorageBucket);
    service = new SupabaseStorageService(mockSupabaseClient as any);
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      // Arrange
      const mockFile = createMockFile();
      const uploadData: UploadFileDTO = {
        file: mockFile,
        bucket: 'test-bucket',
        path: 'uploads/test.jpg',
        options: {
          cacheControl: '3600',
          contentType: 'image/jpeg',
          upsert: false
        }
      };

      const mockUploadData = { path: 'uploads/test.jpg' };
      const mockPublicUrlData = { publicUrl: 'https://example.com/test.jpg' };

      mockStorageBucket.upload.mockResolvedValue({ data: mockUploadData, error: null });
      mockStorageBucket.getPublicUrl.mockReturnValue({ data: mockPublicUrlData });

      // Act
      const result = await service.uploadFile(uploadData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com/test.jpg');
      expect(result.path).toBe('uploads/test.jpg');
      expect(mockStorageBucket.upload).toHaveBeenCalledWith('uploads/test.jpg', mockFile, {
        cacheControl: '3600',
        contentType: 'image/jpeg',
        upsert: false
      });
    });

    it('should handle missing file', async () => {
      // Arrange
      const uploadData: UploadFileDTO = {
        file: null as any,
        bucket: 'test-bucket',
        path: 'uploads/test.jpg'
      };

      // Act
      const result = await service.uploadFile(uploadData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Archivo es requerido');
    });

    it('should handle missing bucket', async () => {
      // Arrange
      const mockFile = createMockFile();
      const uploadData: UploadFileDTO = {
        file: mockFile,
        bucket: '',
        path: 'uploads/test.jpg'
      };

      // Act
      const result = await service.uploadFile(uploadData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Bucket y ruta son requeridos');
    });

    it('should handle missing path', async () => {
      // Arrange
      const mockFile = createMockFile();
      const uploadData: UploadFileDTO = {
        file: mockFile,
        bucket: 'test-bucket',
        path: ''
      };

      // Act
      const result = await service.uploadFile(uploadData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Bucket y ruta son requeridos');
    });

    it('should handle upload error', async () => {
      // Arrange
      const mockFile = createMockFile();
      const uploadData: UploadFileDTO = {
        file: mockFile,
        bucket: 'test-bucket',
        path: 'uploads/test.jpg'
      };

      mockStorageBucket.upload.mockResolvedValue({
        data: null,
        error: { message: 'Storage error' }
      });

      // Act
      const result = await service.uploadFile(uploadData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al subir archivo: Storage error');
    });

    it('should use default options when not provided', async () => {
      // Arrange
      const mockFile = createMockFile();
      const uploadData: UploadFileDTO = {
        file: mockFile,
        bucket: 'test-bucket',
        path: 'uploads/test.jpg'
      };

      const mockUploadData = { path: 'uploads/test.jpg' };
      const mockPublicUrlData = { publicUrl: 'https://example.com/test.jpg' };

      mockStorageBucket.upload.mockResolvedValue({ data: mockUploadData, error: null });
      mockStorageBucket.getPublicUrl.mockReturnValue({ data: mockPublicUrlData });

      // Act
      const result = await service.uploadFile(uploadData);

      // Assert
      expect(result.success).toBe(true);
      expect(mockStorageBucket.upload).toHaveBeenCalledWith('uploads/test.jpg', mockFile, {
        cacheControl: '3600',
        contentType: 'image/jpeg',
        upsert: false
      });
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const mockFile = createMockFile();
      const uploadData: UploadFileDTO = {
        file: mockFile,
        bucket: 'test-bucket',
        path: 'uploads/test.jpg'
      };

      mockStorageBucket.upload.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.uploadFile(uploadData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getPublicUrl', () => {
    it('should return public URL', () => {
      // Arrange
      const bucket = 'test-bucket';
      const path = 'uploads/test.jpg';
      const mockPublicUrlData = { publicUrl: 'https://example.com/test.jpg' };

      mockStorageBucket.getPublicUrl.mockReturnValue({ data: mockPublicUrlData });

      // Act
      const result = service.getPublicUrl(bucket, path);

      // Assert
      expect(result).toBe('https://example.com/test.jpg');
      expect(mockStorageBucket.getPublicUrl).toHaveBeenCalledWith(path);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      // Arrange
      const bucket = 'test-bucket';
      const path = 'uploads/test.jpg';

      mockStorageBucket.remove.mockResolvedValue({ error: null });

      // Act
      const result = await service.deleteFile(bucket, path);

      // Assert
      expect(result).toBe(true);
      expect(mockStorageBucket.remove).toHaveBeenCalledWith([path]);
    });

    it('should handle delete error', async () => {
      // Arrange
      const bucket = 'test-bucket';
      const path = 'uploads/test.jpg';

      mockStorageBucket.remove.mockResolvedValue({ error: { message: 'Delete error' } });

      // Act
      const result = await service.deleteFile(bucket, path);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const bucket = 'test-bucket';
      const path = 'uploads/test.jpg';

      mockStorageBucket.remove.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.deleteFile(bucket, path);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      // Arrange
      const bucket = 'test-bucket';
      const path = 'uploads/';
      const limit = 10;
      const offset = 0;

      const mockFiles = [
        {
          name: 'test1.jpg',
          id: '1',
          updated_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          last_accessed_at: '2023-01-01T00:00:00Z',
          metadata: {}
        },
        {
          name: 'test2.jpg',
          id: '2',
          updated_at: '2023-01-02T00:00:00Z',
          created_at: '2023-01-02T00:00:00Z',
          last_accessed_at: '2023-01-02T00:00:00Z',
          metadata: {}
        }
      ];

      mockStorageBucket.list.mockResolvedValue({ data: mockFiles, error: null });

      // Act
      const result = await service.listFiles(bucket, path, limit, offset);

      // Assert
      expect(result.files).toEqual(mockFiles);
      expect(result.error).toBeUndefined();
      expect(mockStorageBucket.list).toHaveBeenCalledWith(path, {
        limit: 10,
        offset: 0
      });
    });

    it('should use default parameters', async () => {
      // Arrange
      const bucket = 'test-bucket';

      mockStorageBucket.list.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await service.listFiles(bucket);

      // Assert
      expect(result.files).toEqual([]);
      expect(mockStorageBucket.list).toHaveBeenCalledWith(undefined, {
        limit: 100,
        offset: 0
      });
    });

    it('should handle list error', async () => {
      // Arrange
      const bucket = 'test-bucket';

      mockStorageBucket.list.mockResolvedValue({
        data: null,
        error: { message: 'List error' }
      });

      // Act
      const result = await service.listFiles(bucket);

      // Assert
      expect(result.files).toEqual([]);
      expect(result.error).toBe('List error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const bucket = 'test-bucket';

      mockStorageBucket.list.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.listFiles(bucket);

      // Assert
      expect(result.files).toEqual([]);
      expect(result.error).toBe('Network error');
    });
  });

  describe('createSignedUrl', () => {
    it('should create signed URL successfully', async () => {
      // Arrange
      const bucket = 'test-bucket';
      const path = 'uploads/test.jpg';
      const expiresIn = 3600;
      const mockSignedUrl = 'https://example.com/signed-url';

      mockStorageBucket.createSignedUrl.mockResolvedValue({
        data: { signedUrl: mockSignedUrl },
        error: null
      });

      // Act
      const result = await service.createSignedUrl(bucket, path, expiresIn);

      // Assert
      expect(result.signedUrl).toBe(mockSignedUrl);
      expect(result.error).toBeUndefined();
      expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith(path, expiresIn);
    });

    it('should handle signed URL error', async () => {
      // Arrange
      const bucket = 'test-bucket';
      const path = 'uploads/test.jpg';
      const expiresIn = 3600;

      mockStorageBucket.createSignedUrl.mockResolvedValue({
        data: null,
        error: { message: 'Signed URL error' }
      });

      // Act
      const result = await service.createSignedUrl(bucket, path, expiresIn);

      // Assert
      expect(result.signedUrl).toBeUndefined();
      expect(result.error).toBe('Signed URL error');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const bucket = 'test-bucket';
      const path = 'uploads/test.jpg';
      const expiresIn = 3600;

      mockStorageBucket.createSignedUrl.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.createSignedUrl(bucket, path, expiresIn);

      // Assert
      expect(result.signedUrl).toBeUndefined();
      expect(result.error).toBe('Network error');
    });
  });
});
