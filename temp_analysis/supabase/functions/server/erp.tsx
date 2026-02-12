import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const erpApp = new Hono();

// ============== SUPPLIERS ==============

// Get all suppliers
erpApp.get("/make-server-0dd48dc4/suppliers", async (c) => {
  try {
    const suppliers = await kv.getByPrefix("supplier:");
    return c.json({ suppliers });
  } catch (error) {
    console.log("Error fetching suppliers:", error);
    return c.json({ error: "Error fetching suppliers" }, 500);
  }
});

// Get single supplier
erpApp.get("/make-server-0dd48dc4/suppliers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supplier = await kv.get(`supplier:${id}`);

    if (!supplier) {
      return c.json({ error: "Supplier not found" }, 404);
    }

    return c.json({ supplier });
  } catch (error) {
    console.log("Error fetching supplier:", error);
    return c.json({ error: "Error fetching supplier" }, 500);
  }
});

// Create supplier
erpApp.post("/make-server-0dd48dc4/suppliers", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const supplier = {
      id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`supplier:${id}`, supplier);
    return c.json({ supplier });
  } catch (error) {
    console.log("Error creating supplier:", error);
    return c.json({ error: "Error creating supplier" }, 500);
  }
});

// Update supplier
erpApp.put("/make-server-0dd48dc4/suppliers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`supplier:${id}`);

    if (!existing) {
      return c.json({ error: "Supplier not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`supplier:${id}`, updated);
    return c.json({ supplier: updated });
  } catch (error) {
    console.log("Error updating supplier:", error);
    return c.json({ error: "Error updating supplier" }, 500);
  }
});

// Delete supplier
erpApp.delete("/make-server-0dd48dc4/suppliers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`supplier:${id}`);

    if (!existing) {
      return c.json({ error: "Supplier not found" }, 404);
    }

    await kv.del(`supplier:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting supplier:", error);
    return c.json({ error: "Error deleting supplier" }, 500);
  }
});

// ============== STOCK MOVEMENTS ==============

// Get all stock movements
erpApp.get("/make-server-0dd48dc4/stock-movements", async (c) => {
  try {
    const movements = await kv.getByPrefix("stock_movement:");
    
    // Sort by date descending
    const sorted = movements.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return c.json({ movements: sorted });
  } catch (error) {
    console.log("Error fetching stock movements:", error);
    return c.json({ error: "Error fetching stock movements" }, 500);
  }
});

// Get single stock movement
erpApp.get("/make-server-0dd48dc4/stock-movements/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const movement = await kv.get(`stock_movement:${id}`);

    if (!movement) {
      return c.json({ error: "Movement not found" }, 404);
    }

    return c.json({ movement });
  } catch (error) {
    console.log("Error fetching stock movement:", error);
    return c.json({ error: "Error fetching stock movement" }, 500);
  }
});

// Create stock movement and update stock
erpApp.post("/make-server-0dd48dc4/stock-movements", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const movement = {
      id,
      ...data,
      createdAt: timestamp,
      createdBy: "admin", // TODO: Get from auth
    };

    await kv.set(`stock_movement:${id}`, movement);

    // Update stock for each item
    for (const item of data.items) {
      const product = await kv.get(`product:${item.productId}`);
      
      if (product) {
        let stockChange = item.quantity;
        
        // Determine if it's an increase or decrease
        if (data.type === "credit_note") {
          stockChange = -Math.abs(item.quantity); // Decrease stock
        }
        
        const updatedProduct = {
          ...product,
          stock: (product.stock || 0) + stockChange,
          cost: item.cost || product.cost, // Update cost if provided
          updatedAt: timestamp,
        };
        
        await kv.set(`product:${item.productId}`, updatedProduct);
        
        // Log stock change
        await kv.set(`stock_log:${Date.now()}-${item.productId}`, {
          productId: item.productId,
          productName: item.productName,
          movementId: id,
          movementType: data.type,
          change: stockChange,
          previousStock: product.stock || 0,
          newStock: updatedProduct.stock,
          timestamp,
        });
      }
    }

    return c.json({ movement });
  } catch (error) {
    console.log("Error creating stock movement:", error);
    return c.json({ error: "Error creating stock movement" }, 500);
  }
});

// Update stock movement
erpApp.put("/make-server-0dd48dc4/stock-movements/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`stock_movement:${id}`);

    if (!existing) {
      return c.json({ error: "Movement not found" }, 404);
    }

    // Revert previous stock changes
    for (const item of existing.items) {
      const product = await kv.get(`product:${item.productId}`);
      if (product) {
        let stockChange = item.quantity;
        if (existing.type === "credit_note") {
          stockChange = -Math.abs(item.quantity);
        }
        
        await kv.set(`product:${item.productId}`, {
          ...product,
          stock: (product.stock || 0) - stockChange,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Apply new stock changes
    for (const item of updates.items) {
      const product = await kv.get(`product:${item.productId}`);
      if (product) {
        let stockChange = item.quantity;
        if (updates.type === "credit_note") {
          stockChange = -Math.abs(item.quantity);
        }
        
        await kv.set(`product:${item.productId}`, {
          ...product,
          stock: (product.stock || 0) + stockChange,
          cost: item.cost || product.cost,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`stock_movement:${id}`, updated);
    return c.json({ movement: updated });
  } catch (error) {
    console.log("Error updating stock movement:", error);
    return c.json({ error: "Error updating stock movement" }, 500);
  }
});

// Delete stock movement and revert stock
erpApp.delete("/make-server-0dd48dc4/stock-movements/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`stock_movement:${id}`);

    if (!existing) {
      return c.json({ error: "Movement not found" }, 404);
    }

    // Revert stock changes
    for (const item of existing.items) {
      const product = await kv.get(`product:${item.productId}`);
      if (product) {
        let stockChange = item.quantity;
        if (existing.type === "credit_note") {
          stockChange = -Math.abs(item.quantity);
        }
        
        await kv.set(`product:${item.productId}`, {
          ...product,
          stock: (product.stock || 0) - stockChange,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    await kv.del(`stock_movement:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting stock movement:", error);
    return c.json({ error: "Error deleting stock movement" }, 500);
  }
});

