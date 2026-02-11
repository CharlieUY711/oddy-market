import { Heart, ShoppingCart, Eye } from "lucide-react";
import { motion } from "motion/react";

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

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg shadow-sm border border-border overflow-hidden group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onClick={() => onViewDetails(product)}
        />
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 left-3 bg-secondary text-white px-3 py-1 rounded-full text-sm font-bold">
            -{product.discount}%
          </div>
        )}

        {/* Stock Badge */}
        {product.stock !== undefined && product.stock < 5 && (
          <div className="absolute top-3 right-3 bg-destructive text-white px-3 py-1 rounded-full text-xs font-bold">
            ¡Últimas unidades!
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewDetails(product)}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4" onClick={() => onViewDetails(product)}>
        <p className="text-xs text-secondary font-semibold uppercase mb-1">
          {product.category}
        </p>
        <h3 className="font-medium text-foreground mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < Math.floor(product.rating!)
                      ? "text-primary"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.rating})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-primary">
            ${discountedPrice.toLocaleString()}
          </span>
          {product.discount && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar al carrito
        </button>
      </div>
    </motion.div>
  );
}
