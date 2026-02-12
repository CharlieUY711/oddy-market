import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const authApp = new Hono();

// Initialize Supabase with service role for admin operations
function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// Get user from authorization header
async function getUserFromAuth(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}

// ============== REGISTER ==============

authApp.post("/make-server-0dd48dc4/auth/register", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password and name are required" }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Check if this is the first user (make them admin)
    const existingUsers = await kv.getByPrefix("user_profile:");
    const isFirstUser = !existingUsers || existingUsers.length === 0;

    // Create user with admin API (automatically confirms email)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: isFirstUser ? "admin" : "cliente" // First user is admin, rest are clients
      },
      email_confirm: true, // Auto-confirm since we don't have email server configured
    });

    if (error) {
      console.log("Error creating user:", error);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile in KV store
    const profile = {
      id: data.user.id,
      email,
      name,
      role: isFirstUser ? "admin" : "cliente",
      created_at: new Date().toISOString(),
      preferences: {
        notifications: true,
        newsletter: true,
        marketing: false,
      },
    };

    await kv.set(`user_profile:${data.user.id}`, profile);

    return c.json({ 
      user: data.user, 
      profile,
      message: isFirstUser ? "Cuenta de administrador creada exitosamente" : "Cuenta creada exitosamente"
    });
  } catch (error) {
    console.log("Error in register endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== PROFILE ==============

// Get user profile
authApp.get("/make-server-0dd48dc4/auth/profile", async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);

    if (!profile) {
      // Create default profile if doesn't exist
      const defaultProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "Usuario",
        created_at: user.created_at,
        preferences: {
          notifications: true,
          newsletter: true,
          marketing: false,
        },
      };
      
      await kv.set(`user_profile:${user.id}`, defaultProfile);
      return c.json({ profile: defaultProfile });
    }

    return c.json({ profile });
  } catch (error) {
    console.log("Error fetching profile:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update user profile
authApp.put("/make-server-0dd48dc4/auth/profile", async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const updates = await c.req.json();
    const existingProfile = await kv.get(`user_profile:${user.id}`);

    const updatedProfile = {
      ...existingProfile,
      ...updates,
      id: user.id,
      email: user.email, // Don't allow email updates through this endpoint
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);

    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log("Error updating profile:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== PASSWORD RESET ==============

authApp.post("/make-server-0dd48dc4/auth/reset-password", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${c.req.header("origin")}/reset-password`,
    });

    if (error) {
      console.log("Error sending reset email:", error);
      // Don't reveal if email exists or not for security
      return c.json({ message: "If the email exists, a reset link has been sent" });
    }

    return c.json({ message: "Password reset email sent" });
  } catch (error) {
    console.log("Error in reset password endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== EMAIL VERIFICATION ==============

authApp.post("/make-server-0dd48dc4/auth/resend-verification", async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseAdmin();

    // Resend confirmation email
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email!,
    });

    if (error) {
      console.log("Error resending verification:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: "Verification email sent" });
  } catch (error) {
    console.log("Error in resend verification endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== USER STATS ==============

authApp.get("/make-server-0dd48dc4/auth/stats", async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user's order history, favorites, etc.
    // For now returning mock data
    const stats = {
      orders: 0,
      favorites: 0,
      reviews: 0,
      points: 0,
    };

    return c.json({ stats });
  } catch (error) {
    console.log("Error fetching user stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== RESET PASSWORD (ADMIN) ==============

authApp.post("/make-server-0dd48dc4/auth/admin/reset-password", async (c) => {
  try {
    const { email, newPassword } = await c.req.json();
    
    if (!email || !newPassword) {
      return c.json({ error: "Email and newPassword are required" }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log("Error listing users:", listError);
      return c.json({ error: "Error finding user" }, 500);
    }

    const user = users.users.find((u: any) => u.email === email);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Update password
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (error) {
      console.log("Error updating password:", error);
      return c.json({ error: error.message }, 400);
    }

    console.log(`Password updated for user: ${email}`);

    return c.json({ 
      message: "Password updated successfully",
      email: email
    });
  } catch (error) {
    console.log("Error resetting password:", error);
    return c.json({ error: `Internal server error: ${error.message}` }, 500);
  }
});

// ============== DELETE ACCOUNT ==============

authApp.delete("/make-server-0dd48dc4/auth/account", async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseAdmin();

    // Delete user profile from KV
    await kv.del(`user_profile:${user.id}`);

    // Delete user from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      console.log("Error deleting user:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error deleting account:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== MAKE ADMIN (Development only) ==============

authApp.post("/make-server-0dd48dc4/auth/make-admin", async (c) => {
  try {
    console.log("=== Make Admin Request Started ===");
    const authHeader = c.req.header("Authorization");
    console.log("Auth header present:", !!authHeader);
    
    const user = await getUserFromAuth(authHeader);
    console.log("User found:", !!user, user?.id);
    
    if (!user) {
      console.log("Unauthorized: No user found");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseAdmin();
    console.log("Updating user metadata for:", user.id);

    // Update user metadata to include admin role
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: "admin",
      },
    });

    if (error) {
      console.log("Error updating user to admin:", error);
      return c.json({ error: error.message }, 400);
    }

    console.log("User metadata updated successfully");

    // Update profile in KV
    try {
      const profile = await kv.get(`user_profile:${user.id}`);
      console.log("Profile found in KV:", !!profile);
      
      if (profile) {
        profile.role = "admin";
        await kv.set(`user_profile:${user.id}`, profile);
        console.log("Profile updated in KV");
      }
    } catch (kvError) {
      console.log("KV update error (non-critical):", kvError);
      // Don't fail if KV update fails
    }

    console.log("=== Make Admin Request Completed Successfully ===");
    return c.json({ 
      message: "User promoted to admin successfully",
      user: data.user 
    });
  } catch (error) {
    console.log("Error making user admin:", error);
    return c.json({ error: `Internal server error: ${error.message}` }, 500);
  }
});

// Test endpoint to verify auth is working
authApp.get("/make-server-0dd48dc4/auth/test", async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ 
      message: "Auth working",
      userId: user.id,
      email: user.email,
      role: user.user_metadata?.role || "cliente"
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ============== ROLE MANAGEMENT SYSTEM ==============

// Request a role upgrade
authApp.post("/make-server-0dd48dc4/auth/request-role", async (c) => {
  try {
    console.log("=== Role Request Started ===");
    console.log("Authorization header:", c.req.header("Authorization") ? "Present" : "Missing");
    
    const user = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!user) {
      console.log("ERROR: User not authenticated");
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log("User authenticated:", user.email, "Current role:", user.user_metadata?.role);

    const { requestedRole, message } = await c.req.json();
    console.log("Requested role:", requestedRole);
    console.log("Message:", message);

    // Validate requested role
    const validRoles = ["editor", "proveedor", "admin"];
    if (!validRoles.includes(requestedRole)) {
      console.log("ERROR: Invalid role requested");
      return c.json({ error: "Invalid role. Valid roles: editor, proveedor, admin" }, 400);
    }

    const currentRole = user.user_metadata?.role || "cliente";

    // Check if already has this role or higher
    if (currentRole === requestedRole) {
      console.log("ERROR: User already has this role");
      return c.json({ error: "You already have this role" }, 400);
    }

    if (currentRole === "admin") {
      console.log("ERROR: User is already admin");
      return c.json({ error: "You already have the highest role" }, 400);
    }

    // Check for pending requests
    console.log("Checking for existing pending requests...");
    const existingRequests = await kv.getByPrefix("role_request:");
    console.log("Total requests found:", existingRequests.length);
    
    const pendingRequest = existingRequests.find(
      (req: any) => req.userId === user.id && req.status === "pending"
    );

    if (pendingRequest) {
      console.log("ERROR: User already has pending request");
      return c.json({ error: "You already have a pending role request" }, 400);
    }

    // Create role request
    const requestId = crypto.randomUUID();
    console.log("Creating role request with ID:", requestId);
    
    const roleRequest = {
      id: requestId,
      userId: user.id,
      email: user.email,
      name: user.user_metadata?.name || "Usuario",
      currentRole,
      requestedRole,
      message: message || "",
      status: "pending", // pending, approved, rejected
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
    };

    console.log("Saving to KV store...");
    await kv.set(`role_request:${requestId}`, roleRequest);

    console.log(`✅ Role request created successfully: ${user.email} requesting ${requestedRole}`);
    console.log("=== Role Request Completed ===");

    return c.json({ 
      message: "Role request submitted successfully",
      request: roleRequest
    });
  } catch (error) {
    console.log("❌ ERROR creating role request:", error);
    console.log("Error stack:", error.stack);
    return c.json({ error: `Internal server error: ${error.message}` }, 500);
  }
});

// Get user's own role requests
authApp.get("/make-server-0dd48dc4/auth/my-requests", async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allRequests = await kv.getByPrefix("role_request:");
    const myRequests = allRequests.filter((req: any) => req.userId === user.id);

    // Sort by date, most recent first
    myRequests.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ requests: myRequests });
  } catch (error) {
    console.log("Error fetching user requests:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get all role requests (Admin only)
authApp.get("/make-server-0dd48dc4/auth/role-requests", async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    if (user.user_metadata?.role !== "admin") {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    const allRequests = await kv.getByPrefix("role_request:");

    // Sort by status (pending first) then by date
    allRequests.sort((a: any, b: any) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json({ requests: allRequests });
  } catch (error) {
    console.log("Error fetching role requests:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Approve role request (Admin only)
authApp.post("/make-server-0dd48dc4/auth/approve-role", async (c) => {
  try {
    const adminUser = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!adminUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    if (adminUser.user_metadata?.role !== "admin") {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    const { requestId } = await c.req.json();

    if (!requestId) {
      return c.json({ error: "Request ID is required" }, 400);
    }

    // Get the request
    const request = await kv.get(`role_request:${requestId}`);

    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }

    if (request.status !== "pending") {
      return c.json({ error: "Request has already been reviewed" }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Update user role in Supabase Auth
    const { data, error } = await supabase.auth.admin.updateUserById(request.userId, {
      user_metadata: {
        name: request.name,
        role: request.requestedRole,
      },
    });

    if (error) {
      console.log("Error updating user role:", error);
      return c.json({ error: error.message }, 400);
    }

    // Update user profile in KV if exists
    try {
      const profile = await kv.get(`user_profile:${request.userId}`);
      if (profile) {
        profile.role = request.requestedRole;
        await kv.set(`user_profile:${request.userId}`, profile);
      }
    } catch (kvError) {
      console.log("KV update error (non-critical):", kvError);
    }

    // Update request status
    request.status = "approved";
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = adminUser.email;
    await kv.set(`role_request:${requestId}`, request);

    console.log(`Role request approved: ${request.email} → ${request.requestedRole} by ${adminUser.email}`);

    return c.json({ 
      message: "Role request approved successfully",
      request,
      user: data.user
    });
  } catch (error) {
    console.log("Error approving role request:", error);
    return c.json({ error: `Internal server error: ${error.message}` }, 500);
  }
});

// Reject role request (Admin only)
authApp.post("/make-server-0dd48dc4/auth/reject-role", async (c) => {
  try {
    const adminUser = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!adminUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    if (adminUser.user_metadata?.role !== "admin") {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    const { requestId, rejectionReason } = await c.req.json();

    if (!requestId) {
      return c.json({ error: "Request ID is required" }, 400);
    }

    // Get the request
    const request = await kv.get(`role_request:${requestId}`);

    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }

    if (request.status !== "pending") {
      return c.json({ error: "Request has already been reviewed" }, 400);
    }

    // Update request status
    request.status = "rejected";
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = adminUser.email;
    request.rejectionReason = rejectionReason || "No reason provided";
    await kv.set(`role_request:${requestId}`, request);

    console.log(`Role request rejected: ${request.email} by ${adminUser.email}`);

    return c.json({ 
      message: "Role request rejected",
      request
    });
  } catch (error) {
    console.log("Error rejecting role request:", error);
    return c.json({ error: `Internal server error: ${error.message}` }, 500);
  }
});

// Get role statistics (Admin only)
authApp.get("/make-server-0dd48dc4/auth/role-stats", async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header("Authorization"));
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (user.user_metadata?.role !== "admin") {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    const allRequests = await kv.getByPrefix("role_request:");
    const allProfiles = await kv.getByPrefix("user_profile:");

    const stats = {
      totalRequests: allRequests.length,
      pendingRequests: allRequests.filter((r: any) => r.status === "pending").length,
      approvedRequests: allRequests.filter((r: any) => r.status === "approved").length,
      rejectedRequests: allRequests.filter((r: any) => r.status === "rejected").length,
      usersByRole: {
        admin: allProfiles.filter((p: any) => p.role === "admin").length,
        editor: allProfiles.filter((p: any) => p.role === "editor").length,
        proveedor: allProfiles.filter((p: any) => p.role === "proveedor").length,
        cliente: allProfiles.filter((p: any) => p.role === "cliente" || !p.role).length,
      },
    };

    return c.json({ stats });
  } catch (error) {
    console.log("Error fetching role stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default authApp;