// ============== PURCHASE ORDERS ==============

// Get all purchase orders
erpApp.get("/make-server-0dd48dc4/purchase-orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("purchase-order:");
    
    // Sort by creation date descending
    const sortedOrders = orders.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json({ orders: sortedOrders });
  } catch (error) {
    console.log("Error fetching purchase orders:", error);
    return c.json({ error: "Error fetching purchase orders" }, 500);
  }
});

// Get single purchase order
erpApp.get("/make-server-0dd48dc4/purchase-orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`purchase-order:${id}`);

    if (!order) {
      return c.json({ error: "Purchase order not found" }, 404);
    }

    return c.json({ order });
  } catch (error) {
    console.log("Error fetching purchase order:", error);
    return c.json({ error: "Error fetching purchase order" }, 500);
  }
});

// Create purchase order
erpApp.post("/make-server-0dd48dc4/purchase-orders", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Get supplier info
    const supplier = await kv.get(`supplier:${data.supplierId}`);
    if (!supplier) {
      return c.json({ error: "Supplier not found" }, 404);
    }

    // Generate order number
    const orders = await kv.getByPrefix("purchase-order:");
    const orderNumber = `OC-${String(orders.length + 1).padStart(5, "0")}`;

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum: number, item: any) => sum + item.total,
      0
    );
    const tax = subtotal * 0.22; // 22% IVA Uruguay
    const total = subtotal + tax;

    const order = {
      id,
      orderNumber,
      supplierId: data.supplierId,
      supplierName: supplier.name,
      status: "draft",
      orderDate: data.orderDate,
      expectedDate: data.expectedDate,
      items: data.items,
      subtotal,
      tax,
      total,
      notes: data.notes,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`purchase-order:${id}`, order);
    return c.json({ order });
  } catch (error) {
    console.log("Error creating purchase order:", error);
    return c.json({ error: "Error creating purchase order" }, 500);
  }
});

// Update purchase order status
erpApp.put("/make-server-0dd48dc4/purchase-orders/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    const order = await kv.get(`purchase-order:${id}`);

    if (!order) {
      return c.json({ error: "Purchase order not found" }, 404);
    }

    const updated = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    };

    // If status is "received", update inventory
    if (status === "received") {
      updated.receivedDate = new Date().toISOString();
      
      // Update inventory for each item (in a real app)
      for (const item of order.items) {
        // This would update the inventory
        console.log(`Updating inventory for ${item.productName}: +${item.quantity}`);
      }
    }

    await kv.set(`purchase-order:${id}`, updated);
    return c.json({ order: updated });
  } catch (error) {
    console.log("Error updating purchase order status:", error);
    return c.json({ error: "Error updating status" }, 500);
  }
});

// ============== INVENTORY ==============

