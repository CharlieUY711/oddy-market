import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// TIPOS DE DOCUMENTOS
// ============================================

const DOCUMENT_TYPES = {
  QUOTE: "quote",                    // Presupuesto/Cotización
  INVOICE: "invoice",                // Factura
  CREDIT_NOTE: "credit_note",        // Nota de crédito
  DEBIT_NOTE: "debit_note",          // Nota de débito
  PURCHASE_ORDER: "purchase_order",  // Orden de compra
  DELIVERY_NOTE: "delivery_note",    // Remito/Guía de envío
  WAYBILL: "waybill",                // Carta de porte
  RECEIPT: "receipt",                // Recibo
  PROFORMA: "proforma",              // Factura proforma
  TICKET: "ticket",                  // Ticket (impresora térmica)
};

// Proveedores de facturación electrónica por país
const E_INVOICE_PROVIDERS = {
  UY: {
    name: "DGI - Dirección General Impositiva",
    provider: "dgi",
    endpoint: "https://seace.dgi.gub.uy",
    documentation: "https://dgi.gub.uy",
  },
  AR: {
    name: "AFIP - Administración Federal de Ingresos Públicos",
    provider: "afip",
    endpoint: "https://servicios1.afip.gov.ar/wsfev1/service.asmx",
    documentation: "https://www.afip.gob.ar/ws/",
  },
  BR: {
    name: "SEFAZ - Secretaria da Fazenda",
    provider: "sefaz",
    endpoint: "https://nfe.fazenda.gov.br",
    documentation: "http://www.nfe.fazenda.gov.br",
  },
  CL: {
    name: "SII - Servicio de Impuestos Internos",
    provider: "sii",
    endpoint: "https://palena.sii.cl",
    documentation: "https://www.sii.cl/factura_electronica/",
  },
  PE: {
    name: "SUNAT - Superintendencia Nacional de Aduanas",
    provider: "sunat",
    endpoint: "https://e-factura.sunat.gob.pe",
    documentation: "https://cpe.sunat.gob.pe",
  },
  MX: {
    name: "SAT - Servicio de Administración Tributaria",
    provider: "sat",
    endpoint: "https://portalcfdi.facturaelectronica.sat.gob.mx",
    documentation: "https://www.sat.gob.mx/factura/",
  },
  CO: {
    name: "DIAN - Dirección de Impuestos y Aduanas Nacionales",
    provider: "dian",
    endpoint: "https://catalogo-vpfe.dian.gov.co",
    documentation: "https://www.dian.gov.co/",
  },
  EC: {
    name: "SRI - Servicio de Rentas Internas",
    provider: "sri",
    endpoint: "https://cel.sri.gob.ec",
    documentation: "https://www.sri.gob.ec/facturacion-electronica",
  },
};

const DOCUMENT_STATUS = {
  DRAFT: "draft",           // Borrador
  PENDING: "pending",       // Pendiente de aprobación
  APPROVED: "approved",     // Aprobado
  SENT: "sent",            // Enviado
  PAID: "paid",            // Pagado
  PARTIAL: "partial",      // Pago parcial
  OVERDUE: "overdue",      // Vencido
  CANCELLED: "cancelled",  // Cancelado
  VOID: "void",            // Anulado
};

// ============================================
// NUMERACIÓN DE DOCUMENTOS
// ============================================

// Obtener siguiente número de documento
async function getNextDocumentNumber(
  entity_id: string,
  document_type: string,
  series: string = "A"
): Promise<string> {
  const counterKey = ["document_counter", entity_id, document_type, series];
  const counterEntry = await kv.get(counterKey);
  
  const currentNumber = (counterEntry.value as number) || 0;
  const nextNumber = currentNumber + 1;
  
  await kv.set(counterKey, nextNumber);
  
  // Formato: A-00001
  const paddedNumber = String(nextNumber).padStart(5, "0");
  return `${series}-${paddedNumber}`;
}

// ============================================
// CREAR DOCUMENTO
// ============================================

