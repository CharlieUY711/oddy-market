import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// HELPERS
// ============================================

// Simple hash function (en producción usarías bcrypt o similar)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Generate token (simple JWT-like)
function generateToken(userId: string): string {
  const payload = {
    user_id: userId,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
  };
  return btoa(JSON.stringify(payload));
}

// Verify token
function verifyToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null; // Token expirado
    }
    return payload;
  } catch {
    return null;
  }
}

// Generate verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// REGISTRO
// ============================================

// Register - Crear cuenta
app.post("/make-server-0dd48dc4/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const timestamp = new Date().toISOString();

    // Validaciones
    if (!body.email || !body.password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    if (body.password.length < 8) {
      return c.json({ error: "Password must be at least 8 characters" }, 400);
    }

    // Verificar si el email ya existe
    const emailIndex = ["users_by_email", body.email.toLowerCase()];
    const existingEntry = await kv.get(emailIndex);
    
    if (existingEntry.value) {
      return c.json({ error: "Email already registered" }, 409);
    }

    // Crear usuario
    const userId = `user:${Date.now()}`;
    const passwordHash = await hashPassword(body.password);

    const newUser = {
      id: userId,
      entity_id: body.entity_id || "default",
      email: body.email.toLowerCase(),
      email_verified: false,
      password_hash: passwordHash,
      
      // Perfil
      profile: {
        first_name: body.first_name || "",
        last_name: body.last_name || "",
        phone: body.phone || "",
        avatar_url: body.avatar_url || "",
      },
      
      // Seguridad
      verification_code: generateVerificationCode(),
      verification_code_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
      password_reset_token: null,
      password_reset_expires_at: null,
      
      // Status
      status: "active", // active, suspended, deleted
      
      // Metadata
      metadata: body.metadata || {},
      
      // Auditoría
      created_at: timestamp,
      updated_at: timestamp,
      last_login_at: null,
    };

    await kv.set([userId], newUser);
    
    // Indexar por email
    await kv.set(emailIndex, userId);
    
    // Indexar por entity
    await kv.set(["users_by_entity", newUser.entity_id, userId], true);

    // Generar token
    const token = generateToken(userId);

    // En producción, aquí enviarías el email de verificación
    console.log(`Verification code for ${body.email}: ${newUser.verification_code}`);

    // No retornar password_hash ni códigos de verificación
    const { password_hash, verification_code, ...userResponse } = newUser;

    return c.json({ 
      user: userResponse,
      token,
      message: "User registered successfully. Please verify your email." 
    });
  } catch (error) {
    console.log("Error registering user:", error);
    return c.json({ error: error.message || "Error registering user" }, 500);
  }
});

// ============================================
// LOGIN
// ============================================

