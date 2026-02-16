import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// TIPOS Y CONSTANTES
// ============================================

const SHIPMENT_TYPES = {
  EXPORT: "Exportación",
  IMPORT: "Importación",
  TRANSIT: "Tránsito",
};

const INCOTERMS = {
  EXW: "Ex Works",
  FCA: "Free Carrier",
  CPT: "Carriage Paid To",
  CIP: "Carriage and Insurance Paid To",
  DAP: "Delivered At Place",
  DPU: "Delivered at Place Unloaded",
  DDP: "Delivered Duty Paid",
  FAS: "Free Alongside Ship",
  FOB: "Free On Board",
  CFR: "Cost and Freight",
  CIF: "Cost, Insurance and Freight",
};

const DOCUMENT_TYPES = {
  DUA: "Declaración Única Aduanera (Uruguay)",
  COMMERCIAL_INVOICE: "Factura Comercial",
  PACKING_LIST: "Lista de Empaque",
  CERTIFICATE_OF_ORIGIN: "Certificado de Origen",
  BILL_OF_LADING: "Conocimiento de Embarque",
  AIRWAY_BILL: "Guía Aérea",
  MANIFEST: "Manifiesto de Carga",
};

const TRANSPORT_MODES = {
  MARITIME: "Marítimo",
  AIR: "Aéreo",
  ROAD: "Terrestre",
  RAIL: "Ferroviario",
  MULTIMODAL: "Multimodal",
};

// ============================================
// CREAR DECLARACIÓN ADUANERA
// ============================================

app.post("/make-server-0dd48dc4/customs/declarations", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `customs_declaration:${Date.now()}`;

    // Generar número de DUA
    const dua_number = await generateDUANumber(entity_id);

    const declaration = {
      id,
      entity_id,
      
      // Número DUA
      dua_number,
      
      // Tipo de operación
      operation_type: body.operation_type || "EXPORT", // EXPORT, IMPORT, TRANSIT
      
      // Partes
      exporter: body.exporter || {},
      importer: body.importer || {},
      customs_agent: body.customs_agent || {},
      
      // Transporte
      transport: {
        mode: body.transport?.mode || "MARITIME",
        vessel_name: body.transport?.vessel_name || "",
        voyage_number: body.transport?.voyage_number || "",
        departure_port: body.transport?.departure_port || "",
        arrival_port: body.transport?.arrival_port || "",
        departure_date: body.transport?.departure_date || null,
        arrival_date: body.transport?.arrival_date || null,
      },
      
      // Términos comerciales
      incoterm: body.incoterm || "FOB",
      
      // Items/Mercancías
      items: (body.items || []).map((item: any) => ({
        description: item.description,
        hs_code: item.hs_code || "", // Código arancelario (NCM)
        quantity: item.quantity,
        unit: item.unit || "UN",
        unit_value: item.unit_value,
        total_value: item.quantity * item.unit_value,
        net_weight_kg: item.net_weight_kg || 0,
        gross_weight_kg: item.gross_weight_kg || 0,
        country_of_origin: item.country_of_origin || "",
        manufacturer: item.manufacturer || "",
      })),
      
      // Bultos/Paquetes
      packages: body.packages || [],
      
      // Valoración
      valuation: {
        currency: body.valuation?.currency || "USD",
        fob_value: body.valuation?.fob_value || 0,
        freight_value: body.valuation?.freight_value || 0,
        insurance_value: body.valuation?.insurance_value || 0,
        cif_value: 0, // Se calcula
        customs_duties: 0,
        other_charges: body.valuation?.other_charges || 0,
        total_value: 0,
      },
      
      // Documentos adjuntos
      supporting_documents: body.supporting_documents || [],
      
      // Estado
      status: "DRAFT", // DRAFT, SUBMITTED, APPROVED, REJECTED, CLEARED
      
      // Fechas
      declaration_date: body.declaration_date || timestamp,
      submission_date: null,
      clearance_date: null,
      
      // Observaciones
      notes: body.notes || "",
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    // Calcular CIF (Cost, Insurance, Freight)
    declaration.valuation.cif_value = 
      declaration.valuation.fob_value +
      declaration.valuation.freight_value +
      declaration.valuation.insurance_value;
    
    // Calcular derechos aduaneros (simplificado, en producción se usaría API de DNA)
    declaration.valuation.customs_duties = declaration.valuation.cif_value * 0.10; // 10% ejemplo
    
    declaration.valuation.total_value = 
      declaration.valuation.cif_value +
      declaration.valuation.customs_duties +
      declaration.valuation.other_charges;

    await kv.set([id], declaration);
    
    // Indexar
    const indexKey = ["customs_declarations", entity_id, id];
    await kv.set(indexKey, id);

    return c.json({ 
      declaration,
      message: "Customs declaration created successfully" 
    });
  } catch (error) {
    console.log("Error creating customs declaration:", error);
    return c.json({ error: "Error creating customs declaration" }, 500);
  }
});