app.post("/make-server-0dd48dc4/documents", async (c) => {
  try {
    const body = await c.req.json();
    const timestamp = new Date().toISOString();

    // Validaciones
    if (!body.document_type || !DOCUMENT_TYPES[body.document_type.toUpperCase()]) {
      return c.json({ error: "Invalid document type" }, 400);
    }

    // Generar número de documento
    const documentNumber = await getNextDocumentNumber(
      body.entity_id || "default",
      body.document_type,
      body.series || "A"
    );

    const id = `doc:${Date.now()}`;

    const newDocument = {
      id,
      entity_id: body.entity_id || "default",
      
      // Tipo y número
      document_type: body.document_type,
      document_number: documentNumber,
      series: body.series || "A",
      
      // Fechas
      issue_date: body.issue_date || timestamp,
      due_date: body.due_date || null,
      
      // Partes involucradas
      from: {
        party_id: body.from?.party_id || null,
        name: body.from?.name || "",
        tax_id: body.from?.tax_id || "",
        address: body.from?.address || {},
        contact: body.from?.contact || {},
      },
      
      to: {
        party_id: body.to?.party_id || null,
        name: body.to?.name || "",
        tax_id: body.to?.tax_id || "",
        address: body.to?.address || {},
        contact: body.to?.contact || {},
      },
      
      // Items/Líneas
      items: body.items || [],
      // Ejemplo de item:
      // {
      //   product_id: "prod:123",
      //   description: "Producto X",
      //   quantity: 2,
      //   unit_price: 100,
      //   discount: 0,
      //   tax_rate: 0.22,
      //   subtotal: 200,
      //   total: 244
      // }
      
      // Totales
      subtotal: body.subtotal || 0,
      discount: body.discount || 0,
      tax: body.tax || 0,
      shipping: body.shipping || 0,
      total: body.total || 0,
      
      currency: body.currency || "USD",
      
      // Referencias
      related_order_id: body.related_order_id || null,
      related_quote_id: body.related_quote_id || null,
      related_invoice_id: body.related_invoice_id || null,
      
      // Condiciones
      payment_terms: body.payment_terms || "NET_30",
      payment_method: body.payment_method || null,
      
      // Notas
      notes: body.notes || "",
      terms_and_conditions: body.terms_and_conditions || "",
      
      // Archivo PDF generado
      pdf_url: body.pdf_url || null,
      
      // Status
      status: body.status || DOCUMENT_STATUS.DRAFT,
      
      // Firma digital (opcional)
      digital_signature: body.digital_signature || null,
      
      // Validación fiscal (para facturas)
      fiscal_validation: {
        validated: false,
        validation_date: null,
        cae: null, // Código de Autorización Electrónica (AFIP Argentina)
        cfe: null, // Comprobante Fiscal Electrónico (DGI Uruguay)
        validation_code: null,
      },
      
      // Metadata
      metadata: body.metadata || {},
      
      // Auditoría
      created_at: timestamp,
      updated_at: timestamp,
      created_by: body.created_by || null,
    };

    // Calcular totales automáticamente si hay items
    if (newDocument.items.length > 0) {
      let subtotal = 0;
      let tax = 0;
      
      newDocument.items.forEach((item: any) => {
        const itemSubtotal = item.quantity * item.unit_price - (item.discount || 0);
        const itemTax = itemSubtotal * (item.tax_rate || 0);
        
        item.subtotal = itemSubtotal;
        item.total = itemSubtotal + itemTax;
        
        subtotal += itemSubtotal;
        tax += itemTax;
      });
      
      newDocument.subtotal = subtotal;
      newDocument.tax = tax;
      newDocument.total = subtotal + tax + (newDocument.shipping || 0) - (newDocument.discount || 0);
    }

    await kv.set([id], newDocument);
    
    // Indexar por entity
    await kv.set(["documents_by_entity", newDocument.entity_id, id], true);
    
    // Indexar por tipo
    await kv.set(["documents_by_type", newDocument.entity_id, newDocument.document_type, id], true);
    
    // Indexar por número
    await kv.set(["documents_by_number", newDocument.entity_id, newDocument.document_number], id);
    
    // Indexar por party (to)
    if (newDocument.to.party_id) {
      await kv.set(["documents_by_party", newDocument.entity_id, newDocument.to.party_id, id], true);
    }

    return c.json({ document: newDocument });
  } catch (error) {
    console.log("Error creating document:", error);
    return c.json({ error: error.message || "Error creating document" }, 500);
  }
});

