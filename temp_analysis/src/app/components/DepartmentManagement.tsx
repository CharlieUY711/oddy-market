import { useState, useEffect } from "react";
import {
  Store,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Grid,
  List,
  Search,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  Check,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Subcategory {
  id: string;
  name: string;
  image?: string;
  visible?: boolean;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
  expanded?: boolean;
  image?: string;
  visible?: boolean;
}

interface Department {
  id: string;
  name: string;
  icon: string;
  categories: Category[];
  expanded?: boolean;
  visible?: boolean;
  order?: number;
  image?: string;
  isAdultContent?: boolean;
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    icon: "📦",
    categories: [] as Category[],
    image: "",
    visible: true,
    isAdultContent: false,
  });

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
        if (data.departments && data.departments.length > 0) {
          setDepartments(data.departments);
        } else {
          setDepartments(initialDepartments);
          // Save initial departments to backend
          await saveInitialDepartments();
        }
      } else {
        setDepartments(initialDepartments);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
      setDepartments(initialDepartments);
    }
  }

  async function saveInitialDepartments() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ departments: initialDepartments }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`Initialized ${data.count} departments`);
      }
    } catch (error) {
      console.error("Error saving initial departments:", error);
    }
  }

  async function resetToFullDepartmentList() {
    if (!confirm("¿Estás seguro de reiniciar a la lista completa de 18 departamentos? Esto no eliminará los existentes, solo agregará los faltantes.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ departments: initialDepartments }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`✅ Se inicializaron ${data.count} departamentos completos`);
        loadDepartments();
      } else {
        toast.error("Error al reiniciar departamentos");
      }
    } catch (error) {
      console.error("Error resetting departments:", error);
      toast.error("Error al reiniciar departamentos");
    } finally {
      setLoading(false);
    }
  }

  async function saveDepartment() {
    if (!formData.name) {
      toast.error("El nombre es requerido");
      return;
    }

    setLoading(true);
    try {
      const departmentData = {
        ...formData,
        order: departments.length,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(departmentData),
        }
      );

      if (response.ok) {
        toast.success("Departamento guardado exitosamente");
        loadDepartments();
        setShowAddModal(false);
        resetForm();
      } else {
        toast.error("Error al guardar departamento");
      }
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("Error al guardar departamento");
    } finally {
      setLoading(false);
    }
  }

  async function toggleDepartmentVisibility(id: string) {
    const dept = departments.find((d) => d.id === id);
    if (!dept) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ ...dept, visible: !dept.visible }),
        }
      );

      setDepartments(
        departments.map((d) =>
          d.id === id ? { ...d, visible: !d.visible } : d
        )
      );
      toast.success(
        dept.visible ? "Departamento ocultado en carga de productos" : "Departamento visible en carga de productos"
      );
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Error al cambiar visibilidad");
    }
  }

  async function toggleCategoryVisibility(deptId: string, catId: string) {
    const dept = departments.find((d) => d.id === deptId);
    if (!dept) return;

    const updatedDept = {
      ...dept,
      categories: dept.categories.map((c) =>
        c.id === catId ? { ...c, visible: !c.visible } : c
      ),
    };

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${deptId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updatedDept),
        }
      );

      setDepartments(
        departments.map((d) => (d.id === deptId ? updatedDept : d))
      );
      toast.success("Visibilidad de categoría actualizada");
    } catch (error) {
      console.error("Error toggling category visibility:", error);
      toast.error("Error al cambiar visibilidad");
    }
  }

  async function toggleSubcategoryVisibility(
    deptId: string,
    catId: string,
    subId: string
  ) {
    const dept = departments.find((d) => d.id === deptId);
    if (!dept) return;

    const updatedDept = {
      ...dept,
      categories: dept.categories.map((c) =>
        c.id === catId
          ? {
              ...c,
              subcategories: c.subcategories.map((s) =>
                s.id === subId ? { ...s, visible: !s.visible } : s
              ),
            }
          : c
      ),
    };

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${deptId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updatedDept),
        }
      );

      setDepartments(
        departments.map((d) => (d.id === deptId ? updatedDept : d))
      );
      toast.success("Visibilidad de subcategoría actualizada");
    } catch (error) {
      console.error("Error toggling subcategory visibility:", error);
      toast.error("Error al cambiar visibilidad");
    }
  }

  async function uploadImage(file: File, type: "department" | "category" | "subcategory", id: string) {
    setUploadingImage(id);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/images/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formDataUpload,
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Imagen subida exitosamente");
        return data.url;
      } else {
        toast.error("Error al subir imagen");
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir imagen");
      return null;
    } finally {
      setUploadingImage(null);
    }
  }

  async function handleDepartmentImageUpload(deptId: string, file: File) {
    const imageUrl = await uploadImage(file, "department", deptId);
    if (imageUrl) {
      const dept = departments.find((d) => d.id === deptId);
      if (dept) {
        const updatedDept = { ...dept, image: imageUrl };
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${deptId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(updatedDept),
          }
        );
        setDepartments(
          departments.map((d) => (d.id === deptId ? updatedDept : d))
        );
      }
    }
  }

  async function deleteDepartment(id: string) {
    if (!confirm("¿Estás seguro de eliminar este departamento?")) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      setDepartments(departments.filter((d) => d.id !== id));
      toast.success("Departamento eliminado");
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Error al eliminar departamento");
    }
  }

  function toggleDepartmentExpand(id: string) {
    setDepartments(
      departments.map((d) =>
        d.id === id ? { ...d, expanded: !d.expanded } : d
      )
    );
  }

  function toggleCategoryExpand(deptId: string, catId: string) {
    setDepartments(
      departments.map((d) =>
        d.id === deptId
          ? {
              ...d,
              categories: d.categories.map((c) =>
                c.id === catId ? { ...c, expanded: !c.expanded } : c
              ),
            }
          : d
      )
    );
  }

  function addCategory() {
    setFormData({
      ...formData,
      categories: [
        ...formData.categories,
        { id: crypto.randomUUID(), name: "", subcategories: [], visible: true },
      ],
    });
  }

  function addSubcategory(categoryId: string) {
    setFormData({
      ...formData,
      categories: formData.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: [
                ...c.subcategories,
                { id: crypto.randomUUID(), name: "", visible: true },
              ],
            }
          : c
      ),
    });
  }

  function updateCategory(categoryId: string, name: string) {
    setFormData({
      ...formData,
      categories: formData.categories.map((c) =>
        c.id === categoryId ? { ...c, name } : c
      ),
    });
  }

  function updateSubcategory(
    categoryId: string,
    subcategoryId: string,
    name: string
  ) {
    setFormData({
      ...formData,
      categories: formData.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.map((s) =>
                s.id === subcategoryId ? { ...s, name } : s
              ),
            }
          : c
      ),
    });
  }

  function removeCategory(categoryId: string) {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c.id !== categoryId),
    });
  }

  function removeSubcategory(categoryId: string, subcategoryId: string) {
    setFormData({
      ...formData,
      categories: formData.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.filter(
                (s) => s.id !== subcategoryId
              ),
            }
          : c
      ),
    });
  }

  function resetForm() {
    setFormData({
      name: "",
      icon: "📦",
      categories: [],
      image: "",
      visible: true,
    });
  }

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: departments.length,
    visible: departments.filter((d) => d.visible !== false).length,
    categories: departments.reduce((sum, d) => sum + d.categories.length, 0),
    subcategories: departments.reduce(
      (sum, d) =>
        sum +
        d.categories.reduce((catSum, c) => catSum + c.subcategories.length, 0),
      0
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Store className="w-8 h-8 text-primary" />
          Gestión de Departamentos
        </h2>
        <p className="text-muted-foreground mt-1">
          Organiza tu tienda con departamentos, categorías y subcategorías. Controla su visibilidad en la carga de productos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Departamentos</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="text-2xl font-bold text-secondary">{stats.visible}</div>
          <div className="text-sm text-muted-foreground">Visibles</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="text-2xl font-bold text-green-600">{stats.categories}</div>
          <div className="text-sm text-muted-foreground">Categorías</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="text-2xl font-bold text-purple-600">
            {stats.subcategories}
          </div>
          <div className="text-sm text-muted-foreground">Subcategorías</div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar departamentos..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {departments.length < 18 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Solo hay {departments.length} departamentos.</span>
              <span>La lista completa incluye 18 departamentos con 130+ categorías.</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {departments.length < 18 && (
            <button
              onClick={resetToFullDepartmentList}
              disabled={loading}
              className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors text-sm disabled:opacity-50"
              title="Restaurar lista completa de 18 departamentos"
            >
              <Store className="w-4 h-4" />
              Restaurar 18 Departamentos
            </button>
          )}
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg border transition-colors ${
              viewMode === "list"
                ? "bg-primary text-white border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg border transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-white border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Departamento
          </button>
        </div>
      </div>

      {/* Departments List */}
      <div
        className={
          viewMode === "grid"
            ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        {filteredDepartments.map((dept) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg border border-border overflow-hidden"
          >
            {/* Department Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleDepartmentExpand(dept.id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    {dept.expanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <span className="text-2xl">{dept.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dept.categories.length} categorías
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDepartmentVisibility(dept.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      dept.visible !== false
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                    title={dept.visible !== false ? "Visible en carga de productos" : "Oculto en carga de productos"}
                  >
                    {dept.visible !== false ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteDepartment(dept.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Department Image */}
              <div className="relative">
                {dept.image ? (
                  <div className="relative group">
                    <ImageWithFallback
                      src={dept.image}
                      alt={dept.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-lg">
                      <Upload className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDepartmentImageUpload(dept.id, file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {uploadingImage === dept.id ? "Subiendo..." : "Subir imagen"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDepartmentImageUpload(dept.id, file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Categories */}
            <AnimatePresence>
              {dept.expanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-2 bg-muted/30">
                    {dept.categories.map((cat) => (
                      <div key={cat.id} className="bg-white rounded-lg border border-border">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <button
                              onClick={() => toggleCategoryExpand(dept.id, cat.id)}
                              className="flex items-center gap-2 flex-1 text-left"
                            >
                              {cat.expanded ? (
                                <ChevronDown className="w-4 h-4 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                              )}
                              <span className="font-medium">{cat.name}</span>
                              <span className="text-sm text-muted-foreground">
                                ({cat.subcategories.length})
                              </span>
                            </button>
                            <button
                              onClick={() => toggleCategoryVisibility(dept.id, cat.id)}
                              className={`p-1 rounded transition-colors ${
                                cat.visible !== false
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-gray-400 hover:bg-gray-50"
                              }`}
                              title={cat.visible !== false ? "Visible" : "Oculto"}
                            >
                              {cat.visible !== false ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Category Image Preview */}
                          {cat.image && (
                            <ImageWithFallback
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                          )}
                        </div>

                        {/* Subcategories */}
                        <AnimatePresence>
                          {cat.expanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden border-t border-border"
                            >
                              <div className="p-3 pl-10 space-y-1 bg-muted/20">
                                {cat.subcategories.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="flex items-center justify-between text-sm py-1"
                                  >
                                    <span className="text-muted-foreground">• {sub.name}</span>
                                    <button
                                      onClick={() =>
                                        toggleSubcategoryVisibility(dept.id, cat.id, sub.id)
                                      }
                                      className={`p-1 rounded transition-colors ${
                                        sub.visible !== false
                                          ? "text-green-600 hover:bg-green-50"
                                          : "text-gray-400 hover:bg-gray-50"
                                      }`}
                                    >
                                      {sub.visible !== false ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <X className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Add Department Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">Nuevo Departamento</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ej: Tecnología"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ícono (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-2xl text-center"
                      placeholder="📦"
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <input
                    type="checkbox"
                    id="dept-visible"
                    checked={formData.visible}
                    onChange={(e) =>
                      setFormData({ ...formData, visible: e.target.checked })
                    }
                    className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary rounded"
                  />
                  <label htmlFor="dept-visible" className="font-medium">
                    Visible en carga de productos
                  </label>
                </div>

                {/* Adult Content Toggle */}
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="dept-adult"
                    checked={formData.isAdultContent}
                    onChange={(e) =>
                      setFormData({ ...formData, isAdultContent: e.target.checked })
                    }
                    className="w-5 h-5 text-orange-600 focus:ring-2 focus:ring-orange-500 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="dept-adult" className="font-medium flex items-center gap-2">
                      <span className="text-xl">🔞</span>
                      Contenido para Adultos (+18)
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requiere verificación de edad para acceder y verificación de identidad para comprar
                    </p>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Categorías</h3>
                    <button
                      onClick={addCategory}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Categoría
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.categories.map((category) => (
                      <div
                        key={category.id}
                        className="border border-border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) =>
                              updateCategory(category.id, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Nombre de la categoría"
                          />
                          <button
                            onClick={() => addSubcategory(category.id)}
                            className="px-3 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors whitespace-nowrap"
                          >
                            + Subcat
                          </button>
                          <button
                            onClick={() => removeCategory(category.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subcategories */}
                        {category.subcategories.length > 0 && (
                          <div className="pl-4 space-y-2 border-l-2 border-muted">
                            {category.subcategories.map((sub) => (
                              <div key={sub.id} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={sub.name}
                                  onChange={(e) =>
                                    updateSubcategory(
                                      category.id,
                                      sub.id,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                  placeholder="Subcategoría"
                                />
                                <button
                                  onClick={() =>
                                    removeSubcategory(category.id, sub.id)
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveDepartment}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "Guardando..." : "Guardar Departamento"}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 border border-border py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Initial departments data - LISTA COMPLETA para tienda departamental
const initialDepartments: Department[] = [
  {
    id: "1",
    name: "Alimentos y Bebidas",
    icon: "🍕",
    visible: true,
    order: 1,
    categories: [
      {
        id: "1-1",
        name: "Despensa",
        visible: true,
        subcategories: [
          { id: "1-1-1", name: "Pastas, arroces y legumbres", visible: true },
          { id: "1-1-2", name: "Aceites, condimentos y salsas", visible: true },
          { id: "1-1-3", name: "Conservas y enlatados", visible: true },
          { id: "1-1-4", name: "Harinas y repostería", visible: true },
          { id: "1-1-5", name: "Cereales y granolas", visible: true },
        ],
      },
      {
        id: "1-2",
        name: "Snacks y Dulces",
        visible: true,
        subcategories: [
          { id: "1-2-1", name: "Chocolates", visible: true },
          { id: "1-2-2", name: "Galletas y alfajores", visible: true },
          { id: "1-2-3", name: "Chips y snacks salados", visible: true },
          { id: "1-2-4", name: "Golosinas", visible: true },
        ],
      },
      {
        id: "1-3",
        name: "Bebidas",
        visible: true,
        subcategories: [
          { id: "1-3-1", name: "Gaseosas y refrescos", visible: true },
          { id: "1-3-2", name: "Jugos y néctares", visible: true },
          { id: "1-3-3", name: "Agua mineral", visible: true },
          { id: "1-3-4", name: "Bebidas energéticas", visible: true },
          { id: "1-3-5", name: "Cerveza y vinos", visible: true },
          { id: "1-3-6", name: "Licores", visible: true },
        ],
      },
      { id: "1-4", name: "Productos frescos", visible: true, subcategories: [] },
      { id: "1-5", name: "Congelados", visible: true, subcategories: [] },
      { id: "1-6", name: "Orgánicos y saludables", visible: true, subcategories: [] },
      { id: "1-7", name: "Lácteos", visible: true, subcategories: [] },
      { id: "1-8", name: "Carnes y embutidos", visible: true, subcategories: [] },
      { id: "1-9", name: "Panadería y pastelería", visible: true, subcategories: [] },
    ],
  },
  {
    id: "2",
    name: "Higiene y Cuidado Personal",
    icon: "🧴",
    visible: true,
    order: 2,
    categories: [
      { id: "2-1", name: "Higiene corporal", visible: true, subcategories: [] },
      { id: "2-2", name: "Higiene dental", visible: true, subcategories: [] },
      { id: "2-3", name: "Cuidado capilar", visible: true, subcategories: [] },
      { id: "2-4", name: "Cuidado de la piel", visible: true, subcategories: [] },
      { id: "2-5", name: "Afeitado", visible: true, subcategories: [] },
      { id: "2-6", name: "Higiene femenina", visible: true, subcategories: [] },
      { id: "2-7", name: "Cuidado masculino", visible: true, subcategories: [] },
      { id: "2-8", name: "Protección solar", visible: true, subcategories: [] },
      { id: "2-9", name: "Maquillaje y cosméticos", visible: true, subcategories: [] },
      { id: "2-10", name: "Perfumería", visible: true, subcategories: [] },
    ],
  },
  {
    id: "3",
    name: "Tecnología",
    icon: "💻",
    visible: true,
    order: 3,
    categories: [
      { id: "3-1", name: "Celulares y accesorios", visible: true, subcategories: [] },
      {
        id: "3-2",
        name: "Computación",
        visible: true,
        subcategories: [
          { id: "3-2-1", name: "Laptops", visible: true },
          { id: "3-2-2", name: "PCs de escritorio", visible: true },
          { id: "3-2-3", name: "Tablets", visible: true },
          { id: "3-2-4", name: "Monitores", visible: true },
          { id: "3-2-5", name: "Teclados y Mouse", visible: true },
          { id: "3-2-6", name: "Almacenamiento", visible: true },
        ],
      },
      { id: "3-3", name: "Audio y video", visible: true, subcategories: [] },
      { id: "3-4", name: "Gaming", visible: true, subcategories: [] },
      { id: "3-5", name: "Smart Home", visible: true, subcategories: [] },
      { id: "3-6", name: "Fotografía y cámaras", visible: true, subcategories: [] },
      { id: "3-7", name: "Drones", visible: true, subcategories: [] },
      { id: "3-8", name: "Wearables", visible: true, subcategories: [] },
    ],
  },
  {
    id: "4",
    name: "Moda y Accesorios",
    icon: "👜",
    visible: true,
    order: 4,
    categories: [
      { id: "4-1", name: "Carteras y bolsos", visible: true, subcategories: [] },
      { id: "4-2", name: "Mochilas", visible: true, subcategories: [] },
      { id: "4-3", name: "Billeteras", visible: true, subcategories: [] },
      { id: "4-4", name: "Relojes", visible: true, subcategories: [] },
      { id: "4-5", name: "Joyería", visible: true, subcategories: [] },
      { id: "4-6", name: "Gafas y lentes", visible: true, subcategories: [] },
      { id: "4-7", name: "Cinturones", visible: true, subcategories: [] },
      { id: "4-8", name: "Bufandas y pañuelos", visible: true, subcategories: [] },
      { id: "4-9", name: "Sombreros y gorras", visible: true, subcategories: [] },
    ],
  },
  {
    id: "5",
    name: "Hogar y Decoración",
    icon: "🏠",
    visible: true,
    order: 5,
    categories: [
      { id: "5-1", name: "Cocina y menaje", visible: true, subcategories: [] },
      { id: "5-2", name: "Organización", visible: true, subcategories: [] },
      { id: "5-3", name: "Decoración", visible: true, subcategories: [] },
      { id: "5-4", name: "Textiles de hogar", visible: true, subcategories: [] },
      { id: "5-5", name: "Baño", visible: true, subcategories: [] },
      { id: "5-6", name: "Iluminación", visible: true, subcategories: [] },
      { id: "5-7", name: "Muebles", visible: true, subcategories: [] },
      { id: "5-8", name: "Jardín y exterior", visible: true, subcategories: [] },
    ],
  },
  {
    id: "6",
    name: "Herramientas y Mejoras",
    icon: "🔧",
    visible: true,
    order: 6,
    categories: [
      { id: "6-1", name: "Herramientas manuales", visible: true, subcategories: [] },
      { id: "6-2", name: "Herramientas eléctricas", visible: true, subcategories: [] },
      { id: "6-3", name: "Ferretería", visible: true, subcategories: [] },
      { id: "6-4", name: "Seguridad y protección", visible: true, subcategories: [] },
      { id: "6-5", name: "Jardinería", visible: true, subcategories: [] },
      { id: "6-6", name: "Pinturas y accesorios", visible: true, subcategories: [] },
      { id: "6-7", name: "Electricidad", visible: true, subcategories: [] },
      { id: "6-8", name: "Plomería", visible: true, subcategories: [] },
    ],
  },
  {
    id: "7",
    name: "Electrodomésticos",
    icon: "🔌",
    visible: true,
    order: 7,
    categories: [
      { id: "7-1", name: "Línea blanca", visible: true, subcategories: [] },
      { id: "7-2", name: "Pequeños electrodomésticos", visible: true, subcategories: [] },
      { id: "7-3", name: "Climatización", visible: true, subcategories: [] },
      { id: "7-4", name: "Cuidado de la ropa", visible: true, subcategories: [] },
      { id: "7-5", name: "Aspiradoras y limpieza", visible: true, subcategories: [] },
      { id: "7-6", name: "Ventiladores", visible: true, subcategories: [] },
    ],
  },
  {
    id: "8",
    name: "Indumentaria",
    icon: "👗",
    visible: true,
    order: 8,
    categories: [
      { id: "8-1", name: "Hombre", visible: true, subcategories: [] },
      { id: "8-2", name: "Mujer", visible: true, subcategories: [] },
      { id: "8-3", name: "Niños", visible: true, subcategories: [] },
      { id: "8-4", name: "Calzado", visible: true, subcategories: [] },
      { id: "8-5", name: "Ropa interior y pijamas", visible: true, subcategories: [] },
      { id: "8-6", name: "Deportiva", visible: true, subcategories: [] },
      { id: "8-7", name: "Trajes y vestimenta formal", visible: true, subcategories: [] },
    ],
  },
  {
    id: "9",
    name: "Bebés y Niños",
    icon: "👶",
    visible: true,
    order: 9,
    categories: [
      { id: "9-1", name: "Maternidad", visible: true, subcategories: [] },
      { id: "9-2", name: "Alimentación infantil", visible: true, subcategories: [] },
      { id: "9-3", name: "Higiene y cuidado", visible: true, subcategories: [] },
      { id: "9-4", name: "Juguetes", visible: true, subcategories: [] },
      { id: "9-5", name: "Ropa de bebé", visible: true, subcategories: [] },
      { id: "9-6", name: "Mobiliario infantil", visible: true, subcategories: [] },
      { id: "9-7", name: "Paseo y viaje", visible: true, subcategories: [] },
      { id: "9-8", name: "Seguridad infantil", visible: true, subcategories: [] },
    ],
  },
  {
    id: "10",
    name: "Deportes y Fitness",
    icon: "⚽",
    visible: true,
    order: 10,
    categories: [
      { id: "10-1", name: "Fitness y gimnasio", visible: true, subcategories: [] },
      { id: "10-2", name: "Fútbol", visible: true, subcategories: [] },
      { id: "10-3", name: "Running", visible: true, subcategories: [] },
      { id: "10-4", name: "Ciclismo", visible: true, subcategories: [] },
      { id: "10-5", name: "Natación", visible: true, subcategories: [] },
      { id: "10-6", name: "Deportes de raqueta", visible: true, subcategories: [] },
      { id: "10-7", name: "Campamento y aventura", visible: true, subcategories: [] },
      { id: "10-8", name: "Suplementos deportivos", visible: true, subcategories: [] },
    ],
  },
  {
    id: "11",
    name: "Automotriz",
    icon: "🚗",
    visible: true,
    order: 11,
    categories: [
      { id: "11-1", name: "Accesorios para auto", visible: true, subcategories: [] },
      { id: "11-2", name: "Audio y multimedia", visible: true, subcategories: [] },
      { id: "11-3", name: "Herramientas automotrices", visible: true, subcategories: [] },
      { id: "11-4", name: "Cuidado y limpieza", visible: true, subcategories: [] },
      { id: "11-5", name: "Seguridad vial", visible: true, subcategories: [] },
      { id: "11-6", name: "Repuestos", visible: true, subcategories: [] },
    ],
  },
  {
    id: "12",
    name: "Oficina y Librería",
    icon: "📚",
    visible: true,
    order: 12,
    categories: [
      { id: "12-1", name: "Papelería", visible: true, subcategories: [] },
      { id: "12-2", name: "Organización de oficina", visible: true, subcategories: [] },
      { id: "12-3", name: "Útiles escolares", visible: true, subcategories: [] },
      { id: "12-4", name: "Arte y manualidades", visible: true, subcategories: [] },
      { id: "12-5", name: "Mochilas escolares", visible: true, subcategories: [] },
      { id: "12-6", name: "Libros", visible: true, subcategories: [] },
    ],
  },
  {
    id: "13",
    name: "Mascotas",
    icon: "🐾",
    visible: true,
    order: 13,
    categories: [
      { id: "13-1", name: "Alimento para perros", visible: true, subcategories: [] },
      { id: "13-2", name: "Alimento para gatos", visible: true, subcategories: [] },
      { id: "13-3", name: "Accesorios y juguetes", visible: true, subcategories: [] },
      { id: "13-4", name: "Higiene y cuidado", visible: true, subcategories: [] },
      { id: "13-5", name: "Salud veterinaria", visible: true, subcategories: [] },
      { id: "13-6", name: "Camas y transportadores", visible: true, subcategories: [] },
    ],
  },
  {
    id: "14",
    name: "Juguetería",
    icon: "🎮",
    visible: true,
    order: 14,
    categories: [
      { id: "14-1", name: "Juegos de mesa", visible: true, subcategories: [] },
      { id: "14-2", name: "Muñecas y figuras", visible: true, subcategories: [] },
      { id: "14-3", name: "Vehículos a escala", visible: true, subcategories: [] },
      { id: "14-4", name: "Juegos de construcción", visible: true, subcategories: [] },
      { id: "14-5", name: "Juguetes educativos", visible: true, subcategories: [] },
      { id: "14-6", name: "Juguetes de exterior", visible: true, subcategories: [] },
      { id: "14-7", name: "Peluches", visible: true, subcategories: [] },
    ],
  },
  {
    id: "15",
    name: "Salud y Bienestar",
    icon: "💊",
    visible: true,
    order: 15,
    categories: [
      { id: "15-1", name: "Vitaminas y suplementos", visible: true, subcategories: [] },
      { id: "15-2", name: "Cuidado de la salud", visible: true, subcategories: [] },
      { id: "15-3", name: "Ortopedia", visible: true, subcategories: [] },
      { id: "15-4", name: "Primeros auxilios", visible: true, subcategories: [] },
      { id: "15-5", name: "Bienestar sexual", visible: true, subcategories: [] },
      { id: "15-6", name: "Medición y diagnóstico", visible: true, subcategories: [] },
    ],
  },
  {
    id: "16",
    name: "Limpieza del Hogar",
    icon: "🧹",
    visible: true,
    order: 16,
    categories: [
      { id: "16-1", name: "Limpieza general", visible: true, subcategories: [] },
      { id: "16-2", name: "Cuidado de ropa", visible: true, subcategories: [] },
      { id: "16-3", name: "Ambientadores", visible: true, subcategories: [] },
      { id: "16-4", name: "Papel y descartables", visible: true, subcategories: [] },
      { id: "16-5", name: "Utensilios de limpieza", visible: true, subcategories: [] },
      { id: "16-6", name: "Bolsas de basura", visible: true, subcategories: [] },
    ],
  },
  {
    id: "17",
    name: "Música e Instrumentos",
    icon: "🎸",
    visible: true,
    order: 17,
    categories: [
      { id: "17-1", name: "Guitarras", visible: true, subcategories: [] },
      { id: "17-2", name: "Teclados y pianos", visible: true, subcategories: [] },
      { id: "17-3", name: "Baterías y percusión", visible: true, subcategories: [] },
      { id: "17-4", name: "Instrumentos de viento", visible: true, subcategories: [] },
      { id: "17-5", name: "DJ y producción", visible: true, subcategories: [] },
      { id: "17-6", name: "Accesorios musicales", visible: true, subcategories: [] },
    ],
  },
  {
    id: "18",
    name: "Películas, Series y Entretenimiento",
    icon: "🎬",
    visible: true,
    order: 18,
    categories: [
      { id: "18-1", name: "Películas físicas", visible: true, subcategories: [] },
      { id: "18-2", name: "Series TV", visible: true, subcategories: [] },
      { id: "18-3", name: "Videojuegos", visible: true, subcategories: [] },
      { id: "18-4", name: "Consolas", visible: true, subcategories: [] },
      { id: "18-5", name: "Merchandising", visible: true, subcategories: [] },
      { id: "18-6", name: "Coleccionables", visible: true, subcategories: [] },
    ],
  },
];