// ============================================
// GENERAR PACKING LIST PROFESIONAL
// ============================================

app.post("/make-server-0dd48dc4/customs/packing-list/generate", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `packing_list:${Date.now()}`;
    
    // Generar número de Packing List
    const packing_list_number = await generatePackingListNumber(entity_id);

    const packingList = {
      id,
      entity_id,
      
      // Número
      packing_list_number,
      
      // Información de la carga
      shipment_id: body.shipment_id || null,
      invoice_id: body.invoice_id || null,
      order_id: body.order_id || null,
      
      // Partes
      shipper: body.shipper || {},
      consignee: body.consignee || {},
      notify_party: body.notify_party || {},
      
      // Transporte
      transport: {
        mode: body.transport?.mode || "MARITIME",
        vessel_name: body.transport?.vessel_name || "",
        voyage_number: body.transport?.voyage_number || "",
        container_number: body.transport?.container_number || "",
        seal_number: body.transport?.seal_number || "",
        port_of_loading: body.transport?.port_of_loading || "",
        port_of_discharge: body.transport?.port_of_discharge || "",
      },
      
      // Bultos/Cajas
      packages: (body.packages || []).map((pkg: any, index: number) => ({
        package_number: index + 1,
        marks: pkg.marks || `PKG-${String(index + 1).padStart(3, "0")}`,
        description: pkg.description || "",
        quantity: pkg.quantity || 1,
        type: pkg.type || "CARTON", // CARTON, PALLET, CRATE, BAG, DRUM
        
        // Dimensiones
        length_cm: pkg.length_cm || 0,
        width_cm: pkg.width_cm || 0,
        height_cm: pkg.height_cm || 0,
        volume_m3: calculateVolume(pkg.length_cm, pkg.width_cm, pkg.height_cm),
        
        // Pesos
        net_weight_kg: pkg.net_weight_kg || 0,
        gross_weight_kg: pkg.gross_weight_kg || 0,
        
        // Contenido
        contents: pkg.contents || [],
      })),
      
      // Totales
      totals: {
        total_packages: 0,
        total_net_weight_kg: 0,
        total_gross_weight_kg: 0,
        total_volume_m3: 0,
      },
      
      // Fecha
      packing_date: body.packing_date || timestamp,
      
      // Notas
      special_instructions: body.special_instructions || "",
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    // Calcular totales
    packingList.totals.total_packages = packingList.packages.length;
    packingList.totals.total_net_weight_kg = packingList.packages.reduce(
      (sum: number, pkg: any) => sum + pkg.net_weight_kg, 0
    );
    packingList.totals.total_gross_weight_kg = packingList.packages.reduce(
      (sum: number, pkg: any) => sum + pkg.gross_weight_kg, 0
    );
    packingList.totals.total_volume_m3 = packingList.packages.reduce(
      (sum: number, pkg: any) => sum + pkg.volume_m3, 0
    );

    await kv.set([id], packingList);
    
    // Indexar
    const indexKey = ["packing_lists", entity_id, id];
    await kv.set(indexKey, id);

    // Generar PDF profesional
    const pdf_content = generatePackingListPDF(packingList);

    return c.json({ 
      packing_list: packingList,
      pdf_content,
      message: "Packing list generated successfully" 
    });
  } catch (error) {
    console.log("Error generating packing list:", error);
    return c.json({ error: "Error generating packing list" }, 500);
  }
});

// ============================================
// GENERAR FACTURA COMERCIAL (COMMERCIAL INVOICE)
// ============================================

