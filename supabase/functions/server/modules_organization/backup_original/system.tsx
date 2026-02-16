import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// DEFINICIONES GLOBALES DE IMPUESTOS
// ============================================

// Impuestos por país/región
const TAX_DEFINITIONS = {
  // Uruguay
  UY: {
    country: "Uruguay",
    currency: "UYU",
    taxes: {
      IVA_BASICO: {
        name: "IVA Básico",
        rate: 0.22, // 22%
        type: "vat",
        applies_to: ["goods", "services"],
      },
      IVA_MINIMO: {
        name: "IVA Mínimo",
        rate: 0.10, // 10%
        type: "vat",
        applies_to: ["food", "medicine", "books"],
      },
    },
  },
  
  // Argentina
  AR: {
    country: "Argentina",
    currency: "ARS",
    taxes: {
      IVA_GENERAL: {
        name: "IVA General",
        rate: 0.21, // 21%
        type: "vat",
        applies_to: ["goods", "services"],
      },
      IVA_REDUCIDO: {
        name: "IVA Reducido",
        rate: 0.105, // 10.5%
        type: "vat",
        applies_to: ["food", "medicine"],
      },
      IIBB: {
        name: "Ingresos Brutos",
        rate: 0.05, // 5% (varía por provincia)
        type: "provincial",
        applies_to: ["goods", "services"],
      },
    },
  },
  
  // Brasil
  BR: {
    country: "Brasil",
    currency: "BRL",
    taxes: {
      ICMS: {
        name: "ICMS (Imposto sobre Circulação de Mercadorias e Serviços)",
        rate: 0.18, // 18% (varía por estado)
        type: "state",
        applies_to: ["goods"],
      },
      PIS: {
        name: "PIS (Programa de Integração Social)",
        rate: 0.0165, // 1.65%
        type: "federal",
        applies_to: ["goods", "services"],
      },
      COFINS: {
        name: "COFINS (Contribuição para Financiamento da Seguridade Social)",
        rate: 0.076, // 7.6%
        type: "federal",
        applies_to: ["goods", "services"],
      },
    },
  },
  
  // Chile
  CL: {
    country: "Chile",
    currency: "CLP",
    taxes: {
      IVA: {
        name: "IVA",
        rate: 0.19, // 19%
        type: "vat",
        applies_to: ["goods", "services"],
      },
    },
  },
  
  // Perú
  PE: {
    country: "Perú",
    currency: "PEN",
    taxes: {
      IGV: {
        name: "IGV (Impuesto General a las Ventas)",
        rate: 0.18, // 18%
        type: "vat",
        applies_to: ["goods", "services"],
      },
      IPM: {
        name: "IPM (Impuesto de Promoción Municipal)",
        rate: 0.02, // 2%
        type: "municipal",
        applies_to: ["goods", "services"],
      },
    },
  },
  
  // México
  MX: {
    country: "México",
    currency: "MXN",
    taxes: {
      IVA: {
        name: "IVA",
        rate: 0.16, // 16%
        type: "vat",
        applies_to: ["goods", "services"],
      },
      IVA_FRONTERA: {
        name: "IVA Frontera",
        rate: 0.08, // 8%
        type: "vat",
        applies_to: ["goods", "services"],
        regions: ["Baja California", "Sonora", "Chihuahua"],
      },
      IEPS: {
        name: "IEPS (Impuesto Especial sobre Producción y Servicios)",
        rate: 0.08, // 8% (varía por producto)
        type: "special",
        applies_to: ["alcohol", "tobacco", "fuel"],
      },
    },
  },
  
  // Colombia
  CO: {
    country: "Colombia",
    currency: "COP",
    taxes: {
      IVA: {
        name: "IVA",
        rate: 0.19, // 19%
        type: "vat",
        applies_to: ["goods", "services"],
      },
      IVA_REDUCIDO: {
        name: "IVA Reducido",
        rate: 0.05, // 5%
        type: "vat",
        applies_to: ["food", "medicine"],
      },
    },
  },
  
  // Ecuador
  EC: {
    country: "Ecuador",
    currency: "USD",
    taxes: {
      IVA: {
        name: "IVA",
        rate: 0.12, // 12%
        type: "vat",
        applies_to: ["goods", "services"],
      },
    },
  },
  
  // Estados Unidos
  US: {
    country: "United States",
    currency: "USD",
    taxes: {
      SALES_TAX_CA: {
        name: "California Sales Tax",
        rate: 0.0725, // 7.25% (base)
        type: "state",
        applies_to: ["goods"],
        state: "CA",
      },
      SALES_TAX_NY: {
        name: "New York Sales Tax",
        rate: 0.04, // 4%
        type: "state",
        applies_to: ["goods"],
        state: "NY",
      },
      SALES_TAX_TX: {
        name: "Texas Sales Tax",
        rate: 0.0625, // 6.25%
        type: "state",
        applies_to: ["goods"],
        state: "TX",
      },
    },
  },
};