// Login
app.post("/make-server-0dd48dc4/auth/login", async (c) => {
  try {
    const body = await c.req.json();

    // Validaciones
    if (!body.email || !body.password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Buscar usuario por email
    const emailIndex = ["users_by_email", body.email.toLowerCase()];
    const emailEntry = await kv.get(emailIndex);
    
    if (!emailEntry.value) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const userId = emailEntry.value as string;
    const userEntry = await kv.get([userId]);
    
    if (!userEntry.value) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const user = userEntry.value as any;

    // Verificar contraseña
    const isValid = await verifyPassword(body.password, user.password_hash);
    
    if (!isValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Verificar status
    if (user.status !== "active") {
      return c.json({ error: "Account is not active" }, 403);
    }

    // Actualizar last_login
    const timestamp = new Date().toISOString();
    const updatedUser = {
      ...user,
      last_login_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([userId], updatedUser);

    // Generar token
    const token = generateToken(userId);

    // No retornar password_hash
    const { password_hash, verification_code, ...userResponse } = updatedUser;

    return c.json({ 
      user: userResponse,
      token,
      message: "Login successful" 
    });
  } catch (error) {
    console.log("Error logging in:", error);
    return c.json({ error: "Error logging in" }, 500);
  }
});

// ============================================
// LOGOUT
// ============================================

// Logout (en este caso simple, solo informativo)
app.post("/make-server-0dd48dc4/auth/logout", async (c) => {
  try {
    // En una implementación real, invalidarías el token aquí
    return c.json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error logging out:", error);
    return c.json({ error: "Error logging out" }, 500);
  }
});

// ============================================
// VERIFICACIÓN DE EMAIL
// ============================================

// Verify email
app.post("/make-server-0dd48dc4/auth/verify-email", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.email || !body.code) {
      return c.json({ error: "Email and verification code are required" }, 400);
    }

    // Buscar usuario
    const emailIndex = ["users_by_email", body.email.toLowerCase()];
    const emailEntry = await kv.get(emailIndex);
    
    if (!emailEntry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const userId = emailEntry.value as string;
    const userEntry = await kv.get([userId]);
    const user = userEntry.value as any;

    // Verificar código
    if (user.verification_code !== body.code) {
      return c.json({ error: "Invalid verification code" }, 400);
    }

    // Verificar expiración
    if (new Date(user.verification_code_expires_at) < new Date()) {
      return c.json({ error: "Verification code expired" }, 400);
    }

    // Marcar como verificado
    const timestamp = new Date().toISOString();
    const updatedUser = {
      ...user,
      email_verified: true,
      verification_code: null,
      verification_code_expires_at: null,
      updated_at: timestamp,
    };

    await kv.set([userId], updatedUser);

    const { password_hash, ...userResponse } = updatedUser;

    return c.json({ 
      user: userResponse,
      message: "Email verified successfully" 
    });
  } catch (error) {
    console.log("Error verifying email:", error);
    return c.json({ error: "Error verifying email" }, 500);
  }
});

// Resend verification code
app.post("/make-server-0dd48dc4/auth/resend-verification", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Buscar usuario
    const emailIndex = ["users_by_email", body.email.toLowerCase()];
    const emailEntry = await kv.get(emailIndex);
    
    if (!emailEntry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const userId = emailEntry.value as string;
    const userEntry = await kv.get([userId]);
    const user = userEntry.value as any;

    // Generar nuevo código
    const timestamp = new Date().toISOString();
    const updatedUser = {
      ...user,
      verification_code: generateVerificationCode(),
      verification_code_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      updated_at: timestamp,
    };

    await kv.set([userId], updatedUser);

    // En producción, enviarías el email aquí
    console.log(`New verification code for ${body.email}: ${updatedUser.verification_code}`);

    return c.json({ message: "Verification code sent" });
  } catch (error) {
    console.log("Error resending verification:", error);
    return c.json({ error: "Error resending verification" }, 500);
  }
});

// ============================================
// RECUPERACIÓN DE CONTRASEÑA
// ============================================

// Request password reset
app.post("/make-server-0dd48dc4/auth/forgot-password", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Buscar usuario
    const emailIndex = ["users_by_email", body.email.toLowerCase()];
    const emailEntry = await kv.get(emailIndex);
    
    if (!emailEntry.value) {
      // Por seguridad, no revelamos si el email existe
      return c.json({ message: "If the email exists, a reset link will be sent" });
    }

    const userId = emailEntry.value as string;
    const userEntry = await kv.get([userId]);
    const user = userEntry.value as any;

    // Generar token de reset
    const resetToken = generateToken(userId);
    const timestamp = new Date().toISOString();
    
    const updatedUser = {
      ...user,
      password_reset_token: resetToken,
      password_reset_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
      updated_at: timestamp,
    };

    await kv.set([userId], updatedUser);

    // En producción, enviarías el email con el link
    console.log(`Password reset token for ${body.email}: ${resetToken}`);

    return c.json({ message: "If the email exists, a reset link will be sent" });
  } catch (error) {
    console.log("Error requesting password reset:", error);
    return c.json({ error: "Error requesting password reset" }, 500);
  }
});

