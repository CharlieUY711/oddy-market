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

export default app;
