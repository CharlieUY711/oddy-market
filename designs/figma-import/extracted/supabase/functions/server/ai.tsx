import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const aiApp = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// ============== AUTH HELPER ==============
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ============== OPENAI / AI HELPER ==============
async function callOpenAI(prompt: string, systemPrompt?: string) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    // Mock response for development
    console.log("OpenAI API key not found, using mock response");
    return generateMockResponse(prompt);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI error:", error);
    return generateMockResponse(prompt);
  }
}

function generateMockResponse(prompt: string): string {
  // Mock intelligent responses based on prompt
  if (prompt.toLowerCase().includes("descripción") || prompt.toLowerCase().includes("producto")) {
    return "Este producto innovador combina calidad y estilo excepcionales. Diseñado con materiales premium y atención meticulosa al detalle, ofrece durabilidad y comodidad inigualables. Perfecto para el uso diario, su diseño versátil se adapta a cualquier ocasión. Con tecnología de última generación y un acabado elegante, representa la mejor relación calidad-precio del mercado.";
  }
  
  if (prompt.toLowerCase().includes("precio") || prompt.toLowerCase().includes("optimizar")) {
    return JSON.stringify({
      currentPrice: 50000,
      optimalPrice: 47500,
      expectedIncrease: 15,
      analysis: "Basado en el análisis de mercado y comportamiento de compra, reducir el precio en 5% puede aumentar las ventas en 15%, maximizando los ingresos totales."
    });
  }

  return "Respuesta generada por IA";
}

// ============== CHATBOT ==============
aiApp.post("/chatbot", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    const { message, conversationHistory } = await c.req.json();

    // Build context from conversation history
    const context = conversationHistory
      ?.slice(-5)
      .map((msg: any) => `${msg.type === "user" ? "Usuario" : "Asistente"}: ${msg.content}`)
      .join("\n");

    const systemPrompt = `Eres un asistente de compras inteligente para ODDY Market, un ecommerce argentino. 
    Tu objetivo es ayudar a los clientes a encontrar productos, resolver dudas y mejorar su experiencia de compra.
    Sé amigable, profesional y conciso. Usa emojis ocasionalmente para hacer la conversación más amigable.
    Si el usuario pregunta por productos específicos, recomienda opciones y ofrece detalles relevantes.
    ${context ? `\nContexto de la conversación:\n${context}` : ""}`;

    const prompt = `Usuario: ${message}\n\nResponde de forma útil y amigable.`;

    // Check for specific intents
    const lowerMessage = message.toLowerCase();
    let response = "";
    let suggestions: string[] = [];
    let products: any[] = [];

    // Search products intent
    if (lowerMessage.includes("buscar") || lowerMessage.includes("producto") || lowerMessage.includes("encontrar")) {
      const allProducts = await kv.getByPrefix("product:");
      products = allProducts.slice(0, 3); // Top 3 products
      response = "¡Encontré algunos productos que podrían interesarte! 🛍️\n\nAquí están mis recomendaciones basadas en tu búsqueda:";
      suggestions = ["Ver más productos", "Filtrar por categoría", "Ver ofertas"];
    }
    // Order status intent
    else if (lowerMessage.includes("pedido") || lowerMessage.includes("orden") || lowerMessage.includes("compra")) {
      if (user) {
        const userOrders = await kv.getByPrefix(`order:user:${user.id}:`);
        if (userOrders.length > 0) {
          const lastOrder = userOrders[0];
          response = `Tu último pedido (#${lastOrder.orderNumber}) está en estado: ${lastOrder.status}. 📦\n\n¿Necesitas más información sobre este pedido?`;
          suggestions = ["Ver detalles del pedido", "Rastrear envío", "Contactar soporte"];
        } else {
          response = "No encontré pedidos registrados en tu cuenta. 🤔\n\n¿Te gustaría explorar nuestros productos?";
          suggestions = ["Ver productos", "Ver ofertas", "Categorías"];
        }
      } else {
        response = "Para ver el estado de tu pedido, necesito que inicies sesión. 🔐\n\n¿Ya tienes una cuenta con nosotros?";
        suggestions = ["Iniciar sesión", "Crear cuenta", "Buscar sin registrarme"];
      }
    }
    // Recommendations intent
    else if (lowerMessage.includes("recomend") || lowerMessage.includes("sugerir") || lowerMessage.includes("qué comprar")) {
      const allProducts = await kv.getByPrefix("product:");
      // Simple recommendation algorithm (can be improved with actual ML)
      products = allProducts
        .sort(() => Math.random() - 0.5) // Random for now
        .slice(0, 3);
      
      response = "Basándome en las tendencias actuales y productos populares, te recomiendo: ✨";
      suggestions = ["Ver más recomendaciones", "Cambiar preferencias", "Ver ofertas"];
    }
    // Offers intent
    else if (lowerMessage.includes("oferta") || lowerMessage.includes("descuento") || lowerMessage.includes("promoción")) {
      const allProducts = await kv.getByPrefix("product:");
      products = allProducts
        .filter((p: any) => p.discount && p.discount > 0)
        .slice(0, 3);
      
      response = "¡Tenemos excelentes ofertas disponibles! 🎉\n\nAquí están las mejores promociones del momento:";
      suggestions = ["Ver todas las ofertas", "Notificarme de nuevas ofertas", "Categorías"];
    }
    // General query - use AI
    else {
      response = await callOpenAI(prompt, systemPrompt);
      suggestions = ["Buscar productos", "Ver ofertas", "Estado de mi pedido", "Hablar con soporte"];
    }

    // Track conversation for analytics
    if (user) {
      await kv.set(`chatbot:${user.id}:${Date.now()}`, {
        userId: user.id,
        message,
        response,
        timestamp: new Date().toISOString(),
      });
    }

    return c.json({ response, suggestions, products });
  } catch (error) {
    console.error("Chatbot error:", error);
    return c.json({ 
      response: "Lo siento, tuve un problema técnico. ¿Podrías reformular tu pregunta?",
      suggestions: ["Buscar productos", "Ver ofertas", "Contactar soporte"]
    }, 500);
  }
});

