import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { EnhancedProductForm } from "./EnhancedProductForm";
import { BatchActionsManager } from "./BatchActionsManager";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  stock: number;
  cost: number;
  prices: any[];
  syncChannels: any;
  images?: string[];
  tags?: string[];
  visible?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function EnhancedProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showBatchActions, setShowBatchActions] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
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
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  async function saveProduct(productData: any) {
    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/products/${editingProduct.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/products`;

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success(
          editingProduct
            ? "Producto actualizado correctamente"
            : "Producto creado correctamente"
        );
        setShowProductForm(false);
        setEditingProduct(null);
        loadProducts();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(`Error: ${error.message}`);
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Producto eliminado");
        loadProducts();
      } else {
        toast.error("Error al eliminar producto");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar producto");
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setShowProductForm(true);
  }

  function handleCancel() {
    setShowProductForm(false);
    setEditingProduct(null);
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  const batchItems = filteredProducts.map((p) => ({
    id: p.id,
    type: "product" as const,
    name: p.name,
    selected: false,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-orange-600" />
            Gestión de Productos Avanzada
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sistema completo con precios múltiples, sincronización y acciones por
            lote
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBatchActions(!showBatchActions)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Acciones por Lote
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showProductForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </h3>
              </div>
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <EnhancedProductForm
                  initialData={editingProduct}
                  onSave={saveProduct}
                  onCancel={handleCancel}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch Actions */}
      {showBatchActions && (
        <BatchActionsManager items={batchItems} onItemsUpdated={loadProducts} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, SKU o código de barras..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Productos</div>
          <div className="text-2xl font-bold text-gray-900">
            {products.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Con Stock</div>
          <div className="text-2xl font-bold text-green-600">
            {products.filter((p) => p.stock > 0).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Sin Stock</div>
          <div className="text-2xl font-bold text-red-600">
            {products.filter((p) => p.stock === 0).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Sincronizados</div>
          <div className="text-2xl font-bold text-orange-600">
            {
              products.filter(
                (p) =>
                  p.syncChannels?.mercadolibre ||
                  p.syncChannels?.facebook ||
                  p.syncChannels?.instagram ||
                  p.syncChannels?.whatsapp
              ).length
            }
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No se encontraron productos</p>
          <p className="text-sm text-gray-500">
            {searchQuery || categoryFilter !== "all"
              ? "Intenta ajustar los filtros"
              : "Crea tu primer producto para comenzar"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-gray-300" />
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  {product.sku && (
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stock</p>
                    <p
                      className={`font-medium ${
                        product.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.stock}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Precio</p>
                    <p className="font-medium text-orange-600">
                      $
                      {product.prices?.[0]?.amount?.toFixed(2) ||
                        product.cost?.toFixed(2) ||
                        "0.00"}
                    </p>
                  </div>
                </div>

                {/* Sync Channels */}
                <div className="flex gap-1">
                  {product.syncChannels?.mercadolibre && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                      ML
                    </span>
                  )}
                  {product.syncChannels?.facebook && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      FB
                    </span>
                  )}
                  {product.syncChannels?.instagram && (
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded">
                      IG
                    </span>
                  )}
                  {product.syncChannels?.whatsapp && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      WA
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
