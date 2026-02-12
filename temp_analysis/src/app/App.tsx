// ODDY Market - E-commerce System v2.1 - Fixed Imports
import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Cart } from "./components/Cart";
import { HomePage } from "./components/HomePage";
import { AdminDashboard } from "./components/AdminDashboard";
import { ClientDashboard } from "./components/ClientDashboard";
import { ProviderDashboard } from "./components/ProviderDashboard";
import { AIChatbot } from "./components/AIChatbot";
import { ProductCard } from "./components/ProductCard";
import { Checkout } from "./components/Checkout";
import { MegaMenu } from "./components/MegaMenu";
import { AuthComponent } from "./components/AuthComponent";
import { UserProfile } from "./components/UserProfile";
import { SecondHandMain } from "./components/secondhand/SecondHandMain";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast, Toaster } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  discount?: number;
  rating?: number;
  stock?: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartTimer, setCartTimer] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Session ID para carritos de usuarios no logueados
  const [sessionId, setSessionId] = useState<string>("");

  // Generar sessionId persistente
  useEffect(() => {
    let storedSessionId = localStorage.getItem("oddy_session_id");
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("oddy_session_id", storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  // Cargar carrito al iniciar (usuario logueado o session)
  useEffect(() => {
    if (session?.user?.id) {
      loadUserCart(session.user.id);
    } else if (sessionId) {
      loadSessionCart(sessionId);
    }
  }, [session, sessionId]);

  // Auto-guardar carrito cada vez que cambia
  useEffect(() => {
    if (cart.length >= 0 && (session?.user?.id || sessionId)) {
      const timeoutId = setTimeout(() => {
        saveCart();
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [cart, session, sessionId]);

  // Handle hash navigation for dashboards
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'client-dashboard' || hash === 'provider-dashboard' || 
          hash === 'editor-dashboard' || hash === 'admin') {
        setCurrentPage(hash);
        window.location.hash = '';
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Track abandoned carts - after 60 minutes of inactivity with items in cart
  useEffect(() => {
    if (cart.length > 0 && !checkoutOpen) {
      // Clear previous timer
      if (cartTimer) {
        clearTimeout(cartTimer);
      }

      // Set new timer for 60 minutes (3600000 ms)
      // For demo purposes, using 5 minutes (300000 ms)
      const timer = window.setTimeout(() => {
        trackAbandonedCart();
      }, 300000); // 5 minutes

      setCartTimer(timer);

      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [cart, checkoutOpen]);

  async function trackAbandonedCart() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => {
      const price = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return sum + price * item.quantity;
    }, 0);

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/track-cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            customerEmail: "demo@ejemplo.com",
            customerName: "Cliente Demo",
            items: cart,
            total,
          }),
        }
      );
      console.log("Abandoned cart tracked");
    } catch (error) {
      console.error("Error tracking abandoned cart:", error);
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/products`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          // Set demo products if no products in database
          setProducts(demoProducts);
        }
      } else {
        setProducts(demoProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  }

  // Cargar carrito de usuario logueado
  async function loadUserCart(userId: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/cart/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.cart && data.cart.items) {
          setCart(data.cart.items);
          console.log("Carrito de usuario cargado:", data.cart.items.length, "items");
        }
      }
    } catch (error) {
      console.error("Error loading user cart:", error);
    }
  }

  // Cargar carrito de sesión (usuario no logueado)
  async function loadSessionCart(sessionId: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/cart/session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.cart && data.cart.items) {
          setCart(data.cart.items);
          console.log("Carrito de sesión cargado:", data.cart.items.length, "items");
        }
      }
    } catch (error) {
      console.error("Error loading session cart:", error);
    }
  }

  // Guardar carrito (usuario o sesión)
  async function saveCart() {
    try {
      if (session?.user?.id) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/cart/${session.user.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ items: cart }),
          }
        );
      } else if (sessionId) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/cart/session/${sessionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ items: cart }),
          }
        );
      }
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }

  // Migrar carrito de sesión a usuario cuando se loguea
  async function migrateCart() {
    if (sessionId && session?.user?.id) {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/cart/migrate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              sessionId,
              userId: session.user.id,
            }),
          }
        );
        // Recargar carrito de usuario
        await loadUserCart(session.user.id);
        console.log("Carrito migrado exitosamente");
      } catch (error) {
        console.error("Error migrating cart:", error);
      }
    }
  }

  // Demo products
  const demoProducts: Product[] = [
    {
      id: "1",
      name: "Smartphone Galaxy S24 Ultra",
      price: 899999,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop",
      category: "Electrónica",
      discount: 15,
      rating: 4.8,
      stock: 12,
      description: "El smartphone más potente con cámara de 200MP y pantalla AMOLED"
    },
    {
      id: "2",
      name: "Laptop HP Pavilion 15",
      price: 749999,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
      category: "Electrónica",
      rating: 4.5,
      stock: 8,
      description: "Laptop potente para trabajo y entretenimiento"
    },
    {
      id: "3",
      name: "Auriculares Sony WH-1000XM5",
      price: 299999,
      image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop",
      category: "Audio",
      discount: 20,
      rating: 4.9,
      stock: 25,
      description: "Cancelación de ruido líder en la industria"
    },
    {
      id: "4",
      name: "Smart Watch Apple Watch Series 9",
      price: 449999,
      image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&h=500&fit=crop",
      category: "Wearables",
      rating: 4.7,
      stock: 15,
      description: "Monitoreo de salud avanzado y diseño elegante"
    },
    {
      id: "5",
      name: "Cámara Canon EOS R6",
      price: 1499999,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop",
      category: "Fotografía",
      discount: 10,
      rating: 4.9,
      stock: 5,
      description: "Cámara profesional full-frame con estabilización"
    },
    {
      id: "6",
      name: "Tablet Samsung Galaxy Tab S9",
      price: 549999,
      image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&h=500&fit=crop",
      category: "Electrónica",
      rating: 4.6,
      stock: 18,
      description: "Tablet premium con S Pen incluido"
    },
    {
      id: "7",
      name: "Consola PlayStation 5",
      price: 649999,
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=500&fit=crop",
      category: "Gaming",
      discount: 5,
      rating: 4.8,
      stock: 3,
      description: "La consola de nueva generación de Sony"
    },
    {
      id: "8",
      name: "Monitor LG UltraWide 34",
      price: 449999,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop",
      category: "Monitores",
      rating: 4.7,
      stock: 10,
      description: "Monitor curvo ultrawide para productividad"
    },
    {
      id: "9",
      name: "Teclado Mecánico Logitech G Pro",
      price: 129999,
      image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&h=500&fit=crop",
      category: "Periféricos",
      discount: 15,
      rating: 4.6,
      stock: 22,
      description: "Teclado mecánico gaming profesional"
    },
    {
      id: "10",
      name: "Mouse Logitech MX Master 3S",
      price: 99999,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
      category: "Periféricos",
      rating: 4.8,
      stock: 30,
      description: "Mouse ergonómico para profesionales"
    },
    {
      id: "11",
      name: "Parlante JBL Charge 5",
      price: 149999,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
      category: "Audio",
      discount: 10,
      rating: 4.7,
      stock: 20,
      description: "Parlante Bluetooth portátil resistente al agua"
    },
    {
      id: "12",
      name: "Webcam Logitech Brio 4K",
      price: 199999,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop",
      category: "Periféricos",
      rating: 4.5,
      stock: 14,
      description: "Webcam 4K Ultra HD con HDR"
    },
  ];

  // Cart functions
  function addToCart(product: Product) {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} agregado al carrito`, {
      duration: 2000,
    });
  }

  function updateQuantity(id: string, quantity: number) {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }

  function removeFromCart(id: string) {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    toast.success("Producto eliminado del carrito");
  }

  function handleCheckout() {
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  async function handlePaymentSuccess() {
    // Create order in backend
    await createOrder();
    
    // Send order confirmation email
    await sendOrderConfirmationEmail();
    
    setCheckoutOpen(false);
    setCart([]);
    toast.success("¡Pago exitoso! Tu orden ha sido procesada");
    setCurrentPage("home");
  }

  async function sendOrderConfirmationEmail() {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/send-transactional`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            type: "confirmation",
            to: "demo@ejemplo.com",
            data: {
              customerName: "Cliente Demo",
              orderNumber: `ORD-${Date.now()}`,
              orderDate: new Date().toLocaleDateString(),
              orderTotal: cart
                .reduce((sum, item) => {
                  const price = item.discount
                    ? item.price * (1 - item.discount / 100)
                    : item.price;
                  return sum + price * item.quantity;
                }, 0)
                .toLocaleString(),
              orderItems: cart
                .map(
                  (item) =>
                    `<div style="margin-bottom: 10px;">${item.name} x${item.quantity} - $${item.price.toLocaleString()}</div>`
                )
                .join(""),
              trackingLink: "https://oddymarket.com/orders",
            },
          }),
        }
      );
      console.log("Order confirmation email sent");
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }
  }

  async function createOrder() {
    try {
      const orderData = {
        items: cart,
        total: cart.reduce((sum, item) => {
          const price = item.discount
            ? item.price * (1 - item.discount / 100)
            : item.price;
          return sum + price * item.quantity;
        }, 0),
        customer: {
          name: "Cliente Demo",
          email: "demo@ejemplo.com",
        },
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Order created:", data.order);
      } else {
        console.error("Error creating order");
        toast.error("Error al procesar la orden");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error al procesar la orden");
    }
  }

  function handleViewDetails(product: Product) {
    toast.info(`Ver detalles de: ${product.name}`);
    // Future: Navigate to product detail page
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  // Authentication handlers
  function handleAuthenticated(authenticatedUser: any, authenticatedSession: any) {
    console.log("🔐 Usuario autenticado:", authenticatedUser);
    console.log("📋 Metadata del usuario:", authenticatedUser.user_metadata);
    console.log("🎭 Rol detectado:", authenticatedUser.user_metadata?.role);
    
    setUser(authenticatedUser);
    setSession(authenticatedSession);
    setShowAuth(false);
    toast.success(`¡Bienvenido ${authenticatedUser.user_metadata?.name || authenticatedUser.email}!`);
  }

  function handleLogout() {
    setUser(null);
    setSession(null);
    setShowProfile(false);
    toast.success("Sesión cerrada");
  }

  function handleUserClick() {
    if (user) {
      setShowProfile(true);
    } else {
      setShowAuth(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard - Check if user is admin
  if (currentPage === "admin") {
    // Check if user is admin - support multiple metadata structures
    console.log("🔍 Verificando permisos de admin:");
    console.log("User object:", user);
    console.log("User metadata:", user?.user_metadata);
    console.log("Raw metadata:", user?.raw_user_meta_data);
    console.log("Role from user_metadata:", user?.user_metadata?.role);
    console.log("Role from raw_user_meta_data:", user?.raw_user_meta_data?.role);
    console.log("Email:", user?.email);
    
    const isAdmin = user?.user_metadata?.role === "admin" || 
                    user?.raw_user_meta_data?.role === "admin" ||
                    user?.email === "cvaralla@gmail.com" ||
                    user?.email === "admin@oddymarket.com";
    
    console.log("✅ Is Admin?", isAdmin);
    
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg border border-border max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-6">
              No tienes permisos para acceder al panel de administración.
            </p>
            <button
              onClick={() => setCurrentPage("home")}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Volver al Inicio
            </button>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <p className="text-xs text-blue-800 space-y-1">
                <strong>🔍 Debug Info:</strong><br />
                <span className="block">📧 Email: {user?.email || "No email"}</span>
                <span className="block">🎭 Role (user_metadata): {user?.user_metadata?.role || "No role"}</span>
                <span className="block">🎭 Role (raw): {user?.raw_user_meta_data?.role || "No role"}</span>
                <span className="block mt-2">📋 Full metadata:</span>
                <pre className="text-xs bg-blue-100 p-2 rounded overflow-auto">
                  {JSON.stringify(user?.user_metadata, null, 2)}
                </pre>
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return <AdminDashboard onClose={() => setCurrentPage("home")} session={session} />;
  }

  // Client Dashboard
  if (currentPage === "client-dashboard") {
    if (!user) {
      setShowAuth(true);
      setCurrentPage("home");
      return null;
    }
    return (
      <ClientDashboard 
        user={user}
        session={session}
        onClose={() => setCurrentPage("home")} 
      />
    );
  }

  // Provider Dashboard
  if (currentPage === "provider-dashboard") {
    if (!user || user?.user_metadata?.role !== "proveedor") {
      toast.error("No tienes permisos para acceder al dashboard de proveedor");
      setCurrentPage("home");
      return null;
    }
    return (
      <ProviderDashboard 
        user={user}
        session={session}
        onClose={() => setCurrentPage("home")} 
      />
    );
  }

  // Editor Dashboard (uses AdminDashboard with limited permissions)
  if (currentPage === "editor-dashboard") {
    const isEditor = user?.user_metadata?.role === "editor" || user?.user_metadata?.role === "admin";
    
    if (!isEditor) {
      toast.error("No tienes permisos para acceder al dashboard de editor");
      setCurrentPage("home");
      return null;
    }
    return (
      <AdminDashboard 
        onClose={() => setCurrentPage("home")} 
        session={session}
        editorMode={true}
      />
    );
  }

  // Checkout Page
  if (checkoutOpen) {
    return (
      <Checkout
        items={cart}
        total={cartTotal}
        onBack={() => setCheckoutOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  // Second Hand Department
  if (currentPage === "secondhand") {
    return <SecondHandMain user={user} session={session} />;
  }

  function handleCategorySelect(department: string, category?: string, subcategory?: string) {
    setSelectedDepartment(department);
    setSelectedCategory(category || null);
    setSelectedSubcategory(subcategory || null);
    setCurrentPage("shop");
  }

  // Filter products based on selections
  const filteredProducts = products.filter((product) => {
    if (!selectedDepartment) return true;
    // Basic filtering - in a real app, products would have department/category fields
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      
      <Header
        cartCount={cartCount}
        onNavigate={setCurrentPage}
        onCartClick={() => setCartOpen(true)}
        user={user}
        onUserClick={handleUserClick}
      />

      {/* Mega Menu */}
      <MegaMenu onCategorySelect={handleCategorySelect} />

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Auth Modal */}
      {showAuth && (
        <AuthComponent
          onAuthenticated={handleAuthenticated}
          onClose={() => setShowAuth(false)}
        />
      )}

      {/* User Profile Modal */}
      {showProfile && user && session && (
        <UserProfile
          user={user}
          session={session}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}



      {currentPage === "home" && (
        <HomePage
          products={products}
          onAddToCart={addToCart}
          onViewDetails={handleViewDetails}
          onNavigate={setCurrentPage}
          user={user}
          session={session}
        />
      )}

      {currentPage === "shop" && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {selectedDepartment || "Todos los productos"}
            </h1>
            {selectedCategory && (
              <p className="text-muted-foreground mt-1">
                {selectedCategory}
                {selectedSubcategory && ` / ${selectedSubcategory}`}
              </p>
            )}
            {(selectedDepartment || selectedCategory) && (
              <button
                onClick={() => {
                  setSelectedDepartment(null);
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className="text-sm text-primary hover:underline mt-2"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {currentPage === "account" && (
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="bg-white p-8 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Mi Cuenta</h2>
            {!user ? (
              <>
                <p className="text-muted-foreground mb-6">
                  Iniciá sesión para acceder a tu cuenta
                </p>
                <button
                  onClick={handleUserClick}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors mb-3"
                >
                  Iniciar Sesión / Registrarse
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
                  {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <p className="text-lg font-medium mb-2">
                  {user.user_metadata?.name || "Usuario"}
                </p>
                <p className="text-sm text-muted-foreground mb-6">{user.email}</p>
                
                {/* Show role badge */}
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg">
                  <p className="text-sm font-bold text-orange-900">
                    {user.user_metadata?.role === "admin" && "👑 Administrador"}
                    {user.user_metadata?.role === "editor" && "✏️ Editor"}
                    {user.user_metadata?.role === "proveedor" && "📦 Proveedor"}
                    {(!user.user_metadata?.role || user.user_metadata?.role === "cliente") && "🛒 Cliente"}
                  </p>
                </div>
                
                {/* Show admin button only if user is admin */}
                {user.user_metadata?.role === "admin" && (
                  <button
                    onClick={() => setCurrentPage("admin")}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity mb-3"
                  >
                    🔧 Acceder al Panel Admin
                  </button>
                )}
                
                <button
                  onClick={handleUserClick}
                  className="w-full border border-border py-3 rounded-lg font-medium hover:bg-muted transition-colors mb-3"
                >
                  Ver Mi Perfil
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentPage("home")}
              className="w-full border border-border py-3 rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Sobre nosotros</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Quiénes somos</li>
                <li>Sucursales</li>
                <li>Trabaja con nosotros</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Ayuda</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Preguntas frecuentes</li>
                <li>Envíos</li>
                <li>Devoluciones</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Términos y condiciones</li>
                <li>Política de privacidad</li>
                <li>Defensa al consumidor</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Seguinos</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Facebook</li>
                <li>Instagram</li>
                <li>WhatsApp</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm opacity-60">
            <p>© 2026 ODDY Market. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot - Available on all pages */}
      <AIChatbot user={user} session={session} />
    </div>
  );
}