// Get all inventory items
erpApp.get("/make-server-0dd48dc4/inventory", async (c) => {
  try {
    const inventory = await kv.getByPrefix("inventory:");
    
    // Calculate status for each item
    const itemsWithStatus = inventory.map((item: any) => {
      let status = "normal";
      if (item.currentStock <= item.minStock / 2) {
        status = "critical";
      } else if (item.currentStock <= item.minStock) {
        status = "low";
      } else if (item.currentStock >= item.maxStock) {
        status = "overstock";
      }
      
      return { ...item, status };
    });

    return c.json({ inventory: itemsWithStatus });
  } catch (error) {
    console.log("Error fetching inventory:", error);
    return c.json({ error: "Error fetching inventory" }, 500);
  }
});

// Get single inventory item
erpApp.get("/make-server-0dd48dc4/inventory/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const item = await kv.get(`inventory:${id}`);

    if (!item) {
      return c.json({ error: "Inventory item not found" }, 404);
    }

    return c.json({ item });
  } catch (error) {
    console.log("Error fetching inventory item:", error);
    return c.json({ error: "Error fetching inventory item" }, 500);
  }
});

// Create inventory item
erpApp.post("/make-server-0dd48dc4/inventory", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const item = {
      id,
      ...data,
      currentStock: data.currentStock || 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastMovement: timestamp,
    };

    await kv.set(`inventory:${id}`, item);
    return c.json({ item });
  } catch (error) {
    console.log("Error creating inventory item:", error);
    return c.json({ error: "Error creating inventory item" }, 500);
  }
});

// Update inventory item
erpApp.put("/make-server-0dd48dc4/inventory/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`inventory:${id}`);

    if (!existing) {
      return c.json({ error: "Inventory item not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`inventory:${id}`, updated);
    return c.json({ item: updated });
  } catch (error) {
    console.log("Error updating inventory item:", error);
    return c.json({ error: "Error updating inventory item" }, 500);
  }
});

// ============== INVENTORY MOVEMENTS ==============

// Get all movements
erpApp.get("/make-server-0dd48dc4/inventory/movements", async (c) => {
  try {
    const movements = await kv.getByPrefix("movement:");
    
    // Sort by date descending
    const sortedMovements = movements.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return c.json({ movements: sortedMovements });
  } catch (error) {
    console.log("Error fetching movements:", error);
    return c.json({ error: "Error fetching movements" }, 500);
  }
});

// Create movement (and update inventory)
erpApp.post("/make-server-0dd48dc4/inventory/movements", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Get inventory item
    const item = await kv.get(`inventory:${data.itemId}`);
    if (!item) {
      return c.json({ error: "Inventory item not found" }, 404);
    }

    const previousStock = item.currentStock;
    let newStock = previousStock;

    // Calculate new stock based on movement type
    if (data.type === "in") {
      newStock = previousStock + data.quantity;
    } else if (data.type === "out") {
      newStock = previousStock - data.quantity;
    } else if (data.type === "adjustment") {
      newStock = data.quantity; // Absolute value for adjustments
    }

    // Create movement record
    const movement = {
      id,
      itemId: data.itemId,
      itemName: item.name,
      type: data.type,
      quantity: data.quantity,
      previousStock,
      newStock,
      reason: data.reason,
      reference: data.reference,
      user: "Admin", // In a real app, this would be from auth
      date: timestamp,
    };

    await kv.set(`movement:${id}`, movement);

    // Update inventory
    const updatedItem = {
      ...item,
      currentStock: newStock,
      lastMovement: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`inventory:${data.itemId}`, updatedItem);

    return c.json({ movement });
  } catch (error) {
    console.log("Error creating inventory movement:", error);
    return c.json({ error: "Error creating inventory movement" }, 500);
  }
});

// ============== CATALOG SYNC ==============

