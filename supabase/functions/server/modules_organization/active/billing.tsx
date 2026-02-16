import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// TIPOS DE DOCUMENTOS FISCALES
// ============================================

const INVOICE_TYPES = {
  INVOICE: "Factura",
  CREDIT_NOTE: "Nota de Crédito",
  DEBIT_NOTE: "Nota de Débito",
  PROFORMA: "Factura Proforma",
  RECEIPT: "Recibo",
};

const PAYMENT_STATUS = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
};

const PAYMENT_METHODS = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  CHEQUE: "Cheque",
  MERCADOPAGO: "Mercado Pago",
  PAYPAL: "PayPal",
  CRYPTO: "Criptomoneda",
  OTHER: "Otro",
};

// ============================================
// CREAR FACTURA
// ============================================

app.post("/make-server-0dd48dc4/billing/invoices", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `invoice:${Date.now()}`;
    
    // Generar número de factura
    const invoiceNumber = await generateInvoiceNumber(entity_id, body.type || "INVOICE");

    // Calcular impuestos usando el módulo system
    let taxCalculation = null;
    if (body.auto_calculate_tax !== false) {
      // Aquí se integraría con system.tsx
      const subtotal = calculateSubtotal(body.items || []);
      taxCalculation = await calculateTaxes(
        subtotal,
        body.customer?.country || "UY",
        body.items || [],
        entity_id
      );
    }

    const invoice = {
      id,
      entity_id,
      
      // Numeración
      invoice_number: invoiceNumber,
      series: body.series || "A",
      type: body.type || "INVOICE",
      
      // Cliente
      customer_id: body.customer_id,
      customer: body.customer || {},
      
      // Fechas
      issue_date: body.issue_date || timestamp,
      due_date: body.due_date || calculateDueDate(timestamp, 30),
      
      // Items
      items: body.items || [],
      
      // Totales
      subtotal: taxCalculation?.subtotal || calculateSubtotal(body.items || []),
      tax_details: taxCalculation?.taxes || [],
      total_tax: taxCalculation?.total_tax || 0,
      discount: body.discount || 0,
      shipping_cost: body.shipping_cost || 0,
      total: taxCalculation?.total || calculateTotal(body),
      
      // Moneda
      currency: body.currency || "USD",
      exchange_rate: body.exchange_rate || 1,
      
      // Pago
      payment_status: "PENDING",
      payment_method: body.payment_method || null,
      payments: [],
      
      // Notas
      notes: body.notes || "",
      terms: body.terms || "",
      
      // Fiscal
      fiscal_data: {
        tax_id: body.fiscal_data?.tax_id || "",
        address: body.fiscal_data?.address || {},
        fiscal_regime: body.fiscal_data?.fiscal_regime || "",
      },
      
      // E-Invoice
      einvoice_status: "PENDING", // PENDING, SENT, APPROVED, REJECTED
      einvoice_provider: body.einvoice_provider || null,
      einvoice_id: null,
      einvoice_cae: null, // CAE (Argentina), CFE (Uruguay)
      einvoice_qr: null,
      
      // PDF
      pdf_url: null,
      
      // Metadata
      created_at: timestamp,
      updated_at: timestamp,
      created_by: body.created_by || "system",
      
      // Relaciones
      order_id: body.order_id || null,
      related_invoices: [], // Para notas de crédito/débito
    };

    await kv.set([id], invoice);
    
    // Indexar por entity_id
    const indexKey = ["invoices", entity_id, id];
    await kv.set(indexKey, id);
    
    // Indexar por cliente
    if (body.customer_id) {
      const customerIndexKey = ["invoices", "by_customer", body.customer_id, id];
      await kv.set(customerIndexKey, id);
    }

    return c.json({ 
      invoice,
      message: "Invoice created successfully" 
    });
  } catch (error) {
    console.log("Error creating invoice:", error);
    return c.json({ error: "Error creating invoice" }, 500);
  }
});

// ============================================
// LISTAR FACTURAS
// ============================================

