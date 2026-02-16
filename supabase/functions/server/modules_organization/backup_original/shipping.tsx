import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// Estados de envío
const SHIPMENT_STATUS = {
  PENDING: "pending",                 // Pendiente de recolección
  PICKED_UP: "picked_up",             // Recolectado
  IN_TRANSIT: "in_transit",           // En tránsito
  OUT_FOR_DELIVERY: "out_for_delivery", // En reparto
  DELIVERED: "delivered",             // Entregado
  FAILED: "failed",                   // Falló la entrega
  RETURNED: "returned",               // Devuelto
  CANCELLED: "cancelled",             // Cancelado
};

// Tipos de servicio
const SERVICE_TYPES = {
  STANDARD: "standard",               // Estándar (3-5 días)
  EXPRESS: "express",                 // Express (1-2 días)
  SAME_DAY: "same_day",              // Mismo día
  NEXT_DAY: "next_day",              // Día siguiente
  INTERNATIONAL: "international",     // Internacional
};

// Couriers soportados
const COURIERS = {
  ODDY_LOGISTICA: "oddy_logistica",    // ODDY Logística (nuestra empresa)
  FEDEX: "fedex",
  UPS: "ups",
  DHL: "dhl",
  USPS: "usps",
  CORREO_ARGENTINO: "correo_argentino",
  CORREO_URUGUAYO: "correo_uruguayo",
  ANDREANI: "andreani",
  OCA: "oca",
  MERCADO_ENVIOS: "mercado_envios",
  CUSTOM: "custom",
};

// ============================================
// CREAR ENVÍO
// ============================================