// Get sync stats
erpApp.get("/make-server-0dd48dc4/catalog-sync/stats", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    
    const stats = {
      totalProducts: products.length,
      syncedProducts: products.filter((p: any) => 
        p.syncChannels?.mercadolibre || p.syncChannels?.facebook || 
        p.syncChannels?.instagram || p.syncChannels?.whatsapp
      ).length,
      pendingSync: products.filter((p: any) => !p.lastSync).length,
      failedSync: 0,
    };

    const channelCounts = {
      mercadolibre: products.filter((p: any) => p.syncChannels?.mercadolibre).length,
      facebook: products.filter((p: any) => p.syncChannels?.facebook).length,
      instagram: products.filter((p: any) => p.syncChannels?.instagram).length,
      whatsapp: products.filter((p: any) => p.syncChannels?.whatsapp).length,
    };

    const lastSyncs: any = {};
    for (const channel of ["mercadolibre", "facebook", "instagram", "whatsapp"]) {
      const syncedProducts = products.filter((p: any) => 
        p.syncChannels?.[channel] && p.lastSync?.[channel]
      );
      if (syncedProducts.length > 0) {
        const latestSync = syncedProducts.reduce((latest: any, p: any) => {
          const syncDate = new Date(p.lastSync[channel]).getTime();
          return syncDate > latest ? syncDate : latest;
        }, 0);
        lastSyncs[channel] = new Date(latestSync).toISOString();
      }
    }

    return c.json({ stats, channelCounts, lastSyncs });
  } catch (error) {
    console.log("Error fetching sync stats:", error);
    return c.json({ error: "Error fetching sync stats" }, 500);
  }
});

// Sync products to a channel
erpApp.post("/make-server-0dd48dc4/catalog-sync/sync", async (c) => {
  try {
    const { channelId } = await c.req.json();
    const products = await kv.getByPrefix("product:");
    
    // Filter products that should sync to this channel
    const productsToSync = products.filter((p: any) => 
      p.syncChannels?.[channelId] === true
    );

    // Simulate sync (in real implementation, call channel APIs)
    let synced = 0;
    const timestamp = new Date().toISOString();
    
    for (const product of productsToSync) {
      // Update product with last sync timestamp
      const updated = {
        ...product,
        lastSync: {
          ...product.lastSync,
          [channelId]: timestamp,
        },
      };
      await kv.set(`product:${product.id}`, updated);
      synced++;
    }

    return c.json({ synced, channel: channelId, timestamp });
  } catch (error) {
    console.log("Error syncing channel:", error);
    return c.json({ error: "Error syncing channel" }, 500);
  }
});

