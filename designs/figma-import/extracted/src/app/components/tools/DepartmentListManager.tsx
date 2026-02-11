import { useState, useEffect } from "react";
import {
  Store,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Upload,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface Department {
  id: string;
  name: string;
  icon: string;
  visible?: boolean;
  image?: string;
  ageRange?: string;
  order?: number;
}

interface EditModalProps {
  department: Department;
  onSave: (updated: Department) => void;
  onClose: () => void;
}

function EditModal({ department, onSave, onClose }: EditModalProps) {
  const [formData, setFormData] = useState(department);
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "make-0dd48dc4-departments");
      formData.append("path", `${department.id}/${Date.now()}-${file.name}`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/upload`,
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
        setFormData({ ...formData, image: data.url });
        toast.success("Imagen subida correctamente");
      } else {
        toast.error("Error al subir imagen");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Editar Departamento</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium mb-1">Icono (emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
              placeholder="📦"
            />
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium mb-1">Rango de Edad</label>
            <select
              value={formData.ageRange || "todas"}
              onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            >
              <option value="todas">Todas las edades</option>
              <option value="niños">Niños (0-12 años)</option>
              <option value="adolescentes">Adolescentes (13-17 años)</option>
              <option value="adultos">Adultos (18-64 años)</option>
              <option value="tercera-edad">Tercera edad (65+ años)</option>
            </select>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Imagen</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.image || ""}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="flex-1 px-3 py-2 border border-border rounded-lg"
                placeholder="URL de la imagen"
              />
              <label className="px-4 py-2 bg-secondary text-white rounded-lg cursor-pointer hover:bg-secondary/90 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {uploading ? "..." : "Subir"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {formData.image && (
              <div className="mt-2">
                <ImageWithFallback
                  src={formData.image}
                  alt={formData.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function DepartmentListManager({ onClose }: { onClose: () => void }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDept, setEditingDept] = useState<Department | null>(null);

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
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
      toast.error("Error al cargar departamentos");
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisibility(dept: Department) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${dept.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ ...dept, visible: !dept.visible }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepartments(
          departments.map((d) => (d.id === dept.id ? data.department : d))
        );
        toast.success(
          data.department.visible
            ? "Departamento visible"
            : "Departamento oculto"
        );
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Error al cambiar visibilidad");
    }
  }

  async function updateAgeRange(dept: Department, ageRange: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${dept.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ ...dept, ageRange }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepartments(
          departments.map((d) => (d.id === dept.id ? data.department : d))
        );
        toast.success("Rango de edad actualizado");
      }
    } catch (error) {
      console.error("Error updating age range:", error);
      toast.error("Error al actualizar rango de edad");
    }
  }

  async function handleSaveEdit(updated: Department) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${updated.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updated),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepartments(
          departments.map((d) => (d.id === updated.id ? data.department : d))
        );
        toast.success("Departamento actualizado");
        setEditingDept(null);
      }
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error("Error al actualizar departamento");
    }
  }

  async function handleDelete(dept: Department) {
    // Check for associated products
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${dept.id}/check-products`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.hasProducts) {
          toast.error(
            `No se puede eliminar. Este departamento tiene ${data.count} producto(s) asociado(s)`
          );
          return;
        }
      }

      // Confirm deletion
      if (
        !confirm(
          `¿Estás seguro de eliminar el departamento "${dept.name}"? Esta acción no se puede deshacer.`
        )
      ) {
        return;
      }

      // Delete
      const deleteResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${dept.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (deleteResponse.ok) {
        setDepartments(departments.filter((d) => d.id !== dept.id));
        toast.success("Departamento eliminado");
      } else {
        toast.error("Error al eliminar departamento");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Error al eliminar departamento");
    }
  }

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAgeRangeLabel = (range?: string) => {
    const labels: Record<string, string> = {
      todas: "Todas",
      niños: "Niños",
      adolescentes: "Adolescentes",
      adultos: "Adultos",
      "tercera-edad": "Tercera edad",
    };
    return labels[range || "todas"] || "Todas";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            Gestión de Departamentos
          </h2>
          <p className="text-muted-foreground">Lista simple de departamentos</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Volver
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar departamentos..."
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg"
        />
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Información importante:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              El checkbox controla la visibilidad del departamento en el sitio
            </li>
            <li>Solo se pueden eliminar departamentos sin productos asociados</li>
            <li>
              Los cambios de rango de edad se guardan automáticamente
            </li>
          </ul>
        </div>
      </div>

      {/* Department List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-12">
                    Visible
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-16">
                    Icono
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-40">
                    Rango de Edad
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "No se encontraron departamentos"
                          : "No hay departamentos"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <tr
                      key={dept.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Visibility Checkbox */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleVisibility(dept)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            dept.visible
                              ? "bg-green-500 border-green-500"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {dept.visible && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </td>

                      {/* Icon */}
                      <td className="px-4 py-3">
                        <span className="text-2xl">{dept.icon}</span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {dept.image && (
                            <ImageWithFallback
                              src={dept.image}
                              alt={dept.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{dept.name}</span>
                        </div>
                      </td>

                      {/* Age Range */}
                      <td className="px-4 py-3">
                        <select
                          value={dept.ageRange || "todas"}
                          onChange={(e) => updateAgeRange(dept, e.target.value)}
                          className="w-full px-2 py-1 border border-border rounded text-sm"
                        >
                          <option value="todas">Todas</option>
                          <option value="niños">Niños</option>
                          <option value="adolescentes">Adolescentes</option>
                          <option value="adultos">Adultos</option>
                          <option value="tercera-edad">Tercera edad</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingDept(dept)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dept)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingDept && (
          <EditModal
            department={editingDept}
            onSave={handleSaveEdit}
            onClose={() => setEditingDept(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