app.post("/make-server-0dd48dc4/shipments", async (c) => {
  try {
    const body = await c.req.json();
    const timestamp = new Date().toISOString();

    const id = body.id || `shipment:${Date.now()}`;
    const tracking_number = body.tracking_number || generateTrackingNumber();

    const shipment = {
      id,
      entity_id: body.entity_id || "default",
      
      // Número de tracking
      tracking_number,
      
      // Códigos de barras y QR
      codes: {
        barcode: {
          type: "code128",
          data: tracking_number,
          image_base64: generateBarcodeSimulated(tracking_number, "code128"),
          svg: `<svg><!-- Barcode for ${tracking_number} --></svg>`,
        },
        qr: {
          type: "qr",
          data: `${body.base_url || "https://oddy.market"}/track/${tracking_number}`,
          image_base64: generateBarcodeSimulated(tracking_number, "qr"),
          svg: `<svg><!-- QR for tracking ${tracking_number} --></svg>`,
        },
      },
      
      // Orden relacionada
      order_id: body.order_id || null,
      
      // Información del remitente
      sender: {
        party_id: body.sender?.party_id || null,
        name: body.sender?.name || "",
        phone: body.sender?.phone || "",
        email: body.sender?.email || "",
        address: {
          street: body.sender?.address?.street || "",
          city: body.sender?.address?.city || "",
          state: body.sender?.address?.state || "",
          postal_code: body.sender?.address?.postal_code || "",
          country: body.sender?.address?.country || "",
          coordinates: body.sender?.address?.coordinates || null, // { lat, lng }
        },
      },
      
      // Información del destinatario
      recipient: {
        party_id: body.recipient?.party_id || null,
        name: body.recipient?.name || "",
        phone: body.recipient?.phone || "",
        email: body.recipient?.email || "",
        address: {
          street: body.recipient?.address?.street || "",
          city: body.recipient?.address?.city || "",
          state: body.recipient?.address?.state || "",
          postal_code: body.recipient?.address?.postal_code || "",
          country: body.recipient?.address?.country || "",
          coordinates: body.recipient?.address?.coordinates || null, // { lat, lng }
        },
      },
      
      // Información del paquete
      package: {
        weight: body.package?.weight || null, // en kg
        dimensions: body.package?.dimensions || null, // { length, width, height } en cm
        declared_value: body.package?.declared_value || null,
        currency: body.package?.currency || "USD",
        contents: body.package?.contents || "",
        quantity: body.package?.quantity || 1,
        fragile: body.package?.fragile || false,
        perishable: body.package?.perishable || false,
        requires_signature: body.package?.requires_signature || false,
      },
      
      // Servicio de envío
      service: {
        type: body.service?.type || SERVICE_TYPES.STANDARD,
        courier: body.service?.courier || COURIERS.CUSTOM,
        estimated_delivery_date: body.service?.estimated_delivery_date || null,
        delivery_instructions: body.service?.delivery_instructions || "",
      },
      
      // Costos
      costs: {
        shipping_cost: body.costs?.shipping_cost || 0,
        insurance_cost: body.costs?.insurance_cost || 0,
        handling_cost: body.costs?.handling_cost || 0,
        total_cost: body.costs?.total_cost || 0,
        currency: body.costs?.currency || "USD",
      },
      
      // Estado
      status: SHIPMENT_STATUS.PENDING,
      
      // Tracking en tiempo real
      current_location: null,
      location_history: [],
      
      // Fechas importantes
      created_at: timestamp,
      updated_at: timestamp,
      picked_up_at: null,
      in_transit_at: null,
      out_for_delivery_at: null,
      delivered_at: null,
      
      // Información de entrega
      delivery_info: {
        delivered_to: null,
        signature: null,
        photo_proof: null,
        notes: null,
      },
      
      // Eventos del envío
      events: [
        {
          id: `event:${Date.now()}`,
          type: "created",
          status: SHIPMENT_STATUS.PENDING,
          description: "Envío creado",
          location: body.sender?.address?.city || "Unknown",
          timestamp,
          coordinates: body.sender?.address?.coordinates || null,
        },
      ],
      
      // Integración con Google Maps
      google_maps: {
        distance: null, // en km
        duration: null, // en minutos
        route_encoded: null, // Polyline encoded
        eta: null, // Estimated Time of Arrival
      },
      
      // Notificaciones
      notifications: {
        sms_enabled: body.notifications?.sms_enabled || false,
        email_enabled: body.notifications?.email_enabled !== false,
        push_enabled: body.notifications?.push_enabled || false,
      },
      
      // Metadata
      metadata: body.metadata || {},
    };

    // Calcular distancia y ETA con Google Maps (simulado)
    if (shipment.sender.address.coordinates && shipment.recipient.address.coordinates) {
      const mapsData = await calculateRouteWithGoogleMaps(
        shipment.sender.address.coordinates,
        shipment.recipient.address.coordinates
      );
      
      shipment.google_maps = mapsData;
      
      // Estimar fecha de entrega basada en el tipo de servicio
      if (mapsData.duration && !shipment.service.estimated_delivery_date) {
        shipment.service.estimated_delivery_date = estimateDeliveryDate(
          shipment.service.type,
          mapsData.duration
        );
      }
    }

    await kv.set([id], shipment);
    
    // Indexar
    await kv.set(["shipments_by_entity", shipment.entity_id, id], true);
    await kv.set(["shipments_by_tracking", shipment.entity_id, tracking_number], id);
    await kv.set(["shipments_by_status", shipment.entity_id, shipment.status, id], true);
    
    if (shipment.order_id) {
      await kv.set(["shipments_by_order", shipment.entity_id, shipment.order_id, id], true);
    }
    
    if (shipment.sender.party_id) {
      await kv.set(["shipments_by_sender", shipment.entity_id, shipment.sender.party_id, id], true);
    }
    
    if (shipment.recipient.party_id) {
      await kv.set(["shipments_by_recipient", shipment.entity_id, shipment.recipient.party_id, id], true);
    }

    return c.json({ 
      shipment,
      message: "Shipment created successfully",
    });
  } catch (error) {
    console.log("Error creating shipment:", error);
    return c.json({ error: "Error creating shipment" }, 500);
  }
});

// ============================================
// OBTENER ENVÍO
// ============================================

app.get("/make-server-0dd48dc4/shipments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Shipment not found" }, 404);
    }

    return c.json({ shipment: entry.value });
  } catch (error) {
    console.log("Error getting shipment:", error);
    return c.json({ error: "Error getting shipment" }, 500);
  }
});

// ============================================
// TRACKING POR NÚMERO
// ============================================