// ============================================
// LEER DOCUMENTOS
// ============================================

// Listar documentos
app.get("/make-server-0dd48dc4/documents", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const document_type = c.req.query("document_type");
    const status = c.req.query("status");
    const party_id = c.req.query("party_id");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    let documents = [];

    if (document_type) {
      // Buscar por tipo
      const typePrefix = ["documents_by_type", entity_id, document_type];
      const entries = kv.list({ prefix: typePrefix });
      for await (const entry of entries) {
        const docId = entry.key[entry.key.length - 1];
        const docEntry = await kv.get([docId]);
        if (docEntry.value) {
          documents.push(docEntry.value);
        }
      }
    } else if (party_id) {
      // Buscar por party
      const partyPrefix = ["documents_by_party", entity_id, party_id];
      const entries = kv.list({ prefix: partyPrefix });
      for await (const entry of entries) {
        const docId = entry.key[entry.key.length - 1];
        const docEntry = await kv.get([docId]);
        if (docEntry.value) {
          documents.push(docEntry.value);
        }
      }
    } else {
      // Buscar por entity
      const entityPrefix = ["documents_by_entity", entity_id];
      const entries = kv.list({ prefix: entityPrefix });
      for await (const entry of entries) {
        const docId = entry.key[entry.key.length - 1];
        const docEntry = await kv.get([docId]);
        if (docEntry.value) {
          documents.push(docEntry.value);
        }
      }
    }

    // Filtrar por status
    if (status) {
      documents = documents.filter((d: any) => d.status === status);
    }

    // Ordenar por fecha de emisión (más reciente primero)
    documents.sort((a: any, b: any) => 
      new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
    );

    // Paginar
    const total = documents.length;
    const paginated = documents.slice(offset, offset + limit);

    return c.json({
      documents: paginated,
      total,
      limit,
      offset,
      has_more: offset + limit < total,
    });
  } catch (error) {
    console.log("Error listing documents:", error);
    return c.json({ error: "Error listing documents" }, 500);
  }
});

// Obtener documento por ID
app.get("/make-server-0dd48dc4/documents/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    return c.json({ document: entry.value });
  } catch (error) {
    console.log("Error getting document:", error);
    return c.json({ error: "Error getting document" }, 500);
  }
});

// Obtener documento por número
app.get("/make-server-0dd48dc4/documents/by-number/:number", async (c) => {
  try {
    const number = c.req.param("number");
    const entity_id = c.req.query("entity_id") || "default";
    
    const numberIndex = ["documents_by_number", entity_id, number];
    const numberEntry = await kv.get(numberIndex);

    if (!numberEntry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    const docId = numberEntry.value as string;
    const docEntry = await kv.get([docId]);

    if (!docEntry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    return c.json({ document: docEntry.value });
  } catch (error) {
    console.log("Error getting document by number:", error);
    return c.json({ error: "Error getting document" }, 500);
  }
});

// ============================================
// ACTUALIZAR DOCUMENTO
// ============================================

app.patch("/make-server-0dd48dc4/documents/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    const document = entry.value as any;
    const timestamp = new Date().toISOString();

    const updated = {
      ...document,
      ...updates,
      items: updates.items || document.items,
      from: { ...document.from, ...updates.from },
      to: { ...document.to, ...updates.to },
      fiscal_validation: { ...document.fiscal_validation, ...updates.fiscal_validation },
      metadata: { ...document.metadata, ...updates.metadata },
      updated_at: timestamp,
    };

    // Recalcular totales si cambiaron los items
    if (updates.items) {
      let subtotal = 0;
      let tax = 0;
      
      updated.items.forEach((item: any) => {
        const itemSubtotal = item.quantity * item.unit_price - (item.discount || 0);
        const itemTax = itemSubtotal * (item.tax_rate || 0);
        
        item.subtotal = itemSubtotal;
        item.total = itemSubtotal + itemTax;
        
        subtotal += itemSubtotal;
        tax += itemTax;
      });
      
      updated.subtotal = subtotal;
      updated.tax = tax;
      updated.total = subtotal + tax + (updated.shipping || 0) - (updated.discount || 0);
    }

    await kv.set([id], updated);

    return c.json({ document: updated });
  } catch (error) {
    console.log("Error updating document:", error);
    return c.json({ error: "Error updating document" }, 500);
  }
});