// ============================================
// DEFINICIONES DE MONEDAS
// ============================================

const CURRENCY_DEFINITIONS = {
  USD: { name: "US Dollar", symbol: "$", decimals: 2 },
  EUR: { name: "Euro", symbol: "€", decimals: 2 },
  UYU: { name: "Peso Uruguayo", symbol: "$", decimals: 2 },
  ARS: { name: "Peso Argentino", symbol: "$", decimals: 2 },
  BRL: { name: "Real Brasileño", symbol: "R$", decimals: 2 },
  CLP: { name: "Peso Chileno", symbol: "$", decimals: 0 },
  PEN: { name: "Sol Peruano", symbol: "S/", decimals: 2 },
  MXN: { name: "Peso Mexicano", symbol: "$", decimals: 2 },
  COP: { name: "Peso Colombiano", symbol: "$", decimals: 0 },
};

// ============================================
// DEFINICIONES DE UNIDADES DE MEDIDA
// ============================================

const UNIT_DEFINITIONS = {
  // Peso
  weight: {
    kg: { name: "Kilogramo", symbol: "kg", base: 1 },
    g: { name: "Gramo", symbol: "g", base: 0.001 },
    lb: { name: "Libra", symbol: "lb", base: 0.453592 },
    oz: { name: "Onza", symbol: "oz", base: 0.0283495 },
  },
  
  // Longitud
  length: {
    m: { name: "Metro", symbol: "m", base: 1 },
    cm: { name: "Centímetro", symbol: "cm", base: 0.01 },
    mm: { name: "Milímetro", symbol: "mm", base: 0.001 },
    in: { name: "Pulgada", symbol: "in", base: 0.0254 },
    ft: { name: "Pie", symbol: "ft", base: 0.3048 },
  },
  
  // Volumen
  volume: {
    l: { name: "Litro", symbol: "l", base: 1 },
    ml: { name: "Mililitro", symbol: "ml", base: 0.001 },
    gal: { name: "Galón", symbol: "gal", base: 3.78541 },
  },
};

// ============================================
// OBTENER DEFINICIONES DE IMPUESTOS
// ============================================

app.get("/make-server-0dd48dc4/system/taxes", async (c) => {
  try {
    const country = c.req.query("country");

    if (country) {
      const taxDef = TAX_DEFINITIONS[country.toUpperCase()];
      
      if (!taxDef) {
        return c.json({ error: "Country not found" }, 404);
      }

      return c.json({ taxes: taxDef });
    }

    // Retornar todos los países
    return c.json({ taxes: TAX_DEFINITIONS });
  } catch (error) {
    console.log("Error getting taxes:", error);
    return c.json({ error: "Error getting taxes" }, 500);
  }
});

// ============================================
// CONFIGURAR IMPUESTOS PERSONALIZADOS
// ============================================

app.post("/make-server-0dd48dc4/system/taxes/configure", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const configId = `tax-config:${entity_id}`;

    const config = {
      id: configId,
      entity_id,
      
      // País principal
      primary_country: body.primary_country || "UY",
      
      // Impuestos personalizados (sobrescribe los defaults)
      custom_taxes: body.custom_taxes || {},
      
      // Reglas especiales
      rules: {
        // Aplicar impuesto basado en ubicación del cliente
        tax_by_customer_location: body.rules?.tax_by_customer_location !== false,
        
        // Aplicar impuesto basado en tipo de producto
        tax_by_product_category: body.rules?.tax_by_product_category !== false,
        
        // Exenciones fiscales
        tax_exempt_parties: body.rules?.tax_exempt_parties || [],
        
        // Productos exentos
        tax_exempt_categories: body.rules?.tax_exempt_categories || [],
      },
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([configId], config);
    await kv.set(["system_config", entity_id, "taxes"], configId);

    return c.json({ 
      config,
      message: "Tax configuration saved successfully" 
    });
  } catch (error) {
    console.log("Error configuring taxes:", error);
    return c.json({ error: "Error configuring taxes" }, 500);
  }
});

// ============================================
// CALCULAR IMPUESTOS PARA UNA TRANSACCIÓN
// ============================================

