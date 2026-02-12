/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';

// Configuración
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase no está configurado. Por favor configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.local'
  );
}

// Crear cliente de Supabase
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Helper: Obtener usuario actual
 */
export const getCurrentUser = async () => {
  if (!supabase) return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Helper: Sign in con email y password
 */
export const signIn = async (email, password) => {
  if (!supabase) throw new Error('Supabase no está configurado');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

/**
 * Helper: Sign up con email y password
 */
export const signUp = async (email, password, metadata = {}) => {
  if (!supabase) throw new Error('Supabase no está configurado');
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  if (error) throw error;
  return data;
};

/**
 * Helper: Sign out
 */
export const signOut = async () => {
  if (!supabase) throw new Error('Supabase no está configurado');
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Helper: Reset password
 */
export const resetPassword = async (email) => {
  if (!supabase) throw new Error('Supabase no está configurado');
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
};

/**
 * Helper: Update password
 */
export const updatePassword = async (newPassword) => {
  if (!supabase) throw new Error('Supabase no está configurado');
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) throw error;
};

// Export default
export default supabase;
