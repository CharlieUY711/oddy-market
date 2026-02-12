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
  LABEL: "label",                    // Etiqueta
};

// Tipos de etiquetas
const LABEL_TYPES = {
  PRICE: "price",                    // Etiqueta de precio
  BARCODE: "barcode",                // Etiqueta de código de barras
  SHIPPING: "shipping",              // Etiqueta de envío
  PRODUCT: "product",                // Etiqueta de producto
  INVENTORY: "inventory",            // Etiqueta de inventario
  PROMOTIONAL: "promotional",        // Etiqueta promocional
  WARNING: "warning",                // Etiqueta de advertencia
  CUSTOM: "custom",                  // Etiqueta personalizada
  EMOTIVE: "emotive",                // Etiqueta Emotiva (con mensaje del remitente)
};

// Formatos de etiquetas (en mm)
const LABEL_FORMATS = {
  SMALL: { width: 40, height: 30, name: "Pequeña (40x30mm)" },
  MEDIUM: { width: 70, height: 50, name: "Mediana (70x50mm)" },
  LARGE: { width: 100, height: 70, name: "Grande (100x70mm)" },
  SHIPPING: { width: 100, height: 150, name: "Envío (100x150mm)" },
  A4: { width: 210, height: 297, name: "A4 completa" },
  CUSTOM: { width: null, height: null, name: "Personalizado" },
};

