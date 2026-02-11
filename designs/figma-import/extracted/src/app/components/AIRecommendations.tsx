import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Eye, ShoppingCart, Heart } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { motion } from "motion/react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  discount?: number;
  aiScore?: number;
  aiReason?: string;
}

interface AIRecommendationsProps {
  user?: any;
  session?: any;
  onAddToCart?: (product: Product) => void;
  currentProductId?: string;
  limit?: number;
}

export function AIRecommendations({ 
  user, 
  session, 
  onAddToCart,
  currentProductId,
  limit = 6 
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState<string>("personalized");

  useEffect(() => {
    fetchRecommendations();
  }, [user, currentProductId, recommendationType]);

  async function fetchRecommendations() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/ai/recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            currentProductId,
            type: recommendationType,
            limit,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  }

  const types = [
    { id: "personalized", label: "Para Ti", icon: Sparkles },
    { id: "trending", label: "Tendencias", icon: TrendingUp },
    { id: "similar", label: "Similares", icon: Eye },
  ];

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold">Cargando recomendaciones...</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted rounded-lg animate-pulse">
              <div className="aspect-square bg-muted-foreground/20" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded" />
                <div className="h-6 bg-muted-foreground/20 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Recomendado por IA</h2>
            <p className="text-sm text-muted-foreground">
              Seleccionados especialmente para ti
            </p>
          </div>
        </div>

        {/* Type Selector */}
        <div className="hidden md:flex gap-2">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setRecommendationType(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                recommendationType === type.id
                  ? "bg-primary text-white"
                  : "bg-muted hover:bg-muted-foreground/10"
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Type Selector */}
      <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-2">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setRecommendationType(type.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              recommendationType === type.id
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted-foreground/10"
            }`}
          >
            <type.icon className="w-4 h-4" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {recommendations.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all group"
          >
            {/* AI Badge */}
            {product.aiScore && product.aiScore > 0.8 && (
              <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {Math.round(product.aiScore * 100)}% match
              </div>
            )}

            {/* Discount Badge */}
            {product.discount && (
              <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{product.discount}%
              </div>
            )}

            {/* Image */}
            <div className="relative aspect-square bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Quick Actions */}
              <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 bg-white text-primary px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3" />
                  Ver
                </button>
                <button className="bg-white text-primary p-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
              <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                {product.name}
              </h3>

              {/* AI Reason */}
              {product.aiReason && (
                <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700 flex items-start gap-1">
                  <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{product.aiReason}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  {product.discount ? (
                    <div>
                      <p className="text-xs text-muted-foreground line-through">
                        ${product.price.toLocaleString()}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        $
                        {(
                          product.price *
                          (1 - product.discount / 100)
                        ).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </p>
                  )}
                </div>

                {onAddToCart && (
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating!)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({product.rating.toFixed(1)})
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Learn More */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium text-purple-900">
              ¿Cómo funciona nuestra IA?
            </p>
            <p className="text-sm text-purple-700 mt-1">
              Analizamos tu historial de navegación, compras anteriores y preferencias 
              para recomendarte productos que realmente te van a gustar. Mientras más uses 
              ODDY Market, mejores serán nuestras recomendaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
