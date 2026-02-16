import { useState, useRef, useEffect } from "react";
import { EditorCanvas } from "./EditorCanvas";
import { EditorToolbar } from "./EditorToolbar";
import { LayersPanel } from "./LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { CropTool } from "./CropTool";
import { TextEditor } from "./TextEditor";
import { ShapesPanel } from "./ShapesPanel";
import { FiltersPanel } from "./FiltersPanel";
import { DrawingTools } from "./DrawingTools";
import { StickersPanel } from "./StickersPanel";
import { TemplatesGallery } from "./TemplatesGallery";
import { ExportDialog } from "./ExportDialog";
import { HistoryPanel } from "./HistoryPanel";
import { EditorProject, EditorLayer, ActiveTool } from "./types";
import { X } from "lucide-react";
import * as fabric from "fabric";

interface ImageEditorProps {
  projectId?: string;
  onClose?: () => void;
}

export function ImageEditor({ projectId, onClose }: ImageEditorProps) {
  const [project, setProject] = useState<EditorProject>({
    id: projectId || crypto.randomUUID(),
    name: "Nuevo Proyecto",
    canvas: {
      width: 1080,
      height: 1080,
      backgroundColor: "#FFFFFF",
    },
    layers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [sidebarLeftOpen, setSidebarLeftOpen] = useState(true);
  const [sidebarRightOpen, setSidebarRightOpen] = useState(true);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showShapesPanel, setShowShapesPanel] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [showStickersPanel, setShowStickersPanel] = useState(false);
  const [showTemplatesGallery, setShowTemplatesGallery] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [canvasInstance, setCanvasInstance] = useState<fabric.Canvas | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; action: string; timestamp: Date; description: string; project: EditorProject }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Guardar en historial
  const saveToHistory = (action: string, description: string, projectToSave: EditorProject = project) => {
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push({
        id: crypto.randomUUID(),
        action,
        timestamp: new Date(),
        description,
        project: JSON.parse(JSON.stringify(projectToSave)),
      });
      
      const limitedHistory = newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
      setHistoryIndex(limitedHistory.length - 1);
      return limitedHistory;
    });
  };

  // Auto-save cada 30 segundos
  useEffect(() => {
    autoSaveIntervalRef.current = setInterval(() => {
      if (project.layers.length > 0) {
        console.log("Auto-save:", project);
      }
    }, 30000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [project]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setProject(history[newIndex].project);
        }
      }
      if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "z")) {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setProject(history[newIndex].project);
        }
      }
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveToHistory("Guardar proyecto", "Proyecto guardado");
        console.log("Guardar proyecto:", project);
        alert("Proyecto guardado (guardado local por ahora)");
      }
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        setShowExportDialog(true);
      }
      if (e.key === "Delete" && selectedLayerId) {
        handleLayerDelete(selectedLayerId);
      }
      if (e.key === "Escape") {
        setShowTextEditor(false);
        setShowShapesPanel(false);
        setShowFiltersPanel(false);
        setShowDrawingTools(false);
        setShowStickersPanel(false);
        setShowTemplatesGallery(false);
        setShowExportDialog(false);
        setShowHistoryPanel(false);
        setActiveTool("select");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLayerId, historyIndex, history, project]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setProject(history[newIndex].project);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setProject(history[newIndex].project);
    }
  };

  const handleRestoreHistory = (index: number) => {
    setHistoryIndex(index);
    setProject(history[index].project);
  };

  // Manejar carga de imagen
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newLayer: EditorLayer = {
          id: crypto.randomUUID(),
          type: "image",
          name: file.name || "Imagen",
          visible: true,
          locked: false,
          opacity: 100,
          position: { x: 0, y: 0 },
          zIndex: project.layers.length,
          image: {
            src: imageUrl,
          },
        };
        const updatedProject = {
          ...project,
          layers: [...project.layers, newLayer],
          updatedAt: new Date().toISOString(),
        };
        setProject(updatedProject);
        setSelectedLayerId(newLayer.id);
        saveToHistory("Agregar imagen", `Imagen: ${file.name || "Imagen"}`, updatedProject);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar herramientas
  const handleToolChange = (tool: ActiveTool) => {
    setActiveTool(tool);
    
    if (tool === "crop") {
      setIsCropMode(true);
    } else {
      setIsCropMode(false);
    }

    if (tool === "text") {
      setShowTextEditor(true);
    }

    if (tool === "shape") {
      setShowShapesPanel(true);
    }

    if (tool === "filter") {
      setShowFiltersPanel(true);
    }

    if (tool === "drawing") {
      setShowDrawingTools(true);
    }
  };

  // Manejar crop
  const handleCropComplete = (cropData: { x: number; y: number; width: number; height: number }) => {
    if (!selectedLayerId) return;
    
    const layer = project.layers.find((l) => l.id === selectedLayerId);
    if (layer && layer.type === "image" && layer.image) {
      handleLayerUpdate(selectedLayerId, {
        image: {
          ...layer.image,
          crop: cropData,
        },
      });
    }
    
    setIsCropMode(false);
    setActiveTool("select");
  };

  const handleCropCancel = () => {
    setIsCropMode(false);
    setActiveTool("select");
  };

  // Manejar flip
  const handleFlipHorizontal = () => {
    if (!selectedLayerId) return;
    const layer = project.layers.find((l) => l.id === selectedLayerId);
    if (layer && layer.type === "image" && layer.image) {
      handleLayerUpdate(selectedLayerId, {
        image: {
          ...layer.image,
          flipX: !layer.image.flipX,
        },
      });
    }
  };

  const handleFlipVertical = () => {
    if (!selectedLayerId) return;
    const layer = project.layers.find((l) => l.id === selectedLayerId);
    if (layer && layer.type === "image" && layer.image) {
      handleLayerUpdate(selectedLayerId, {
        image: {
          ...layer.image,
          flipY: !layer.image.flipY,
        },
      });
    }
  };

  // Manejar resize canvas
  const handleResizeCanvas = () => {
    const width = prompt("Ancho (px):", project.canvas.width.toString());
    const height = prompt("Alto (px):", project.canvas.height.toString());
    
    if (width && height) {
      const updatedProject = {
        ...project,
        canvas: {
          ...project.canvas,
          width: parseInt(width) || project.canvas.width,
          height: parseInt(height) || project.canvas.height,
        },
        updatedAt: new Date().toISOString(),
      };
      setProject(updatedProject);
      saveToHistory("Redimensionar canvas", `Nuevo tamaño: ${width}x${height}`, updatedProject);
    }
  };

  // Manejar capas
  const handleLayerAdd = () => {
    setShowTextEditor(true);
  };

  const handleLayerDelete = (layerId: string) => {
    const layer = project.layers.find((l) => l.id === layerId);
    const updatedProject = {
      ...project,
      layers: project.layers.filter((l) => l.id !== layerId),
      updatedAt: new Date().toISOString(),
    };
    setProject(updatedProject);
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
    saveToHistory("Eliminar capa", `Eliminada capa: ${layer?.name || layerId}`, updatedProject);
  };

  const handleLayerUpdate = (layerId: string, updates: Partial<EditorLayer>) => {
    const updatedProject = {
      ...project,
      layers: project.layers.map((layer) =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      ),
      updatedAt: new Date().toISOString(),
    };
    setProject(updatedProject);
    saveToHistory("Actualizar capa", `Actualizada capa: ${project.layers.find(l => l.id === layerId)?.name || layerId}`, updatedProject);
  };

  const handleLayerToggleVisibility = (layerId: string) => {
    const layer = project.layers.find((l) => l.id === layerId);
    if (layer) {
      handleLayerUpdate(layerId, { visible: !layer.visible });
    }
  };

  const handleLayerToggleLock = (layerId: string) => {
    const layer = project.layers.find((l) => l.id === layerId);
    if (layer) {
      handleLayerUpdate(layerId, { locked: !layer.locked });
    }
  };

  // Manejar texto
  const handleTextSave = (textData: any) => {
    const newLayer: EditorLayer = {
      id: crypto.randomUUID(),
      type: "text",
      name: `Texto ${project.layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 100,
      position: { x: 100, y: 100 },
      zIndex: project.layers.length,
      text: textData,
    };
    const updatedProject = {
      ...project,
      layers: [...project.layers, newLayer],
      updatedAt: new Date().toISOString(),
    };
    setProject(updatedProject);
    setSelectedLayerId(newLayer.id);
    setShowTextEditor(false);
    setActiveTool("select");
    saveToHistory("Agregar texto", `Texto: ${textData.content.substring(0, 20)}...`, updatedProject);
  };

  // Manejar formas
  const handleShapeSelect = (shapeType: "rectangle" | "circle" | "line" | "arrow" | "triangle") => {
    const newLayer: EditorLayer = {
      id: crypto.randomUUID(),
      type: "shape",
      name: `Forma ${project.layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 100,
      position: { x: 200, y: 200 },
      zIndex: project.layers.length,
      shape: {
        shapeType,
        fill: "#FF6B35",
        stroke: "#000000",
        strokeWidth: 2,
        width: shapeType === "line" ? 100 : 100,
        height: shapeType === "line" ? 0 : 100,
      },
    };
    const updatedProject = {
      ...project,
      layers: [...project.layers, newLayer],
      updatedAt: new Date().toISOString(),
    };
    setProject(updatedProject);
    setSelectedLayerId(newLayer.id);
    setActiveTool("select");
    saveToHistory("Agregar forma", `Forma: ${shapeType}`, updatedProject);
  };

  // Manejar zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1));
  };

  const handleZoomFit = () => {
    setZoom(1);
  };

  const handleZoom100 = () => {
    setZoom(1);
  };

  // Manejar exportación
  const handleDownload = () => {
    setShowExportDialog(true);
  };

  const handleExport = async (config: {
    format: "png" | "jpg" | "webp";
    quality: number;
    scale: number;
    width?: number;
    height?: number;
  }) => {
    if (!canvasInstance) {
      alert("Canvas no disponible");
      return;
    }

    try {
      const dataURL = canvasInstance.toDataURL({
        format: config.format,
        quality: config.quality / 100,
        multiplier: config.scale,
      });

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `imagen-${Date.now()}.${config.format}`;
      link.click();
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Error al exportar la imagen");
    }
  };

  // Manejar guardado
  const handleSave = () => {
    saveToHistory("Guardar proyecto", "Proyecto guardado");
    console.log("Guardar proyecto:", project);
    alert("Proyecto guardado (guardado local por ahora)");
  };

  // Manejar templates
  const handleTemplateSelect = (template: { width: number; height: number; name: string }) => {
    const updatedProject = {
      ...project,
      canvas: {
        ...project.canvas,
        width: template.width,
        height: template.height,
      },
      name: template.name,
      updatedAt: new Date().toISOString(),
    };
    setProject(updatedProject);
    saveToHistory("Aplicar plantilla", `Plantilla: ${template.name}`, updatedProject);
  };

  // Manejar stickers
  const handleStickerSelect = (sticker: { id: string; name: string; url: string }) => {
    const newLayer: EditorLayer = {
      id: crypto.randomUUID(),
      type: "sticker",
      name: sticker.name,
      visible: true,
      locked: false,
      opacity: 100,
      position: { x: 200, y: 200 },
      zIndex: project.layers.length,
      sticker: {
        stickerId: sticker.id,
        stickerUrl: sticker.url,
        category: "emoji",
        name: sticker.name,
      },
    };
    const updatedProject = {
      ...project,
      layers: [...project.layers, newLayer],
      updatedAt: new Date().toISOString(),
    };
    setProject(updatedProject);
    setSelectedLayerId(newLayer.id);
    saveToHistory("Agregar sticker", `Sticker: ${sticker.name}`, updatedProject);
  };

  // Manejar dibujo
  const handleDrawingToolSelect = (tool: "pen" | "brush" | "eraser", config: { size: number; color: string }) => {
    console.log("Drawing tool:", tool, config);
    setActiveTool("select");
  };

  const selectedLayer = project.layers.find((l) => l.id === selectedLayerId) || null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] flex items-center justify-between px-6 text-white">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Editor de Imágenes</h1>
          <span className="text-sm opacity-90">Fase 4: Funcionalidades Avanzadas</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <EditorToolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onUpload={() => fileInputRef.current?.click()}
        onDownload={handleDownload}
        onSave={handleSave}
        zoom={zoom}
        onFlipHorizontal={handleFlipHorizontal}
        onFlipVertical={handleFlipVertical}
        onResizeCanvas={handleResizeCanvas}
        onZoomFit={handleZoomFit}
        onZoom100={handleZoom100}
        onShowTemplates={() => setShowTemplatesGallery(true)}
        onShowHistory={() => setShowHistoryPanel(true)}
        onShowStickers={() => setShowStickersPanel(true)}
      />

      {/* Input oculto para carga de archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel lateral izquierdo - Capas */}
        {sidebarLeftOpen && (
          <LayersPanel
            layers={project.layers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={setSelectedLayerId}
            onLayerAdd={handleLayerAdd}
            onLayerDelete={handleLayerDelete}
            onLayerToggleVisibility={handleLayerToggleVisibility}
            onLayerToggleLock={handleLayerToggleLock}
          />
        )}

        {/* Canvas central */}
        <div className="flex-1 overflow-hidden relative">
          <EditorCanvas
            project={project}
            selectedLayerId={selectedLayerId}
            activeTool={activeTool}
            zoom={zoom}
            onLayerSelect={setSelectedLayerId}
            onLayerUpdate={handleLayerUpdate}
            onCanvasReady={setCanvasInstance}
          />
          {isCropMode && canvasInstance && (
            <CropTool
              canvas={canvasInstance}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
            />
          )}
        </div>

        {/* Panel lateral derecho - Propiedades */}
        {sidebarRightOpen && (
          <PropertiesPanel
            layer={selectedLayer}
            onLayerUpdate={(updates) => {
              if (selectedLayerId) {
                handleLayerUpdate(selectedLayerId, updates);
              }
            }}
            onFlipHorizontal={handleFlipHorizontal}
            onFlipVertical={handleFlipVertical}
          />
        )}
      </div>

      {/* Modales */}
      {showTextEditor && (
        <TextEditor
          initialText=""
          initialFontSize={20}
          initialFontFamily="Arial"
          initialColor="#000000"
          onSave={handleTextSave}
          onCancel={() => {
            setShowTextEditor(false);
            setActiveTool("select");
          }}
        />
      )}

      {showShapesPanel && (
        <ShapesPanel
          onShapeSelect={handleShapeSelect}
          onClose={() => {
            setShowShapesPanel(false);
            setActiveTool("select");
          }}
        />
      )}

      {showFiltersPanel && selectedLayer && selectedLayer.type === "image" && (
        <FiltersPanel
          onApply={(filters) => {
            if (selectedLayerId && selectedLayer.image) {
              handleLayerUpdate(selectedLayerId, {
                image: {
                  ...selectedLayer.image,
                  filters,
                },
              });
            }
          }}
          onClose={() => {
            setShowFiltersPanel(false);
            setActiveTool("select");
          }}
          initialFilters={selectedLayer.image?.filters}
        />
      )}

      {showDrawingTools && (
        <DrawingTools
          onToolSelect={handleDrawingToolSelect}
          onClose={() => {
            setShowDrawingTools(false);
            setActiveTool("select");
          }}
        />
      )}

      {showStickersPanel && (
        <StickersPanel
          onStickerSelect={handleStickerSelect}
          onClose={() => {
            setShowStickersPanel(false);
            setActiveTool("select");
          }}
        />
      )}

      {showTemplatesGallery && (
        <TemplatesGallery
          onTemplateSelect={handleTemplateSelect}
          onClose={() => {
            setShowTemplatesGallery(false);
          }}
        />
      )}

      {showExportDialog && (
        <ExportDialog
          onExport={handleExport}
          onClose={() => setShowExportDialog(false)}
          currentWidth={project.canvas.width}
          currentHeight={project.canvas.height}
        />
      )}

      {showHistoryPanel && (
        <HistoryPanel
          history={history.map(h => ({
            id: h.id,
            action: h.action,
            timestamp: h.timestamp,
            description: h.description,
          }))}
          currentIndex={historyIndex}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onRestore={handleRestoreHistory}
          onClose={() => setShowHistoryPanel(false)}
        />
      )}
    </div>
  );
}