app.get("/make-server-0dd48dc4/billing/invoices", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const customer_id = c.req.query("customer_id");
    const status = c.req.query("status");
    const type = c.req.query("type");
    const limit = parseInt(c.req.query("limit") || "50");

    const invoices = [];
    
    // Si se filtra por cliente
    if (customer_id) {
      const customerEntries = kv.list({ prefix: ["invoices", "by_customer", customer_id] });
      
      for await (const entry of customerEntries) {
        const invoiceId = entry.value as string;
        const invoiceEntry = await kv.get([invoiceId]);
        
        if (invoiceEntry.value) {
          invoices.push(invoiceEntry.value);
        }
        
        if (invoices.length >= limit) break;
      }
    } else {
      // Listar por entidad
      const entries = kv.list({ prefix: ["invoices", entity_id] });
      
      for await (const entry of entries) {
        const invoiceId = entry.value as string;
        const invoiceEntry = await kv.get([invoiceId]);
        
        if (invoiceEntry.value) {
          invoices.push(invoiceEntry.value);
        }
        
        if (invoices.length >= limit) break;
      }
    }

    // Filtrar por estado
    let filtered = invoices;
    if (status) {
      filtered = filtered.filter((inv: any) => inv.payment_status === status);
    }
    
    // Filtrar por tipo
    if (type) {
      filtered = filtered.filter((inv: any) => inv.type === type);
    }

    return c.json({ 
      invoices: filtered,
      total: filtered.length 
    });
  } catch (error) {
    console.log("Error listing invoices:", error);
    return c.json({ error: "Error listing invoices" }, 500);
  }
});

// ============================================
// OBTENER FACTURA POR ID
// ============================================

app.get("/make-server-0dd48dc4/billing/invoices/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    return c.json({ invoice: entry.value });
  } catch (error) {
    console.log("Error getting invoice:", error);
    return c.json({ error: "Error getting invoice" }, 500);
  }
});

// ============================================
// ACTUALIZAR FACTURA
// ============================================

app.patch("/make-server-0dd48dc4/billing/invoices/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const invoice = entry.value as any;
    const timestamp = new Date().toISOString();

    const updatedInvoice = {
      ...invoice,
      ...updates,
      updated_at: timestamp,
    };

    await kv.set([id], updatedInvoice);

    return c.json({ 
      invoice: updatedInvoice,
      message: "Invoice updated successfully" 
    });
  } catch (error) {
    console.log("Error updating invoice:", error);
    return c.json({ error: "Error updating invoice" }, 500);
  }
});

// ============================================
// ANULAR FACTURA
// ============================================

app.post("/make-server-0dd48dc4/billing/invoices/:id/cancel", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const invoice = entry.value as any;
    const timestamp = new Date().toISOString();

    const updatedInvoice = {
      ...invoice,
      payment_status: "CANCELLED",
      cancelled_at: timestamp,
      cancelled_reason: body.reason || "Cancelled by user",
      cancelled_by: body.cancelled_by || "system",
      updated_at: timestamp,
    };

    await kv.set([id], updatedInvoice);

    return c.json({ 
      invoice: updatedInvoice,
      message: "Invoice cancelled successfully" 
    });
  } catch (error) {
    console.log("Error cancelling invoice:", error);
    return c.json({ error: "Error cancelling invoice" }, 500);
  }
});

// ============================================
// REGISTRAR PAGO
// ============================================

app.post("/make-server-0dd48dc4/billing/invoices/:id/payments", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const invoice = entry.value as any;
    const timestamp = new Date().toISOString();

    const payment = {
      id: `payment:${Date.now()}`,
      amount: body.amount,
      method: body.method || "CASH",
      reference: body.reference || "",
      date: body.date || timestamp,
      notes: body.notes || "",
      created_at: timestamp,
    };

    const payments = [...(invoice.payments || []), payment];
    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    
    // Determinar estado de pago
    let payment_status = "PENDING";
    if (totalPaid >= invoice.total) {
      payment_status = "PAID";
    } else if (totalPaid > 0) {
      payment_status = "PARTIAL";
    }
    
    // Verificar si está vencido
    const dueDate = new Date(invoice.due_date);
    const now = new Date();
    if (now > dueDate && payment_status !== "PAID") {
      payment_status = "OVERDUE";
    }

    const updatedInvoice = {
      ...invoice,
      payments,
      total_paid: totalPaid,
      payment_status,
      updated_at: timestamp,
    };

    await kv.set([id], updatedInvoice);

    return c.json({ 
      invoice: updatedInvoice,
      payment,
      message: "Payment registered successfully" 
    });
  } catch (error) {
    console.log("Error registering payment:", error);
    return c.json({ error: "Error registering payment" }, 500);
  }
});

// ============================================
// CREAR NOTA DE CRÉDITO
// ============================================

