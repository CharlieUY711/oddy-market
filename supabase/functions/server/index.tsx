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
      "documents",
      "library",
      "shipping",
      "inventory",
      "categories",
      "integrations",
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
app.route("/", documentsApp);
app.route("/", libraryApp);
app.route("/", shippingApp);
app.route("/", inventoryApp);
app.route("/", categoriesApp);
app.route("/", integrationsApp);

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
console.log("📦 Loaded modules: system, entities, parties, products, orders, cart, auth, users, billing, documents, library, shipping, inventory, categories, integrations");

Deno.serve(app.fetch);