// Toggle channel enabled/disabled
erpApp.post("/make-server-0dd48dc4/catalog-sync/toggle-channel", async (c) => {
  try {
    const { channelId } = await c.req.json();
    
    // Store channel config
    const configKey = `channel-config:${channelId}`;
    const config = await kv.get(configKey) || { enabled: false };
    
    const updated = {
      ...config,
      enabled: !config.enabled,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(configKey, updated);
    return c.json({ success: true, config: updated });
  } catch (error) {
    console.log("Error toggling channel:", error);
    return c.json({ error: "Error toggling channel" }, 500);
  }
});

// ============== PRODUCT SEARCH (Info Finder) ==============

erpApp.post("/make-server-0dd48dc4/product-search", async (c) => {
  try {
    const { query } = await c.req.json();
    
    // Search in our existing products first
    const products = await kv.getByPrefix("product:");
    const localResults = products.filter((p: any) => 
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.sku?.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(query.toLowerCase())
    );

    // Format results
    const results = localResults.map((p: any) => ({
      name: p.name,
      description: p.description || "",
      category: p.category || "",
      brand: p.brand || "",
      sku: p.sku || "",
      barcode: p.barcode || "",
      price: p.price || 0,
      cost: p.cost || 0,
      images: p.images || [],
      specifications: p.specifications || {},
      tags: p.tags || [],
      source: "Base de datos local",
    }));

    // In a real implementation, you would also search external APIs here
    // For example: Mercado Libre API, Google Shopping, etc.
    
    return c.json({ results });
  } catch (error) {
    console.log("Error searching products:", error);
    return c.json({ error: "Error searching products" }, 500);
  }
});

// ============== BATCH ACTIONS ==============

erpApp.post("/make-server-0dd48dc4/batch-actions", async (c) => {
  try {
    const { action, itemIds, data } = await c.req.json();
    
    let updated = 0;
    const timestamp = new Date().toISOString();

    for (const itemId of itemIds) {
      const item = await kv.get(`product:${itemId}`);
      if (!item) continue;

      let updatedItem = { ...item, updatedAt: timestamp };

      switch (action) {
        case "update-price":
          if (data.priceType && data.priceAction && data.priceValue) {
            const prices = updatedItem.prices || [];
            const priceIndex = prices.findIndex((p: any) => p.type === data.priceType);
            
            if (priceIndex >= 0) {
              let newAmount = prices[priceIndex].amount;
              
              switch (data.priceAction) {
                case "set":
                  newAmount = parseFloat(data.priceValue);
                  break;
                case "increase-percent":
                  newAmount = newAmount * (1 + parseFloat(data.priceValue) / 100);
                  break;
                case "decrease-percent":
                  newAmount = newAmount * (1 - parseFloat(data.priceValue) / 100);
                  break;
                case "increase-amount":
                  newAmount = newAmount + parseFloat(data.priceValue);
                  break;
                case "decrease-amount":
                  newAmount = newAmount - parseFloat(data.priceValue);
                  break;
              }
              
              prices[priceIndex].amount = newAmount;
              updatedItem.prices = prices;
            }
          }
          break;

        case "update-category":
          if (data.category) {
            updatedItem.category = data.category;
          }
          break;

        case "update-stock":
          if (data.stockAction && data.stockValue) {
            const value = parseFloat(data.stockValue);
            switch (data.stockAction) {
              case "set":
                updatedItem.stock = value;
                break;
              case "add":
                updatedItem.stock = (updatedItem.stock || 0) + value;
                break;
              case "subtract":
                updatedItem.stock = (updatedItem.stock || 0) - value;
                break;
            }
          }
          break;

        case "update-sync":
          updatedItem.syncChannels = {
            ...updatedItem.syncChannels,
            mercadolibre: data.syncMercadoLibre ?? updatedItem.syncChannels?.mercadolibre,
            facebook: data.syncFacebook ?? updatedItem.syncChannels?.facebook,
            instagram: data.syncInstagram ?? updatedItem.syncChannels?.instagram,
            whatsapp: data.syncWhatsApp ?? updatedItem.syncChannels?.whatsapp,
          };
          break;

        case "visibility":
          if (data.visibility) {
            updatedItem.visible = data.visibility === "visible";
          }
          break;

        case "edit-tags":
          if (data.tags) {
            updatedItem.tags = data.tags.split(",").map((t: string) => t.trim());
          }
          break;

        case "duplicate":
          const duplicateId = crypto.randomUUID();
          const duplicate = {
            ...item,
            id: duplicateId,
            name: `${item.name} (Copia)`,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          await kv.set(`product:${duplicateId}`, duplicate);
          updated++;
          continue;

        case "delete":
          await kv.del(`product:${itemId}`);
          updated++;
          continue;

        default:
          continue;
      }

      await kv.set(`product:${itemId}`, updatedItem);
      updated++;
    }

    return c.json({ updated, action });
  } catch (error) {
    console.log("Error processing batch action:", error);
    return c.json({ error: "Error processing batch action" }, 500);
  }
});

// ============== PRODUCTS (for enhanced management) ==============

// Get all products
erpApp.get("/make-server-0dd48dc4/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    
    // Sort by updated date descending
    const sorted = products.sort((a: any, b: any) => {
      return new Date(b.updatedAt || b.createdAt).getTime() - 
             new Date(a.updatedAt || a.createdAt).getTime();
    });
    
    return c.json({ products: sorted });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ error: "Error fetching products" }, 500);
  }
});

// Get single product
erpApp.get("/make-server-0dd48dc4/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`product:${id}`);

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ product });
  } catch (error) {
    console.log("Error fetching product:", error);
    return c.json({ error: "Error fetching product" }, 500);
  }
});

// Create product
erpApp.post("/make-server-0dd48dc4/products", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const product = {
      id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
      visible: data.visible ?? true,
      stock: data.stock || 0,
      // Ensure default sync channels if not provided
      syncChannels: data.syncChannels || {
        mercadolibre: true,
        facebook: false,
        instagram: false,
        whatsapp: false,
        fullSync: false,
      },
      // Ensure default prices if not provided
      prices: data.prices || [
        {
          id: "1",
          type: "principal",
          amount: data.price || 0,
          startDate: timestamp.split("T")[0],
          endDate: "",
          active: true,
        },
      ],
    };

    await kv.set(`product:${id}`, product);
    return c.json({ product });
  } catch (error) {
    console.log("Error creating product:", error);
    return c.json({ error: "Error creating product" }, 500);
  }
});

// Update product
erpApp.put("/make-server-0dd48dc4/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`product:${id}`);

    if (!existing) {
      return c.json({ error: "Product not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`product:${id}`, updated);
    return c.json({ product: updated });
  } catch (error) {
    console.log("Error updating product:", error);
    return c.json({ error: "Error updating product" }, 500);
  }
});

// Delete product
erpApp.delete("/make-server-0dd48dc4/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`product:${id}`);

    if (!existing) {
      return c.json({ error: "Product not found" }, 404);
    }

    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ error: "Error deleting product" }, 500);
  }
});

export default erpApp;