// Tipos de códigos de barras
const BARCODE_TYPES = {
  EAN13: "ean13",                    // Código EAN-13 (más común)
  EAN8: "ean8",                      // Código EAN-8
  CODE128: "code128",                // Code 128
  CODE39: "code39",                  // Code 39
  QR: "qr",                          // Código QR
  DATAMATRIX: "datamatrix",          // Data Matrix
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
// SISTEMA DE ETIQUETAS
// ============================================

// Generar código de barras (simulado)
function generateBarcode(data: string, type: string = BARCODE_TYPES.EAN13) {
  // En producción, usar librería como bwip-js o similar
  return {
    type,
    data,
    image_base64: `data:image/png;base64,SIMULATED_BARCODE_${type}_${data}`,
    svg: `<svg><!-- Barcode SVG for ${data} --></svg>`,
  };
}

// Generar etiqueta única
app.post("/make-server-0dd48dc4/labels/generate", async (c) => {
  try {
    const body = await c.req.json();
    const timestamp = new Date().toISOString();

    const id = `label:${Date.now()}`;

    const label = {
      id,
      entity_id: body.entity_id || "default",
      
      // Tipo y formato
      label_type: body.label_type || LABEL_TYPES.PRODUCT,
      format: body.format || LABEL_FORMATS.MEDIUM,
      custom_size: body.custom_size || null, // { width, height }
      
      // Contenido
      content: {
        title: body.content?.title || "",
        subtitle: body.content?.subtitle || "",
        description: body.content?.description || "",
        price: body.content?.price || null,
        currency: body.content?.currency || "USD",
        discount: body.content?.discount || null,
        sku: body.content?.sku || null,
        barcode_data: body.content?.barcode_data || null,
        barcode_type: body.content?.barcode_type || BARCODE_TYPES.EAN13,
        qr_data: body.content?.qr_data || null,
        image_url: body.content?.image_url || null,
        custom_fields: body.content?.custom_fields || {},
      },
      
      // Estilo
      style: {
        background_color: body.style?.background_color || "#FFFFFF",
        text_color: body.style?.text_color || "#000000",
        border: body.style?.border !== false,
        border_color: body.style?.border_color || "#000000",
        font_size: body.style?.font_size || "normal",
        logo: body.style?.logo !== false,
      },
      
      // Datos del producto (si aplica)
      product_id: body.product_id || null,
      variant_id: body.variant_id || null,
      
      // Metadata
      metadata: body.metadata || {},
      
      created_at: timestamp,
      updated_at: timestamp,
      created_by: body.created_by || null,
    };

    // Generar código de barras si se proporciona
    if (label.content.barcode_data) {
      label.content.barcode = generateBarcode(
        label.content.barcode_data,
        label.content.barcode_type
      );
    }

    // Generar QR si se proporciona
    if (label.content.qr_data) {
      label.content.qr = generateBarcode(label.content.qr_data, BARCODE_TYPES.QR);
    }

    await kv.set([id], label);
    
    // Indexar
    await kv.set(["labels_by_entity", label.entity_id, id], true);
    await kv.set(["labels_by_type", label.entity_id, label.label_type, id], true);
    
    if (label.product_id) {
      await kv.set(["labels_by_product", label.entity_id, label.product_id, id], true);
    }

    return c.json({ 
      label,
      message: "Label generated successfully",
      // Comandos para impresora de etiquetas (ZPL, EPL, etc.)
      printer_data: generateLabelPrinterCommands(label),
    });
  } catch (error) {
    console.log("Error generating label:", error);
    return c.json({ error: error.message || "Error generating label" }, 500);
  }
});

// Generar etiquetas en lote
app.post("/make-server-0dd48dc4/labels/generate-batch", async (c) => {
  try {
    const body = await c.req.json();
    const products = body.products || [];
    const label_type = body.label_type || LABEL_TYPES.PRODUCT;
    const format = body.format || LABEL_FORMATS.MEDIUM;
    const entity_id = body.entity_id || "default";

    if (products.length === 0) {
      return c.json({ error: "No products provided" }, 400);
    }

    const labels = [];
    const timestamp = new Date().toISOString();

    for (const product of products) {
      const id = `label:${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const label = {
        id,
        entity_id,
        label_type,
        format,
        
        content: {
          title: product.name || product.title || "",
          subtitle: product.brand || "",
          description: product.description || "",
          price: product.price || null,
          currency: product.currency || "USD",
          discount: product.discount || null,
          sku: product.sku || null,
          barcode_data: product.barcode || product.ean || product.sku || null,
          barcode_type: product.barcode_type || BARCODE_TYPES.EAN13,
          qr_data: product.qr_data || product.url || null,
          image_url: product.image_url || product.image || null,
        },
        
        style: body.style || {
          background_color: "#FFFFFF",
          text_color: "#000000",
          border: true,
          logo: true,
        },
        
        product_id: product.id || product.product_id || null,
        variant_id: product.variant_id || null,
        quantity: product.quantity || 1, // Cantidad de etiquetas a imprimir
        
        metadata: product.metadata || {},
        created_at: timestamp,
        updated_at: timestamp,
      };

      // Generar códigos
      if (label.content.barcode_data) {
        label.content.barcode = generateBarcode(
          label.content.barcode_data,
          label.content.barcode_type
        );
      }

      if (label.content.qr_data) {
        label.content.qr = generateBarcode(label.content.qr_data, BARCODE_TYPES.QR);
      }

      await kv.set([id], label);
      await kv.set(["labels_by_entity", entity_id, id], true);
      await kv.set(["labels_by_type", entity_id, label_type, id], true);
      
      if (label.product_id) {
        await kv.set(["labels_by_product", entity_id, label.product_id, id], true);
      }

      labels.push(label);
    }

    return c.json({ 
      labels,
      total: labels.length,
      message: `${labels.length} labels generated successfully`,
      // Comandos para impresión en lote
      printer_data: labels.map((l) => generateLabelPrinterCommands(l)),
    });
  } catch (error) {
    console.log("Error generating batch labels:", error);
    return c.json({ error: "Error generating batch labels" }, 500);
  }
});

// Obtener etiqueta
app.get("/make-server-0dd48dc4/labels/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Label not found" }, 404);
    }

    return c.json({ label: entry.value });
  } catch (error) {
    console.log("Error getting label:", error);
    return c.json({ error: "Error getting label" }, 500);
  }
});

// Listar etiquetas
app.get("/make-server-0dd48dc4/labels", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const label_type = c.req.query("label_type");
    const product_id = c.req.query("product_id");

    let prefix;
    
    if (product_id) {
      prefix = ["labels_by_product", entity_id, product_id];
    } else if (label_type) {
      prefix = ["labels_by_type", entity_id, label_type];
    } else {
      prefix = ["labels_by_entity", entity_id];
    }

    const entries = kv.list({ prefix });
    
    let labels = [];
    for await (const entry of entries) {
      const labelId = entry.key[entry.key.length - 1];
      const labelEntry = await kv.get([labelId]);
      if (labelEntry.value) {
        labels.push(labelEntry.value);
      }
    }

    return c.json({ labels, total: labels.length });
  } catch (error) {
    console.log("Error listing labels:", error);
    return c.json({ error: "Error listing labels" }, 500);
  }
});

// Plantillas de etiquetas
app.get("/make-server-0dd48dc4/labels/templates/list", async (c) => {
  try {
    const templates = [
      {
        id: "price-basic",
        name: "Precio Simple",
        type: LABEL_TYPES.PRICE,
        format: LABEL_FORMATS.SMALL,
        preview: "https://example.com/preview-price-basic.png",
        fields: ["title", "price", "currency"],
      },
      {
        id: "price-discount",
        name: "Precio con Descuento",
        type: LABEL_TYPES.PRICE,
        format: LABEL_FORMATS.MEDIUM,
        preview: "https://example.com/preview-price-discount.png",
        fields: ["title", "price", "discount", "currency"],
      },
      {
        id: "barcode-ean13",
        name: "Código de Barras EAN-13",
        type: LABEL_TYPES.BARCODE,
        format: LABEL_FORMATS.MEDIUM,
        preview: "https://example.com/preview-barcode.png",
        fields: ["title", "sku", "barcode_data"],
      },
      {
        id: "product-full",
        name: "Producto Completo",
        type: LABEL_TYPES.PRODUCT,
        format: LABEL_FORMATS.LARGE,
        preview: "https://example.com/preview-product-full.png",
        fields: ["title", "subtitle", "description", "price", "barcode_data", "qr_data", "image_url"],
      },
      {
        id: "shipping-address",
        name: "Etiqueta de Envío",
        type: LABEL_TYPES.SHIPPING,
        format: LABEL_FORMATS.SHIPPING,
        preview: "https://example.com/preview-shipping.png",
        fields: ["title", "subtitle", "description", "barcode_data", "qr_data"],
      },
      {
        id: "inventory-location",
        name: "Ubicación de Inventario",
        type: LABEL_TYPES.INVENTORY,
        format: LABEL_FORMATS.MEDIUM,
        preview: "https://example.com/preview-inventory.png",
        fields: ["title", "sku", "barcode_data", "custom_fields.location"],
      },
      {
        id: "promotional",
        name: "Promocional",
        type: LABEL_TYPES.PROMOTIONAL,
        format: LABEL_FORMATS.LARGE,
        preview: "https://example.com/preview-promo.png",
        fields: ["title", "subtitle", "price", "discount", "image_url"],
      },
    ];

    return c.json({ templates });
  } catch (error) {
    console.log("Error listing templates:", error);
    return c.json({ error: "Error listing templates" }, 500);
  }
});

// Generar desde plantilla
app.post("/make-server-0dd48dc4/labels/from-template", async (c) => {
  try {
    const body = await c.req.json();
    const template_id = body.template_id;
    
    // Obtener plantilla (en producción vendría de BD)
    const templates = {
      "price-basic": {
        label_type: LABEL_TYPES.PRICE,
        format: LABEL_FORMATS.SMALL,
        style: { background_color: "#FFFFFF", text_color: "#000000", border: true },
      },
      "barcode-ean13": {
        label_type: LABEL_TYPES.BARCODE,
        format: LABEL_FORMATS.MEDIUM,
        style: { background_color: "#FFFFFF", text_color: "#000000", border: true },
      },
      "product-full": {
        label_type: LABEL_TYPES.PRODUCT,
        format: LABEL_FORMATS.LARGE,
        style: { background_color: "#FFFFFF", text_color: "#000000", border: true, logo: true },
      },
    };

    const template = templates[template_id];
    
    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }

    // Generar etiqueta usando la plantilla
    const labelData = {
      ...body,
      label_type: template.label_type,
      format: template.format,
      style: { ...template.style, ...(body.style || {}) },
    };

    // Reutilizar endpoint de generación
    return await app.request(`/make-server-0dd48dc4/labels/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(labelData),
    });
  } catch (error) {
    console.log("Error generating from template:", error);
    return c.json({ error: "Error generating from template" }, 500);
  }
});