app.post("/make-server-0dd48dc4/customs/commercial-invoice/generate", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `commercial_invoice:${Date.now()}`;
    
    const invoice_number = await generateCommercialInvoiceNumber(entity_id);

    const commercialInvoice = {
      id,
      entity_id,
      
      // Número
      invoice_number,
      
      // Partes
      seller: body.seller || {},
      buyer: body.buyer || {},
      
      // Términos
      incoterm: body.incoterm || "FOB",
      payment_terms: body.payment_terms || "30 días",
      
      // Items
      items: (body.items || []).map((item: any) => ({
        description: item.description,
        hs_code: item.hs_code || "",
        quantity: item.quantity,
        unit: item.unit || "UN",
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        country_of_origin: item.country_of_origin || "",
      })),
      
      // Totales
      subtotal: 0,
      freight: body.freight || 0,
      insurance: body.insurance || 0,
      total: 0,
      currency: body.currency || "USD",
      
      // Transporte
      shipping_method: body.shipping_method || "Maritime",
      port_of_loading: body.port_of_loading || "",
      port_of_discharge: body.port_of_discharge || "",
      
      // Fecha
      invoice_date: body.invoice_date || timestamp,
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    // Calcular totales
    commercialInvoice.subtotal = commercialInvoice.items.reduce(
      (sum: number, item: any) => sum + item.total_price, 0
    );
    commercialInvoice.total = 
      commercialInvoice.subtotal +
      commercialInvoice.freight +
      commercialInvoice.insurance;

    await kv.set([id], commercialInvoice);
    
    const indexKey = ["commercial_invoices", entity_id, id];
    await kv.set(indexKey, id);

    return c.json({ 
      commercial_invoice: commercialInvoice,
      message: "Commercial invoice generated successfully" 
    });
  } catch (error) {
    console.log("Error generating commercial invoice:", error);
    return c.json({ error: "Error generating commercial invoice" }, 500);
  }
});

// ============================================
// GENERAR CERTIFICADO DE ORIGEN
// ============================================

app.post("/make-server-0dd48dc4/customs/certificate-of-origin/generate", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `certificate_of_origin:${Date.now()}`;
    
    const certificate_number = await generateCertificateNumber(entity_id);

    const certificate = {
      id,
      entity_id,
      
      certificate_number,
      
      // Tipo de certificado
      certificate_type: body.certificate_type || "MERCOSUR", // MERCOSUR, ALADI, GSP, etc.
      
      // Partes
      exporter: body.exporter || {},
      importer: body.importer || {},
      
      // Productos
      goods: body.goods || [],
      
      // País de origen
      country_of_origin: body.country_of_origin || "UY",
      
      // Criterio de origen
      origin_criterion: body.origin_criterion || "WO", // WO = Wholly Obtained
      
      // Observaciones
      remarks: body.remarks || "",
      
      // Fecha de emisión
      issue_date: body.issue_date || timestamp,
      
      // Autoridad emisora
      issuing_authority: body.issuing_authority || "Cámara de Comercio Uruguay",
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], certificate);
    
    const indexKey = ["certificates_of_origin", entity_id, id];
    await kv.set(indexKey, id);

    return c.json({ 
      certificate,
      message: "Certificate of origin generated successfully" 
    });
  } catch (error) {
    console.log("Error generating certificate of origin:", error);
    return c.json({ error: "Error generating certificate of origin" }, 500);
  }
});

// ============================================
// CLASIFICAR PRODUCTO (HS CODE / NCM)
// ============================================

app.post("/make-server-0dd48dc4/customs/classify-product", async (c) => {
  try {
    const body = await c.req.json();

    // Base de datos simplificada de códigos HS (en producción usaría API de DNA o Aduana)
    const hs_codes_database = {
      "textiles": "6109.10.00",
      "electronics": "8517.12.00",
      "food": "0406.10.00",
      "beverages": "2202.10.00",
      "furniture": "9403.20.00",
      "toys": "9503.00.00",
      "cosmetics": "3304.99.00",
      "books": "4901.10.00",
    };

    const product_description = body.description?.toLowerCase() || "";
    
    // Búsqueda simple por palabras clave
    let suggested_hs_code = "";
    let suggested_description = "";
    
    for (const [category, code] of Object.entries(hs_codes_database)) {
      if (product_description.includes(category)) {
        suggested_hs_code = code;
        suggested_description = category;
        break;
      }
    }

    return c.json({
      classification: {
        suggested_hs_code,
        suggested_description,
        confidence: suggested_hs_code ? "LOW" : "NONE",
        note: "En producción, se integraría con la API de la DNA Uruguay para clasificación oficial",
      },
    });
  } catch (error) {
    console.log("Error classifying product:", error);
    return c.json({ error: "Error classifying product" }, 500);
  }
});

// ============================================
// CALCULAR DERECHOS ADUANEROS
// ============================================