app.post("/make-server-0dd48dc4/system/taxes/calculate", async (c) => {
  try {
    const body = await c.req.json();
    
    const amount = body.amount || 0;
    const country = body.country || "UY";
    const product_category = body.product_category || "goods";
    const customer_location = body.customer_location || null;
    const entity_id = body.entity_id || "default";

    // Obtener configuración personalizada
    const configIndexEntry = await kv.get(["system_config", entity_id, "taxes"]);
    let customConfig = null;
    
    if (configIndexEntry.value) {
      const configId = configIndexEntry.value as string;
      const configEntry = await kv.get([configId]);
      customConfig = configEntry.value as any;
    }

    // Obtener definición de impuestos del país
    const taxDef = TAX_DEFINITIONS[country.toUpperCase()];
    
    if (!taxDef) {
      return c.json({ error: "Tax definition not found for country" }, 404);
    }

    // Calcular impuestos
    const taxCalculations = [];
    let totalTax = 0;

    for (const [taxKey, taxInfo] of Object.entries(taxDef.taxes)) {
      const tax = taxInfo as any;
      
      // Verificar si aplica a la categoría del producto
      if (!tax.applies_to.includes(product_category)) {
        continue;
      }

      // Calcular monto del impuesto
      const taxAmount = amount * tax.rate;
      totalTax += taxAmount;

      taxCalculations.push({
        tax_key: taxKey,
        name: tax.name,
        rate: tax.rate,
        amount: Math.round(taxAmount * 100) / 100,
        type: tax.type,
      });
    }

    return c.json({
      calculation: {
        subtotal: amount,
        taxes: taxCalculations,
        total_tax: Math.round(totalTax * 100) / 100,
        total: Math.round((amount + totalTax) * 100) / 100,
        currency: taxDef.currency,
      },
    });
  } catch (error) {
    console.log("Error calculating taxes:", error);
    return c.json({ error: "Error calculating taxes" }, 500);
  }
});

// ============================================
// OBTENER DEFINICIONES DE MONEDAS
// ============================================

app.get("/make-server-0dd48dc4/system/currencies", async (c) => {
  try {
    return c.json({ currencies: CURRENCY_DEFINITIONS });
  } catch (error) {
    console.log("Error getting currencies:", error);
    return c.json({ error: "Error getting currencies" }, 500);
  }
});

// ============================================
// CONFIGURAR TASAS DE CAMBIO
// ============================================

app.post("/make-server-0dd48dc4/system/exchange-rates", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const rateId = `exchange-rate:${entity_id}:${Date.now()}`;

    const rate = {
      id: rateId,
      entity_id,
      
      // Moneda base
      base_currency: body.base_currency || "USD",
      
      // Tasas de cambio
      rates: body.rates || {},
      
      // Fuente de las tasas
      source: body.source || "manual", // manual, api, bank
      
      // Válido desde/hasta
      valid_from: body.valid_from || timestamp,
      valid_until: body.valid_until || null,
      
      created_at: timestamp,
    };

    await kv.set([rateId], rate);
    await kv.set(["system_config", entity_id, "exchange_rates", "current"], rateId);

    return c.json({ 
      rate,
      message: "Exchange rates saved successfully" 
    });
  } catch (error) {
    console.log("Error saving exchange rates:", error);
    return c.json({ error: "Error saving exchange rates" }, 500);
  }
});

// ============================================
// OBTENER TASAS DE CAMBIO ACTUALES
// ============================================

app.get("/make-server-0dd48dc4/system/exchange-rates", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const rateIdEntry = await kv.get(["system_config", entity_id, "exchange_rates", "current"]);

    if (!rateIdEntry.value) {
      return c.json({ error: "Exchange rates not configured" }, 404);
    }

    const rateId = rateIdEntry.value as string;
    const rateEntry = await kv.get([rateId]);

    if (!rateEntry.value) {
      return c.json({ error: "Exchange rates not found" }, 404);
    }

    return c.json({ exchange_rates: rateEntry.value });
  } catch (error) {
    console.log("Error getting exchange rates:", error);
    return c.json({ error: "Error getting exchange rates" }, 500);
  }
});

// ============================================
// CONVERTIR MONEDA
// ============================================

app.post("/make-server-0dd48dc4/system/convert-currency", async (c) => {
  try {
    const body = await c.req.json();
    
    const amount = body.amount || 0;
    const from_currency = body.from_currency || "USD";
    const to_currency = body.to_currency || "USD";
    const entity_id = body.entity_id || "default";

    if (from_currency === to_currency) {
      return c.json({
        conversion: {
          amount,
          from_currency,
          to_currency,
          converted_amount: amount,
          rate: 1,
        },
      });
    }

    // Obtener tasas de cambio
    const rateIdEntry = await kv.get(["system_config", entity_id, "exchange_rates", "current"]);

    if (!rateIdEntry.value) {
      return c.json({ error: "Exchange rates not configured" }, 400);
    }

    const rateId = rateIdEntry.value as string;
    const rateEntry = await kv.get([rateId]);
    const rateConfig = rateEntry.value as any;

    // Calcular conversión
    let rate = 1;
    let convertedAmount = amount;

    if (rateConfig.base_currency === from_currency) {
      // Conversión directa desde base
      rate = rateConfig.rates[to_currency] || 1;
      convertedAmount = amount * rate;
    } else if (rateConfig.base_currency === to_currency) {
      // Conversión inversa hacia base
      rate = 1 / (rateConfig.rates[from_currency] || 1);
      convertedAmount = amount * rate;
    } else {
      // Conversión cruzada (via base)
      const rateToBase = 1 / (rateConfig.rates[from_currency] || 1);
      const rateFromBase = rateConfig.rates[to_currency] || 1;
      rate = rateToBase * rateFromBase;
      convertedAmount = amount * rate;
    }

    return c.json({
      conversion: {
        amount,
        from_currency,
        to_currency,
        converted_amount: Math.round(convertedAmount * 100) / 100,
        rate: Math.round(rate * 10000) / 10000,
      },
    });
  } catch (error) {
    console.log("Error converting currency:", error);
    return c.json({ error: "Error converting currency" }, 500);
  }
});