// Función auxiliar para generar comandos de impresora de etiquetas
function generateLabelPrinterCommands(label: any) {
  const format = label.format;
  const content = label.content;
  
  // Comandos genéricos (en producción usar ZPL para Zebra, EPL para otras)
  const commands = [];
  
  // Inicializar etiqueta
  commands.push(`SIZE ${format.width}mm,${format.height}mm`);
  commands.push(`GAP 3mm,0mm`);
  commands.push(`DIRECTION 0`);
  commands.push(`CLS`);
  
  // Título
  if (content.title) {
    commands.push(`TEXT 10,10,"3",0,1,1,"${content.title}"`);
  }
  
  // Subtítulo
  if (content.subtitle) {
    commands.push(`TEXT 10,40,"2",0,1,1,"${content.subtitle}"`);
  }
  
  // Precio
  if (content.price) {
    const priceText = `${content.currency} ${content.price}`;
    commands.push(`TEXT 10,70,"4",0,1,1,"${priceText}"`);
  }
  
  // Descuento
  if (content.discount) {
    commands.push(`TEXT 10,110,"2",0,1,1,"-${content.discount}%"`);
  }
  
  // Código de barras
  if (content.barcode_data) {
    const barcodeY = format.height - 60;
    commands.push(`BARCODE 10,${barcodeY},"${content.barcode_type.toUpperCase()}",50,1,0,2,2,"${content.barcode_data}"`);
  }
  
  // QR
  if (content.qr_data) {
    const qrX = format.width - 60;
    commands.push(`QRCODE ${qrX},10,H,5,A,0,"${content.qr_data}"`);
  }
  
  // SKU
  if (content.sku) {
    const skuY = format.height - 20;
    commands.push(`TEXT 10,${skuY},"1",0,1,1,"SKU: ${content.sku}"`);
  }
  
  // Finalizar e imprimir
  commands.push(`PRINT 1,${label.quantity || 1}`);
  
  return {
    format: "TSPL", // Lenguaje genérico de etiquetas
    commands,
    raw: commands.join("\n"),
  };
}

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