app.post("/make-server-0dd48dc4/customs/calculate-duties", async (c) => {
  try {
    const body = await c.req.json();

    const cif_value = body.cif_value || 0;
    const hs_code = body.hs_code || "";
    const country_of_origin = body.country_of_origin || "";

    // Tarifas simplificadas (en producción usaría API de DNA)
    const tariff_rates = {
      "6109.10.00": 0.18, // 18%
      "8517.12.00": 0.10, // 10%
      "0406.10.00": 0.15, // 15%
      "default": 0.10,
    };

    const tariff_rate = tariff_rates[hs_code] || tariff_rates.default;
    const customs_duty = cif_value * tariff_rate;
    const vat = (cif_value + customs_duty) * 0.22; // IVA 22%
    const total_duties = customs_duty + vat;

    return c.json({
      calculation: {
        cif_value,
        hs_code,
        tariff_rate,
        customs_duty: Math.round(customs_duty * 100) / 100,
        vat: Math.round(vat * 100) / 100,
        total_duties: Math.round(total_duties * 100) / 100,
        total_to_pay: Math.round((cif_value + total_duties) * 100) / 100,
        note: "Cálculo estimado. Verificar con DNA Uruguay para valores oficiales.",
      },
    });
  } catch (error) {
    console.log("Error calculating duties:", error);
    return c.json({ error: "Error calculating duties" }, 500);
  }
});

// ============================================
// LISTAR DECLARACIONES ADUANERAS
// ============================================

app.get("/make-server-0dd48dc4/customs/declarations", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");

    const declarations = [];
    const entries = kv.list({ prefix: ["customs_declarations", entity_id] });
    
    for await (const entry of entries) {
      const declarationId = entry.value as string;
      const declarationEntry = await kv.get([declarationId]);
      
      if (declarationEntry.value) {
        const declaration = declarationEntry.value as any;
        if (!status || declaration.status === status) {
          declarations.push(declaration);
        }
      }
    }

    return c.json({ 
      declarations,
      total: declarations.length 
    });
  } catch (error) {
    console.log("Error listing declarations:", error);
    return c.json({ error: "Error listing declarations" }, 500);
  }
});

// ============================================
// ENVIAR DUA A DNA URUGUAY
// ============================================

app.post("/make-server-0dd48dc4/customs/declarations/:id/submit", async (c) => {
  try {
    const id = c.req.param("id");
    const timestamp = new Date().toISOString();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Declaration not found" }, 404);
    }

    const declaration = entry.value as any;

    // Aquí se integraría con la API de DNA Uruguay
    // Por ahora simulamos el envío

    const updatedDeclaration = {
      ...declaration,
      status: "SUBMITTED",
      submission_date: timestamp,
      dna_reference: `DNA-${Date.now()}`,
      updated_at: timestamp,
    };

    await kv.set([id], updatedDeclaration);

    return c.json({ 
      declaration: updatedDeclaration,
      message: "Declaration submitted to DNA Uruguay successfully",
      note: "En producción, se enviaría a través de la plataforma VUCE de Uruguay"
    });
  } catch (error) {
    console.log("Error submitting declaration:", error);
    return c.json({ error: "Error submitting declaration" }, 500);
  }
});

// ============================================
// DASHBOARD ADUANERO
// ============================================

app.get("/make-server-0dd48dc4/customs/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const declarations = [];
    const entries = kv.list({ prefix: ["customs_declarations", entity_id] });
    
    for await (const entry of entries) {
      const declarationId = entry.value as string;
      const declarationEntry = await kv.get([declarationId]);
      
      if (declarationEntry.value) {
        declarations.push(declarationEntry.value);
      }
    }

    // Métricas
    const total_declarations = declarations.length;
    const draft = declarations.filter((d: any) => d.status === "DRAFT").length;
    const submitted = declarations.filter((d: any) => d.status === "SUBMITTED").length;
    const approved = declarations.filter((d: any) => d.status === "APPROVED").length;
    const cleared = declarations.filter((d: any) => d.status === "CLEARED").length;

    const total_fob_value = declarations.reduce(
      (sum: number, d: any) => sum + (d.valuation?.fob_value || 0), 0
    );

    const total_customs_duties = declarations.reduce(
      (sum: number, d: any) => sum + (d.valuation?.customs_duties || 0), 0
    );

    return c.json({
      dashboard: {
        summary: {
          total_declarations,
          draft,
          submitted,
          approved,
          cleared,
          total_fob_value: Math.round(total_fob_value * 100) / 100,
          total_customs_duties: Math.round(total_customs_duties * 100) / 100,
        },
        recent_declarations: declarations.slice(-10),
      },
    });
  } catch (error) {
    console.log("Error getting customs dashboard:", error);
    return c.json({ error: "Error getting customs dashboard" }, 500);
  }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function generateDUANumber(entity_id: string): Promise<string> {
  const counterKey = ["customs_dua_counter", entity_id];
  const counterEntry = await kv.get(counterKey);
  
  let counter = 1;
  if (counterEntry.value) {
    counter = (counterEntry.value as number) + 1;
  }
  
  await kv.set(counterKey, counter);
  
  const year = new Date().getFullYear();
  return `DUA-${year}-${String(counter).padStart(6, "0")}`;
}