// ============================================
// CAMBIAR STATUS
// ============================================

app.patch("/make-server-0dd48dc4/documents/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    const document = entry.value as any;
    const timestamp = new Date().toISOString();

    if (!body.status || !Object.values(DOCUMENT_STATUS).includes(body.status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const updated = {
      ...document,
      status: body.status,
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ document: updated });
  } catch (error) {
    console.log("Error updating status:", error);
    return c.json({ error: "Error updating status" }, 500);
  }
});

// ============================================
// APROBAR PRESUPUESTO
// ============================================

app.post("/make-server-0dd48dc4/documents/:id/approve", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    const document = entry.value as any;
    const timestamp = new Date().toISOString();

    if (document.document_type !== DOCUMENT_TYPES.QUOTE) {
      return c.json({ error: "Only quotes can be approved" }, 400);
    }

    const updated = {
      ...document,
      status: DOCUMENT_STATUS.APPROVED,
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      document: updated,
      message: "Quote approved successfully" 
    });
  } catch (error) {
    console.log("Error approving quote:", error);
    return c.json({ error: "Error approving quote" }, 500);
  }
});

// ============================================
// CONVERTIR PRESUPUESTO A FACTURA
// ============================================

app.post("/make-server-0dd48dc4/documents/:id/convert-to-invoice", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    const quote = entry.value as any;

    if (quote.document_type !== DOCUMENT_TYPES.QUOTE) {
      return c.json({ error: "Only quotes can be converted to invoices" }, 400);
    }

    if (quote.status !== DOCUMENT_STATUS.APPROVED) {
      return c.json({ error: "Quote must be approved first" }, 400);
    }

    const timestamp = new Date().toISOString();

    // Generar número de factura
    const invoiceNumber = await getNextDocumentNumber(
      quote.entity_id,
      DOCUMENT_TYPES.INVOICE,
      quote.series
    );

    const invoiceId = `doc:${Date.now()}`;

    const newInvoice = {
      ...quote,
      id: invoiceId,
      document_type: DOCUMENT_TYPES.INVOICE,
      document_number: invoiceNumber,
      related_quote_id: quote.id,
      status: DOCUMENT_STATUS.PENDING,
      issue_date: timestamp,
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([invoiceId], newInvoice);
    
    // Indexar
    await kv.set(["documents_by_entity", newInvoice.entity_id, invoiceId], true);
    await kv.set(["documents_by_type", newInvoice.entity_id, newInvoice.document_type, invoiceId], true);
    await kv.set(["documents_by_number", newInvoice.entity_id, newInvoice.document_number], invoiceId);
    
    if (newInvoice.to.party_id) {
      await kv.set(["documents_by_party", newInvoice.entity_id, newInvoice.to.party_id, invoiceId], true);
    }

    return c.json({ 
      invoice: newInvoice,
      message: "Quote converted to invoice successfully" 
    });
  } catch (error) {
    console.log("Error converting to invoice:", error);
    return c.json({ error: "Error converting to invoice" }, 500);
  }
});

// ============================================
// GENERAR PDF (SIMULADO)
// ============================================

app.post("/make-server-0dd48dc4/documents/:id/generate-pdf", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    const document = entry.value as any;
    const timestamp = new Date().toISOString();

    // Aquí iría la lógica real de generación de PDF
    // Por ahora, simulamos con una URL
    const pdfUrl = `https://storage.example.com/documents/${document.document_number}.pdf`;

    const updated = {
      ...document,
      pdf_url: pdfUrl,
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      document: updated,
      pdf_url: pdfUrl,
      message: "PDF generated successfully" 
    });
  } catch (error) {
    console.log("Error generating PDF:", error);
    return c.json({ error: "Error generating PDF" }, 500);
  }
});

// ============================================
// ENVIAR DOCUMENTO POR EMAIL (SIMULADO)
// ============================================

