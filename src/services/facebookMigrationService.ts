/**
 * Facebook Migration Service - Servicio para respaldo, eliminación y migración de Facebook
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
async function facebookRequest(endpoint: string, options: RequestInit = {}) {
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
    console.error(`Facebook Migration API Error [${endpoint}]:`, error);
    throw error;
  }
}

export interface BackupRequest {
  type: "posts" | "photos" | "videos" | "events" | "all";
}

export interface BackupResponse {
  posts: number;
  photos: number;
  videos: number;
  events: number;
  total: number;
  downloadUrl?: string;
  status: "completed" | "processing";
}

export interface DeleteRequest {
  type: "posts" | "photos" | "videos" | "all";
}

export interface PageSettings {
  name: string;
  username: string;
  category: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  coverPhoto: string | null;
  profilePicture: string | null;
  businessHours?: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
}

export const facebookMigrationService = {
  /**
   * Respaldar contenido de Facebook
   */
  backupContent: async (request: BackupRequest): Promise<BackupResponse> => {
    return facebookRequest('/social/facebook/backup', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Obtener estado del respaldo
   */
  getBackupStatus: async (backupId: string): Promise<BackupResponse> => {
    return facebookRequest(`/social/facebook/backup/${backupId}/status`);
  },

  /**
   * Eliminar contenido de Facebook
   */
  deleteContent: async (request: DeleteRequest): Promise<{ deleted: number; status: string }> => {
    return facebookRequest('/social/facebook/delete', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Obtener información de la página actual
   */
  getPage: async (): Promise<PageSettings> => {
    return facebookRequest('/social/facebook/page');
  },

  /**
   * Actualizar página de Facebook
   */
  updatePage: async (settings: PageSettings): Promise<{ success: boolean; message: string }> => {
    return facebookRequest('/social/facebook/page', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Subir foto de perfil
   */
  uploadProfilePicture: async (imageData: string): Promise<{ url: string }> => {
    return facebookRequest('/social/facebook/page/picture', {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    });
  },

  /**
   * Subir foto de portada
   */
  uploadCoverPhoto: async (imageData: string): Promise<{ url: string }> => {
    return facebookRequest('/social/facebook/page/cover', {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    });
  },

  /**
   * Verificar conexión con Facebook
   */
  verifyConnection: async (): Promise<{ connected: boolean; pageInfo?: any; error?: string }> => {
    return facebookRequest('/social/facebook/verify');
  },
};
