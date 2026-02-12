import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Import all module apps
import integrationsApp from "./integrations.tsx";
import billingApp from "./billing.tsx";
import mailingApp from "./mailing.tsx";
import departmentsApp from "./departments.tsx";
import erpApp from "./erp.tsx";
import crmApp from "./crm.tsx";
import socialApp from "./social.tsx";
import authApp from "./auth.tsx";
import shippingApp from "./shipping.tsx";
import imagesApp from "./images.tsx";
import marketingApp from "./marketing.tsx";
import usersApp from "./users.tsx";
import providerApp from "./provider.tsx";
import aiApp from "./ai.tsx";
import auditApp from "./audit.tsx";
import secondhandApp from "./secondhand.tsx";
import productsApp from "./products.tsx";
import ordersApp from "./orders.tsx";
import customersApp from "./customers-basic.tsx";
import inventoryApp from "./inventory-basic.tsx";
import categoriesApp from "./categories.tsx";
import analyticsApp from "./analytics.tsx";
import entitiesApp from "./entities.tsx";
import dashboardApp from "./dashboard.tsx";
import mediaApp from "./media.tsx";
import documentsApp from "./documents.tsx";
import apiKeysApp from "./api-keys.tsx";
import verificationApp from "./verification.tsx";
import cartApp from "./cart.tsx";
import automationApp from "./automation.tsx";
import wheelApp from "./wheel.tsx";

const app = new Hono();

// Middleware
app.use("*", logger(console.log));
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Create Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Auth helper
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Single signup route (keeping this inline for simplicity)
app.post("/make-server-0dd48dc4/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log("Signup exception:", error);
    return c.json({ error: "Error creating user" }, 500);
  }
});

// Mount all module routes
app.route("/", productsApp);
app.route("/", ordersApp);
app.route("/", customersApp);
app.route("/", inventoryApp);
app.route("/", categoriesApp);
app.route("/", analyticsApp);
app.route("/", entitiesApp);
app.route("/", dashboardApp);
app.route("/", mediaApp);
app.route("/", documentsApp);
app.route("/", integrationsApp);
app.route("/", billingApp);
app.route("/", mailingApp);
app.route("/", departmentsApp);
app.route("/", erpApp);
app.route("/", crmApp);
app.route("/", socialApp);
app.route("/", authApp);
app.route("/", shippingApp);
app.route("/", imagesApp);
app.route("/", marketingApp);
app.route("/make-server-0dd48dc4/users", usersApp);
app.route("/make-server-0dd48dc4/provider", providerApp);
app.route("/make-server-0dd48dc4/ai", aiApp);
app.route("/make-server-0dd48dc4/audit", auditApp);
app.route("/", secondhandApp);
app.route("/", apiKeysApp);
app.route("/", verificationApp);
app.route("/", cartApp);
app.route("/", automationApp);
app.route("/", wheelApp);

Deno.serve(app.fetch);