app.get("/make-server-0dd48dc4/shipments/track/:tracking_number", async (c) => {
  try {
    const tracking_number = c.req.param("tracking_number");
    const entity_id = c.req.query("entity_id") || "default";

    const shipmentIdEntry = await kv.get(["shipments_by_tracking", entity_id, tracking_number]);

    if (!shipmentIdEntry.value) {
      return c.json({ error: "Shipment not found" }, 404);
    }

    const shipmentId = shipmentIdEntry.value as string;
    const shipmentEntry = await kv.get([shipmentId]);

    if (!shipmentEntry.value) {
      return c.json({ error: "Shipment not found" }, 404);
    }

    const shipment = shipmentEntry.value as any;

    // Retornar vista pública del tracking
    return c.json({
      tracking: {
        tracking_number: shipment.tracking_number,
        status: shipment.status,
        current_location: shipment.current_location,
        recipient: {
          name: shipment.recipient.name,
          city: shipment.recipient.address.city,
        },
        service: {
          type: shipment.service.type,
          estimated_delivery_date: shipment.service.estimated_delivery_date,
        },
        events: shipment.events,
        google_maps: shipment.google_maps,
        delivered_at: shipment.delivered_at,
        delivery_info: shipment.delivery_info,
      },
    });
  } catch (error) {
    console.log("Error tracking shipment:", error);
    return c.json({ error: "Error tracking shipment" }, 500);
  }
});

// ============================================
// ACTUALIZAR UBICACIÓN (GEOPOSICIONAMIENTO)
// ============================================

app.post("/make-server-0dd48dc4/shipments/:id/update-location", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Shipment not found" }, 404);
    }

    const shipment = entry.value as any;
    const timestamp = new Date().toISOString();

    // Actualizar ubicación actual
    const newLocation = {
      coordinates: body.coordinates, // { lat, lng }
      address: body.address || null,
      city: body.city || null,
      country: body.country || null,
      timestamp,
    };

    shipment.current_location = newLocation;
    
    // Agregar a historial
    shipment.location_history.push(newLocation);

    // Actualizar ETA con Google Maps
    if (body.coordinates && shipment.recipient.address.coordinates) {
      const mapsData = await calculateRouteWithGoogleMaps(
        body.coordinates,
        shipment.recipient.address.coordinates
      );
      
      shipment.google_maps.distance = mapsData.distance;
      shipment.google_maps.duration = mapsData.duration;
      shipment.google_maps.eta = mapsData.eta;
    }

    // Agregar evento
    shipment.events.push({
      id: `event:${Date.now()}`,
      type: "location_update",
      status: shipment.status,
      description: body.description || "Ubicación actualizada",
      location: body.city || body.address || "Unknown",
      timestamp,
      coordinates: body.coordinates,
    });

    shipment.updated_at = timestamp;

    await kv.set([id], shipment);

    // Enviar notificaciones si está configurado
    if (shipment.notifications.sms_enabled || shipment.notifications.email_enabled) {
      console.log(`[NOTIFICATION] Send location update to recipient: ${shipment.recipient.name}`);
    }

    return c.json({ 
      success: true,
      shipment,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.log("Error updating location:", error);
    return c.json({ error: "Error updating location" }, 500);
  }
});

// ============================================
// ACTUALIZAR ESTADO DEL ENVÍO
// ============================================