app.post("/make-server-0dd48dc4/billing/invoices/:id/credit-note", async (c) => {
  try {
    const invoiceId = c.req.param("id");
    const body = await c.req.json();
    
    const invoiceEntry = await kv.get([invoiceId]);
    
    if (!invoiceEntry.value) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const invoice = invoiceEntry.value as any;
    const timestamp = new Date().toISOString();

    const creditNoteId = `invoice:${Date.now()}`;
    const creditNoteNumber = await generateInvoiceNumber(invoice.entity_id, "CREDIT_NOTE");

    const creditNote = {
      id: creditNoteId,
      entity_id: invoice.entity_id,
      
      invoice_number: creditNoteNumber,
      series: "NC",
      type: "CREDIT_NOTE",
      
      customer_id: invoice.customer_id,
      customer: invoice.customer,
      
      issue_date: timestamp,
      due_date: null, // Las notas de crédito no tienen vencimiento
      
      items: body.items || invoice.items, // Puede ser parcial o total
      
      subtotal: body.subtotal || invoice.subtotal,
      tax_details: body.tax_details || invoice.tax_details,
      total_tax: body.total_tax || invoice.total_tax,
      total: body.total || invoice.total,
      
      currency: invoice.currency,
      exchange_rate: invoice.exchange_rate,
      
      payment_status: "PAID", // Las NC se consideran "pagadas"
      
      notes: body.notes || `Nota de crédito para factura ${invoice.invoice_number}`,
      reason: body.reason || "Devolución",
      
      created_at: timestamp,
      updated_at: timestamp,
      
      related_invoices: [invoiceId],
    };

    await kv.set([creditNoteId], creditNote);
    
    // Indexar
    const indexKey = ["invoices", invoice.entity_id, creditNoteId];
    await kv.set(indexKey, creditNoteId);
    
    // Actualizar factura original
    const updatedInvoice = {
      ...invoice,
      related_invoices: [...(invoice.related_invoices || []), creditNoteId],
      updated_at: timestamp,
    };
    await kv.set([invoiceId], updatedInvoice);

    return c.json({ 
      credit_note: creditNote,
      message: "Credit note created successfully" 
    });
  } catch (error) {
    console.log("Error creating credit note:", error);
    return c.json({ error: "Error creating credit note" }, 500);
  }
});

// ============================================
// GENERAR PDF
// ============================================

app.post("/make-server-0dd48dc4/billing/invoices/:id/generate-pdf", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const invoice = entry.value as any;
    
    // Aquí se integraría con documents.tsx para generar PDF
    const pdfUrl = `/pdfs/${invoice.invoice_number}.pdf`;
    
    const timestamp = new Date().toISOString();
    const updatedInvoice = {
      ...invoice,
      pdf_url: pdfUrl,
      pdf_generated_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], updatedInvoice);

    return c.json({ 
      invoice: updatedInvoice,
      pdf_url: pdfUrl,
      message: "PDF generated successfully" 
    });
  } catch (error) {
    console.log("Error generating PDF:", error);
    return c.json({ error: "Error generating PDF" }, 500);
  }
});

// ============================================
// ENVIAR FACTURA POR EMAIL
// ============================================

app.post("/make-server-0dd48dc4/billing/invoices/:id/send", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const invoice = entry.value as any;
    const timestamp = new Date().toISOString();
    
    // Aquí se integraría con el módulo de email
    const emailLog = {
      to: body.to || invoice.customer?.email,
      subject: body.subject || `Factura ${invoice.invoice_number}`,
      sent_at: timestamp,
    };

    const updatedInvoice = {
      ...invoice,
      email_logs: [...(invoice.email_logs || []), emailLog],
      last_sent_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], updatedInvoice);

    return c.json({ 
      invoice: updatedInvoice,
      message: "Invoice sent successfully" 
    });
  } catch (error) {
    console.log("Error sending invoice:", error);
    return c.json({ error: "Error sending invoice" }, 500);
  }
});

// ============================================
// ENVIAR A E-INVOICE (DGI, AFIP, etc)
// ============================================