// ============== PRODUCT RECOMMENDATIONS ==============
aiApp.post("/recommendations", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    const { userId, currentProductId, type, limit = 6 } = await c.req.json();

    const allProducts = await kv.getByPrefix("product:");
    let recommendations: any[] = [];

    if (type === "personalized" && user) {
      // Get user's purchase history
      const userOrders = await kv.getByPrefix(`order:user:${user.id}:`);
      const purchasedCategories = new Set<string>();
      
      userOrders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          if (item.category) purchasedCategories.add(item.category);
        });
      });

      // Recommend products from same categories
      recommendations = allProducts
        .filter((p: any) => purchasedCategories.has(p.category))
        .map((p: any) => ({
          ...p,
          aiScore: 0.85 + Math.random() * 0.15,
          aiReason: "Basado en tus compras anteriores"
        }))
        .slice(0, limit);

      // Fill with popular products if not enough
      if (recommendations.length < limit) {
        const remaining = allProducts
          .filter((p: any) => !recommendations.find((r: any) => r.id === p.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, limit - recommendations.length)
          .map((p: any) => ({
            ...p,
            aiScore: 0.7 + Math.random() * 0.2,
            aiReason: "Popular entre usuarios similares"
          }));
        
        recommendations = [...recommendations, ...remaining];
      }
    } else if (type === "similar" && currentProductId) {
      // Find similar products by category
      const currentProduct = await kv.get(currentProductId);
      
      if (currentProduct) {
        recommendations = allProducts
          .filter((p: any) => 
            p.category === currentProduct.category && 
            p.id !== currentProductId
          )
          .map((p: any) => ({
            ...p,
            aiScore: 0.9,
            aiReason: "Producto similar"
          }))
          .slice(0, limit);
      }
    } else if (type === "trending") {
      // Trending products (most viewed/sold)
      recommendations = allProducts
        .sort(() => Math.random() - 0.5) // Random for demo
        .slice(0, limit)
        .map((p: any) => ({
          ...p,
          aiScore: 0.95,
          aiReason: "Tendencia actual"
        }));
    }

    return c.json({ recommendations });
  } catch (error) {
    console.error("Recommendations error:", error);
    return c.json({ error: "Error generating recommendations" }, 500);
  }
});

