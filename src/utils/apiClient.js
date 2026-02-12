/**
 * API Client Avanzado con interceptores, retry logic y cache
 */

import { STORAGE_KEYS } from './constants';

// Configuración
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
};

// Cache simple en memoria
const cache = new Map();

/**
 * Obtener datos del cache
 */
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const { data, timestamp } = cached;
  const isExpired = Date.now() - timestamp > API_CONFIG.CACHE_TTL;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return data;
};

/**
 * Guardar en cache
 */
const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Sleep utility para retry delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Obtener token de autenticación
 */
const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
    return user?.token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Request con retry logic
 */
const fetchWithRetry = async (url, options = {}, attempt = 1) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Si es 401, limpiar auth y recargar
    if (response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
      throw new Error('No autorizado');
    }

    // Si es error del servidor (5xx), intentar retry
    if (response.status >= 500 && attempt < API_CONFIG.RETRY_ATTEMPTS) {
      console.warn(`Retry attempt ${attempt} for ${url}`);
      await sleep(API_CONFIG.RETRY_DELAY * attempt);
      return fetchWithRetry(url, options, attempt + 1);
    }

    return response;
  } catch (error) {
    // Si es timeout o network error, intentar retry
    if (
      (error.name === 'AbortError' || error.message.includes('Failed to fetch')) &&
      attempt < API_CONFIG.RETRY_ATTEMPTS
    ) {
      console.warn(`Retry attempt ${attempt} for ${url} after error:`, error.message);
      await sleep(API_CONFIG.RETRY_DELAY * attempt);
      return fetchWithRetry(url, options, attempt + 1);
    }

    throw error;
  }
};

/**
 * Request interceptor
 */
const buildRequest = (endpoint, options = {}) => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_CONFIG.BASE_URL}${endpoint}`;

  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    url,
    options: {
      ...options,
      headers,
    },
  };
};

/**
 * Response interceptor
 */
const handleResponse = async (response) => {
  // Si es 204 No Content, retornar null
  if (response.status === 204) {
    return null;
  }

  // Intentar parsear JSON
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(data.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * API Client principal
 */
export const apiClient = {
  /**
   * GET request con cache opcional
   */
  get: async (endpoint, { cache: useCache = false, ...options } = {}) => {
    const cacheKey = `GET:${endpoint}`;

    // Intentar obtener del cache
    if (useCache) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        console.log('Cache hit:', cacheKey);
        return cached;
      }
    }

    const { url, options: requestOptions } = buildRequest(endpoint, {
      method: 'GET',
      ...options,
    });

    const response = await fetchWithRetry(url, requestOptions);
    const data = await handleResponse(response);

    // Guardar en cache si está habilitado
    if (useCache && data) {
      setCachedData(cacheKey, data);
    }

    return data;
  },

  /**
   * POST request
   */
  post: async (endpoint, body, options = {}) => {
    const { url, options: requestOptions } = buildRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });

    const response = await fetchWithRetry(url, requestOptions);
    return handleResponse(response);
  },

  /**
   * PUT request
   */
  put: async (endpoint, body, options = {}) => {
    const { url, options: requestOptions } = buildRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });

    const response = await fetchWithRetry(url, requestOptions);
    return handleResponse(response);
  },

  /**
   * PATCH request
   */
  patch: async (endpoint, body, options = {}) => {
    const { url, options: requestOptions } = buildRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    });

    const response = await fetchWithRetry(url, requestOptions);
    return handleResponse(response);
  },

  /**
   * DELETE request
   */
  delete: async (endpoint, options = {}) => {
    const { url, options: requestOptions } = buildRequest(endpoint, {
      method: 'DELETE',
      ...options,
    });

    const response = await fetchWithRetry(url, requestOptions);
    return handleResponse(response);
  },

  /**
   * Limpiar cache
   */
  clearCache: (pattern) => {
    if (pattern) {
      // Limpiar cache que coincida con el patrón
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    } else {
      // Limpiar todo el cache
      cache.clear();
    }
  },

  /**
   * Configurar API URL
   */
  setBaseURL: (url) => {
    API_CONFIG.BASE_URL = url;
  },

  /**
   * Obtener configuración actual
   */
  getConfig: () => ({ ...API_CONFIG }),
};

// Export default
export default apiClient;