// ============================================
// SISTEMA DE ETIQUETAS EMOTIVAS
// ============================================

// Generar Etiqueta Emotiva (con mensaje del remitente al destinatario)
app.post("/make-server-0dd48dc4/labels/emotive/generate", async (c) => {
  try {
    const body = await c.req.json();
    const timestamp = new Date().toISOString();

    const id = `emotive:${Date.now()}`;

    const emotiveLabel = {
      id,
      entity_id: body.entity_id || "default",
      
      // Tipo
      label_type: LABEL_TYPES.EMOTIVE,
      format: body.format || LABEL_FORMATS.SHIPPING,
      
      // Información del envío
      package: {
        tracking_number: body.package?.tracking_number || `PKG-${Date.now()}`,
        order_id: body.package?.order_id || null,
        weight: body.package?.weight || null,
        dimensions: body.package?.dimensions || null,
      },
      
      // Remitente
      sender: {
        party_id: body.sender?.party_id || null,
        name: body.sender?.name || "",
        phone: body.sender?.phone || "",
        email: body.sender?.email || "",
        address: body.sender?.address || "",
      },
      
      // Destinatario
      recipient: {
        party_id: body.recipient?.party_id || null,
        name: body.recipient?.name || "",
        phone: body.recipient?.phone || "",
        email: body.recipient?.email || "",
        address: body.recipient?.address || "",
      },
      
      // Mensaje emotivo del remitente
      emotive_message: {
        title: body.emotive_message?.title || "Tienes un mensaje especial",
        message: body.emotive_message?.message || "",
        image_url: body.emotive_message?.image_url || null,
        video_url: body.emotive_message?.video_url || null,
        sender_signature: body.emotive_message?.sender_signature || "",
        reveal_on_scan: body.emotive_message?.reveal_on_scan !== false, // Por defecto true
      },
      
      // QR Codes
      qr_tracking: {
        type: "tracking",
        data: null, // Se genera después
        url: null,
        scanned: false,
        scanned_at: null,
        scanned_by: null,
      },
      
      qr_emotive: {
        type: "emotive",
        data: null, // Se genera después
        url: null,
        scanned: false,
        scanned_at: null,
        scanned_by: null,
      },
      
      // Estado del match
      match: {
        matched: false,
        matched_at: null,
        recipient_acknowledged: false,
        acknowledged_at: null,
        thank_you_message: null,
      },
      
      // Interacciones
      interactions: [],
      
      // Estado
      status: "pending", // pending, shipped, delivered, revealed, acknowledged
      
      // Fechas
      created_at: timestamp,
      shipped_at: null,
      delivered_at: null,
      revealed_at: null,
      acknowledged_at: null,
      
      metadata: body.metadata || {},
    };

    // Generar URLs de QR
    const baseUrl = body.base_url || "https://oddy.market";
    
    // QR de Tracking (normal)
    emotiveLabel.qr_tracking.data = `${baseUrl}/track/${emotiveLabel.package.tracking_number}`;
    emotiveLabel.qr_tracking.url = `${baseUrl}/track/${emotiveLabel.package.tracking_number}`;
    
    // QR Emotivo (con ID único)
    emotiveLabel.qr_emotive.data = `${baseUrl}/emotive/${id}`;
    emotiveLabel.qr_emotive.url = `${baseUrl}/emotive/${id}`;

    await kv.set([id], emotiveLabel);
    
    // Indexar
    await kv.set(["emotive_labels", emotiveLabel.entity_id, id], true);
    await kv.set(["emotive_by_tracking", emotiveLabel.entity_id, emotiveLabel.package.tracking_number], id);
    
    if (emotiveLabel.sender.party_id) {
      await kv.set(["emotive_by_sender", emotiveLabel.entity_id, emotiveLabel.sender.party_id, id], true);
    }
    
    if (emotiveLabel.recipient.party_id) {
      await kv.set(["emotive_by_recipient", emotiveLabel.entity_id, emotiveLabel.recipient.party_id, id], true);
    }

    return c.json({ 
      emotive_label: emotiveLabel,
      message: "Emotive label generated successfully",
      qr_codes: {
        tracking: {
          url: emotiveLabel.qr_tracking.url,
          svg: generateBarcode(emotiveLabel.qr_tracking.data, BARCODE_TYPES.QR).svg,
        },
        emotive: {
          url: emotiveLabel.qr_emotive.url,
          svg: generateBarcode(emotiveLabel.qr_emotive.data, BARCODE_TYPES.QR).svg,
        },
      },
      // Comandos para impresora con ambos QR
      printer_data: generateEmotiveLabelPrinterCommands(emotiveLabel),
    });
  } catch (error) {
    console.log("Error generating emotive label:", error);
    return c.json({ error: "Error generating emotive label" }, 500);
  }
});