async function generatePackingListNumber(entity_id: string): Promise<string> {
  const counterKey = ["packing_list_counter", entity_id];
  const counterEntry = await kv.get(counterKey);
  
  let counter = 1;
  if (counterEntry.value) {
    counter = (counterEntry.value as number) + 1;
  }
  
  await kv.set(counterKey, counter);
  
  return `PL-${String(counter).padStart(6, "0")}`;
}

async function generateCommercialInvoiceNumber(entity_id: string): Promise<string> {
  const counterKey = ["commercial_invoice_counter", entity_id];
  const counterEntry = await kv.get(counterKey);
  
  let counter = 1;
  if (counterEntry.value) {
    counter = (counterEntry.value as number) + 1;
  }
  
  await kv.set(counterKey, counter);
  
  return `CI-${String(counter).padStart(6, "0")}`;
}

async function generateCertificateNumber(entity_id: string): Promise<string> {
  const counterKey = ["certificate_origin_counter", entity_id];
  const counterEntry = await kv.get(counterKey);
  
  let counter = 1;
  if (counterEntry.value) {
    counter = (counterEntry.value as number) + 1;
  }
  
  await kv.set(counterKey, counter);
  
  const year = new Date().getFullYear();
  return `CO-${year}-${String(counter).padStart(6, "0")}`;
}

function calculateVolume(length_cm: number, width_cm: number, height_cm: number): number {
  return Math.round((length_cm * width_cm * height_cm) / 1000000 * 1000) / 1000; // m³
}

function generatePackingListPDF(packingList: any): string {
  const lines = [];
  
  lines.push("================================================================================");
  lines.push("                           PACKING LIST / LISTA DE EMPAQUE");
  lines.push("================================================================================");
  lines.push("");
  lines.push(`Packing List No: ${packingList.packing_list_number}`);
  lines.push(`Date: ${new Date(packingList.packing_date).toLocaleDateString()}`);
  lines.push("");
  lines.push("SHIPPER / EXPEDIDOR:");
  lines.push(`  ${packingList.shipper.name || ""}`);
  lines.push(`  ${packingList.shipper.address || ""}`);
  lines.push("");
  lines.push("CONSIGNEE / CONSIGNATARIO:");
  lines.push(`  ${packingList.consignee.name || ""}`);
  lines.push(`  ${packingList.consignee.address || ""}`);
  lines.push("");
  lines.push("TRANSPORT DETAILS / DETALLES DE TRANSPORTE:");
  lines.push(`  Mode: ${packingList.transport.mode}`);
  lines.push(`  Vessel/Flight: ${packingList.transport.vessel_name}`);
  lines.push(`  Port of Loading: ${packingList.transport.port_of_loading}`);
  lines.push(`  Port of Discharge: ${packingList.transport.port_of_discharge}`);
  lines.push("");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(" PKG# | MARKS         | DESCRIPTION      | QTY | NET WT  | GROSS WT | VOLUME");
  lines.push("      |               |                  |     | (kg)    | (kg)     | (m³)  ");
  lines.push("--------------------------------------------------------------------------------");
  
  packingList.packages.forEach((pkg: any) => {
    lines.push(
      ` ${String(pkg.package_number).padStart(4)} | ` +
      `${pkg.marks.padEnd(13)} | ` +
      `${pkg.description.substring(0, 16).padEnd(16)} | ` +
      `${String(pkg.quantity).padStart(3)} | ` +
      `${pkg.net_weight_kg.toFixed(2).padStart(7)} | ` +
      `${pkg.gross_weight_kg.toFixed(2).padStart(8)} | ` +
      `${pkg.volume_m3.toFixed(3).padStart(6)}`
    );
  });
  
  lines.push("--------------------------------------------------------------------------------");
  lines.push(
    ` TOTAL: ${packingList.totals.total_packages} packages | ` +
    `Net: ${packingList.totals.total_net_weight_kg.toFixed(2)} kg | ` +
    `Gross: ${packingList.totals.total_gross_weight_kg.toFixed(2)} kg | ` +
    `Vol: ${packingList.totals.total_volume_m3.toFixed(3)} m³`
  );
  lines.push("================================================================================");
  
  if (packingList.special_instructions) {
    lines.push("");
    lines.push("SPECIAL INSTRUCTIONS / INSTRUCCIONES ESPECIALES:");
    lines.push(packingList.special_instructions);
  }
  
  lines.push("");
  lines.push("Prepared by: ODDY Market Customs Module");
  lines.push("================================================================================");
  
  return lines.join("\n");
}

export default app;
