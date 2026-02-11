import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  File,
  Upload,
  Trash2,
  Download,
  Eye,
  Search,
  Filter,
  Grid3x3,
  List,
  Folder,
  Edit2,
  Copy,
  Wand2,
  FileText,
  Loader2,
  Plus,
  FolderPlus,
  Star,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { copyToClipboardWithToast } from "/src/utils/clipboard";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "document";
  url: string;
  size: number;
  mimeType: string;
  folder?: string;
  uploadedAt: string;
  thumbnail?: string;
  starred?: boolean;
}

interface MediaLibraryProps {
  onSelectImageEditor?: () => void;
  onSelectDocumentEditor?: () => void;
}

export function MediaLibrary({ onSelectImageEditor, onSelectDocumentEditor }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"images" | "documents">("images");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeTab, selectedFolder, files]);

  async function loadFiles() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/media`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Error al cargar archivos");
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = files.filter((f) => f.type === activeTab.replace("s", ""));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((f) => f.name.toLowerCase().includes(query));
    }

    if (selectedFolder !== "all") {
      filtered = filtered.filter((f) => f.folder === selectedFolder);
    }

    setFilteredFiles(filtered);
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(fileList).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", activeTab === "images" ? "image" : "document");
        if (selectedFolder !== "all") {
          formData.append("folder", selectedFolder);
        }

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/media/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: formData,
          }
        );

        return response.ok;
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(Boolean).length;

      if (successCount > 0) {
        toast.success(`${successCount} archivo(s) subido(s)`);
        loadFiles();
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error al subir archivos");
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(id: string) {
    if (!confirm("¿Eliminar este archivo?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/media/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Archivo eliminado");
        loadFiles();
      } else {
        toast.error("Error al eliminar archivo");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error al eliminar archivo");
    }
  }

  async function toggleStar(id: string) {
    const file = files.find((f) => f.id === id);
    if (!file) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/media/${id}/star`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ starred: !file.starred }),
        }
      );

      if (response.ok) {
        loadFiles();
      }
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  }

  async function copyToClipboard(url: string) {
    await copyToClipboardWithToast(url, "URL copiada al portapapeles");
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  const folders = Array.from(new Set(files.map((f) => f.folder).filter(Boolean)));
  const stats = {
    images: {
      total: files.filter((f) => f.type === "image").length,
      size: files.filter((f) => f.type === "image").reduce((sum, f) => sum + f.size, 0),
    },
    documents: {
      total: files.filter((f) => f.type === "document").length,
      size: files.filter((f) => f.type === "document").reduce((sum, f) => sum + f.size, 0),
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Biblioteca de Medios</h2>
          <p className="text-muted-foreground mt-1">
            Gestiona todas tus imágenes y archivos en un solo lugar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "images" && onSelectImageEditor && (
            <button
              onClick={onSelectImageEditor}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Wand2 className="w-4 h-4" />
              <span>Editor de Imágenes</span>
            </button>
          )}

          {activeTab === "documents" && onSelectDocumentEditor && (
            <button
              onClick={onSelectDocumentEditor}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <FileText className="w-4 h-4" />
              <span>Generador de Documentos</span>
            </button>
          )}

          <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Subiendo..." : "Subir Archivos"}</span>
            <input
              type="file"
              multiple
              accept={activeTab === "images" ? "image/*" : ".pdf,.doc,.docx,.xls,.xlsx,.txt"}
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-border rounded-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("images")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "images"
                ? "bg-primary text-white"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="font-medium">Imágenes</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {stats.images.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "documents"
                ? "bg-primary text-white"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <File className="w-5 h-5" />
            <span className="font-medium">Documentos</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {stats.documents.total}
            </span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total de Archivos</span>
            {activeTab === "images" ? (
              <ImageIcon className="w-5 h-5 text-primary" />
            ) : (
              <File className="w-5 h-5 text-primary" />
            )}
          </div>
          <p className="text-3xl font-bold">
            {activeTab === "images" ? stats.images.total : stats.documents.total}
          </p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Espacio Utilizado</span>
            <Folder className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl font-bold">
            {formatFileSize(
              activeTab === "images" ? stats.images.size : stats.documents.size
            )}
          </p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Carpetas</span>
            <FolderPlus className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">{folders.length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-border rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Folder Filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas las carpetas</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
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

      {/* Files Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-border rounded-lg p-12 text-center">
          {activeTab === "images" ? (
            <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          ) : (
            <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          )}
          <h3 className="text-xl font-bold mb-2">No hay archivos</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? "No se encontraron resultados" : "Sube tu primer archivo"}
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>Subir Archivos</span>
            <input
              type="file"
              multiple
              accept={activeTab === "images" ? "image/*" : ".pdf,.doc,.docx,.xls,.xlsx,.txt"}
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-square bg-muted relative">
                {file.type === "image" ? (
                  <ImageWithFallback
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => window.open(file.url, "_blank")}
                    className="p-2 bg-white rounded-lg hover:bg-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="p-2 bg-white rounded-lg hover:bg-muted transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Star Button */}
                <button
                  onClick={() => toggleStar(file.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${
                      file.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </button>
              </div>

              <div className="p-3">
                <p className="font-medium text-sm truncate mb-1">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          {filteredFiles.map((file, index) => (
            <div
              key={file.id}
              className={`flex items-center gap-4 p-4 hover:bg-muted transition-colors ${
                index !== 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                {file.type === "image" ? (
                  <ImageWithFallback
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStar(file.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${
                      file.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </button>
                <button
                  onClick={() => window.open(file.url, "_blank")}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyToClipboard(file.url)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = file.url;
                    a.download = file.name;
                    a.click();
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