// Escanear QR Emotivo (landing page para el destinatario)
app.get("/make-server-0dd48dc4/emotive/:id/scan", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Emotive label not found" }, 404);
    }

    const emotiveLabel = entry.value as any;
    const timestamp = new Date().toISOString();

    // Registrar escaneo del QR emotivo
    if (!emotiveLabel.qr_emotive.scanned) {
      emotiveLabel.qr_emotive.scanned = true;
      emotiveLabel.qr_emotive.scanned_at = timestamp;
      emotiveLabel.status = "revealed";
      emotiveLabel.revealed_at = timestamp;
    }

    // Registrar interacción
    emotiveLabel.interactions.push({
      type: "qr_emotive_scanned",
      timestamp,
      ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
      user_agent: c.req.header("user-agent") || "unknown",
    });

    // Realizar match (conectar remitente con destinatario)
    if (!emotiveLabel.match.matched) {
      emotiveLabel.match.matched = true;
      emotiveLabel.match.matched_at = timestamp;
    }

    await kv.set([id], emotiveLabel);

    // Retornar datos para la landing page
    return c.json({
      success: true,
      emotive_label: {
        id: emotiveLabel.id,
        package: {
          tracking_number: emotiveLabel.package.tracking_number,
        },
        sender: {
          name: emotiveLabel.sender.name,
        },
        recipient: {
          name: emotiveLabel.recipient.name,
        },
        emotive_message: {
          title: emotiveLabel.emotive_message.title,
          message: emotiveLabel.emotive_message.message,
          image_url: emotiveLabel.emotive_message.image_url,
          video_url: emotiveLabel.emotive_message.video_url,
          sender_signature: emotiveLabel.emotive_message.sender_signature,
        },
        delivered_at: emotiveLabel.delivered_at,
        days_since_delivery: emotiveLabel.delivered_at 
          ? Math.floor((new Date(timestamp).getTime() - new Date(emotiveLabel.delivered_at).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      },
      can_acknowledge: !emotiveLabel.match.recipient_acknowledged,
    });
  } catch (error) {
    console.log("Error scanning emotive QR:", error);
    return c.json({ error: "Error scanning emotive QR" }, 500);
  }
});