app.post("/make-server-0dd48dc4/documents/:id/send", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    const document = entry.value as any;
    const timestamp = new Date().toISOString();

    // Aquí iría la lógica de envío por email
    console.log(`Sending document ${document.document_number} to ${body.email || document.to.contact.email}`);

    const updated = {
      ...document,
      status: DOCUMENT_STATUS.SENT,
      updated_at: timestamp,
      metadata: {
        ...document.metadata,
        sent_at: timestamp,
        sent_to: body.email || document.to.contact.email,
      },
    };

    await kv.set([id], updated);

    return c.json({ 
      document: updated,
      message: "Document sent successfully" 
    });
  } catch (error) {
    console.log("Error sending document:", error);
    return c.json({ error: "Error sending document" }, 500);
  }
});

// ============================================
// ESTADÍSTICAS
// ============================================

app.get("/make-server-0dd48dc4/documents/stats", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    // Obtener todos los documentos
    const entityPrefix = ["documents_by_entity", entity_id];
    const entries = kv.list({ prefix: entityPrefix });
    
    let documents = [];
    for await (const entry of entries) {
      const docId = entry.key[entry.key.length - 1];
      const docEntry = await kv.get([docId]);
      if (docEntry.value) {
        documents.push(docEntry.value);
      }
    }

    // Calcular estadísticas
    const stats = {
      total_documents: documents.length,
      by_type: {},
      by_status: {},
      total_amount: 0,
      total_paid: 0,
      total_pending: 0,
    };

    documents.forEach((doc: any) => {
      // Contar por tipo
      stats.by_type[doc.document_type] = (stats.by_type[doc.document_type] || 0) + 1;
      
      // Contar por status
      stats.by_status[doc.status] = (stats.by_status[doc.status] || 0) + 1;
      
      // Sumar totales
      stats.total_amount += doc.total || 0;
      
      if (doc.status === DOCUMENT_STATUS.PAID) {
        stats.total_paid += doc.total || 0;
      } else if ([DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.SENT, DOCUMENT_STATUS.APPROVED].includes(doc.status)) {
        stats.total_pending += doc.total || 0;
      }
    });

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting stats:", error);
    return c.json({ error: "Error getting stats" }, 500);
  }
});

// ============================================
// ANULAR DOCUMENTO
// ============================================

app.post("/make-server-0dd48dc4/documents/:id/void", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    const document = entry.value as any;
    const timestamp = new Date().toISOString();

    const updated = {
      ...document,
      status: DOCUMENT_STATUS.VOID,
      updated_at: timestamp,
      metadata: {
        ...document.metadata,
        void_reason: body.reason || "",
        voided_at: timestamp,
        voided_by: body.voided_by || null,
      },
    };

    await kv.set([id], updated);

    return c.json({ 
      document: updated,
      message: "Document voided successfully" 
    });
  } catch (error) {
    console.log("Error voiding document:", error);
    return c.json({ error: "Error voiding document" }, 500);
  }
});

// ============================================
// DASHBOARD DE DOCUMENTOS POR PARTY
// ============================================

