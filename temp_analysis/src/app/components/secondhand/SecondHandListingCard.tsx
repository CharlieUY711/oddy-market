import { motion } from "motion/react";
import { Heart, MapPin, Clock, Eye, MessageCircle } from "lucide-react";
import { useState } from "react";

interface SecondHandListingCardProps {
  listing: any;
  onView: (listing: any) => void;
  onFavorite?: (listing: any) => void;
  isFavorited?: boolean;
  showStatus?: boolean;
}

const CONDITION_LABELS: any = {
  new: "Nuevo",
  "like-new": "Como nuevo",
  good: "Buen estado",
  fair: "Estado aceptable",
  poor: "Para reparar",
};

const CONDITION_COLORS: any = {
  new: "bg-green-100 text-green-800 border-green-200",
  "like-new": "bg-blue-100 text-blue-800 border-blue-200",
  good: "bg-cyan-100 text-cyan-800 border-cyan-200",
  fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
  poor: "bg-orange-100 text-orange-800 border-orange-200",
};

const STATUS_LABELS: any = {
  pending: "⏳ Pendiente de aprobación",
  approved: "✅ Aprobado",
  rejected: "❌ Rechazado",
  sold: "✨ Vendido",
};

const STATUS_COLORS: any = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  sold: "bg-purple-100 text-purple-800 border-purple-300",
};

export function SecondHandListingCard({
  listing,
  onView,
  onFavorite,
  isFavorited = false,
  showStatus = false,
}: SecondHandListingCardProps) {
  const [imageError, setImageError] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);

  const mainImage = listing.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop";

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(listing);
      setFavorited(!favorited);
    }
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `Hace ${days} día${days > 1 ? "s" : ""}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    return "Recién publicado";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={() => onView(listing)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageError ? (
          <img
            src={mainImage}
            alt={listing.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}

        {/* Favorite Button */}
        {onFavorite && (
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${
                favorited ? "fill-red-500 text-red-500" : "text-gray-700"
              }`}
            />
          </button>
        )}

        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
              CONDITION_COLORS[listing.condition] || "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {CONDITION_LABELS[listing.condition] || listing.condition}
          </span>
        </div>

        {/* Status Badge (if shown) */}
        {showStatus && (
          <div className="absolute bottom-3 left-3 right-3">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border-2 text-center ${
                STATUS_COLORS[listing.status] || "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {STATUS_LABELS[listing.status] || listing.status}
            </div>
          </div>
        )}

        {/* Image Counter */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
            📷 {listing.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {listing.title}
        </h3>

        {/* Category */}
        <p className="text-xs text-gray-500 mb-2">{listing.category}</p>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600">
              ${parseFloat(listing.price).toLocaleString()}
            </span>
            {listing.negotiable && (
              <span className="text-xs text-cyan-600 font-medium">
                Negociable
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{listing.location}</span>
        </div>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {listing.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                +{listing.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(listing.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            {listing.viewCount > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{listing.viewCount}</span>
              </div>
            )}
            {listing.favoriteCount > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{listing.favoriteCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Seller Info */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {listing.sellerName?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{listing.sellerName}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
