import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const shippingApp = new Hono();

// Generate tracking number
function generateTrackingNumber(): string {
  const prefix = "ODDY";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Calculate shipping cost based on weight and distance
function calculateShippingCost(weight: number, dimensions: any): number {
  const volumetricWeight =
    (dimensions.length * dimensions.width * dimensions.height) / 5000;
  const chargeableWeight = Math.max(weight, volumetricWeight);

  // Base cost + weight charge
  const baseCost = 200;
  const weightCost = chargeableWeight * 50;

  return Math.round(baseCost + weightCost);
}

// ============== LIST SHIPMENTS ==============

shippingApp.get("/make-server-0dd48dc4/shipping/list", async (c) => {
  try {
    const shipments = await kv.getByPrefix("shipment:");

    // Sort by creation date (most recent first)
    shipments.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json({ shipments });
  } catch (error) {
    console.log("Error listing shipments:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== GET SHIPMENT ==============

shippingApp.get("/make-server-0dd48dc4/shipping/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const shipment = await kv.get(`shipment:${id}`);

    if (!shipment) {
      return c.json({ error: "Shipment not found" }, 404);
    }

    return c.json({ shipment });
  } catch (error) {
    console.log("Error getting shipment:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== CREATE SHIPMENT ==============

shippingApp.post("/make-server-0dd48dc4/shipping/create", async (c) => {
  try {
    const data = await c.req.json();

    const trackingNumber = generateTrackingNumber();
    const cost = calculateShippingCost(data.weight, data.dimensions);

    // Calculate estimated delivery (5-7 business days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 6);

    const shipment = {
      id: `SHP-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      orderId: data.orderId || `ORD-${Date.now()}`,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      origin: data.origin,
      destination: data.destination,
      carrier: data.carrier,
      trackingNumber,
      status: "pending",
      estimatedDelivery: estimatedDelivery.toISOString(),
      weight: data.weight,
      dimensions: data.dimensions,
      cost,
      items: data.items || [],
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: "pending",
          message: "Envío creado",
          location: data.origin.city,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await kv.set(`shipment:${shipment.id}`, shipment);

    // Log activity
    const activity = {
      id: `activity-${Date.now()}`,
      type: "shipment_created",
      shipmentId: shipment.id,
      trackingNumber,
      message: `Nuevo envío creado para ${data.customerName}`,
      timestamp: new Date().toISOString(),
    };
    await kv.set(`activity:shipment:${activity.id}`, activity);

    return c.json({ shipment });
  } catch (error) {
    console.log("Error creating shipment:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== UPDATE SHIPMENT STATUS ==============

shippingApp.put(
  "/make-server-0dd48dc4/shipping/:id/status",
  async (c) => {
    try {
      const id = c.req.param("id");
      const { status, location, message } = await c.req.json();

      const shipment = await kv.get(`shipment:${id}`);

      if (!shipment) {
        return c.json({ error: "Shipment not found" }, 404);
      }

      // Update status
      shipment.status = status;
      shipment.updatedAt = new Date().toISOString();

      // Add to timeline
      const timelineEvent = {
        status,
        message:
          message ||
          getStatusMessage(status),
        location: location || shipment.destination.city,
        timestamp: new Date().toISOString(),
      };

      shipment.timeline.push(timelineEvent);

      // If delivered, set actual delivery date
      if (status === "delivered") {
        shipment.actualDelivery = new Date().toISOString();
      }

      await kv.set(`shipment:${id}`, shipment);

      // Log activity
      const activity = {
        id: `activity-${Date.now()}`,
        type: "shipment_status_updated",
        shipmentId: id,
        trackingNumber: shipment.trackingNumber,
        status,
        message: `Estado actualizado a: ${getStatusMessage(status)}`,
        timestamp: new Date().toISOString(),
      };
      await kv.set(`activity:shipment:${activity.id}`, activity);

      return c.json({ shipment });
    } catch (error) {
      console.log("Error updating shipment status:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// ============== TRACK SHIPMENT ==============

shippingApp.get("/make-server-0dd48dc4/shipping/track/:trackingNumber", async (c) => {
  try {
    const trackingNumber = c.req.param("trackingNumber");

    // Find shipment by tracking number
    const allShipments = await kv.getByPrefix("shipment:");
    const shipment = allShipments.find(
      (s: any) => s.trackingNumber === trackingNumber
    );

    if (!shipment) {
      return c.json({ error: "Tracking number not found" }, 404);
    }

    // Return public tracking info (hide sensitive data)
    const trackingInfo = {
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
      carrier: shipment.carrier,
      origin: {
        city: shipment.origin.city,
        state: shipment.origin.state,
      },
      destination: {
        city: shipment.destination.city,
        state: shipment.destination.state,
      },
      timeline: shipment.timeline,
    };

    return c.json({ tracking: trackingInfo });
  } catch (error) {
    console.log("Error tracking shipment:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== GET SHIPMENT STATS ==============

shippingApp.get("/make-server-0dd48dc4/shipping/stats", async (c) => {
  try {
    const shipments = await kv.getByPrefix("shipment:");

    const stats = {
      total: shipments.length,
      byStatus: {
        pending: shipments.filter((s: any) => s.status === "pending").length,
        picked_up: shipments.filter((s: any) => s.status === "picked_up")
          .length,
        in_transit: shipments.filter((s: any) => s.status === "in_transit")
          .length,
        out_for_delivery: shipments.filter(
          (s: any) => s.status === "out_for_delivery"
        ).length,
        delivered: shipments.filter((s: any) => s.status === "delivered")
          .length,
        failed: shipments.filter((s: any) => s.status === "failed").length,
      },
      byCarrier: {} as Record<string, number>,
      totalCost: shipments.reduce((sum: number, s: any) => sum + (s.cost || 0), 0),
      averageDeliveryTime: 0, // Calculate based on delivered shipments
    };

    // Count by carrier
    shipments.forEach((s: any) => {
      if (!stats.byCarrier[s.carrier]) {
        stats.byCarrier[s.carrier] = 0;
      }
      stats.byCarrier[s.carrier]++;
    });

    // Calculate average delivery time
    const deliveredShipments = shipments.filter(
      (s: any) => s.status === "delivered" && s.actualDelivery
    );
    if (deliveredShipments.length > 0) {
      const totalDays = deliveredShipments.reduce((sum: number, s: any) => {
        const created = new Date(s.createdAt);
        const delivered = new Date(s.actualDelivery);
        const days = Math.ceil(
          (delivered.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      stats.averageDeliveryTime = Math.round(
        totalDays / deliveredShipments.length
      );
    }

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting shipment stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== DELETE SHIPMENT ==============

shippingApp.delete("/make-server-0dd48dc4/shipping/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const shipment = await kv.get(`shipment:${id}`);

    if (!shipment) {
      return c.json({ error: "Shipment not found" }, 404);
    }

    await kv.del(`shipment:${id}`);

    return c.json({ message: "Shipment deleted successfully" });
  } catch (error) {
    console.log("Error deleting shipment:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Helper function to get status message
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: "Esperando recolección",
    picked_up: "Paquete recogido por el transportista",
    in_transit: "Paquete en tránsito",
    out_for_delivery: "Paquete en reparto",
    delivered: "Paquete entregado exitosamente",
    failed: "Intento de entrega fallido",
  };

  return messages[status] || "Estado actualizado";
}

export default shippingApp;
