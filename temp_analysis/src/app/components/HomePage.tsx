import { useState, useEffect } from "react";
import { ChevronRight, Zap, Shield, Truck, Headphones } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { AIRecommendations } from "./AIRecommendations";
import { motion } from "motion/react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  discount?: number;
  rating?: number;
  stock?: number;
}

interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onNavigate: (page: string) => void;
  user?: any;
  session?: any;
}

interface Department {
  id: string;
  name: string;
  icon: string;
  visible?: boolean;
}

export function HomePage({ products, onAddToCart, onViewDetails, onNavigate, user, session }: HomePageProps) {
  const featuredProducts = products.slice(0, 8);
  const newArrivals = products.slice(8, 12);
  const [departments, setDepartments] = useState<Department[]>([
    { id: "1", name: "Alimentos y Bebidas", icon: "🍕", visible: true },
    { id: "2", name: "Tecnología", icon: "💻", visible: true },
    { id: "3", name: "Moda y Accesorios", icon: "👜", visible: true },
    { id: "4", name: "Hogar y Decoración", icon: "🏠", visible: true },
    { id: "5", name: "Deportes y Fitness", icon: "⚽", visible: true },
    { id: "6", name: "Salud y Bienestar", icon: "💊", visible: true },
  ]);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter only visible departments and limit to first 6 for homepage
        const visibleDepts = data.departments
          .filter((d: Department) => d.visible !== false)
          .slice(0, 6);
        if (visibleDepts.length > 0) {
          setDepartments(visibleDepts);
        }
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  }

  const features = [
    {
      icon: Truck,
      title: "Envío Gratis",
      description: "En compras superiores a $50.000",
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Protección total en tu compra",
    },
    {
      icon: Zap,
      title: "Envío Rápido",
      description: "Recibí en 24-48hs",
    },
    {
      icon: Headphones,
      title: "Soporte 24/7",
      description: "Te ayudamos cuando lo necesites",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Descubrí las mejores
                <span className="text-primary"> ofertas</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Miles de productos con envío gratis y las mejores marcas del mercado
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate("shop")}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Ver productos
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate("offers")}
                  className="border border-primary text-primary px-8 py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors"
                >
                  Ver ofertas
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop"
                  alt="Hero"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 text-secondary rounded-full mb-3">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium mb-1 text-sm md:text-base">{feature.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Second Hand Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <div className="text-6xl mb-4">🔄</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Second Hand Market
            </h2>
            <p className="text-lg text-orange-100 mb-6 max-w-2xl mx-auto">
              Compra y vende productos de segunda mano. Dale una segunda vida a tus cosas o encuentra gangas increíbles.
            </p>
            <button
              onClick={() => onNavigate("secondhand")}
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-xl inline-flex items-center gap-2"
            >
              Explorar Second Hand
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Departamentos</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {departments.map((dept, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate("departments")}
                className={`${dept.color} p-6 rounded-xl text-center hover:shadow-lg transition-shadow`}
              >
                <div className="text-4xl mb-2">{dept.icon}</div>
                <p className="font-medium text-sm">{dept.name}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Productos destacados</h2>
            <button
              onClick={() => onNavigate("shop")}
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              Ver todos
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Recién llegados</h2>
            <button
              onClick={() => onNavigate("shop")}
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              Ver todos
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <AIRecommendations 
            user={user}
            session={session}
            onAddToCart={onAddToCart}
            limit={6}
          />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Suscribite a nuestro newsletter
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Recibí las mejores ofertas y novedades directamente en tu email
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Suscribirme
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
