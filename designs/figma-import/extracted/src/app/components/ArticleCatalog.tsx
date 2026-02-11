import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  Grid3x3,
  List,
  Edit2,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Tag,
  AlertCircle,
  Mic,
  Camera,
  Star,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ArticleForm } from "./ArticleForm";

interface Article {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
  brand?: string;
  images: string[];
  tags?: string[];
}

export function ArticleCatalog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showForm, setShowForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, categoryFilter, articles]);

  async function loadArticles() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/articles`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error("Error loading articles:", error);
      toast.error("Error al cargar los artículos");
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...articles];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.name.toLowerCase().includes(query) ||
          article.description?.toLowerCase().includes(query) ||
          article.sku?.toLowerCase().includes(query) ||
          article.brand?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((article) => article.category === categoryFilter);
    }

    setFilteredArticles(filtered);
  }

  async function deleteArticle(id: string) {
    if (!confirm("¿Eliminar este artículo?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/articles/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Artículo eliminado");
        loadArticles();
      } else {
        toast.error("Error al eliminar el artículo");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Error al eliminar el artículo");
    }
  }

  function startVoiceSearch() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Tu navegador no soporta búsqueda por voz");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Escuchando...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success(`Búsqueda: "${transcript}"`);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      toast.error("Error en el reconocimiento de voz");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  async function searchByImage(file: File) {
    toast.info("Buscando por imagen...");
    
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/ai/search-by-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchQuery(data.description || "");
        toast.success("Búsqueda completada");
      } else {
        toast.error("Error en la búsqueda por imagen");
      }
    } catch (error) {
      console.error("Error searching by image:", error);
      toast.error("Error en la búsqueda por imagen");
    }
  }

  const categories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Artículos</h2>
          <p className="text-muted-foreground mt-1">
            Gestión completa con búsqueda multimodal y sincronización
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedArticle(undefined);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Artículo
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-border rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar artículos por nombre, SKU, marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              spellCheck
              lang="es"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Voice Search */}
          <button
            onClick={startVoiceSearch}
            disabled={isListening}
            className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
              isListening
                ? "border-red-500 bg-red-50 text-red-600 animate-pulse"
                : "border-border hover:border-primary hover:bg-primary/5"
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="hidden sm:inline">
              {isListening ? "Escuchando..." : "Voz"}
            </span>
          </button>

          {/* Image Search */}
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
            <Camera className="w-5 h-5" />
            <span className="hidden sm:inline">Imagen</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) searchByImage(file);
              }}
              className="hidden"
            />
          </label>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 transition-colors ${
                viewMode === "grid" ? "bg-primary text-white" : "bg-white hover:bg-muted"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 transition-colors ${
                viewMode === "list" ? "bg-primary text-white" : "bg-white hover:bg-muted"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Artículos</span>
            <Package className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{articles.length}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Resultados</span>
            <Filter className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl font-bold">{filteredArticles.length}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Stock Bajo</span>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold">
            {articles.filter((a) => a.stock < 10).length}
          </p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Categorías</span>
            <Tag className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{categories.length}</p>
        </div>
      </div>

      {/* Articles Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-border rounded-lg p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No hay artículos</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || categoryFilter !== "all"
              ? "No se encontraron resultados"
              : "Crea tu primer artículo"}
          </p>
          <button
            onClick={() => {
              setSelectedArticle(undefined);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Artículo
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArticles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-square bg-muted relative">
                {article.images?.[0] ? (
                  <img
                    src={article.images[0]}
                    alt={article.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedArticle(article);
                      setShowForm(true);
                    }}
                    className="p-3 bg-white rounded-lg hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Stock Badge */}
                <div className="absolute top-2 right-2 px-3 py-1 bg-white/90 rounded-full text-sm font-medium">
                  Stock: {article.stock}
                </div>

                {/* Low Stock Warning */}
                {article.stock < 10 && (
                  <div className="absolute top-2 left-2 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Bajo
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="font-bold text-lg truncate mb-1">{article.name}</p>
                <p className="text-sm text-muted-foreground truncate mb-3">
                  {article.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ${article.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SKU: {article.sku || "N/A"}
                    </p>
                  </div>

                  {article.brand && (
                    <span className="px-2 py-1 bg-muted rounded text-xs">
                      {article.brand}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 font-medium">Artículo</th>
                <th className="text-left px-6 py-4 font-medium">SKU</th>
                <th className="text-left px-6 py-4 font-medium">Categoría</th>
                <th className="text-left px-6 py-4 font-medium">Precio</th>
                <th className="text-left px-6 py-4 font-medium">Stock</th>
                <th className="text-right px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article, index) => (
                <tr
                  key={article.id}
                  className={`${
                    index !== filteredArticles.length - 1 ? "border-b border-border" : ""
                  } hover:bg-muted/30 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {article.images?.[0] ? (
                          <img
                            src={article.images[0]}
                            alt={article.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{article.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {article.brand || "Sin marca"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{article.sku || "N/A"}</td>
                  <td className="px-6 py-4 text-sm">{article.category || "N/A"}</td>
                  <td className="px-6 py-4 font-bold text-primary">
                    ${article.price?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        article.stock < 10
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {article.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedArticle(article);
                          setShowForm(true);
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteArticle(article.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ArticleForm
          article={selectedArticle}
          onSave={() => {
            setShowForm(false);
            loadArticles();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
