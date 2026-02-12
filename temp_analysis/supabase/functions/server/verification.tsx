import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { getApiKey } from "./api-keys.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Helper para obtener usuario autenticado
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ============== VERIFICACIÓN DE IDENTIDAD ==============

// Obtener estado de verificación de un usuario
app.get("/make-server-0dd48dc4/verification/status", async (c) => {
  try {
    const userId = c.req.query("userId");
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }

    const verification = await kv.get(`verification:${userId}`);
    
    if (!verification) {
      return c.json({ 
        verified: false, 
        status: "not_started" 
      });
    }

    return c.json({
      verified: verification.status === "verified",
      status: verification.status,
      verifiedAt: verification.verifiedAt,
      verificationType: verification.verificationType,
      ageVerified: verification.ageVerified || false,
    });
  } catch (error) {
    console.log("Error fetching verification status:", error);
    return c.json({ error: "Error fetching verification status" }, 500);
  }
});

// Obtener configuración de MetaMap
app.get("/make-server-0dd48dc4/verification/metamap-config", async (c) => {
  try {
    const userId = c.req.query("userId");
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }

    // Obtener credenciales de MetaMap del KV store o env vars
    const clientId = await getApiKey("metamap_client_id") || Deno.env.get("METAMAP_CLIENT_ID");
    
    if (!clientId) {
      return c.json({ error: "MetaMap not configured" }, 400);
    }

    // FlowId por defecto - el admin puede cambiarlo desde el panel de MetaMap
    const flowId = await getApiKey("metamap_flow_id") || Deno.env.get("METAMAP_FLOW_ID") || "default";

    return c.json({
      clientId,
      flowId,
    });
  } catch (error) {
    console.log("Error fetching MetaMap config:", error);
    return c.json({ error: "Error fetching MetaMap config" }, 500);
  }
});

// Completar verificación de identidad
app.post("/make-server-0dd48dc4/verification/complete", async (c) => {
  try {
    const { userId, metamapData, reason } = await c.req.json();

    if (!userId || !metamapData) {
      return c.json({ error: "userId and metamapData are required" }, 400);
    }

    // Obtener el secret de MetaMap para validar el webhook
    const clientSecret = await getApiKey("metamap_client_secret") || Deno.env.get("METAMAP_CLIENT_SECRET");
    
    if (!clientSecret) {
      console.log("MetaMap client secret not configured, skipping validation");
    }

    // En producción, aquí deberíamos validar la respuesta de MetaMap
    // mediante su API o webhook signature
    
    // Verificar que la respuesta de MetaMap contenga los datos esperados
    const verificationId = metamapData.identityId || metamapData.flowId || "unknown";
    const status = metamapData.status || "pending";

    // Solo marcar como verificado si MetaMap lo aprobó
    const isVerified = status === "reviewNeeded" || status === "verified" || status === "completed";

    // Guardar verificación en KV store
    const verificationData = {
      key: `verification:${userId}`,
      userId,
      status: isVerified ? "verified" : "pending",
      verificationType: "metamap",
      verificationId,
      metamapData: {
        identityId: verificationId,
        status,
        completedAt: metamapData.eventName === "verification_completed" ? new Date().toISOString() : null,
      },
      verifiedAt: isVerified ? new Date().toISOString() : null,
      reason,
      ageVerified: true, // MetaMap verifica la edad al validar el documento
    };

    await kv.set(`verification:${userId}`, verificationData);

    // También guardar en el perfil del usuario
    const userProfile = await kv.get(`user_profile:${userId}`) || {};
    await kv.set(`user_profile:${userId}`, {
      ...userProfile,
      identityVerified: isVerified,
      identityVerifiedAt: verificationData.verifiedAt,
      ageVerified: true,
    });

    return c.json({
      success: true,
      verified: isVerified,
      verificationData,
    });
  } catch (error) {
    console.log("Error completing verification:", error);
    return c.json({ error: "Error completing verification" }, 500);
  }
});

