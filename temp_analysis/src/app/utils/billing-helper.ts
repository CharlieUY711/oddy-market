import { projectId, publicAnonKey } from "/utils/supabase/info";

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4`;

/**
 * Helper para crear factura electrónica desde una orden
 */
export async function createInvoiceFromOrder(
  orderId: string,
  orderData: {
    customer: {
      documentType?: string;
      documentNumber: string;
      name: string;
      email: string;
      phone?: string;
      address?: {
        street?: string;
        number?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      };
    };
    items: Array<{
      id: string;
      sku?: string;
      name: string;
      quantity: number;
      price: number; // En centavos
      discount?: number;
    }>;
    totals: {
      subtotal: number; // En centavos
      discount?: number;
      tax: number; // IVA en centavos
      total: number;
    };
    paymentMethod?: string;
    notes?: string;
  },
  authToken?: string
) {
  try {
    const token = authToken || localStorage.getItem("supabase_token") || publicAnonKey;

    const response = await fetch(`${baseUrl}/billing/facturas/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        customer: {
          documentType: orderData.customer.documentType || "CI",
          documentNumber: orderData.customer.documentNumber,
          name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
          address: {
            street: orderData.customer.address?.street || "",
            number: orderData.customer.address?.number || "",
            city: orderData.customer.address?.city || "Montevideo",
            state: orderData.customer.address?.state || "Montevideo",
            zipCode: orderData.customer.address?.zipCode || "",
            country: orderData.customer.address?.country || "Uruguay",
          },
          paymentMethod: orderData.paymentMethod || "efectivo",
        },
        items: orderData.items,
        totals: {
          subtotal: orderData.totals.subtotal,
          discount: orderData.totals.discount || 0,
          tax: orderData.totals.tax,
          total: orderData.totals.total,
        },
        notes: orderData.notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error creating invoice");
    }

    const data = await response.json();
    return {
      success: true,
      invoice: data.invoice,
      fixed: data.fixed,
    };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Helper para crear remito desde una orden
 */
export async function createRemitoFromOrder(
  orderId: string,
  orderData: {
    customer: {
      documentType?: string;
      documentNumber: string;
      name: string;
      email: string;
      phone?: string;
      address?: {
        street?: string;
        number?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      };
    };
    items: Array<{
      id: string;
      sku?: string;
      name: string;
      quantity: number;
    }>;
    deliveryDate?: string;
    notes?: string;
  },
  authToken?: string
) {
  try {
    const token = authToken || localStorage.getItem("supabase_token") || publicAnonKey;

    const response = await fetch(`${baseUrl}/billing/remitos/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        customer: {
          documentType: orderData.customer.documentType || "CI",
          documentNumber: orderData.customer.documentNumber,
          name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
          address: {
            street: orderData.customer.address?.street || "",
            number: orderData.customer.address?.number || "",
            city: orderData.customer.address?.city || "Montevideo",
            state: orderData.customer.address?.state || "Montevideo",
            zipCode: orderData.customer.address?.zipCode || "",
            country: orderData.customer.address?.country || "Uruguay",
          },
        },
        items: orderData.items,
        deliveryDate: orderData.deliveryDate || new Date().toISOString().split("T")[0],
        notes: orderData.notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error creating remito");
    }

    const data = await response.json();
    return {
      success: true,
      remito: data.remito,
      fixed: data.fixed,
    };
  } catch (error) {
    console.error("Error creating remito:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Descargar PDF de factura
 */
export async function downloadInvoicePDF(invoiceId: string, authToken?: string) {
  try {
    const token = authToken || localStorage.getItem("supabase_token") || publicAnonKey;

    const response = await fetch(`${baseUrl}/billing/facturas/${invoiceId}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error downloading PDF");
    }

    const data = await response.json();
    
    if (data.pdfUrl) {
      window.open(data.pdfUrl, "_blank");
      return { success: true, pdfUrl: data.pdfUrl };
    }

    throw new Error("PDF URL not available");
  } catch (error) {
    console.error("Error downloading invoice PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Descargar PDF de remito
 */
export async function downloadRemitoPDF(remitoId: string, authToken?: string) {
  try {
    const token = authToken || localStorage.getItem("supabase_token") || publicAnonKey;

    const response = await fetch(`${baseUrl}/billing/remitos/${remitoId}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error downloading PDF");
    }

    const data = await response.json();
    
    if (data.pdfUrl) {
      window.open(data.pdfUrl, "_blank");
      return { success: true, pdfUrl: data.pdfUrl };
    }

    throw new Error("PDF URL not available");
  } catch (error) {
    console.error("Error downloading remito PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Anular factura
 */
export async function cancelInvoice(
  invoiceId: string,
  motivo: string,
  authToken?: string
) {
  try {
    const token = authToken || localStorage.getItem("supabase_token") || publicAnonKey;

    const response = await fetch(`${baseUrl}/billing/facturas/${invoiceId}/anular`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ motivo }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error cancelling invoice");
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Error cancelling invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Obtener estadísticas de facturación
 */
export async function getBillingStats(authToken?: string) {
  try {
    const token = authToken || localStorage.getItem("supabase_token") || publicAnonKey;

    const response = await fetch(`${baseUrl}/billing/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error fetching stats");
    }

    const data = await response.json();
    return {
      success: true,
      stats: data,
    };
  } catch (error) {
    console.error("Error fetching billing stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calcular IVA (22% para Uruguay)
 */
export function calculateIVA(subtotal: number, rate: number = 0.22): number {
  return Math.round(subtotal * rate);
}

/**
 * Formatear monto a pesos uruguayos
 */
export function formatUYU(amountInCents: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
  }).format(amountInCents / 100);
}

/**
 * Ejemplo de uso en el checkout:
 * 
 * const result = await createInvoiceFromOrder(order.id, {
 *   customer: {
 *     documentNumber: '12345678',
 *     name: 'Juan Pérez',
 *     email: 'juan@example.com',
 *   },
 *   items: order.items,
 *   totals: {
 *     subtotal: order.subtotal,
 *     tax: calculateIVA(order.subtotal),
 *     total: order.total,
 *   },
 * });
 * 
 * if (result.success) {
 *   console.log('Factura creada:', result.invoice.invoiceNumber);
 *   // Descargar PDF automáticamente
 *   await downloadInvoicePDF(result.invoice.id);
 * }
 */