// Destinatario agradece el envío
app.post("/make-server-0dd48dc4/emotive/:id/acknowledge", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Emotive label not found" }, 404);
    }

    const emotiveLabel = entry.value as any;
    const timestamp = new Date().toISOString();

    if (emotiveLabel.match.recipient_acknowledged) {
      return c.json({ error: "Already acknowledged" }, 400);
    }

    // Registrar agradecimiento
    emotiveLabel.match.recipient_acknowledged = true;
    emotiveLabel.match.acknowledged_at = timestamp;
    emotiveLabel.match.thank_you_message = body.thank_you_message || "Gracias por el envío ❤️";
    emotiveLabel.status = "acknowledged";
    emotiveLabel.acknowledged_at = timestamp;

    // Registrar interacción
    emotiveLabel.interactions.push({
      type: "recipient_acknowledged",
      timestamp,
      message: body.thank_you_message,
      ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
    });

    await kv.set([id], emotiveLabel);

    // TODO: Enviar notificación al remitente (email, SMS, push)
    console.log(`[NOTIFICATION] Sender ${emotiveLabel.sender.name} should be notified: Recipient acknowledged!`);

    return c.json({
      success: true,
      message: "Thank you message sent successfully!",
      emotive_label: {
        sender: { name: emotiveLabel.sender.name },
        recipient: { name: emotiveLabel.recipient.name },
        acknowledged_at: timestamp,
      },
    });
  } catch (error) {
    console.log("Error acknowledging:", error);
    return c.json({ error: "Error acknowledging" }, 500);
  }
});

