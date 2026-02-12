import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

// Import all module apps
import partiesApp from "./parties.tsx";
import productsApp from "./products.tsx";
import ordersApp from "./orders.tsx";
import inventoryApp from "./inventory.tsx";
import categoriesApp from "./categories.tsx";
import integrationsApp from "./integrations.tsx";
import entitiesApp from "./entities.tsx";
import cartApp from "./cart.tsx";
import authApp from "./auth.tsx";
import usersApp from "./users.tsx";
import documentsApp from "./documents.tsx";
import libraryApp from "./library.tsx";
import shippingApp from "./shipping.tsx";
import systemApp from "./system.tsx";
import billingApp from "./billing.tsx";
import posApp from "./pos.tsx";
import customsApp from "./customs.tsx";
import fulfillmentApp from "./fulfillment.tsx";
import mailingApp from "./mailing.tsx";
import marketingApp from "./marketing.tsx";
import automationApp from "./automation.tsx";
import socialApp from "./social.tsx";
import wheelApp from "./wheel.tsx";
import crmApp from "./crm.tsx";
import erpApp from "./erp.tsx";
import departmentsApp from "./departments.tsx";
import providerApp from "./provider.tsx";
import notificationsApp from "./notifications.tsx";
import webhooksApp from "./webhooks.tsx";
import apiKeysApp from "./api_keys.tsx";
import auditApp from "./audit.tsx";
import analyticsApp from "./analytics.tsx";
import reportsApp from "./reports.tsx";
import backupsApp from "./backups.tsx";
import settingsApp from "./settings.tsx";
import helpApp from "./help.tsx";
import supportApp from "./support.tsx";
import documentationApp from "./documentation.tsx";

const app = new Hono();

// Middleware
app.use("*", logger(console.log));
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "ODDY Market API Server",
    version: "1.0.0",
    modules: [
      "system",
      "entities",
      "parties",
      "products",
      "orders",
      "cart",
      "auth",
      "users",
      "billing",
      "pos",
      "customs",
      "fulfillment",
      "documents",
      "library",
      "shipping",
      "inventory",
      "categories",
      "integrations",
      "mailing",
      "marketing",
      "automation",
      "social",
      "wheel",
      "crm",
      "erp",
      "departments",
      "provider",
      "notifications",
      "webhooks",
      "api_keys",
      "audit",
      "analytics",
      "reports",
      "backups",
      "settings",
      "help",
      "support",
      "documentation",
    ],
  });
});

// Mount all module routes
app.route("/", systemApp);
app.route("/", entitiesApp);
app.route("/", partiesApp);
app.route("/", productsApp);
app.route("/", ordersApp);
app.route("/", cartApp);
app.route("/", authApp);
app.route("/", usersApp);
app.route("/", billingApp);
app.route("/", posApp);
app.route("/", customsApp);
app.route("/", fulfillmentApp);
app.route("/", documentsApp);
app.route("/", libraryApp);
app.route("/", shippingApp);
app.route("/", inventoryApp);
app.route("/", categoriesApp);
app.route("/", integrationsApp);
app.route("/", mailingApp);
app.route("/", marketingApp);
app.route("/", automationApp);
app.route("/", socialApp);
app.route("/", wheelApp);
app.route("/", crmApp);
app.route("/", erpApp);
app.route("/", departmentsApp);
app.route("/", providerApp);
app.route("/", notificationsApp);
app.route("/", webhooksApp);
app.route("/", apiKeysApp);
app.route("/", auditApp);
app.route("/", analyticsApp);
app.route("/", reportsApp);
app.route("/", backupsApp);
app.route("/", settingsApp);
app.route("/", helpApp);
app.route("/", supportApp);
app.route("/", documentationApp);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: err.message || "Internal server error" }, 500);
});

console.log("🚀 ODDY Market API Server starting...");
console.log("📦 Loaded modules (38 total): system, entities, parties, products, orders, cart, auth, users, billing, pos, customs, fulfillment, documents, library, shipping, inventory, categories, integrations, mailing, marketing, automation, social, wheel, crm, erp, departments, provider, notifications, webhooks, api_keys, audit, analytics, reports, backups, settings, help, support, documentation");

Deno.serve(app.fetch);
