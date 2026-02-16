import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// GESTIÓN DE USUARIOS (ADMIN)
// ============================================

// Listar usuarios
app.get("/make-server-0dd48dc4/users", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const role = c.req.query("role");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    // Obtener usuarios por entity
    const prefix = ["users_by_entity", entity_id];
    const entries = kv.list({ prefix });
    
    let users = [];
    for await (const entry of entries) {
      const userId = entry.key[entry.key.length - 1];
      const userEntry = await kv.get([userId]);
      if (userEntry.value) {
        const user = userEntry.value as any;
        // No retornar password_hash
        const { password_hash, verification_code, password_reset_token, ...userResponse } = user;
        users.push(userResponse);
      }
    }

    // Filtrar por status
    if (status) {
      users = users.filter((u: any) => u.status === status);
    }

    // Filtrar por rol
    if (role) {
      users = users.filter((u: any) => u.roles?.includes(role));
    }

    // Ordenar por fecha de creación
    users.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Paginar
    const total = users.length;
    const paginated = users.slice(offset, offset + limit);

    return c.json({
      users: paginated,
      total,
      limit,
      offset,
      has_more: offset + limit < total,
    });
  } catch (error) {
    console.log("Error listing users:", error);
    return c.json({ error: "Error listing users" }, 500);
  }
});

// Obtener usuario por ID
app.get("/make-server-0dd48dc4/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = entry.value as any;
    const { password_hash, verification_code, password_reset_token, ...userResponse } = user;

    return c.json({ user: userResponse });
  } catch (error) {
    console.log("Error getting user:", error);
    return c.json({ error: "Error getting user" }, 500);
  }
});

// Actualizar usuario (admin)
app.patch("/make-server-0dd48dc4/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = entry.value as any;
    const timestamp = new Date().toISOString();

    const updated = {
      ...user,
      ...updates,
      profile: {
        ...user.profile,
        ...updates.profile,
      },
      updated_at: timestamp,
    };

    // No permitir actualizar email, password_hash directamente
    delete updated.email;
    delete updated.password_hash;

    await kv.set([id], updated);

    const { password_hash, verification_code, password_reset_token, ...userResponse } = updated;

    return c.json({ user: userResponse });
  } catch (error) {
    console.log("Error updating user:", error);
    return c.json({ error: "Error updating user" }, 500);
  }
});

// Eliminar usuario
app.delete("/make-server-0dd48dc4/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = entry.value as any;

    // Eliminar índices
    await kv.delete(["users_by_email", user.email.toLowerCase()]);
    await kv.delete(["users_by_entity", user.entity_id, id]);

    // Eliminar usuario
    await kv.delete([id]);

    return c.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.log("Error deleting user:", error);
    return c.json({ error: "Error deleting user" }, 500);
  }
});

// ============================================
// ROLES Y PERMISOS (RBAC)
// ============================================

// Definición de roles por defecto
const DEFAULT_ROLES = {
  super_admin: {
    name: "Super Admin",
    permissions: ["*"], // Todos los permisos
  },
  admin: {
    name: "Admin",
    permissions: [
      "users.read",
      "users.create",
      "users.update",
      "users.delete",
      "products.read",
      "products.create",
      "products.update",
      "products.delete",
      "orders.read",
      "orders.update",
      "inventory.read",
      "inventory.update",
    ],
  },
  manager: {
    name: "Manager",
    permissions: [
      "users.read",
      "products.read",
      "products.update",
      "orders.read",
      "orders.update",
      "inventory.read",
      "inventory.update",
    ],
  },
  seller: {
    name: "Seller",
    permissions: [
      "products.read",
      "orders.read",
      "orders.create",
      "orders.update",
    ],
  },
  customer: {
    name: "Customer",
    permissions: [
      "products.read",
      "orders.read",
      "orders.create",
      "cart.read",
      "cart.update",
    ],
  },
};

// Asignar roles a usuario
app.post("/make-server-0dd48dc4/users/:id/roles", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = entry.value as any;
    const timestamp = new Date().toISOString();

    // Validar roles
    const roles = Array.isArray(body.roles) ? body.roles : [body.roles];
    const validRoles = roles.filter((role: string) => DEFAULT_ROLES[role]);

    if (validRoles.length === 0) {
      return c.json({ error: "Invalid roles" }, 400);
    }

    const updated = {
      ...user,
      roles: validRoles,
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    const { password_hash, verification_code, password_reset_token, ...userResponse } = updated;

    return c.json({ user: userResponse });
  } catch (error) {
    console.log("Error assigning roles:", error);
    return c.json({ error: "Error assigning roles" }, 500);
  }
});

// Obtener roles de un usuario
app.get("/make-server-0dd48dc4/users/:id/roles", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = entry.value as any;
    const roles = user.roles || [];

    // Obtener detalles de los roles
    const rolesDetails = roles.map((role: string) => ({
      key: role,
      name: DEFAULT_ROLES[role]?.name || role,
      permissions: DEFAULT_ROLES[role]?.permissions || [],
    }));

    return c.json({ roles: rolesDetails });
  } catch (error) {
    console.log("Error getting roles:", error);
    return c.json({ error: "Error getting roles" }, 500);
  }
});