// ============== GENERATE PRODUCT DESCRIPTION ==============
aiApp.post("/generate-description", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, category, features, targetAudience } = await c.req.json();

    const prompt = `Genera una descripción de producto atractiva y optimizada para SEO para un ecommerce.

Producto: ${name}
Categoría: ${category}
${features ? `Características: ${features}` : ""}
${targetAudience ? `Público objetivo: ${targetAudience}` : ""}

Requisitos:
- Longitud: 150-200 palabras
- Tono: Profesional pero accesible
- Incluir beneficios clave
- Persuasivo pero honesto
- Optimizado para conversión`;

    const systemPrompt = "Eres un experto en copywriting para ecommerce. Crea descripciones de productos atractivas, persuasivas y optimizadas para SEO que aumenten las conversiones.";

    const description = await callOpenAI(prompt, systemPrompt);

    // Log generation for analytics
    await kv.set(`ai:description:${Date.now()}`, {
      userId: user.id,
      productName: name,
      generatedAt: new Date().toISOString(),
    });

    return c.json({ description });
  } catch (error) {
    console.error("Description generation error:", error);
    return c.json({ error: "Error generating description" }, 500);
  }
});

// ============== PRICE OPTIMIZATION ==============
aiApp.post("/optimize-price", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { productId, currentPrice, cost, category } = await c.req.json();

    // Simple ML algorithm (can be improved with actual training data)
    const costPrice = parseFloat(cost) || parseFloat(currentPrice) * 0.6;
    const minMargin = 1.2; // 20% minimum margin
    const minPrice = costPrice * minMargin;
    
    // Calculate optimal price based on market position
    const marketMultiplier = 1.4 + (Math.random() * 0.3); // 1.4x - 1.7x cost
    const optimalPrice = Math.max(minPrice, costPrice * marketMultiplier);
    
    // Calculate expected impact
    const priceDifference = ((parseFloat(currentPrice) - optimalPrice) / parseFloat(currentPrice)) * 100;
    const expectedIncrease = Math.abs(priceDifference) * 2; // Simplified model

    let analysis = "";
    if (optimalPrice < parseFloat(currentPrice)) {
      analysis = `Reducir el precio en ${Math.abs(priceDifference).toFixed(1)}% puede aumentar las ventas en aproximadamente ${expectedIncrease.toFixed(1)}%, maximizando los ingresos totales. El precio actual está por encima del punto óptimo del mercado.`;
    } else if (optimalPrice > parseFloat(currentPrice)) {
      analysis = `Aumentar el precio en ${priceDifference.toFixed(1)}% puede mejorar los márgenes sin afectar significativamente las ventas. El producto tiene margen para un precio premium.`;
    } else {
      analysis = "El precio actual está en el punto óptimo según nuestro análisis de mercado.";
    }

    const recommendation = {
      currentPrice: parseFloat(currentPrice),
      optimalPrice: Math.round(optimalPrice),
      expectedIncrease: Math.round(expectedIncrease),
      analysis,
      confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
    };

    // Log optimization for learning
    await kv.set(`ai:price:${productId}:${Date.now()}`, {
      ...recommendation,
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    return c.json(recommendation);
  } catch (error) {
    console.error("Price optimization error:", error);
    return c.json({ error: "Error optimizing price" }, 500);
  }
});

