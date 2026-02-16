import { useState } from "react";
import { X } from "lucide-react";

interface TextEditorProps {
  initialText?: string;
  initialFontSize?: number;
  initialFontFamily?: string;
  initialColor?: string;
  onSave: (textData: {
    content: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    textAlign?: "left" | "center" | "right" | "justify";
  }) => void;
  onCancel: () => void;
}

export function TextEditor({
  initialText = "",
  initialFontSize = 20,
  initialFontFamily = "Arial",
  initialColor = "#000000",
  onSave,
  onCancel,
}: TextEditorProps) {
  const [content, setContent] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);
  const [color, setColor] = useState(initialColor);
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("normal");
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">("normal");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("left");

  const handleSave = () => {
    onSave({
      content,
      fontSize,
      fontFamily,
      color,
      fontWeight,
      fontStyle,
      textAlign,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Editor de Texto</h2>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100 text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texto</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              rows={4}
              placeholder="Escribe tu texto aquí..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                min="8"
                max="200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuente</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estilo</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFontWeight(fontWeight === "bold" ? "normal" : "bold")}
                className={`px-3 py-2 rounded border text-sm font-medium ${
                  fontWeight === "bold"
                    ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Negrita
              </button>
              <button
                onClick={() => setFontStyle(fontStyle === "italic" ? "normal" : "italic")}
                className={`px-3 py-2 rounded border text-sm font-medium ${
                  fontStyle === "italic"
                    ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cursiva
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alineación</label>
            <div className="grid grid-cols-3 gap-2">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => setTextAlign(align)}
                  className={`px-3 py-2 rounded border text-sm font-medium capitalize ${
                    textAlign === align
                      ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {align === "left" ? "Izquierda" : align === "center" ? "Centro" : "Derecha"}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa</label>
            <div
              style={{
                fontSize: `${fontSize}px`,
                fontFamily,
                color,
                fontWeight,
                fontStyle,
                textAlign,
              }}
              className="min-h-[60px] p-2 bg-white rounded"
            >
              {content || "Vista previa del texto"}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
          >
            Agregar Texto
          </button>
        </div>
      </div>
    </div>
  );
}