app.post("/make-server-0dd48dc4/billing/invoices/:id/submit-einvoice", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const invoice = entry.value as any;
    const timestamp = new Date().toISOString();
    
    // Aquí se integraría con documents.tsx que maneja e-invoicing
    const provider = body.provider || invoice.einvoice_provider || "DGI_UY";
    
    // Simular respuesta de proveedor
    const einvoiceResponse = {
      status: "APPROVED",
      einvoice_id: `CFE-${Date.now()}`,
      cae: `CAE${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      qr_data: `https://einvoice.example.com/verify/${invoice.invoice_number}`,
      approved_at: timestamp,
    };

    const updatedInvoice = {
      ...invoice,
      einvoice_status: "APPROVED",
      einvoice_provider: provider,
      einvoice_id: einvoiceResponse.einvoice_id,
      einvoice_cae: einvoiceResponse.cae,
      einvoice_qr: einvoiceResponse.qr_data,
      einvoice_submitted_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], updatedInvoice);

    return c.json({ 
      invoice: updatedInvoice,
      einvoice: einvoiceResponse,
      message: "Invoice submitted to e-invoice provider successfully" 
    });
  } catch (error) {
    console.log("Error submitting e-invoice:", error);
    return c.json({ error: "Error submitting e-invoice" }, 500);
  }
});

// ============================================
// DASHBOARD DE FACTURACIÓN
// ============================================

app.get("/make-server-0dd48dc4/billing/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const period = c.req.query("period") || "month"; // month, quarter, year

    const invoices = [];
    const entries = kv.list({ prefix: ["invoices", entity_id] });
    
    for await (const entry of entries) {
      const invoiceId = entry.value as string;
      const invoiceEntry = await kv.get([invoiceId]);
      
      if (invoiceEntry.value) {
        invoices.push(invoiceEntry.value);
      }
    }

    // Calcular métricas
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
    const totalPaid = invoices
      .filter((inv: any) => inv.payment_status === "PAID")
      .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
    const totalPending = invoices
      .filter((inv: any) => inv.payment_status === "PENDING" || inv.payment_status === "PARTIAL")
      .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
    const totalOverdue = invoices
      .filter((inv: any) => inv.payment_status === "OVERDUE")
      .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);

    // Agrupar por estado
    const byStatus = {
      PENDING: invoices.filter((inv: any) => inv.payment_status === "PENDING").length,
      PARTIAL: invoices.filter((inv: any) => inv.payment_status === "PARTIAL").length,
      PAID: invoices.filter((inv: any) => inv.payment_status === "PAID").length,
      OVERDUE: invoices.filter((inv: any) => inv.payment_status === "OVERDUE").length,
      CANCELLED: invoices.filter((inv: any) => inv.payment_status === "CANCELLED").length,
    };

    // Agrupar por tipo
    const byType = {
      INVOICE: invoices.filter((inv: any) => inv.type === "INVOICE").length,
      CREDIT_NOTE: invoices.filter((inv: any) => inv.type === "CREDIT_NOTE").length,
      DEBIT_NOTE: invoices.filter((inv: any) => inv.type === "DEBIT_NOTE").length,
      PROFORMA: invoices.filter((inv: any) => inv.type === "PROFORMA").length,
    };

    // Top clientes
    const customerTotals = new Map();
    invoices.forEach((inv: any) => {
      if (inv.customer_id) {
        const current = customerTotals.get(inv.customer_id) || 0;
        customerTotals.set(inv.customer_id, current + inv.total);
      }
    });

    const topCustomers = Array.from(customerTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([customer_id, total]) => ({
        customer_id,
        total,
      }));

    return c.json({
      dashboard: {
        summary: {
          total_invoices: totalInvoices,
          total_amount: Math.round(totalAmount * 100) / 100,
          total_paid: Math.round(totalPaid * 100) / 100,
          total_pending: Math.round(totalPending * 100) / 100,
          total_overdue: Math.round(totalOverdue * 100) / 100,
          collection_rate: totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0,
        },
        by_status: byStatus,
        by_type: byType,
        top_customers: topCustomers,
      },
    });
  } catch (error) {
    console.log("Error getting billing dashboard:", error);
    return c.json({ error: "Error getting billing dashboard" }, 500);
  }
});

// ============================================
// REPORTES FISCALES
// ============================================

