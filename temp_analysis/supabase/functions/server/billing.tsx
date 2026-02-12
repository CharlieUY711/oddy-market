import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

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

// ============== FIXED API INTEGRATION (URUGUAY) ==============

// Obtener próximo número de factura
async function getNextInvoiceNumber(type: "factura" | "remito"): Promise<string> {
  const counterKey = `billing_counter:${type}`;
  const currentCounter = await kv.get(counterKey) || { current: 0 };
  const nextNumber = currentCounter.current + 1;
  
  await kv.set(counterKey, { current: nextNumber, lastUpdated: new Date().toISOString() });
  
  // Formato: FAC-00001 o REM-00001
  const prefix = type === "factura" ? "FAC" : "REM";
  return `${prefix}-${String(nextNumber).padStart(5, "0")}`;
}

// Crear factura electrónica con Fixed
app.post("/make-server-0dd48dc4/billing/facturas/create", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { orderId, items, customer, totals, notes } = await c.req.json();
    const fixedApiKey = Deno.env.get("FIXED_API_KEY");
    const fixedEnvironment = Deno.env.get("FIXED_ENVIRONMENT") || "sandbox";

    if (!fixedApiKey) {
      return c.json({ error: "Fixed API not configured" }, 400);
    }

    // Obtener número de factura
    const invoiceNumber = await getNextInvoiceNumber("factura");

    // Construir payload para Fixed API
    const fixedPayload = {
      tipo_documento: "e-factura", // e-factura para factura electrónica
      numero: invoiceNumber,
      fecha: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      cliente: {
        tipo_documento: customer.documentType || "CI", // CI, RUT, DNI, etc.
        numero_documento: customer.documentNumber,
        razon_social: customer.name,
        email: customer.email,
        telefono: customer.phone || "",
        direccion: {
          calle: customer.address?.street || "",
          numero: customer.address?.number || "",
          ciudad: customer.address?.city || "Montevideo",
          departamento: customer.address?.state || "Montevideo",
          codigo_postal: customer.address?.zipCode || "",
          pais: customer.address?.country || "Uruguay",
        },
      },
      items: items.map((item: any, index: number) => ({
        numero_linea: index + 1,
        codigo: item.sku || item.id,
        descripcion: item.name,
        cantidad: item.quantity,
        unidad_medida: "unidad",
        precio_unitario: item.price / 100, // Convertir centavos a pesos
        descuento: item.discount || 0,
        subtotal: (item.price * item.quantity) / 100,
      })),
      totales: {
        subtotal: totals.subtotal / 100,
        descuentos: totals.discount / 100 || 0,
        iva: totals.tax / 100 || 0,
        total: totals.total / 100,
      },
      moneda: "UYU", // Peso uruguayo
      forma_pago: "contado", // contado, credito
      medio_pago: customer.paymentMethod || "efectivo", // efectivo, transferencia, tarjeta
      observaciones: notes || "",
    };

    // Llamar a Fixed API
    const baseUrl = fixedEnvironment === "production" 
      ? "https://api.fixed.uy/v1"
      : "https://sandbox.fixed.uy/v1";

    const response = await fetch(`${baseUrl}/facturas`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${fixedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fixedPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Fixed API error creating invoice:", result);
      return c.json({ 
        error: result.message || result.error || "Error creating invoice" 
      }, response.status);
    }

    // Guardar factura en KV
    const invoice = {
      id: crypto.randomUUID(),
      fixedId: result.id,
      invoiceNumber: invoiceNumber,
      orderId: orderId,
      customer: customer,
      items: items,
      totals: totals,
      status: result.estado || "emitida",
      cfe: result.cfe || null, // Comprobante Fiscal Electrónico
      qrCode: result.qr_code || null,
      pdfUrl: result.pdf_url || null,
      xmlUrl: result.xml_url || null,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      notes: notes,
    };

    await kv.set(`invoice:${invoice.id}`, invoice);
    
    // Actualizar orden con referencia a factura
    if (orderId) {
      const order = await kv.get(`order:${orderId}`);
      if (order) {
        await kv.set(`order:${orderId}`, {
          ...order,
          invoiceId: invoice.id,
          invoiceNumber: invoiceNumber,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    console.log(`Invoice ${invoiceNumber} created successfully with Fixed ID: ${result.id}`);

    return c.json({ 
      success: true,
      invoice: invoice,
      fixed: result,
    });
  } catch (error) {
    console.log("Error creating invoice with Fixed:", error);
    return c.json({ error: "Error creating invoice" }, 500);
  }
});

// Crear remito (delivery note)
app.post("/make-server-0dd48dc4/billing/remitos/create", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { orderId, items, customer, notes, deliveryDate } = await c.req.json();
    const fixedApiKey = Deno.env.get("FIXED_API_KEY");
    const fixedEnvironment = Deno.env.get("FIXED_ENVIRONMENT") || "sandbox";

    if (!fixedApiKey) {
      return c.json({ error: "Fixed API not configured" }, 400);
    }

    // Obtener número de remito
    const remitoNumber = await getNextInvoiceNumber("remito");

    // Construir payload para Fixed API
    const fixedPayload = {
      tipo_documento: "e-remito",
      numero: remitoNumber,
      fecha: new Date().toISOString().split("T")[0],
      fecha_entrega: deliveryDate || new Date().toISOString().split("T")[0],
      cliente: {
        tipo_documento: customer.documentType || "CI",
        numero_documento: customer.documentNumber,
        razon_social: customer.name,
        email: customer.email,
        telefono: customer.phone || "",
        direccion: {
          calle: customer.address?.street || "",
          numero: customer.address?.number || "",
          ciudad: customer.address?.city || "Montevideo",
          departamento: customer.address?.state || "Montevideo",
          codigo_postal: customer.address?.zipCode || "",
          pais: customer.address?.country || "Uruguay",
        },
      },
      items: items.map((item: any, index: number) => ({
        numero_linea: index + 1,
        codigo: item.sku || item.id,
        descripcion: item.name,
        cantidad: item.quantity,
        unidad_medida: "unidad",
      })),
      observaciones: notes || "",
    };

    // Llamar a Fixed API
    const baseUrl = fixedEnvironment === "production" 
      ? "https://api.fixed.uy/v1"
      : "https://sandbox.fixed.uy/v1";

    const response = await fetch(`${baseUrl}/remitos`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${fixedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fixedPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Fixed API error creating remito:", result);
      return c.json({ 
        error: result.message || result.error || "Error creating remito" 
      }, response.status);
    }

    // Guardar remito en KV
    const remito = {
      id: crypto.randomUUID(),
      fixedId: result.id,
      remitoNumber: remitoNumber,
      orderId: orderId,
      customer: customer,
      items: items,
      status: result.estado || "emitido",
      pdfUrl: result.pdf_url || null,
      deliveryDate: deliveryDate,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      notes: notes,
    };

    await kv.set(`remito:${remito.id}`, remito);
    
    // Actualizar orden con referencia a remito
    if (orderId) {
      const order = await kv.get(`order:${orderId}`);
      if (order) {
        await kv.set(`order:${orderId}`, {
          ...order,
          remitoId: remito.id,
          remitoNumber: remitoNumber,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    console.log(`Remito ${remitoNumber} created successfully with Fixed ID: ${result.id}`);

    return c.json({ 
      success: true,
      remito: remito,
      fixed: result,
    });
  } catch (error) {
    console.log("Error creating remito with Fixed:", error);
    return c.json({ error: "Error creating remito" }, 500);
  }
});

// Obtener todas las facturas
app.get("/make-server-0dd48dc4/billing/facturas", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const invoices = await kv.getByPrefix("invoice:");
    
    // Ordenar por fecha de creación (más reciente primero)
    const sortedInvoices = invoices.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ invoices: sortedInvoices });
  } catch (error) {
    console.log("Error fetching invoices:", error);
    return c.json({ error: "Error fetching invoices" }, 500);
  }
});

// Obtener factura por ID
app.get("/make-server-0dd48dc4/billing/facturas/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const invoice = await kv.get(`invoice:${id}`);

    if (!invoice) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    return c.json({ invoice });
  } catch (error) {
    console.log("Error fetching invoice:", error);
    return c.json({ error: "Error fetching invoice" }, 500);
  }
});