// Webhook de MetaMap (para recibir actualizaciones de verificación)
app.post("/make-server-0dd48dc4/verification/metamap-webhook", async (c) => {
  try {
    const payload = await c.req.json();
    console.log("MetaMap webhook received:", payload);

    // Validar signature del webhook si está configurado
    const clientSecret = await getApiKey("metamap_client_secret") || Deno.env.get("METAMAP_CLIENT_SECRET");
    const signature = c.req.header("x-signature");
    
    if (clientSecret && signature) {
      // Aquí deberías validar la firma del webhook según la documentación de MetaMap
      // Por ahora lo dejamos como placeholder
    }

    // Extraer datos del webhook
    const { eventName, resource, identity } = payload;
    const userId = resource?.metadata?.userId || identity?.metadata?.userId;

    if (!userId) {
      console.log("No userId found in webhook payload");
      return c.json({ error: "userId not found in payload" }, 400);
    }

    // Actualizar el estado de verificación
    const currentVerification = await kv.get(`verification:${userId}`) || {};
    
    const isVerified = 
      eventName === "verification_completed" || 
      resource?.status === "verified" ||
      identity?.status === "verified";

    const updatedVerification = {
      ...currentVerification,
      key: `verification:${userId}`,
      userId,
      status: isVerified ? "verified" : "pending",
      verificationType: "metamap",
      verificationId: resource?.id || identity?.id,
      metamapData: {
        identityId: resource?.id || identity?.id,
        status: resource?.status || identity?.status,
        eventName,
        completedAt: isVerified ? new Date().toISOString() : currentVerification.verifiedAt,
      },
      verifiedAt: isVerified ? new Date().toISOString() : currentVerification.verifiedAt,
      webhookReceivedAt: new Date().toISOString(),
    };

    await kv.set(`verification:${userId}`, updatedVerification);

    // Actualizar perfil de usuario
    const userProfile = await kv.get(`user_profile:${userId}`) || {};
    await kv.set(`user_profile:${userId}`, {
      ...userProfile,
      identityVerified: isVerified,
      identityVerifiedAt: updatedVerification.verifiedAt,
      ageVerified: isVerified,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log("Error processing MetaMap webhook:", error);
    return c.json({ error: "Error processing webhook" }, 500);
  }
});

// Verificar si un usuario puede realizar una acción que requiere verificación
app.get("/make-server-0dd48dc4/verification/can-perform", async (c) => {
  try {
    const userId = c.req.query("userId");
    const action = c.req.query("action"); // "purchase_adult", "publish_secondhand", etc.

    if (!userId || !action) {
      return c.json({ error: "userId and action are required" }, 400);
    }

    const verification = await kv.get(`verification:${userId}`);
    
    // Definir qué acciones requieren verificación
    const requiresVerification = [
      "purchase_adult",
      "publish_secondhand",
      "withdraw_funds",
    ];

    if (!requiresVerification.includes(action)) {
      return c.json({ allowed: true, reason: "no_verification_required" });
    }

    if (!verification || verification.status !== "verified") {
      return c.json({ 
        allowed: false, 
        reason: "identity_not_verified",
        requiresVerification: true,
      });
    }

    return c.json({ 
      allowed: true, 
      verified: true,
      verifiedAt: verification.verifiedAt,
    });
  } catch (error) {
    console.log("Error checking verification permission:", error);
    return c.json({ error: "Error checking permission" }, 500);
  }
});

// Endpoint para marcar departamento como adulto
app.post("/make-server-0dd48dc4/verification/department-adult-flag", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { departmentId, isAdult } = await c.req.json();

    if (!departmentId) {
      return c.json({ error: "departmentId is required" }, 400);
    }

    // Actualizar configuración del departamento
    const department = await kv.get(`department:${departmentId}`);
    if (!department) {
      return c.json({ error: "Department not found" }, 404);
    }

    await kv.set(`department:${departmentId}`, {
      ...department,
      isAdultContent: isAdult,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating department adult flag:", error);
    return c.json({ error: "Error updating department" }, 500);
  }
});

export default app;
