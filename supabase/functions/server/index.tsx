import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { personas } from "./personas.tsx";
import { organizaciones } from "./organizaciones.tsx";
import { roles } from "./roles.tsx";
import { pedidos } from "./pedidos.tsx";
import { metodosPago } from "./metodos_pago.tsx";
import { metodosEnvio } from "./metodos_envio.tsx";
import { etiquetas } from "./etiquetas.tsx";
import { roadmap } from "./roadmap.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-75638143/health", (c) => {
  return c.json({ status: "ok" });
});

// Personas, Organizaciones y Roles
app.route("/make-server-75638143/personas", personas);
app.route("/make-server-75638143/organizaciones", organizaciones);
app.route("/make-server-75638143/roles", roles);

// eCommerce
app.route("/make-server-75638143/pedidos", pedidos);
app.route("/make-server-75638143/metodos-pago", metodosPago);
app.route("/make-server-75638143/metodos-envio", metodosEnvio);

// Marketing
app.route("/make-server-75638143/etiquetas", etiquetas);

// Roadmap + archivos adjuntos
app.route("/make-server-75638143/roadmap", roadmap);

Deno.serve(app.fetch);