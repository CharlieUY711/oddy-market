/**
 * Sentry Configuration - Error Tracking
 */

// Configuración
const sentryDSN = import.meta.env.VITE_SENTRY_DSN;
const sentryEnvironment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
const isProduction = import.meta.env.PROD;

// Flag para saber si Sentry está habilitado
export const isSentryEnabled = Boolean(sentryDSN && isProduction);

/**
 * Inicializar Sentry
 * 
 * Para usar Sentry completo, instala el paquete:
 * npm install @sentry/react
 * 
 * Luego descomenta el código abajo
 */
export const initSentry = () => {
  if (!isSentryEnabled) {
    console.log('ℹ️ Sentry no está habilitado o no estás en producción');
    return;
  }

  /* 
  // Descomentar cuando instales @sentry/react
  import * as Sentry from '@sentry/react';
  
  Sentry.init({
    dsn: sentryDSN,
    environment: sentryEnvironment,
    
    // Tracing
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Ignorar ciertos errores
    ignoreErrors: [
      // Errores del navegador
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Errores de extensiones
      'Extension context invalidated',
    ],
    
    // Antes de enviar el evento
    beforeSend(event, hint) {
      // Filtrar información sensible
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      
      return event;
    },
  });
  
  console.log('✅ Sentry inicializado');
  */

  console.log('📦 Para usar Sentry, instala: npm install @sentry/react');
};

/**
 * Capturar error manualmente
 */
export const captureError = (error, context = {}) => {
  if (!isSentryEnabled) {
    console.error('Error:', error, 'Context:', context);
    return;
  }

  /*
  // Descomentar cuando instales @sentry/react
  import * as Sentry from '@sentry/react';
  
  Sentry.captureException(error, {
    extra: context,
  });
  */
};

/**
 * Capturar mensaje
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (!isSentryEnabled) {
    console.log(`[${level}] ${message}`, context);
    return;
  }

  /*
  // Descomentar cuando instales @sentry/react
  import * as Sentry from '@sentry/react';
  
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
  */
};

/**
 * Set user context
 */
export const setUserContext = (user) => {
  if (!isSentryEnabled) return;

  /*
  // Descomentar cuando instales @sentry/react
  import * as Sentry from '@sentry/react';
  
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
  */
};

// Export default
export default {
  init: initSentry,
  captureError,
  captureMessage,
  setUserContext,
  isEnabled: isSentryEnabled,
};
