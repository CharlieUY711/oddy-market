/**
 * Instagram Migration Service - Servicio para respaldo, eliminación y migración de Instagram
 * Usa el patrón del proyecto con Supabase Functions
 */

// Obtener projectId desde variables de entorno
const getProjectId = () => {
  try {
    const env = (import.meta as any).env || {};
    const supabaseUrl = env.VITE_SUPABASE_URL || '';
    if (supabaseUrl) {
      const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      if (match) return match[1];
    }
    return env.VITE_SUPABASE_PROJECT_ID || 'yomgqobfmgatavnbtvdz';
  } catch {
    return 'yomgqobfmgatavnbtvdz';
  }
};

// Obtener publicAnonKey desde variables de entorno
const getPublicAnonKey = () => {
  try {
    const env = (import.meta as any).env || {};
    return env.VITE_SUPABASE_ANON_KEY || '';
  } catch {
    return '';
  }
};

const projectId = getProjectId();
const publicAnonKey = getPublicAnonKey();
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4`;

/**
 * Helper para hacer requests al backend
 */
async function instagramRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(error.message || error.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`Instagram Migration API Error [${endpoint}]:`, error);
    throw error;
  }
}

export interface BackupRequest {
  type: "posts" | "stories" | "reels" | "all";
}

export interface BackupResponse {
  posts: number;
  stories: number;
  reels: number;
  total: number;
  downloadUrl?: string;
  status: "completed" | "processing";
}

export interface DeleteRequest {
  type: "posts" | "stories" | "reels" | "all";
}

export interface ProfileSettings {
  username: string;
  displayName: string;
  bio: string;
  website: string;
  profilePicture: string | null;
  isPrivate: boolean;
}

export const instagramMigrationService = {
  /**
   * Respaldar contenido de Instagram
   */
  backupContent: async (request: BackupRequest): Promise<BackupResponse> => {
    return instagramRequest('/social/instagram/backup', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Obtener estado del respaldo
   */
  getBackupStatus: async (backupId: string): Promise<BackupResponse> => {
    return instagramRequest(`/social/instagram/backup/${backupId}/status`);
  },

  /**
   * Eliminar contenido de Instagram
   */
  deleteContent: async (request: DeleteRequest): Promise<{ deleted: number; status: string }> => {
    return instagramRequest('/social/instagram/delete', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Obtener información del perfil actual
   */
  getProfile: async (): Promise<ProfileSettings> => {
    return instagramRequest('/social/instagram/profile');
  },

  /**
   * Actualizar perfil de Instagram
   */
  updateProfile: async (settings: ProfileSettings): Promise<{ success: boolean; message: string }> => {
    return instagramRequest('/social/instagram/profile', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Subir foto de perfil
   */
  uploadProfilePicture: async (imageData: string): Promise<{ url: string }> => {
    return instagramRequest('/social/instagram/profile/picture', {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    });
  },

  /**
   * Verificar conexión con Instagram
   */
  verifyConnection: async (): Promise<{ connected: boolean; accountInfo?: any; error?: string }> => {
    return instagramRequest('/social/instagram/verify');
  },
};