app.get("/make-server-0dd48dc4/documents/party/:party_id/dashboard", async (c) => {
  try {
    const party_id = c.req.param("party_id");
    const entity_id = c.req.query("entity_id") || "default";

    // Obtener documentos de la party
    const partyPrefix = ["documents_by_party", entity_id, party_id];
    const entries = kv.list({ prefix: partyPrefix });
    
    let documents = [];
    for await (const entry of entries) {
      const docId = entry.key[entry.key.length - 1];
      const docEntry = await kv.get([docId]);
      if (docEntry.value) {
        documents.push(docEntry.value);
      }
    }

    // Separar por tipo
    const quotes = documents.filter((d: any) => d.document_type === DOCUMENT_TYPES.QUOTE);
    const invoices = documents.filter((d: any) => d.document_type === DOCUMENT_TYPES.INVOICE);
    const tickets = documents.filter((d: any) => d.document_type === DOCUMENT_TYPES.TICKET);
    const deliveryNotes = documents.filter((d: any) => d.document_type === DOCUMENT_TYPES.DELIVERY_NOTE);

    // Calcular totales
    const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
    const totalPaid = invoices
      .filter((inv: any) => inv.status === DOCUMENT_STATUS.PAID)
      .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
    const totalPending = totalInvoiced - totalPaid;

    // Documentos recientes
    const recentDocuments = documents
      .sort((a: any, b: any) => 
        new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      )
      .slice(0, 10);

    return c.json({
      dashboard: {
        party_id,
        summary: {
          total_documents: documents.length,
          total_quotes: quotes.length,
          total_invoices: invoices.length,
          total_tickets: tickets.length,
          total_delivery_notes: deliveryNotes.length,
        },
        financial: {
          total_invoiced: totalInvoiced,
          total_paid: totalPaid,
          total_pending: totalPending,
        },
        recent_documents: recentDocuments.map((doc: any) => ({
          id: doc.id,
          document_type: doc.document_type,
          document_number: doc.document_number,
          issue_date: doc.issue_date,
          total: doc.total,
          status: doc.status,
          pdf_url: doc.pdf_url,
        })),
      },
    });
  } catch (error) {
    console.log("Error getting party dashboard:", error);
    return c.json({ error: "Error getting party dashboard" }, 500);
  }
});

// ============================================
// GENERAR TICKET (IMPRESORA TÉRMICA)
// ============================================

app.post("/make-server-0dd48dc4/documents/generate-ticket", async (c) => {
  try {
    const body = await c.req.json();
    const timestamp = new Date().toISOString();

    // Generar número de ticket
    const ticketNumber = await getNextDocumentNumber(
      body.entity_id || "default",
      DOCUMENT_TYPES.TICKET,
      "T" // Serie para tickets
    );

    const id = `doc:${Date.now()}`;

    const ticket = {
      id,
      entity_id: body.entity_id || "default",
      
      document_type: DOCUMENT_TYPES.TICKET,
      document_number: ticketNumber,
      series: "T",
      
      issue_date: timestamp,
      due_date: null,
      
      from: body.from || {},
      to: body.to || {},
      
      items: body.items || [],
      
      subtotal: body.subtotal || 0,
      discount: body.discount || 0,
      tax: body.tax || 0,
      shipping: 0,
      total: body.total || 0,
      
      currency: body.currency || "USD",
      
      related_order_id: body.related_order_id || null,
      
      payment_method: body.payment_method || "cash",
      
      notes: body.notes || "",
      
      // Formato específico para impresora térmica
      thermal_format: {
        width: body.thermal_format?.width || 58, // mm (58mm o 80mm)
        font_size: body.thermal_format?.font_size || "normal",
        print_logo: body.thermal_format?.print_logo !== false,
        print_qr: body.thermal_format?.print_qr !== false,
      },
      
      pdf_url: null,
      status: DOCUMENT_STATUS.PAID, // Tickets generalmente son pagados al momento
      
      fiscal_validation: {
        validated: false,
        validation_date: null,
        cae: null,
        cfe: null,
        validation_code: null,
      },
      
      metadata: body.metadata || {},
      
      created_at: timestamp,
      updated_at: timestamp,
      created_by: body.created_by || null,
    };

    // Calcular totales automáticamente
    if (ticket.items.length > 0) {
      let subtotal = 0;
      let tax = 0;
      
      ticket.items.forEach((item: any) => {
        const itemSubtotal = item.quantity * item.unit_price - (item.discount || 0);
        const itemTax = itemSubtotal * (item.tax_rate || 0);
        
        item.subtotal = itemSubtotal;
        item.total = itemSubtotal + itemTax;
        
        subtotal += itemSubtotal;
        tax += itemTax;
      });
      
      ticket.subtotal = subtotal;
      ticket.tax = tax;
      ticket.total = subtotal + tax - (ticket.discount || 0);
    }

    await kv.set([id], ticket);
    
    // Indexar
    await kv.set(["documents_by_entity", ticket.entity_id, id], true);
    await kv.set(["documents_by_type", ticket.entity_id, ticket.document_type, id], true);
    await kv.set(["documents_by_number", ticket.entity_id, ticket.document_number], id);
    
    if (ticket.to.party_id) {
      await kv.set(["documents_by_party", ticket.entity_id, ticket.to.party_id, id], true);
    }

    return c.json({ 
      ticket,
      message: "Ticket generated successfully",
      // Datos para impresora térmica
      thermal_data: {
        width: ticket.thermal_format.width,
        commands: [
          "ALIGN CENTER",
          "LOGO",
          "TEXT BOLD ON",
          `TEXT ${ticket.from.name || "TIENDA"}`,
          "TEXT BOLD OFF",
          "LINE",
          `TEXT TICKET: ${ticket.document_number}`,
          `TEXT FECHA: ${new Date(ticket.issue_date).toLocaleString()}`,
          "LINE",
          "ALIGN LEFT",
          ...ticket.items.map((item: any) => 
            `TEXT ${item.description} x${item.quantity} $${item.total}`
          ),
          "LINE",
          "ALIGN RIGHT",
          `TEXT BOLD ON`,
          `TEXT TOTAL: $${ticket.total}`,
          "TEXT BOLD OFF",
          "LINE",
          "ALIGN CENTER",
          "TEXT Gracias por su compra",
          ticket.thermal_format.print_qr ? `QR ${ticket.id}` : "",
          "CUT",
        ].filter(Boolean),
      },
    });
  } catch (error) {
    console.log("Error generating ticket:", error);
    return c.json({ error: error.message || "Error generating ticket" }, 500);
  }
});