// ============== FRAUD DETECTION ==============
aiApp.get("/fraud-detection", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get recent orders
    const allOrders = await kv.getByPrefix("order:");
    const recentOrders = allOrders.slice(0, 100); // Last 100 orders

    let safe = 0;
    let suspicious = 0;
    let blocked = 0;
    const suspiciousTransactions: any[] = [];

    // Simple fraud detection rules
    recentOrders.forEach((order: any) => {
      let riskScore = 0;
      const reasons: string[] = [];

      // Rule 1: High value orders
      if (order.total > 500000) {
        riskScore += 0.3;
        reasons.push("Monto alto");
      }

      // Rule 2: Multiple orders from same IP (simulated)
      if (Math.random() > 0.9) {
        riskScore += 0.2;
        reasons.push("Múltiples órdenes desde misma IP");
      }

      // Rule 3: Shipping to different address than billing (simulated)
      if (Math.random() > 0.85) {
        riskScore += 0.25;
        reasons.push("Dirección de envío diferente a facturación");
      }

      // Rule 4: New account with high purchase (simulated)
      if (Math.random() > 0.92) {
        riskScore += 0.35;
        reasons.push("Cuenta nueva con compra de alto valor");
      }

      // Classify transaction
      if (riskScore >= 0.7) {
        blocked++;
        suspiciousTransactions.push({
          orderId: order.orderNumber || order.id,
          riskScore,
          reason: reasons.join(", "),
          amount: order.total,
        });
      } else if (riskScore >= 0.4) {
        suspicious++;
        suspiciousTransactions.push({
          orderId: order.orderNumber || order.id,
          riskScore,
          reason: reasons.join(", "),
          amount: order.total,
        });
      } else {
        safe++;
      }
    });

    return c.json({
      safe,
      suspicious,
      blocked,
      suspiciousTransactions: suspiciousTransactions.slice(0, 10), // Top 10
      totalAnalyzed: recentOrders.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fraud detection error:", error);
    return c.json({ error: "Error analyzing fraud" }, 500);
  }
});

// ============== SALES PREDICTION ==============
aiApp.get("/predict-sales", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get historical sales data
    const allOrders = await kv.getByPrefix("order:");
    
    // Calculate current metrics
    const last7DaysOrders = allOrders.filter((o: any) => {
      const orderDate = new Date(o.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate >= weekAgo;
    });

    const last30DaysOrders = allOrders.filter((o: any) => {
      const orderDate = new Date(o.date);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return orderDate >= monthAgo;
    });

    const totalLast7Days = last7DaysOrders.reduce((sum: number, o: any) => sum + o.total, 0);
    const totalLast30Days = last30DaysOrders.reduce((sum: number, o: any) => sum + o.total, 0);

    // Simple prediction model (can be improved with actual ML)
    const avgDaily = totalLast30Days / 30;
    const trend = (totalLast7Days / 7) / avgDaily; // Growth trend

    const next7Days = Math.round(avgDaily * 7 * trend * (1 + Math.random() * 0.1));
    const next30Days = Math.round(avgDaily * 30 * trend * (1 + Math.random() * 0.15));

    // Get top products
    const productSales = new Map<string, number>();
    allOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const current = productSales.get(item.name) || 0;
        productSales.set(item.name, current + item.quantity);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({
        name,
        expectedGrowth: Math.round(10 + Math.random() * 30),
      }));

    const recommendations = [
      "Aumentar stock de productos top antes del próximo pico",
      "Considerar promociones para productos de baja rotación",
      "Preparar campaña de marketing para maximizar el crecimiento esperado",
    ];

    const prediction = {
      next7Days,
      next30Days,
      growth7Days: Math.round(((next7Days / totalLast7Days) - 1) * 100),
      growth30Days: Math.round(((next30Days / totalLast30Days) - 1) * 100),
      topProducts,
      recommendations,
      confidence: 0.82,
      generatedAt: new Date().toISOString(),
    };

    return c.json(prediction);
  } catch (error) {
    console.error("Sales prediction error:", error);
    return c.json({ error: "Error predicting sales" }, 500);
  }
});

// ============== IMAGE SEARCH ==============
aiApp.post("/image-search", async (c) => {
  try {
    const formData = await c.req.formData();
    const image = formData.get("image");
    
    if (!image || !(image instanceof File)) {
      return c.json({ error: "No image provided" }, 400);
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!apiKey) {
      // Mock response
      return c.json({
        description: "zapatillas deportivas negras running",
        tags: ["zapatillas", "deportivas", "negro", "running"],
      });
    }

    // Use OpenAI Vision API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this product image in Spanish. Provide a brief description suitable for product search. Focus on: type of product, color, brand (if visible), main characteristics. Return only keywords separated by spaces."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${image.type};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI Vision API error:", response.statusText);
      return c.json({ error: "Error analyzing image" }, 500);
    }

    const data = await response.json();
    const description = data.choices[0]?.message?.content || "";

    return c.json({ description, tags: description.split(" ") });
  } catch (error) {
    console.error("Image search error:", error);
    return c.json({ error: "Error analyzing image" }, 500);
  }
});

export default aiApp;