// Obtener etiqueta emotiva
app.get("/make-server-0dd48dc4/emotive/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Emotive label not found" }, 404);
    }

    return c.json({ emotive_label: entry.value });
  } catch (error) {
    console.log("Error getting emotive label:", error);
    return c.json({ error: "Error getting emotive label" }, 500);
  }
});

// Listar etiquetas emotivas
app.get("/make-server-0dd48dc4/emotive", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const sender_id = c.req.query("sender_id");
    const recipient_id = c.req.query("recipient_id");
    const status = c.req.query("status");

    let prefix;
    
    if (sender_id) {
      prefix = ["emotive_by_sender", entity_id, sender_id];
    } else if (recipient_id) {
      prefix = ["emotive_by_recipient", entity_id, recipient_id];
    } else {
      prefix = ["emotive_labels", entity_id];
    }

    const entries = kv.list({ prefix });
    
    let labels = [];
    for await (const entry of entries) {
      const labelId = entry.key[entry.key.length - 1];
      const labelEntry = await kv.get([labelId]);
      if (labelEntry.value) {
        const label = labelEntry.value as any;
        
        // Filtrar por status si se proporciona
        if (!status || label.status === status) {
          labels.push(label);
        }
      }
    }

    // Ordenar por fecha de creación (más reciente primero)
    labels.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ emotive_labels: labels, total: labels.length });
  } catch (error) {
    console.log("Error listing emotive labels:", error);
    return c.json({ error: "Error listing emotive labels" }, 500);
  }
});

// Dashboard de etiquetas emotivas (estadísticas)
app.get("/make-server-0dd48dc4/emotive/stats/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const prefix = ["emotive_labels", entity_id];
    const entries = kv.list({ prefix });
    
    let labels = [];
    for await (const entry of entries) {
      const labelId = entry.key[entry.key.length - 1];
      const labelEntry = await kv.get([labelId]);
      if (labelEntry.value) {
        labels.push(labelEntry.value);
      }
    }

    // Calcular estadísticas
    const stats = {
      total: labels.length,
      by_status: {
        pending: 0,
        shipped: 0,
        delivered: 0,
        revealed: 0,
        acknowledged: 0,
      },
      qr_scans: {
        tracking: 0,
        emotive: 0,
      },
      matches: {
        total: 0,
        acknowledged: 0,
        pending: 0,
      },
      avg_days_to_reveal: 0,
      avg_days_to_acknowledge: 0,
    };

    let totalDaysToReveal = 0;
    let totalDaysToAcknowledge = 0;
    let revealsCount = 0;
    let acknowledgesCount = 0;

    labels.forEach((label: any) => {
      // Contar por status
      stats.by_status[label.status] = (stats.by_status[label.status] || 0) + 1;
      
      // Contar escaneos de QR
      if (label.qr_tracking.scanned) stats.qr_scans.tracking++;
      if (label.qr_emotive.scanned) stats.qr_scans.emotive++;
      
      // Contar matches
      if (label.match.matched) {
        stats.matches.total++;
        if (label.match.recipient_acknowledged) {
          stats.matches.acknowledged++;
        } else {
          stats.matches.pending++;
        }
      }
      
      // Calcular días promedio hasta revelar
      if (label.revealed_at && label.delivered_at) {
        const days = Math.floor(
          (new Date(label.revealed_at).getTime() - new Date(label.delivered_at).getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        totalDaysToReveal += days;
        revealsCount++;
      }
      
      // Calcular días promedio hasta agradecer
      if (label.acknowledged_at && label.delivered_at) {
        const days = Math.floor(
          (new Date(label.acknowledged_at).getTime() - new Date(label.delivered_at).getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        totalDaysToAcknowledge += days;
        acknowledgesCount++;
      }
    });

    stats.avg_days_to_reveal = revealsCount > 0 ? Math.round(totalDaysToReveal / revealsCount) : 0;
    stats.avg_days_to_acknowledge = acknowledgesCount > 0 ? Math.round(totalDaysToAcknowledge / acknowledgesCount) : 0;

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting emotive stats:", error);
    return c.json({ error: "Error getting emotive stats" }, 500);
  }
});

// Actualizar estado de entrega (llamado por el sistema de última milla)
app.post("/make-server-0dd48dc4/emotive/:id/update-status", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Emotive label not found" }, 404);
    }

    const emotiveLabel = entry.value as any;
    const timestamp = new Date().toISOString();

    // Actualizar status
    if (body.status) {
      emotiveLabel.status = body.status;
    }

    // Actualizar fechas según el status
    if (body.status === "shipped" && !emotiveLabel.shipped_at) {
      emotiveLabel.shipped_at = timestamp;
    }
    
    if (body.status === "delivered" && !emotiveLabel.delivered_at) {
      emotiveLabel.delivered_at = timestamp;
      
      // Registrar interacción
      emotiveLabel.interactions.push({
        type: "package_delivered",
        timestamp,
        delivered_to: body.delivered_to || "unknown",
      });
    }

    // Actualizar tracking del paquete
    if (body.tracking_update) {
      emotiveLabel.package.tracking_update = body.tracking_update;
    }

    await kv.set([id], emotiveLabel);

    return c.json({ 
      success: true,
      message: "Status updated successfully",
      emotive_label: emotiveLabel,
    });
  } catch (error) {
    console.log("Error updating status:", error);
    return c.json({ error: "Error updating status" }, 500);
  }
});