// ============================================
// CONFIGURACIÓN DE FACTURACIÓN ELECTRÓNICA
// ============================================

// Obtener proveedores disponibles
app.get("/make-server-0dd48dc4/documents/e-invoice/providers", async (c) => {
  try {
    const country = c.req.query("country");

    if (country) {
      const provider = E_INVOICE_PROVIDERS[country.toUpperCase()];
      
      if (!provider) {
        return c.json({ error: "Provider not found for country" }, 404);
      }

      return c.json({ provider });
    }

    // Retornar todos los proveedores
    return c.json({ providers: E_INVOICE_PROVIDERS });
  } catch (error) {
    console.log("Error getting providers:", error);
    return c.json({ error: "Error getting providers" }, 500);
  }
});

// Configurar credenciales de proveedor de e-invoicing
app.post("/make-server-0dd48dc4/documents/e-invoice/configure", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const country = body.country;

    if (!country || !E_INVOICE_PROVIDERS[country.toUpperCase()]) {
      return c.json({ error: "Invalid country or provider not available" }, 400);
    }

    const configId = `e-invoice-config:${entity_id}:${country}`;
    const timestamp = new Date().toISOString();

    const config = {
      id: configId,
      entity_id,
      country: country.toUpperCase(),
      provider: E_INVOICE_PROVIDERS[country.toUpperCase()].provider,
      
      // Credenciales (en producción deberían estar encriptadas)
      credentials: {
        certificate: body.credentials?.certificate || null, // Certificado digital
        key: body.credentials?.key || null,
        rut: body.credentials?.rut || null,
        cuit: body.credentials?.cuit || null,
        tax_id: body.credentials?.tax_id || null,
        username: body.credentials?.username || null,
        password: body.credentials?.password || null, // ENCRIPTAR EN PRODUCCIÓN
        token: body.credentials?.token || null,
        api_key: body.credentials?.api_key || null,
      },
      
      // Configuración
      environment: body.environment || "testing", // testing, production
      auto_send: body.auto_send !== false, // Enviar automáticamente a proveedor
      
      // Status
      enabled: body.enabled !== false,
      
      // Metadata
      metadata: body.metadata || {},
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([configId], config);
    
    // Indexar por entity
    await kv.set(["e_invoice_configs", entity_id, country], configId);

    return c.json({ 
      config: {
        ...config,
        credentials: "***hidden***", // No retornar credenciales
      },
      message: "E-invoice configuration saved successfully" 
    });
  } catch (error) {
    console.log("Error configuring e-invoice:", error);
    return c.json({ error: "Error configuring e-invoice" }, 500);
  }
});