app.post("/make-server-0dd48dc4/shipments/:id/update-status", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Shipment not found" }, 404);
    }

    const shipment = entry.value as any;
    const timestamp = new Date().toISOString();
    const oldStatus = shipment.status;
    const newStatus = body.status;

    // Validar que el status sea válido
    if (!Object.values(SHIPMENT_STATUS).includes(newStatus)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    // Re-indexar por status
    await kv.delete(["shipments_by_status", shipment.entity_id, oldStatus, id]);
    await kv.set(["shipments_by_status", shipment.entity_id, newStatus, id], true);

    // Actualizar status
    shipment.status = newStatus;
    
    // Actualizar fechas según el status
    if (newStatus === SHIPMENT_STATUS.PICKED_UP && !shipment.picked_up_at) {
      shipment.picked_up_at = timestamp;
    } else if (newStatus === SHIPMENT_STATUS.IN_TRANSIT && !shipment.in_transit_at) {
      shipment.in_transit_at = timestamp;
    } else if (newStatus === SHIPMENT_STATUS.OUT_FOR_DELIVERY && !shipment.out_for_delivery_at) {
      shipment.out_for_delivery_at = timestamp;
    } else if (newStatus === SHIPMENT_STATUS.DELIVERED && !shipment.delivered_at) {
      shipment.delivered_at = timestamp;
      
      // Información de entrega
      if (body.delivery_info) {
        shipment.delivery_info = {
          delivered_to: body.delivery_info.delivered_to || shipment.recipient.name,
          signature: body.delivery_info.signature || null,
          photo_proof: body.delivery_info.photo_proof || null,
          notes: body.delivery_info.notes || null,
        };
      }
    }

    // Agregar evento
    shipment.events.push({
      id: `event:${Date.now()}`,
      type: "status_change",
      status: newStatus,
      description: body.description || getStatusDescription(newStatus),
      location: body.location || shipment.current_location?.city || "Unknown",
      timestamp,
      coordinates: body.coordinates || shipment.current_location?.coordinates || null,
    });

    shipment.updated_at = timestamp;

    await kv.set([id], shipment);

    // Enviar notificaciones
    if (shipment.notifications.sms_enabled || shipment.notifications.email_enabled) {
      console.log(`[NOTIFICATION] Send status update to recipient: ${shipment.recipient.name} - Status: ${newStatus}`);
    }

    return c.json({ 
      success: true,
      shipment,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log("Error updating status:", error);
    return c.json({ error: "Error updating status" }, 500);
  }
});

// ============================================
// LISTAR ENVÍOS
// ============================================

app.get("/make-server-0dd48dc4/shipments", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const order_id = c.req.query("order_id");
    const sender_id = c.req.query("sender_id");
    const recipient_id = c.req.query("recipient_id");

    let prefix;
    
    if (order_id) {
      prefix = ["shipments_by_order", entity_id, order_id];
    } else if (sender_id) {
      prefix = ["shipments_by_sender", entity_id, sender_id];
    } else if (recipient_id) {
      prefix = ["shipments_by_recipient", entity_id, recipient_id];
    } else if (status) {
      prefix = ["shipments_by_status", entity_id, status];
    } else {
      prefix = ["shipments_by_entity", entity_id];
    }

    const entries = kv.list({ prefix });
    
    let shipments = [];
    for await (const entry of entries) {
      const shipmentId = entry.key[entry.key.length - 1];
      const shipmentEntry = await kv.get([shipmentId]);
      if (shipmentEntry.value) {
        shipments.push(shipmentEntry.value);
      }
    }

    // Ordenar por fecha de creación (más reciente primero)
    shipments.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ shipments, total: shipments.length });
  } catch (error) {
    console.log("Error listing shipments:", error);
    return c.json({ error: "Error listing shipments" }, 500);
  }
});

// ============================================
// DASHBOARD DE ENVÍOS
// ============================================

app.get("/make-server-0dd48dc4/shipments/stats/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const prefix = ["shipments_by_entity", entity_id];
    const entries = kv.list({ prefix });
    
    let shipments = [];
    for await (const entry of entries) {
      const shipmentId = entry.key[entry.key.length - 1];
      const shipmentEntry = await kv.get([shipmentId]);
      if (shipmentEntry.value) {
        shipments.push(shipmentEntry.value);
      }
    }

    // Calcular estadísticas
    const stats = {
      total: shipments.length,
      by_status: {
        pending: 0,
        picked_up: 0,
        in_transit: 0,
        out_for_delivery: 0,
        delivered: 0,
        failed: 0,
        returned: 0,
        cancelled: 0,
      },
      by_service_type: {},
      by_courier: {},
      total_shipping_cost: 0,
      avg_delivery_time: 0, // en días
      on_time_delivery_rate: 0, // %
    };

    let totalDeliveryTime = 0;
    let deliveredCount = 0;
    let onTimeCount = 0;

    shipments.forEach((shipment: any) => {
      // Contar por status
      stats.by_status[shipment.status] = (stats.by_status[shipment.status] || 0) + 1;
      
      // Contar por tipo de servicio
      stats.by_service_type[shipment.service.type] = (stats.by_service_type[shipment.service.type] || 0) + 1;
      
      // Contar por courier
      stats.by_courier[shipment.service.courier] = (stats.by_courier[shipment.service.courier] || 0) + 1;
      
      // Sumar costos
      stats.total_shipping_cost += shipment.costs.total_cost || 0;
      
      // Calcular tiempo de entrega promedio
      if (shipment.delivered_at) {
        const deliveryTime = Math.floor(
          (new Date(shipment.delivered_at).getTime() - new Date(shipment.created_at).getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        totalDeliveryTime += deliveryTime;
        deliveredCount++;
        
        // Verificar si fue a tiempo
        if (shipment.service.estimated_delivery_date) {
          const estimatedDate = new Date(shipment.service.estimated_delivery_date);
          const actualDate = new Date(shipment.delivered_at);
          
          if (actualDate <= estimatedDate) {
            onTimeCount++;
          }
        }
      }
    });

    stats.avg_delivery_time = deliveredCount > 0 ? Math.round(totalDeliveryTime / deliveredCount) : 0;
    stats.on_time_delivery_rate = deliveredCount > 0 ? Math.round((onTimeCount / deliveredCount) * 100) : 0;

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting shipment stats:", error);
    return c.json({ error: "Error getting shipment stats" }, 500);
  }
});

