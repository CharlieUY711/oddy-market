/**
 * Servicio para manejar la Rueda de la Suerte
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// URL base de las Edge Functions
const getWheelApiUrl = (endpoint) => {
  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL no está configurado');
  }
  return `${SUPABASE_URL}/functions/v1${endpoint}`;
};

// Helper para hacer requests
async function wheelRequest(endpoint, options = {}) {
  const url = getWheelApiUrl(endpoint);
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Wheel API Error:', error);
    throw error;
  }
}

export const wheelService = {
  // Obtener todas las configuraciones de ruedas
  getConfigs: async () => {
    return wheelRequest('/make-server-0dd48dc4/wheel/configs');
  },

  // Obtener rueda activa
  getActive: async () => {
    return wheelRequest('/make-server-0dd48dc4/wheel/active');
  },

  // Crear/Actualizar configuración
  saveConfig: async (config) => {
    return wheelRequest('/make-server-0dd48dc4/wheel/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  // Girar rueda
  spin: async (wheelId, { userId, email, sessionId }) => {
    return wheelRequest('/make-server-0dd48dc4/wheel/spin', {
      method: 'POST',
      body: JSON.stringify({
        wheelId,
        userId,
        email,
        sessionId,
      }),
    });
  },

  // Obtener estadísticas
  getStats: async (wheelId) => {
    return wheelRequest(`/make-server-0dd48dc4/wheel/${wheelId}/stats`);
  },

  // Obtener mis premios
  getMyPrizes: async ({ userId, email }) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);
    
    return wheelRequest(`/make-server-0dd48dc4/wheel/my-prizes?${params.toString()}`);
  },
};