app.get("/make-server-0dd48dc4/billing/reports/fiscal", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const start_date = c.req.query("start_date");
    const end_date = c.req.query("end_date");

    const invoices = [];
    const entries = kv.list({ prefix: ["invoices", entity_id] });
    
    for await (const entry of entries) {
      const invoiceId = entry.value as string;
      const invoiceEntry = await kv.get([invoiceId]);
      
      if (invoiceEntry.value) {
        const invoice = invoiceEntry.value as any;
        
        // Filtrar por fechas
        if (start_date && invoice.issue_date < start_date) continue;
        if (end_date && invoice.issue_date > end_date) continue;
        
        invoices.push(invoice);
      }
    }

    // Calcular totales fiscales
    const totalSales = invoices
      .filter((inv: any) => inv.type === "INVOICE")
      .reduce((sum: number, inv: any) => sum + (inv.subtotal || 0), 0);
    
    const totalTax = invoices
      .filter((inv: any) => inv.type === "INVOICE")
      .reduce((sum: number, inv: any) => sum + (inv.total_tax || 0), 0);
    
    const totalInvoiced = invoices
      .filter((inv: any) => inv.type === "INVOICE")
      .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);

    // Agrupar impuestos por tipo
    const taxByType = new Map();
    invoices.forEach((inv: any) => {
      if (inv.tax_details) {
        inv.tax_details.forEach((tax: any) => {
          const current = taxByType.get(tax.name) || 0;
          taxByType.set(tax.name, current + tax.amount);
        });
      }
    });

    return c.json({
      report: {
        period: {
          start_date,
          end_date,
        },
        summary: {
          total_invoices: invoices.filter((inv: any) => inv.type === "INVOICE").length,
          total_credit_notes: invoices.filter((inv: any) => inv.type === "CREDIT_NOTE").length,
          total_sales: Math.round(totalSales * 100) / 100,
          total_tax: Math.round(totalTax * 100) / 100,
          total_invoiced: Math.round(totalInvoiced * 100) / 100,
        },
        tax_breakdown: Array.from(taxByType.entries()).map(([name, amount]) => ({
          name,
          amount: Math.round((amount as number) * 100) / 100,
        })),
        invoices,
      },
    });
  } catch (error) {
    console.log("Error generating fiscal report:", error);
    return c.json({ error: "Error generating fiscal report" }, 500);
  }
});

// ============================================
// CONFIGURAR PLANES DE FACTURACIÓN
// ============================================

app.post("/make-server-0dd48dc4/billing/plans", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `billing-plan:${Date.now()}`;

    const plan = {
      id,
      entity_id,
      
      name: body.name,
      description: body.description || "",
      
      // Precio
      price: body.price,
      currency: body.currency || "USD",
      
      // Período
      billing_period: body.billing_period || "monthly", // monthly, quarterly, yearly
      
      // Límites
      limits: body.limits || {},
      
      // Features
      features: body.features || [],
      
      // Estado
      active: body.active !== false,
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], plan);
    
    // Indexar
    const indexKey = ["billing_plans", entity_id, id];
    await kv.set(indexKey, id);

    return c.json({ 
      plan,
      message: "Billing plan created successfully" 
    });
  } catch (error) {
    console.log("Error creating billing plan:", error);
    return c.json({ error: "Error creating billing plan" }, 500);
  }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function generateInvoiceNumber(entity_id: string, type: string): Promise<string> {
  const counterKey = ["invoice_counter", entity_id, type];
  const counterEntry = await kv.get(counterKey);
  
  let counter = 1;
  if (counterEntry.value) {
    counter = (counterEntry.value as number) + 1;
  }
  
  await kv.set(counterKey, counter);
  
  const prefix = type === "INVOICE" ? "A" : type === "CREDIT_NOTE" ? "NC" : "ND";
  return `${prefix}-${String(counter).padStart(8, "0")}`;
}

function calculateDueDate(issueDate: string, daysToAdd: number): string {
  const date = new Date(issueDate);
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString();
}

function calculateSubtotal(items: any[]): number {
  return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
}

function calculateTotal(body: any): number {
  const subtotal = calculateSubtotal(body.items || []);
  const tax = body.total_tax || 0;
  const discount = body.discount || 0;
  const shipping = body.shipping_cost || 0;
  
  return subtotal + tax - discount + shipping;
}

async function calculateTaxes(
  subtotal: number,
  country: string,
  items: any[],
  entity_id: string
): Promise<any> {
  // Aquí se integraría con system.tsx
  // Por ahora retornamos un cálculo simulado
  const taxRate = 0.22; // IVA Uruguay por defecto
  const tax = subtotal * taxRate;
  
  return {
    subtotal,
    taxes: [
      {
        name: "IVA",
        rate: taxRate,
        amount: tax,
        type: "vat",
      },
    ],
    total_tax: tax,
    total: subtotal + tax,
  };
}

export default app;