// ============================================
// MAPA EN VIVO (TODOS LOS ENVÍOS ACTIVOS)
// ============================================

app.get("/make-server-0dd48dc4/shipments/live-map", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    // Obtener envíos activos (en tránsito o en reparto)
    const activeStatuses = [SHIPMENT_STATUS.IN_TRANSIT, SHIPMENT_STATUS.OUT_FOR_DELIVERY];
    
    let activeShipments = [];
    
    for (const status of activeStatuses) {
      const prefix = ["shipments_by_status", entity_id, status];
      const entries = kv.list({ prefix });
      
      for await (const entry of entries) {
        const shipmentId = entry.key[entry.key.length - 1];
        const shipmentEntry = await kv.get([shipmentId]);
        if (shipmentEntry.value) {
          const shipment = shipmentEntry.value as any;
          
          // Solo incluir si tiene ubicación actual
          if (shipment.current_location?.coordinates) {
            activeShipments.push({
              id: shipment.id,
              tracking_number: shipment.tracking_number,
              status: shipment.status,
              current_location: shipment.current_location,
              recipient: {
                name: shipment.recipient.name,
                city: shipment.recipient.address.city,
                coordinates: shipment.recipient.address.coordinates,
              },
              service: {
                type: shipment.service.type,
                estimated_delivery_date: shipment.service.estimated_delivery_date,
              },
              google_maps: {
                distance: shipment.google_maps.distance,
                duration: shipment.google_maps.duration,
                eta: shipment.google_maps.eta,
              },
            });
          }
        }
      }
    }

    return c.json({ 
      active_shipments: activeShipments,
      total: activeShipments.length,
    });
  } catch (error) {
    console.log("Error getting live map:", error);
    return c.json({ error: "Error getting live map" }, 500);
  }
});

// ============================================
// CALCULAR TARIFA DE ENVÍO
// ============================================