// Función auxiliar para generar comandos de impresora para etiqueta emotiva
function generateEmotiveLabelPrinterCommands(label: any) {
  const format = label.format;
  const commands = [];
  
  commands.push(`SIZE ${format.width}mm,${format.height}mm`);
  commands.push(`GAP 3mm,0mm`);
  commands.push(`CLS`);
  
  // Header
  commands.push(`TEXT 10,10,"4",0,1,1,"${label.sender.name}"`);
  commands.push(`TEXT 10,40,"2",0,1,1,"para ${label.recipient.name}"`);
  commands.push(`LINE 10,70,${format.width - 10},70`);
  
  // Dirección
  commands.push(`TEXT 10,80,"2",0,1,1,"PARA:"`);
  commands.push(`TEXT 10,100,"3",0,1,1,"${label.recipient.name}"`);
  commands.push(`TEXT 10,130,"2",0,1,1,"${label.recipient.address}"`);
  
  // Tracking number
  commands.push(`TEXT 10,170,"2",0,1,1,"TRACKING: ${label.package.tracking_number}"`);
  
  // QR de Tracking (izquierda)
  commands.push(`QRCODE 10,200,H,5,A,0,"${label.qr_tracking.data}"`);
  commands.push(`TEXT 10,300,"1",0,1,1,"Escanea para tracking"`);
  
  // QR Emotivo (derecha) - MÁS GRANDE Y DESTACADO
  const qrEmotiveX = format.width - 120;
  commands.push(`BOX ${qrEmotiveX - 10},190,${format.width - 10},320,3`); // Recuadro
  commands.push(`QRCODE ${qrEmotiveX},200,H,6,A,0,"${label.qr_emotive.data}"`);
  commands.push(`TEXT ${qrEmotiveX},310,"2",0,1,1,"MENSAJE"`);
  commands.push(`TEXT ${qrEmotiveX},330,"2",0,1,1,"ESPECIAL"`);
  commands.push(`TEXT ${qrEmotiveX},350,"1",0,1,1,"Escanea aqui"`);
  
  // Título del mensaje emotivo
  if (label.emotive_message.title) {
    commands.push(`TEXT 10,380,"3",0,1,1,"${label.emotive_message.title}"`);
  }
  
  commands.push(`PRINT 1,1`);
  
  return {
    format: "TSPL",
    commands,
    raw: commands.join("\n"),
  };
}

export default app;