// Reset password
app.post("/make-server-0dd48dc4/auth/reset-password", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.token || !body.new_password) {
      return c.json({ error: "Token and new password are required" }, 400);
    }

    if (body.new_password.length < 8) {
      return c.json({ error: "Password must be at least 8 characters" }, 400);
    }

    // Verificar token
    const payload = verifyToken(body.token);
    if (!payload) {
      return c.json({ error: "Invalid or expired token" }, 400);
    }

    const userId = payload.user_id;
    const userEntry = await kv.get([userId]);
    
    if (!userEntry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = userEntry.value as any;

    // Verificar que el token coincida
    if (user.password_reset_token !== body.token) {
      return c.json({ error: "Invalid token" }, 400);
    }

    // Verificar expiración
    if (new Date(user.password_reset_expires_at) < new Date()) {
      return c.json({ error: "Token expired" }, 400);
    }

    // Actualizar contraseña
    const timestamp = new Date().toISOString();
    const passwordHash = await hashPassword(body.new_password);
    
    const updatedUser = {
      ...user,
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires_at: null,
      updated_at: timestamp,
    };

    await kv.set([userId], updatedUser);

    return c.json({ message: "Password reset successful" });
  } catch (error) {
    console.log("Error resetting password:", error);
    return c.json({ error: "Error resetting password" }, 500);
  }
});

// ============================================
// CAMBIO DE CONTRASEÑA (USUARIO LOGUEADO)
// ============================================

// Change password
app.post("/make-server-0dd48dc4/auth/change-password", async (c) => {
  try {
    const body = await c.req.json();
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json({ error: "Authorization required" }, 401);
    }

    if (!body.current_password || !body.new_password) {
      return c.json({ error: "Current and new password are required" }, 400);
    }

    // Verificar token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    
    if (!payload) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const userId = payload.user_id;
    const userEntry = await kv.get([userId]);
    
    if (!userEntry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = userEntry.value as any;

    // Verificar contraseña actual
    const isValid = await verifyPassword(body.current_password, user.password_hash);
    
    if (!isValid) {
      return c.json({ error: "Current password is incorrect" }, 400);
    }

    // Actualizar contraseña
    const timestamp = new Date().toISOString();
    const passwordHash = await hashPassword(body.new_password);
    
    const updatedUser = {
      ...user,
      password_hash: passwordHash,
      updated_at: timestamp,
    };

    await kv.set([userId], updatedUser);

    return c.json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("Error changing password:", error);
    return c.json({ error: "Error changing password" }, 500);
  }
});

// ============================================
// PERFIL
// ============================================

// Get current user
app.get("/make-server-0dd48dc4/auth/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json({ error: "Authorization required" }, 401);
    }

    // Verificar token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    
    if (!payload) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const userId = payload.user_id;
    const userEntry = await kv.get([userId]);
    
    if (!userEntry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = userEntry.value as any;

    // No retornar password_hash ni códigos
    const { password_hash, verification_code, password_reset_token, ...userResponse } = user;

    return c.json({ user: userResponse });
  } catch (error) {
    console.log("Error getting user:", error);
    return c.json({ error: "Error getting user" }, 500);
  }
});

// Update profile
app.patch("/make-server-0dd48dc4/auth/profile", async (c) => {
  try {
    const body = await c.req.json();
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json({ error: "Authorization required" }, 401);
    }

    // Verificar token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    
    if (!payload) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const userId = payload.user_id;
    const userEntry = await kv.get([userId]);
    
    if (!userEntry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = userEntry.value as any;
    const timestamp = new Date().toISOString();

    // Actualizar perfil
    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        ...body.profile,
      },
      updated_at: timestamp,
    };

    await kv.set([userId], updatedUser);

    const { password_hash, verification_code, password_reset_token, ...userResponse } = updatedUser;

    return c.json({ user: userResponse });
  } catch (error) {
    console.log("Error updating profile:", error);
    return c.json({ error: "Error updating profile" }, 500);
  }
});

export default app;
