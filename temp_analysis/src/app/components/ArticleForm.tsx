import { useState, useEffect, useRef } from "react";
import {
  Save,
  X,
  Upload,
  Trash2,
  Plus,
  Package,
  DollarSign,
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Globe,
  BarChart3,
  Settings,
  Truck,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface ArticleFormProps {
  article?: any;
  onSave: () => void;
  onCancel: () => void;
}

type ViewMode = "basic" | "intermediate" | "advanced";

export function ArticleForm({ article, onSave, onCancel }: ArticleFormProps) {
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>("basic");
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Vista Básica
    name: "",
    description: "",
    price: 0,
    category: "",
    images: [] as string[],
    
    // Vista Intermedia
    sku: "",
    barcode: "",
    brand: "",
    stock: 0,
    minStock: 0,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    tags: [] as string[],
    discount: 0,
    
    // Vista Avanzada
    cost: 0,
    supplier: "",
    taxRate: 0,
    warranty: "",
    origin: "",
    material: "",
    color: "",
    size: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    customFields: {} as Record<string, any>,
    syncChannels: {
      mercadoLibre: false,
      facebook: false,
      instagram: false,
    },
    shippingInfo: {
      freeShipping: false,
      shippingCost: 0,
      estimatedDays: 0,
    },
  });

  const [newTag, setNewTag] = useState("");
  const textRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  useEffect(() => {
    if (article) {
      setFormData({
        name: article.name || "",
        description: article.description || "",
        price: article.price || 0,
        category: article.category || "",
        images: article.images || [],
        sku: article.sku || "",
        barcode: article.barcode || "",
        brand: article.brand || "",
        stock: article.stock || 0,
        minStock: article.minStock || 0,
        weight: article.weight || 0,
        dimensions: article.dimensions || { length: 0, width: 0, height: 0 },
        tags: article.tags || [],
        discount: article.discount || 0,
        cost: article.cost || 0,
        supplier: article.supplier || "",
        taxRate: article.taxRate || 0,
        warranty: article.warranty || "",
        origin: article.origin || "",
        material: article.material || "",
        color: article.color || "",
        size: article.size || "",
        seoTitle: article.seoTitle || "",
        seoDescription: article.seoDescription || "",
        seoKeywords: article.seoKeywords || "",
        customFields: article.customFields || {},
        syncChannels: article.syncChannels || {
          mercadoLibre: false,
          facebook: false,
          instagram: false,
        },
        shippingInfo: article.shippingInfo || {
          freeShipping: false,
          shippingCost: 0,
          estimatedDays: 0,
        },
      });
    }
  }, [article]);

  // Corrector ortográfico automático
  function enableSpellCheck(fieldName: string) {
    const element = textRefs.current[fieldName];
    if (element) {
      element.spellcheck = true;
      element.lang = "es";
    }
  }

  // Validar y redimensionar imagen a 1200x1200
  async function validateAndResizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1200;
          canvas.height = 1200;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("No se pudo crear el contexto del canvas"));
            return;
          }

          // Calcular dimensiones para cubrir todo el canvas manteniendo aspecto
          const scale = Math.max(1200 / img.width, 1200 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (1200 - scaledWidth) / 2;
          const y = (1200 - scaledHeight) / 2;

          // Fondo blanco
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, 1200, 1200);
          
          // Dibujar imagen centrada
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.onerror = () => reject(new Error("Error al cargar la imagen"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tipo
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} es demasiado grande (máx 5MB)`);
          continue;
        }

        // Redimensionar a 1200x1200
        toast.info(`Redimensionando ${file.name} a 1200x1200...`);
        const resizedDataUrl = await validateAndResizeImage(file);
        
        // Convertir data URL a blob
        const response = await fetch(resizedDataUrl);
        const blob = await response.blob();
        
        // Crear FormData para upload
        const formData = new FormData();
        formData.append("image", blob, file.name);

        // Subir al servidor
        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/images/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          newImages.push(data.url);
          toast.success(`${file.name} subida exitosamente (1200x1200)`);
        } else {
          toast.error(`Error al subir ${file.name}`);
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Error al subir las imágenes");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function addTag() {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  }

  function removeTag(tag: string) {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }

  async function handleSubmit() {
    // Validaciones básicas
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      setCurrentView("basic");
      return;
    }

    if (formData.price <= 0) {
      toast.error("El precio debe ser mayor a 0");
      setCurrentView("basic");
      return;
    }

    if (formData.images.length === 0) {
      toast.error("Debe agregar al menos una imagen");
      setCurrentView("basic");
      return;
    }

    setLoading(true);

    try {
      const url = article
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/articles/${article.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/articles`;

      const response = await fetch(url, {
        method: article ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(article ? "Artículo actualizado" : "Artículo creado");
        onSave();
      } else {
        toast.error("Error al guardar el artículo");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Error al guardar el artículo");
    } finally {
      setLoading(false);
    }
  }

  const views = [
    { id: "basic", name: "Básica", icon: Package, description: "Información esencial" },
    { id: "intermediate", name: "Intermedia", icon: BarChart3, description: "Inventario y logística" },
    { id: "advanced", name: "Avanzada", icon: Settings, description: "SEO y sincronización" },
  ];

  const currentViewIndex = views.findIndex((v) => v.id === currentView);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {article ? "Editar Artículo" : "Nuevo Artículo"}
              </h2>
              <p className="text-muted-foreground mt-1">
                Complete la información en las diferentes vistas
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Tabs */}
          <div className="flex items-center gap-2">
            {views.map((view, index) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;
              const isCompleted = index < currentViewIndex;

              return (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as ViewMode)}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : isCompleted
                      ? "border-green-500 bg-green-50"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isActive
                        ? "bg-primary text-white"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{view.name}</p>
                    <p className="text-xs text-muted-foreground">{view.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Vista Básica */}
            {currentView === "basic" && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Nombre del Artículo *
                    </label>
                    <input
                      ref={(el) => {
                        textRefs.current["name"] = el;
                        if (el) enableSpellCheck("name");
                      }}
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ej: Zapatillas deportivas Nike Air Max"
                      spellCheck
                      lang="es"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Descripción *
                    </label>
                    <textarea
                      ref={(el) => {
                        textRefs.current["description"] = el;
                        if (el) enableSpellCheck("description");
                      }}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Descripción detallada del artículo..."
                      spellCheck
                      lang="es"
                    />
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Precio *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoría *</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="electronics">Electrónica</option>
                      <option value="clothing">Ropa y Accesorios</option>
                      <option value="home">Hogar y Jardín</option>
                      <option value="sports">Deportes</option>
                      <option value="toys">Juguetes</option>
                      <option value="books">Libros</option>
                      <option value="health">Salud y Belleza</option>
                      <option value="food">Alimentos y Bebidas</option>
                    </select>
                  </div>
                </div>

                {/* Imágenes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Imágenes * (1200x1200px)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border-2 border-border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                          1200×1200
                        </div>
                      </div>
                    ))}
                    
                    {/* Upload Button */}
                    <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Redimensionando...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Subir imágenes
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            Se redimensionarán a 1200×1200
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Vista Intermedia */}
            {currentView === "intermediate" && (
              <motion.div
                key="intermediate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, sku: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="SKU-001"
                    />
                  </div>

                  {/* Código de Barras */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Código de Barras
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, barcode: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="123456789012"
                    />
                  </div>

                  {/* Marca */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Marca</label>
                    <input
                      ref={(el) => {
                        textRefs.current["brand"] = el;
                        if (el) enableSpellCheck("brand");
                      }}
                      type="text"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, brand: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nike, Adidas, etc."
                      spellCheck
                      lang="es"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Stock Disponible
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          stock: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {/* Stock Mínimo */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minStock: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          weight: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.0"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Dimensiones */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dimensiones (cm)
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            length: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Largo"
                      step="0.1"
                      min="0"
                    />
                    <input
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            width: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ancho"
                      step="0.1"
                      min="0"
                    />
                    <input
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            height: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Alto"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                {/* Etiquetas */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={(el) => {
                        textRefs.current["newTag"] = el;
                        if (el) enableSpellCheck("newTag");
                      }}
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nueva etiqueta"
                      spellCheck
                      lang="es"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Descuento */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                    step="1"
                    min="0"
                    max="100"
                  />
                </div>
              </motion.div>
            )}

            {/* Vista Avanzada */}
            {currentView === "advanced" && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Costos y Proveedor */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Costo</label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proveedor
                    </label>
                    <input
                      ref={(el) => {
                        textRefs.current["supplier"] = el;
                        if (el) enableSpellCheck("supplier");
                      }}
                      type="text"
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, supplier: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nombre del proveedor"
                      spellCheck
                      lang="es"
                    />
                  </div>
                </div>

                {/* Detalles del Producto */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tasa de Impuesto (%)
                    </label>
                    <input
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          taxRate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Garantía
                    </label>
                    <input
                      ref={(el) => {
                        textRefs.current["warranty"] = el;
                        if (el) enableSpellCheck("warranty");
                      }}
                      type="text"
                      value={formData.warranty}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, warranty: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="12 meses"
                      spellCheck
                      lang="es"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Origen</label>
                    <input
                      ref={(el) => {
                        textRefs.current["origin"] = el;
                        if (el) enableSpellCheck("origin");
                      }}
                      type="text"
                      value={formData.origin}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, origin: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="País de origen"
                      spellCheck
                      lang="es"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Material</label>
                    <input
                      ref={(el) => {
                        textRefs.current["material"] = el;
                        if (el) enableSpellCheck("material");
                      }}
                      type="text"
                      value={formData.material}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, material: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Algodón, cuero, etc."
                      spellCheck
                      lang="es"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input
                      ref={(el) => {
                        textRefs.current["color"] = el;
                        if (el) enableSpellCheck("color");
                      }}
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, color: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Rojo, azul, etc."
                      spellCheck
                      lang="es"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Talle/Tamaño</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, size: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="S, M, L, XL"
                    />
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Optimización SEO
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Título SEO
                    </label>
                    <input
                      ref={(el) => {
                        textRefs.current["seoTitle"] = el;
                        if (el) enableSpellCheck("seoTitle");
                      }}
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Título optimizado para buscadores"
                      spellCheck
                      lang="es"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Descripción SEO
                    </label>
                    <textarea
                      ref={(el) => {
                        textRefs.current["seoDescription"] = el;
                        if (el) enableSpellCheck("seoDescription");
                      }}
                      value={formData.seoDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          seoDescription: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Descripción optimizada para buscadores"
                      spellCheck
                      lang="es"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Palabras Clave SEO
                    </label>
                    <input
                      ref={(el) => {
                        textRefs.current["seoKeywords"] = el;
                        if (el) enableSpellCheck("seoKeywords");
                      }}
                      type="text"
                      value={formData.seoKeywords}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="palabra1, palabra2, palabra3"
                      spellCheck
                      lang="es"
                    />
                  </div>
                </div>

                {/* Sincronización de Canales */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Canales de Venta
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.syncChannels.mercadoLibre}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            syncChannels: {
                              ...prev.syncChannels,
                              mercadoLibre: e.target.checked,
                            },
                          }))
                        }
                        className="w-5 h-5 rounded border-border"
                      />
                      <span>Sincronizar con Mercado Libre</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.syncChannels.facebook}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            syncChannels: {
                              ...prev.syncChannels,
                              facebook: e.target.checked,
                            },
                          }))
                        }
                        className="w-5 h-5 rounded border-border"
                      />
                      <span>Sincronizar con Facebook Marketplace</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.syncChannels.instagram}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            syncChannels: {
                              ...prev.syncChannels,
                              instagram: e.target.checked,
                            },
                          }))
                        }
                        className="w-5 h-5 rounded border-border"
                      />
                      <span>Sincronizar con Instagram Shopping</span>
                    </label>
                  </div>
                </div>

                {/* Información de Envío */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Información de Envío
                  </h3>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.shippingInfo.freeShipping}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shippingInfo: {
                            ...prev.shippingInfo,
                            freeShipping: e.target.checked,
                          },
                        }))
                      }
                      className="w-5 h-5 rounded border-border"
                    />
                    <span>Envío Gratis</span>
                  </label>

                  {!formData.shippingInfo.freeShipping && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Costo de Envío
                      </label>
                      <input
                        type="number"
                        value={formData.shippingInfo.shippingCost}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shippingInfo: {
                              ...prev.shippingInfo,
                              shippingCost: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tiempo Estimado de Entrega (días)
                    </label>
                    <input
                      type="number"
                      value={formData.shippingInfo.estimatedDays}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shippingInfo: {
                            ...prev.shippingInfo,
                            estimatedDays: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const currentIndex = views.findIndex((v) => v.id === currentView);
                if (currentIndex > 0) {
                  setCurrentView(views[currentIndex - 1].id as ViewMode);
                }
              }}
              disabled={currentView === "basic"}
              className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>

            <div className="flex items-center gap-3">
              {currentView !== "advanced" ? (
                <button
                  onClick={() => {
                    const currentIndex = views.findIndex((v) => v.id === currentView);
                    if (currentIndex < views.length - 1) {
                      setCurrentView(views[currentIndex + 1].id as ViewMode);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Siguiente
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Artículo
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