// Obtener PDF de factura desde Fixed
app.get("/make-server-0dd48dc4/billing/facturas/:id/pdf", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const invoice = await kv.get(`invoice:${id}`);

    if (!invoice) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const fixedApiKey = Deno.env.get("FIXED_API_KEY");
    const fixedEnvironment = Deno.env.get("FIXED_ENVIRONMENT") || "sandbox";

    if (!fixedApiKey) {
      return c.json({ error: "Fixed API not configured" }, 400);
    }

    const baseUrl = fixedEnvironment === "production" 
      ? "https://api.fixed.uy/v1"
      : "https://sandbox.fixed.uy/v1";

    // Si ya tenemos la URL del PDF, devolverla
    if (invoice.pdfUrl) {
      return c.json({ pdfUrl: invoice.pdfUrl });
    }

    // Si no, obtenerla desde Fixed
    const response = await fetch(`${baseUrl}/facturas/${invoice.fixedId}/pdf`, {
      headers: {
        "Authorization": `Bearer ${fixedApiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.log("Fixed API error getting PDF:", error);
      return c.json({ 
        error: error.message || "Error getting PDF" 
      }, response.status);
    }

    const result = await response.json();

    // Actualizar factura con URL del PDF
    if (result.pdf_url) {
      await kv.set(`invoice:${id}`, {
        ...invoice,
        pdfUrl: result.pdf_url,
      });
    }

    return c.json({ pdfUrl: result.pdf_url });
  } catch (error) {
    console.log("Error getting invoice PDF:", error);
    return c.json({ error: "Error getting PDF" }, 500);
  }
});

// Obtener todos los remitos
app.get("/make-server-0dd48dc4/billing/remitos", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const remitos = await kv.getByPrefix("remito:");
    
    // Ordenar por fecha de creación (más reciente primero)
    const sortedRemitos = remitos.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ remitos: sortedRemitos });
  } catch (error) {
    console.log("Error fetching remitos:", error);
    return c.json({ error: "Error fetching remitos" }, 500);
  }
});

// Obtener remito por ID
app.get("/make-server-0dd48dc4/billing/remitos/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const remito = await kv.get(`remito:${id}`);

    if (!remito) {
      return c.json({ error: "Remito not found" }, 404);
    }

    return c.json({ remito });
  } catch (error) {
    console.log("Error fetching remito:", error);
    return c.json({ error: "Error fetching remito" }, 500);
  }
});

// Obtener PDF de remito desde Fixed
app.get("/make-server-0dd48dc4/billing/remitos/:id/pdf", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const remito = await kv.get(`remito:${id}`);

    if (!remito) {
      return c.json({ error: "Remito not found" }, 404);
    }

    const fixedApiKey = Deno.env.get("FIXED_API_KEY");
    const fixedEnvironment = Deno.env.get("FIXED_ENVIRONMENT") || "sandbox";

    if (!fixedApiKey) {
      return c.json({ error: "Fixed API not configured" }, 400);
    }

    const baseUrl = fixedEnvironment === "production" 
      ? "https://api.fixed.uy/v1"
      : "https://sandbox.fixed.uy/v1";

    // Si ya tenemos la URL del PDF, devolverla
    if (remito.pdfUrl) {
      return c.json({ pdfUrl: remito.pdfUrl });
    }

    // Si no, obtenerla desde Fixed
    const response = await fetch(`${baseUrl}/remitos/${remito.fixedId}/pdf`, {
      headers: {
        "Authorization": `Bearer ${fixedApiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.log("Fixed API error getting remito PDF:", error);
      return c.json({ 
        error: error.message || "Error getting PDF" 
      }, response.status);
    }

    const result = await response.json();

    // Actualizar remito con URL del PDF
    if (result.pdf_url) {
      await kv.set(`remito:${id}`, {
        ...remito,
        pdfUrl: result.pdf_url,
      });
    }

    return c.json({ pdfUrl: result.pdf_url });
  } catch (error) {
    console.log("Error getting remito PDF:", error);
    return c.json({ error: "Error getting PDF" }, 500);
  }
});

// Anular factura
app.post("/make-server-0dd48dc4/billing/facturas/:id/anular", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const { motivo } = await c.req.json();
    const invoice = await kv.get(`invoice:${id}`);

    if (!invoice) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const fixedApiKey = Deno.env.get("FIXED_API_KEY");
    const fixedEnvironment = Deno.env.get("FIXED_ENVIRONMENT") || "sandbox";

    if (!fixedApiKey) {
      return c.json({ error: "Fixed API not configured" }, 400);
    }

    const baseUrl = fixedEnvironment === "production" 
      ? "https://api.fixed.uy/v1"
      : "https://sandbox.fixed.uy/v1";

    // Anular factura en Fixed
    const response = await fetch(`${baseUrl}/facturas/${invoice.fixedId}/anular`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${fixedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ motivo: motivo || "Anulación solicitada" }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Fixed API error cancelling invoice:", result);
      return c.json({ 
        error: result.message || result.error || "Error cancelling invoice" 
      }, response.status);
    }

    // Actualizar factura local
    await kv.set(`invoice:${id}`, {
      ...invoice,
      status: "anulada",
      cancelledAt: new Date().toISOString(),
      cancelledBy: user.id,
      cancellationReason: motivo,
    });

    console.log(`Invoice ${invoice.invoiceNumber} cancelled successfully`);

    return c.json({ 
      success: true,
      message: "Invoice cancelled successfully",
    });
  } catch (error) {
    console.log("Error cancelling invoice:", error);
    return c.json({ error: "Error cancelling invoice" }, 500);
  }
});