// Verificar si usuario tiene permiso
app.post("/make-server-0dd48dc4/users/:id/check-permission", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = entry.value as any;
    const roles = user.roles || [];
    const permission = body.permission;

    if (!permission) {
      return c.json({ error: "Permission is required" }, 400);
    }

    // Verificar si tiene el permiso
    let hasPermission = false;

    for (const role of roles) {
      const rolePermissions = DEFAULT_ROLES[role]?.permissions || [];
      
      // Super admin tiene todos los permisos
      if (rolePermissions.includes("*")) {
        hasPermission = true;
        break;
      }

      // Verificar permiso exacto
      if (rolePermissions.includes(permission)) {
        hasPermission = true;
        break;
      }

      // Verificar permiso con wildcard (ej: "products.*")
      const parts = permission.split(".");
      const wildcardPermission = `${parts[0]}.*`;
      if (rolePermissions.includes(wildcardPermission)) {
        hasPermission = true;
        break;
      }
    }

    return c.json({ 
      has_permission: hasPermission,
      permission,
      roles 
    });
  } catch (error) {
    console.log("Error checking permission:", error);
    return c.json({ error: "Error checking permission" }, 500);
  }
});

// Listar todos los roles disponibles
app.get("/make-server-0dd48dc4/roles", async (c) => {
  try {
    const roles = Object.keys(DEFAULT_ROLES).map((key) => ({
      key,
      name: DEFAULT_ROLES[key].name,
      permissions: DEFAULT_ROLES[key].permissions,
    }));

    return c.json({ roles });
  } catch (error) {
    console.log("Error listing roles:", error);
    return c.json({ error: "Error listing roles" }, 500);
  }
});

// ============================================
// GESTIÓN DE STATUS
// ============================================

// Suspender usuario
app.post("/make-server-0dd48dc4/users/:id/suspend", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = entry.value as any;
    const timestamp = new Date().toISOString();

    const updated = {
      ...user,
      status: "suspended",
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      success: true,
      message: "User suspended",
      user_id: id 
    });
  } catch (error) {
    console.log("Error suspending user:", error);
    return c.json({ error: "Error suspending user" }, 500);
  }
});

// Activar usuario
app.post("/make-server-0dd48dc4/users/:id/activate", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = entry.value as any;
    const timestamp = new Date().toISOString();

    const updated = {
      ...user,
      status: "active",
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      success: true,
      message: "User activated",
      user_id: id 
    });
  } catch (error) {
    console.log("Error activating user:", error);
    return c.json({ error: "Error activating user" }, 500);
  }
});

// ============================================
// ESTADÍSTICAS
// ============================================

// Stats de usuarios por entity
app.get("/make-server-0dd48dc4/users/stats", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    // Obtener usuarios por entity
    const prefix = ["users_by_entity", entity_id];
    const entries = kv.list({ prefix });
    
    let users = [];
    for await (const entry of entries) {
      const userId = entry.key[entry.key.length - 1];
      const userEntry = await kv.get([userId]);
      if (userEntry.value) {
        users.push(userEntry.value);
      }
    }

    // Calcular estadísticas
    const totalUsers = users.length;
    const activeUsers = users.filter((u: any) => u.status === "active").length;
    const suspendedUsers = users.filter((u: any) => u.status === "suspended").length;
    const verifiedUsers = users.filter((u: any) => u.email_verified).length;

    // Contar por rol
    const rolesCounts = {};
    users.forEach((u: any) => {
      const roles = u.roles || [];
      roles.forEach((role: string) => {
        rolesCounts[role] = (rolesCounts[role] || 0) + 1;
      });
    });

    // Últimos registros
    const recentUsers = users
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5)
      .map((u: any) => ({
        id: u.id,
        email: u.email,
        name: `${u.profile?.first_name || ""} ${u.profile?.last_name || ""}`.trim(),
        created_at: u.created_at,
      }));

    return c.json({
      stats: {
        total_users: totalUsers,
        active_users: activeUsers,
        suspended_users: suspendedUsers,
        verified_users: verifiedUsers,
        by_role: rolesCounts,
        recent_users: recentUsers,
      },
    });
  } catch (error) {
    console.log("Error getting stats:", error);
    return c.json({ error: "Error getting stats" }, 500);
  }
});

// ============================================
// BÚSQUEDA
// ============================================

// Buscar usuarios
app.get("/make-server-0dd48dc4/users/search", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const q = c.req.query("q")?.toLowerCase() || "";
    const limit = parseInt(c.req.query("limit") || "20");

    // Obtener usuarios por entity
    const prefix = ["users_by_entity", entity_id];
    const entries = kv.list({ prefix });
    
    let users = [];
    for await (const entry of entries) {
      const userId = entry.key[entry.key.length - 1];
      const userEntry = await kv.get([userId]);
      if (userEntry.value) {
        const user = userEntry.value as any;
        const { password_hash, verification_code, password_reset_token, ...userResponse } = user;
        users.push(userResponse);
      }
    }

    // Filtrar por búsqueda
    if (q) {
      users = users.filter((u: any) => {
        const searchFields = [
          u.email,
          u.profile?.first_name,
          u.profile?.last_name,
          u.profile?.phone,
        ]
          .filter(Boolean)
          .map((f) => String(f).toLowerCase());

        return searchFields.some((field) => field.includes(q));
      });
    }

    // Limitar resultados
    users = users.slice(0, limit);

    return c.json({
      users,
      total: users.length,
      query: q,
    });
  } catch (error) {
    console.log("Error searching users:", error);
    return c.json({ error: "Error searching users" }, 500);
  }
});

export default app;