// ============================================
// OBTENER UNIDADES DE MEDIDA
// ============================================

app.get("/make-server-0dd48dc4/system/units", async (c) => {
  try {
    const type = c.req.query("type"); // weight, length, volume

    if (type) {
      const units = UNIT_DEFINITIONS[type];
      
      if (!units) {
        return c.json({ error: "Unit type not found" }, 404);
      }

      return c.json({ units });
    }

    // Retornar todos los tipos
    return c.json({ units: UNIT_DEFINITIONS });
  } catch (error) {
    console.log("Error getting units:", error);
    return c.json({ error: "Error getting units" }, 500);
  }
});

// ============================================
// CONVERTIR UNIDADES
// ============================================

app.post("/make-server-0dd48dc4/system/convert-unit", async (c) => {
  try {
    const body = await c.req.json();
    
    const value = body.value || 0;
    const from_unit = body.from_unit || "kg";
    const to_unit = body.to_unit || "kg";
    const unit_type = body.unit_type || "weight";

    const units = UNIT_DEFINITIONS[unit_type];
    
    if (!units) {
      return c.json({ error: "Unit type not found" }, 400);
    }

    const fromDef = units[from_unit];
    const toDef = units[to_unit];

    if (!fromDef || !toDef) {
      return c.json({ error: "Unit not found" }, 400);
    }

    // Convertir a unidad base y luego a unidad destino
    const baseValue = value * fromDef.base;
    const convertedValue = baseValue / toDef.base;

    return c.json({
      conversion: {
        value,
        from_unit,
        to_unit,
        converted_value: Math.round(convertedValue * 1000) / 1000,
      },
    });
  } catch (error) {
    console.log("Error converting unit:", error);
    return c.json({ error: "Error converting unit" }, 500);
  }
});

// ============================================
// CONFIGURACIÓN GENERAL DEL SISTEMA
// ============================================

app.post("/make-server-0dd48dc4/system/config", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const configId = `system-config:${entity_id}`;

    const config = {
      id: configId,
      entity_id,
      
      // Configuración regional
      regional: {
        default_country: body.regional?.default_country || "UY",
        default_currency: body.regional?.default_currency || "USD",
        default_language: body.regional?.default_language || "es",
        default_timezone: body.regional?.default_timezone || "America/Montevideo",
      },
      
      // Configuración de negocio
      business: {
        name: body.business?.name || "",
        tax_id: body.business?.tax_id || "",
        address: body.business?.address || {},
        phone: body.business?.phone || "",
        email: body.business?.email || "",
        website: body.business?.website || "",
      },
      
      // Configuración de precios
      pricing: {
        include_tax: body.pricing?.include_tax !== false,
        round_prices: body.pricing?.round_prices !== false,
        decimal_places: body.pricing?.decimal_places || 2,
      },
      
      // Configuración de inventario
      inventory: {
        track_stock: body.inventory?.track_stock !== false,
        allow_negative_stock: body.inventory?.allow_negative_stock || false,
        low_stock_threshold: body.inventory?.low_stock_threshold || 10,
      },
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([configId], config);
    await kv.set(["system_config", entity_id, "general"], configId);

    return c.json({ 
      config,
      message: "System configuration saved successfully" 
    });
  } catch (error) {
    console.log("Error saving system config:", error);
    return c.json({ error: "Error saving system config" }, 500);
  }
});

// ============================================
// OBTENER CONFIGURACIÓN GENERAL
// ============================================

app.get("/make-server-0dd48dc4/system/config", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const configIdEntry = await kv.get(["system_config", entity_id, "general"]);

    if (!configIdEntry.value) {
      return c.json({ error: "System configuration not found" }, 404);
    }

    const configId = configIdEntry.value as string;
    const configEntry = await kv.get([configId]);

    if (!configEntry.value) {
      return c.json({ error: "Configuration not found" }, 404);
    }

    return c.json({ config: configEntry.value });
  } catch (error) {
    console.log("Error getting system config:", error);
    return c.json({ error: "Error getting system config" }, 500);
  }
});

export default app;