// Obtener configuración de e-invoicing
app.get("/make-server-0dd48dc4/documents/e-invoice/config", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const country = c.req.query("country");

    if (!country) {
      return c.json({ error: "Country is required" }, 400);
    }

    const configIndex = ["e_invoice_configs", entity_id, country.toUpperCase()];
    const configIdEntry = await kv.get(configIndex);

    if (!configIdEntry.value) {
      return c.json({ error: "Configuration not found" }, 404);
    }

    const configId = configIdEntry.value as string;
    const configEntry = await kv.get([configId]);

    if (!configEntry.value) {
      return c.json({ error: "Configuration not found" }, 404);
    }

    const config = configEntry.value as any;

    return c.json({ 
      config: {
        ...config,
        credentials: "***hidden***", // No retornar credenciales
      },
    });
  } catch (error) {
    console.log("Error getting e-invoice config:", error);
    return c.json({ error: "Error getting e-invoice config" }, 500);
  }
});

// Enviar documento a proveedor oficial (SIMULADO)
app.post("/make-server-0dd48dc4/documents/:id/submit-to-provider", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Document not found" }, 404);
    }

    const document = entry.value as any;
    const timestamp = new Date().toISOString();

    // Obtener configuración de e-invoicing
    const configIndex = ["e_invoice_configs", document.entity_id, document.from.address?.country || "UY"];
    const configIdEntry = await kv.get(configIndex);

    if (!configIdEntry.value) {
      return c.json({ error: "E-invoice not configured for this country" }, 400);
    }

    const configId = configIdEntry.value as string;
    const configEntry = await kv.get([configId]);
    const config = configEntry.value as any;

    if (!config.enabled) {
      return c.json({ error: "E-invoicing is disabled" }, 400);
    }

    // Simular envío al proveedor
    const provider = E_INVOICE_PROVIDERS[config.country];
    console.log(`Submitting document ${document.document_number} to ${provider.name}...`);

    // En producción, aquí iría la llamada real al proveedor
    // Cada proveedor tiene su propio formato y protocolo
    
    // Simular respuesta exitosa
    const validationCode = `${config.country}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const cae = config.country === "AR" ? `${Date.now()}` : null;
    const cfe = config.country === "UY" ? `CFE-${Date.now()}` : null;

    const updated = {
      ...document,
      fiscal_validation: {
        validated: true,
        validation_date: timestamp,
        cae,
        cfe,
        validation_code: validationCode,
        provider: config.provider,
        environment: config.environment,
      },
      status: DOCUMENT_STATUS.APPROVED,
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      document: updated,
      message: `Document submitted successfully to ${provider.name}`,
      validation: {
        provider: provider.name,
        validation_code: validationCode,
        cae,
        cfe,
      },
    });
  } catch (error) {
    console.log("Error submitting to provider:", error);
    return c.json({ error: "Error submitting to provider" }, 500);
  }
});

// ============================================
// LISTAR DOCUMENTOS ACCESIBLES PARA UNA PARTY
// ============================================

app.get("/make-server-0dd48dc4/documents/my-documents", async (c) => {
  try {
    const party_id = c.req.query("party_id");
    const entity_id = c.req.query("entity_id") || "default";

    if (!party_id) {
      return c.json({ error: "party_id is required" }, 400);
    }

    // Obtener documentos de la party
    const partyPrefix = ["documents_by_party", entity_id, party_id];
    const entries = kv.list({ prefix: partyPrefix });
    
    let documents = [];
    for await (const entry of entries) {
      const docId = entry.key[entry.key.length - 1];
      const docEntry = await kv.get([docId]);
      if (docEntry.value) {
        documents.push(docEntry.value);
      }
    }

    // Ordenar por fecha (más reciente primero)
    documents.sort((a: any, b: any) => 
      new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
    );

    return c.json({
      documents: documents.map((doc: any) => ({
        id: doc.id,
        document_type: doc.document_type,
        document_number: doc.document_number,
        issue_date: doc.issue_date,
        due_date: doc.due_date,
        total: doc.total,
        currency: doc.currency,
        status: doc.status,
        pdf_url: doc.pdf_url,
        fiscal_validation: doc.fiscal_validation,
      })),
      total: documents.length,
    });
  } catch (error) {
    console.log("Error getting my documents:", error);
    return c.json({ error: "Error getting my documents" }, 500);
  }
});

export default app;
