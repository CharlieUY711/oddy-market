import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface SecondHandListingFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingListing?: any;
}

const CATEGORIES = [
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
  { value: "new", label: "Nuevo (sin usar, con etiquetas)" },
  { value: "like-new", label: "Como nuevo (sin señales de uso)" },
  { value: "good", label: "Buen estado (ligeras señales de uso)" },
  { value: "fair", label: "Estado aceptable (uso visible)" },
  { value: "poor", label: "Para reparar o repuestos" },
];

export function SecondHandListingForm({
  onClose,
  onSuccess,
  editingListing,
}: SecondHandListingFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    price: "",
    brand: "",
    negotiable: true,
    location: "",
    images: [] as string[],
    tags: [] as string[],
    shippingAvailable: true,
    meetupAvailable: true,
  });

  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (editingListing) {
      setFormData({
        title: editingListing.title || "",
        description: editingListing.description || "",
        category: editingListing.category || "",
        condition: editingListing.condition || "",
        price: editingListing.price || "",
        brand: editingListing.brand || "",
        negotiable: editingListing.negotiable !== false,
        location: editingListing.location || "",
        images: editingListing.images || [],
        tags: editingListing.tags || [],
        shippingAvailable: editingListing.shippingAvailable !== false,
        meetupAvailable: editingListing.meetupAvailable !== false,
      });
    }
  }, [editingListing]);

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  function addImage() {
    if (imageUrl.trim() && formData.images.length < 6) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
      }));
      setImageUrl("");
    }
  }

  function removeImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function addTag() {
    if (
      tagInput.trim() &&
      formData.tags.length < 10 &&
      !formData.tags.includes(tagInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  }

  function removeTag(index: number) {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  }

  function validateForm() {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    } else if (formData.title.length < 10) {
      newErrors.title = "El título debe tener al menos 10 caracteres";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    } else if (formData.description.length < 50) {
      newErrors.description = "La descripción debe tener al menos 50 caracteres";
    }

    if (!formData.category) {
      newErrors.category = "Selecciona una categoría";
    }

    if (!formData.condition) {
      newErrors.condition = "Selecciona el estado del producto";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Ingresa un precio válido";
    }

    if (formData.images.length === 0) {
      newErrors.images = "Agrega al menos una imagen";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Ingresa tu ubicación";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      const method = editingListing ? "PUT" : "POST";
      const url = editingListing
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/listings/${editingListing.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/listings`;

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingListing
            ? "Publicación actualizada correctamente"
            : "Publicación creada correctamente. Será revisada por un administrador antes de publicarse."
        );
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al guardar la publicación");
      }
    } catch (error) {
      console.error("Error saving listing:", error);
      toast.error("Error al guardar la publicación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {editingListing ? "Editar" : "Nueva"} Publicación
              </h2>
              <p className="text-orange-100 mt-1">
                Completa todos los datos de tu producto
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Título del producto *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ej: iPhone 13 Pro 256GB Azul Pacífico"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                maxLength={100}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100 caracteres (mínimo 10)
              </p>
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estado del producto *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                    errors.condition ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecciona el estado</option>
                  {CONDITIONS.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.condition}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción detallada *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe el producto en detalle: características, estado, accesorios incluidos, razón de venta, etc."
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 caracteres (mínimo 50)
              </p>
            </div>

            {/* Price & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price}
                  </p>
                )}
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.negotiable}
                    onChange={(e) => handleChange("negotiable", e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span>Precio negociable</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Marca (opcional)
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="Ej: Apple, Samsung, Nike..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Ej: Montevideo, Pocitos"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Delivery Options */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Opciones de entrega
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.shippingAvailable}
                    onChange={(e) =>
                      handleChange("shippingAvailable", e.target.checked)
                    }
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span>Disponible para envío</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.meetupAvailable}
                    onChange={(e) =>
                      handleChange("meetupAvailable", e.target.checked)
                    }
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span>Disponible para encuentro en persona</span>
                </label>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Imágenes * (máximo 6)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL de la imagen"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    disabled={formData.images.length >= 6}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                {errors.images && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.images}
                  </p>
                )}

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs rounded">
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Etiquetas (opcional, máximo 10)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Ej: garantía, caja original, poco uso..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={formData.tags.length >= 10}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="hover:text-cyan-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>📋 Información importante:</strong>
                <br />
                Tu publicación será revisada por un administrador antes de ser
                publicada. Esto puede tomar hasta 24 horas. Te notificaremos por
                email cuando tu publicación sea aprobada o si necesita
                modificaciones.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Guardando..."
                : editingListing
                ? "Actualizar Publicación"
                : "Crear Publicación"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Helper to import from utils
import { projectId } from "/utils/supabase/info";
const accessToken = localStorage.getItem("access_token") || "";
