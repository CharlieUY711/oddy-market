import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Grid3x3,
  List,
  TrendingUp,
  DollarSign,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  Truck,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { SecondHandListingCard } from "./SecondHandListingCard";
import { copyToClipboardWithToast } from "/src/utils/clipboard";

interface SecondHandMarketplaceProps {
  user?: any;
  session?: any;
}

const CATEGORIES = [
  "Todos",
  "Electrónica",
  "Moda y Accesorios",
  "Hogar y Jardín",
  "Deportes y Fitness",
  "Juguetes y Niños",
  "Libros y Música",
  "Vehículos y Accesorios",
  "Herramientas",
  "Belleza y Cuidado Personal",
  "Mascotas",
  "Otros",
];

const CONDITIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "new", label: "Nuevo" },
  { value: "like-new", label: "Como nuevo" },
  { value: "good", label: "Buen estado" },
  { value: "fair", label: "Estado aceptable" },
  { value: "poor", label: "Para reparar" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Más recientes", order: "desc" },
  { value: "price", label: "Precio: menor a mayor", order: "asc" },
  { value: "price", label: "Precio: mayor a menor", order: "desc" },
  { value: "viewCount", label: "Más vistos", order: "desc" },
];

const CONDITION_LABELS: any = {
  new: "Nuevo",
  "like-new": "Como nuevo",
  good: "Buen estado",
  fair: "Estado aceptable",
  poor: "Para reparar",
};

export function SecondHandMarketplace({ user, session }: SecondHandMarketplaceProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadListings();
    if (user) {
      loadFavorites();
    }
  }, [selectedCategory, selectedCondition, sortBy, searchQuery]);

  async function loadListings() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "approved",
        ...(selectedCategory !== "Todos" && { category: selectedCategory }),
        ...(selectedCondition !== "all" && { condition: selectedCondition }),
        ...(searchQuery && { search: searchQuery }),
        sortBy: sortBy.value,
        order: sortBy.order,
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/listings?${params}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error("Error loading listings:", error);
      toast.error("Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    try {
      const accessToken = session?.access_token;
      if (!accessToken) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/favorites`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const favIds = data.listings?.map((l: any) => l.id) || [];
        setFavorites(favIds);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }

  async function toggleFavorite(listing: any) {
    if (!user) {
      toast.error("Debes iniciar sesión para agregar favoritos");
      return;
    }

    try {
      const accessToken = session?.access_token;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/listings/${listing.id}/favorite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.favorited) {
          setFavorites([...favorites, listing.id]);
          toast.success("Agregado a favoritos");
        } else {
          setFavorites(favorites.filter((id) => id !== listing.id));
          toast.success("Eliminado de favoritos");
        }
        loadListings(); // Refresh to update favorite counts
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Error al actualizar favorito");
    }
  }

  function handleViewListing(listing: any) {
    setSelectedListing(listing);
    setCurrentImageIndex(0);
  }

  function handleCloseDetail() {
    setSelectedListing(null);
    setCurrentImageIndex(0);
  }

  function handleNextImage() {
    if (selectedListing?.images) {
      setCurrentImageIndex((prev) =>
        prev === selectedListing.images.length - 1 ? 0 : prev + 1
      );
    }
  }

  function handlePrevImage() {
    if (selectedListing?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedListing.images.length - 1 : prev - 1
      );
    }
  }

  function handleContactSeller() {
    if (!user) {
      toast.error("Debes iniciar sesión para contactar al vendedor");
      return;
    }
    toast.info("Función de mensajería próximamente disponible");
  }

  async function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: selectedListing?.title,
        text: selectedListing?.description,
        url: window.location.href,
      });
    } else {
      await copyToClipboardWithToast(window.location.href, "Enlace copiado al portapapeles");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🔄 Second Hand Market
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              Compra y vende productos de segunda mano de forma segura
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-2">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="flex-1 py-3 outline-none text-gray-800"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden md:inline">Filtros</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{listings.length}</div>
                <div className="text-orange-100 text-sm">Publicaciones</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{CATEGORIES.length - 1}</div>
                <div className="text-orange-100 text-sm">Categorías</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">🔒</div>
                <div className="text-orange-100 text-sm">Compra Segura</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">24h</div>
                <div className="text-orange-100 text-sm">Soporte</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b-2 border-gray-200 overflow-hidden"
          >
            <div className="container mx-auto max-w-6xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estado
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={`${sortBy.value}-${sortBy.order}`}
                    onChange={(e) => {
                      const selected = SORT_OPTIONS.find(
                        (opt) => `${opt.value}-${opt.order}` === e.target.value
                      );
                      if (selected) setSortBy(selected);
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Pills */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {listings.length} producto{listings.length !== 1 ? "s" : ""} encontrado{listings.length !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-orange-500 text-white"
                  : "bg-white border-2 border-gray-200 text-gray-600"
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-orange-500 text-white"
                  : "bg-white border-2 border-gray-200 text-gray-600"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No se encontraron productos</h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros o buscar algo diferente
            </p>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && listings.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {listings.map((listing) => (
              <SecondHandListingCard
                key={listing.id}
                listing={listing}
                onView={handleViewListing}
                onFavorite={toggleFavorite}
                isFavorited={favorites.includes(listing.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && handleCloseDetail()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 h-full max-h-[90vh]">
                {/* Image Gallery */}
                <div className="relative bg-gray-100">
                  <button
                    onClick={handleCloseDetail}
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {selectedListing.images && selectedListing.images.length > 0 ? (
                    <>
                      <img
                        src={selectedListing.images[currentImageIndex]}
                        alt={selectedListing.title}
                        className="w-full h-full object-cover"
                      />

                      {selectedListing.images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {selectedListing.images.map((_: any, index: number) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentImageIndex
                                    ? "bg-white w-6"
                                    : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 overflow-y-auto">
                  <h2 className="text-3xl font-bold mb-4">
                    {selectedListing.title}
                  </h2>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
                      {selectedListing.category}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {CONDITION_LABELS[selectedListing.condition]}
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-4xl font-bold text-orange-600">
                        ${parseFloat(selectedListing.price).toLocaleString()}
                      </span>
                      {selectedListing.negotiable && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                          Negociable
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>{selectedListing.location}</span>
                    </div>

                    {selectedListing.brand && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-5 h-5" />
                        <span>Marca: {selectedListing.brand}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {selectedListing.shippingAvailable && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          Envío disponible
                        </span>
                      )}
                      {selectedListing.meetupAvailable && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Encuentro personal
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Descripción</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedListing.description}
                    </p>
                  </div>

                  {selectedListing.tags && selectedListing.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-2">Etiquetas</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedListing.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-6 mb-6">
                    <h3 className="font-semibold text-lg mb-3">Vendedor</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {selectedListing.sellerName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{selectedListing.sellerName}</p>
                        <p className="text-sm text-gray-500">
                          Publicado{" "}
                          {new Date(selectedListing.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleContactSeller}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Contactar Vendedor
                    </button>
                    <button
                      onClick={() => toggleFavorite(selectedListing)}
                      className="px-6 py-4 border-2 border-orange-500 text-orange-500 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(selectedListing.id)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