// Obtener estadísticas de facturación
app.get("/make-server-0dd48dc4/billing/stats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [invoices, remitos] = await Promise.all([
      kv.getByPrefix("invoice:"),
      kv.getByPrefix("remito:"),
    ]);

    const totalInvoices = invoices.length;
    const totalRemitos = remitos.length;
    
    const activeInvoices = invoices.filter((inv: any) => inv.status === "emitida").length;
    const cancelledInvoices = invoices.filter((inv: any) => inv.status === "anulada").length;

    const totalBilled = invoices
      .filter((inv: any) => inv.status === "emitida")
      .reduce((sum: number, inv: any) => sum + (inv.totals?.total || 0), 0);

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthlyInvoices = invoices.filter((inv: any) => {
      const date = new Date(inv.createdAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const monthlyBilled = monthlyInvoices
      .filter((inv: any) => inv.status === "emitida")
      .reduce((sum: number, inv: any) => sum + (inv.totals?.total || 0), 0);

    return c.json({
      totalInvoices,
      totalRemitos,
      activeInvoices,
      cancelledInvoices,
      totalBilled,
      monthlyInvoices: monthlyInvoices.length,
      monthlyBilled,
    });
  } catch (error) {
    console.log("Error fetching billing stats:", error);
    return c.json({ error: "Error fetching stats" }, 500);
  }
});

export default app;
