import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Crop,
  Sliders,
  Wand2,
  Sparkles,
  Image as ImageIcon,
  Scissors,
  Palette,
  Save,
  X,
  Maximize,
  Minimize,
  Sun,
  Droplet,
  Contrast,
  Layers,
  HelpCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ImageEditorHelp } from "./ImageEditorHelp";

interface ImageEditorProps {
  onClose: () => void;
}

export function ImageEditor({ onClose }: ImageEditorProps) {
  const [image, setImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "filters" | "ai" | "generate">("edit");
  const [showHelp, setShowHelp] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0,
    grayscale: 0,
    sepia: 0,
  });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [cropMode, setCropMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Load image on canvas
  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        canvas.width = img.width;
        canvas.height = img.height;
        setCanvasSize({ width: img.width, height: img.height });
        drawImage();
      };
      img.src = image;
    }
  }, [image]);

  // Apply filters
  useEffect(() => {
    if (image) {
      drawImage();
    }
  }, [filters, rotation, zoom]);

  function drawImage() {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Apply filters
    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      hue-rotate(${filters.hue}deg)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
    `;

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Restore context
    ctx.restore();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        resetFilters();
      };
      reader.readAsDataURL(file);
    }
  }

  function resetFilters() {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hue: 0,
      grayscale: 0,
      sepia: 0,
    });
    setRotation(0);
    setZoom(1);
  }

  function handleRotate() {
    setRotation((prev) => (prev + 90) % 360);
  }

  function handleZoomIn() {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(prev - 0.1, 0.1));
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `oddy-edited-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagen descargada");
      }
    });
  }

  async function handleRemoveBackground() {
    if (!image) {
      toast.error("Carga una imagen primero");
      return;
    }

    setProcessing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!));
      });

      const formData = new FormData();
      formData.append("image", blob);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/images/remove-bg`,
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
        setImage(data.imageUrl);
        toast.success("Fondo eliminado exitosamente");
      } else {
        toast.error("Error al eliminar fondo");
      }
    } catch (error) {
      console.error("Error removing background:", error);
      toast.error("Error al procesar imagen");
    } finally {
      setProcessing(false);
    }
  }

  async function handleOptimizeImage() {
    if (!image) {
      toast.error("Carga una imagen primero");
      return;
    }

    setProcessing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.85);
      });

      const formData = new FormData();
      formData.append("image", blob);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/images/optimize`,
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
        toast.success(`Imagen optimizada: ${data.originalSize} → ${data.optimizedSize}`);
        setImage(data.imageUrl);
      } else {
        toast.error("Error al optimizar imagen");
      }
    } catch (error) {
      console.error("Error optimizing image:", error);
      toast.error("Error al procesar imagen");
    } finally {
      setProcessing(false);
    }
  }

  function applyPreset(preset: string) {
    const presets: Record<string, typeof filters> = {
      vintage: {
        brightness: 110,
        contrast: 90,
        saturation: 80,
        blur: 0,
        hue: 20,
        grayscale: 0,
        sepia: 40,
      },
      bw: {
        brightness: 100,
        contrast: 110,
        saturation: 0,
        blur: 0,
        hue: 0,
        grayscale: 100,
        sepia: 0,
      },
      vivid: {
        brightness: 105,
        contrast: 120,
        saturation: 150,
        blur: 0,
        hue: 0,
        grayscale: 0,
        sepia: 0,
      },
      cool: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        hue: 200,
        grayscale: 0,
        sepia: 0,
      },
      warm: {
        brightness: 105,
        contrast: 100,
        saturation: 110,
        blur: 0,
        hue: 30,
        grayscale: 0,
        sepia: 20,
      },
    };

    if (presets[preset]) {
      setFilters(presets[preset]);
      toast.success(`Filtro ${preset} aplicado`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editor de Imágenes</h2>
          <p className="text-muted-foreground">Edita, optimiza y transforma tus imágenes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            Ayuda
          </button>
          {image && (
            <>
              <button
                onClick={handleOptimizeImage}
                disabled={processing}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                Optimizar
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download className="w-5 h-5" />
                Descargar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Show Help */}
      {showHelp && (
        <div className="bg-white p-6 rounded-lg border border-border">
          <ImageEditorHelp />
        </div>
      )}

      {!showHelp && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === "edit"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="w-5 h-5" />
          Editar
        </button>
        <button
          onClick={() => setActiveTab("filters")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === "filters"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Palette className="w-5 h-5" />
          Filtros
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === "ai"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wand2 className="w-5 h-5" />
          IA
        </button>
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === "generate"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Generar IA
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Upload */}
          <div className="bg-white p-4 rounded-lg border border-border">
            <h3 className="font-bold mb-3">Cargar Imagen</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Upload className="w-5 h-5" />
              Seleccionar Archivo
            </button>
          </div>

          {/* Edit Tab Controls */}
          {activeTab === "edit" && image && (
            <div className="bg-white p-4 rounded-lg border border-border space-y-4">
              <h3 className="font-bold">Transformaciones</h3>

              {/* Rotation */}
              <button
                onClick={handleRotate}
                className="w-full flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <RotateCw className="w-5 h-5" />
                Rotar 90°
              </button>

              {/* Zoom */}
              <div>
                <label className="block text-sm font-medium mb-2">Zoom: {zoom.toFixed(1)}x</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleZoomOut}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Brightness */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Brillo: {filters.brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.brightness}
                  onChange={(e) =>
                    setFilters({ ...filters, brightness: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Contrast className="w-4 h-4" />
                  Contraste: {filters.contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) =>
                    setFilters({ ...filters, contrast: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  Saturación: {filters.saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) =>
                    setFilters({ ...filters, saturation: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <X className="w-5 h-5" />
                Restablecer
              </button>
            </div>
          )}

          {/* Filters Tab Controls */}
          {activeTab === "filters" && image && (
            <div className="bg-white p-4 rounded-lg border border-border space-y-3">
              <h3 className="font-bold mb-3">Filtros Preestablecidos</h3>

              <button
                onClick={() => applyPreset("vintage")}
                className="w-full px-4 py-2 text-left border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Vintage</p>
                <p className="text-xs text-muted-foreground">Cálido y nostálgico</p>
              </button>

              <button
                onClick={() => applyPreset("bw")}
                className="w-full px-4 py-2 text-left border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Blanco y Negro</p>
                <p className="text-xs text-muted-foreground">Clásico monocromático</p>
              </button>

              <button
                onClick={() => applyPreset("vivid")}
                className="w-full px-4 py-2 text-left border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Vivid</p>
                <p className="text-xs text-muted-foreground">Colores intensos</p>
              </button>

              <button
                onClick={() => applyPreset("cool")}
                className="w-full px-4 py-2 text-left border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Cool</p>
                <p className="text-xs text-muted-foreground">Tonos fríos</p>
              </button>

              <button
                onClick={() => applyPreset("warm")}
                className="w-full px-4 py-2 text-left border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Warm</p>
                <p className="text-xs text-muted-foreground">Tonos cálidos</p>
              </button>
            </div>
          )}

          {/* AI Tab Controls */}
          {activeTab === "ai" && image && (
            <div className="bg-white p-4 rounded-lg border border-border space-y-3">
              <h3 className="font-bold mb-3">Herramientas IA</h3>

              <button
                onClick={handleRemoveBackground}
                disabled={processing}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Scissors className="w-5 h-5" />
                {processing ? "Procesando..." : "Eliminar Fondo"}
              </button>

              <button
                onClick={handleOptimizeImage}
                disabled={processing}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                {processing ? "Procesando..." : "Optimizar Imagen"}
              </button>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Las herramientas de IA utilizan modelos avanzados para mejorar tus imágenes automáticamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-3">
          {activeTab === "generate" ? (
            <AIImageGenerator />
          ) : (
            <div className="bg-white p-6 rounded-lg border border-border">
              {image ? (
                <div className="relative">
                  <div className="overflow-auto max-h-[600px] flex items-center justify-center bg-muted/30 rounded-lg">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto"
                      style={{ imageRendering: "high-quality" }}
                    />
                  </div>
                  {processing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="bg-white p-6 rounded-lg text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                        <p className="font-medium">Procesando imagen...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No hay imagen cargada</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sube una imagen para comenzar a editarla
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Cargar Imagen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// AI Image Generator Component
function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("Escribe un prompt para generar la imagen");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/images/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            prompt,
            negativePrompt,
            style,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.imageUrl);
        toast.success("Imagen generada exitosamente");
      } else {
        toast.error("Error al generar imagen");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Error al procesar solicitud");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-border space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-2">Generador de Imágenes con IA</h3>
        <p className="text-sm text-muted-foreground">
          Describe la imagen que quieres crear y la IA la generará para ti
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Descripción (Prompt)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Un paisaje montañoso al atardecer con un lago cristalino"
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Prompt Negativo (Opcional)
          </label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Ej: baja calidad, borroso, distorsionado"
            rows={2}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Estilo</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="realistic">Realista</option>
            <option value="artistic">Artístico</option>
            <option value="anime">Anime</option>
            <option value="digital-art">Arte Digital</option>
            <option value="3d">3D Render</option>
            <option value="cartoon">Caricatura</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {generating ? "Generando..." : "Generar Imagen"}
        </button>
      </div>

      {generating && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-sm text-muted-foreground">
            Generando tu imagen, esto puede tomar unos segundos...
          </p>
        </div>
      )}

      {generatedImage && !generating && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full rounded-lg border border-border"
            />
          </div>
          <button
            onClick={() => {
              const a = document.createElement("a");
              a.href = generatedImage;
              a.download = `oddy-ai-${Date.now()}.png`;
              a.click();
              toast.success("Imagen descargada");
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="w-5 h-5" />
            Descargar Imagen
          </button>
        </div>
      )}

      {!generating && !generatedImage && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            La imagen generada aparecerá aquí
          </p>
        </div>
      )}
    </div>
  );
}