app.post("/make-server-0dd48dc4/shipments/calculate-rate", async (c) => {
  try {
    const body = await c.req.json();

    const fromCoordinates = body.from_coordinates; // { lat, lng }
    const toCoordinates = body.to_coordinates; // { lat, lng }
    const weight = body.weight || 1; // kg
    const serviceType = body.service_type || SERVICE_TYPES.STANDARD;
    const courier = body.courier || COURIERS.CUSTOM;

    // Calcular distancia con Google Maps
    const mapsData = await calculateRouteWithGoogleMaps(fromCoordinates, toCoordinates);

    // Calcular tarifa basada en distancia y peso
    const rate = calculateShippingRate(mapsData.distance, weight, serviceType, courier);

    return c.json({
      rate: {
        distance: mapsData.distance,
        duration: mapsData.duration,
        service_type: serviceType,
        courier,
        costs: {
          base_cost: rate.base_cost,
          distance_cost: rate.distance_cost,
          weight_cost: rate.weight_cost,
          service_cost: rate.service_cost,
          total_cost: rate.total_cost,
          currency: "USD",
        },
        estimated_delivery_date: estimateDeliveryDate(serviceType, mapsData.duration),
      },
    });
  } catch (error) {
    console.log("Error calculating rate:", error);
    return c.json({ error: "Error calculating rate" }, 500);
  }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function generateTrackingNumber(): string {
  const prefix = "ODY";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

async function calculateRouteWithGoogleMaps(from: {lat: number, lng: number}, to: {lat: number, lng: number}) {
  // En producción, hacer llamada real a Google Maps API
  // const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?...`);
  
  // SIMULADO: Calcular distancia aproximada usando fórmula de Haversine
  const distance = calculateHaversineDistance(from, to);
  const duration = Math.round(distance / 60 * 60); // Asumiendo 60 km/h promedio
  const eta = new Date(Date.now() + duration * 60 * 1000).toISOString();
  
  return {
    distance: Math.round(distance), // km
    duration, // minutos
    route_encoded: "SIMULATED_POLYLINE",
    eta,
  };
}

function calculateHaversineDistance(from: {lat: number, lng: number}, to: {lat: number, lng: number}): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLon = (to.lng - from.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateDeliveryDate(serviceType: string, durationMinutes: number): string {
  let daysToAdd = 0;
  
  switch (serviceType) {
    case SERVICE_TYPES.SAME_DAY:
      daysToAdd = 0;
      break;
    case SERVICE_TYPES.NEXT_DAY:
      daysToAdd = 1;
      break;
    case SERVICE_TYPES.EXPRESS:
      daysToAdd = 2;
      break;
    case SERVICE_TYPES.STANDARD:
      daysToAdd = 5;
      break;
    case SERVICE_TYPES.INTERNATIONAL:
      daysToAdd = 10;
      break;
    default:
      daysToAdd = 5;
  }
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  return deliveryDate.toISOString();
}

function calculateShippingRate(distanceKm: number, weightKg: number, serviceType: string, courier: string) {
  const baseCost = 5; // USD
  const distanceCostPerKm = 0.5; // USD
  const weightCostPerKg = 2; // USD
  
  const distanceCost = distanceKm * distanceCostPerKm;
  const weightCost = weightKg * weightCostPerKg;
  
  // Multiplicador según tipo de servicio
  let serviceMultiplier = 1;
  switch (serviceType) {
    case SERVICE_TYPES.SAME_DAY:
      serviceMultiplier = 3;
      break;
    case SERVICE_TYPES.NEXT_DAY:
      serviceMultiplier = 2;
      break;
    case SERVICE_TYPES.EXPRESS:
      serviceMultiplier = 1.5;
      break;
    case SERVICE_TYPES.INTERNATIONAL:
      serviceMultiplier = 2.5;
      break;
  }
  
  const serviceCost = (baseCost + distanceCost + weightCost) * (serviceMultiplier - 1);
  const totalCost = baseCost + distanceCost + weightCost + serviceCost;
  
  return {
    base_cost: baseCost,
    distance_cost: Math.round(distanceCost * 100) / 100,
    weight_cost: Math.round(weightCost * 100) / 100,
    service_cost: Math.round(serviceCost * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
  };
}

function getStatusDescription(status: string): string {
  const descriptions = {
    [SHIPMENT_STATUS.PENDING]: "Envío pendiente de recolección",
    [SHIPMENT_STATUS.PICKED_UP]: "Paquete recolectado",
    [SHIPMENT_STATUS.IN_TRANSIT]: "En tránsito hacia destino",
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: "En reparto - Llegará hoy",
    [SHIPMENT_STATUS.DELIVERED]: "Entregado exitosamente",
    [SHIPMENT_STATUS.FAILED]: "Falló la entrega",
    [SHIPMENT_STATUS.RETURNED]: "Paquete devuelto al remitente",
    [SHIPMENT_STATUS.CANCELLED]: "Envío cancelado",
  };
  
  return descriptions[status] || "Estado desconocido";
}

function generateBarcodeSimulated(data: string, type: string): string {
  // En producción, usar librería como bwip-js o similar
  return `data:image/png;base64,SIMULATED_${type.toUpperCase()}_${data}`;
}

export default app;
