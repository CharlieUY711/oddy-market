/**
 * 🖼️ Editor de Imágenes Pro
 * CSS Filters en tiempo real + Canvas para export. Sin dependencias externas.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WorkspaceShell } from '../workspace/WorkspaceShell';
import type { MainSection } from '../../../AdminDashboard';
import { Upload, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Download, Save, ZoomIn, ZoomOut } from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

interface Adjustments {
  brightness: number; contrast: number; saturation: number;
  hue: number; blur: number; sepia: number; opacity: number;
}
const DEFAULT_ADJ: Adjustments = { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sepia: 0, opacity: 100 };

const FILTER_PRESETS = [
  { name: 'Original', values: DEFAULT_ADJ },
  { name: 'Vívido',   values: { ...DEFAULT_ADJ, brightness: 110, contrast: 115, saturation: 150 } },
  { name: 'Cool',     values: { ...DEFAULT_ADJ, hue: 190, saturation: 120 } },
  { name: 'Cálido',   values: { ...DEFAULT_ADJ, hue: 20, brightness: 105, saturation: 110 } },
  { name: 'B&N',      values: { ...DEFAULT_ADJ, saturation: 0 } },
  { name: 'Vintage',  values: { ...DEFAULT_ADJ, sepia: 60, contrast: 90, brightness: 95 } },
  { name: 'Fade',     values: { ...DEFAULT_ADJ, contrast: 80, brightness: 105, saturation: 80, opacity: 90 } },
  { name: 'Noir',     values: { ...DEFAULT_ADJ, saturation: 0, contrast: 130, brightness: 90 } },
];

function buildFilter(adj: Adjustments): string {
  return [
    `brightness(${adj.brightness}%)`,
    `contrast(${adj.contrast}%)`,
    `saturate(${adj.saturation}%)`,
    `hue-rotate(${adj.hue}deg)`,
    `blur(${adj.blur}px)`,
    `sepia(${adj.sepia}%)`,
    `opacity(${adj.opacity}%)`,
  ].join(' ');
}

/* ── Left Panel ─────────────────────────────────────────────────────────── */
function LeftPanel({ adj, setAdj, rotation, setRotation, flipH, setFlipH, flipV, setFlipV, onUpload }: {
  adj: Adjustments; setAdj: (a: Adjustments) => void;
  rotation: number; setRotation: (r: number) => void;
  flipH: boolean; setFlipH: (v: boolean) => void;
  flipV: boolean; setFlipV: (v: boolean) => void;
  onUpload: () => void;
}) {
  const S = (key: keyof Adjustments, label: string, min: number, max: number, step = 1) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <label style={{ fontSize: '0.68rem', fontWeight: '600', color: '#374151' }}>{label}</label>
        <span style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: '600' }}>{adj[key]}{key === 'hue' ? '°' : key === 'blur' ? 'px' : '%'}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={adj[key]}
        onChange={e => setAdj({ ...adj, [key]: Number(e.target.value) })}
        style={{ width: '100%', accentColor: '#FF6835', cursor: 'pointer', height: 3 }} />
    </div>
  );

  return (
    <div style={{ padding: '10px 12px' }}>
      {/* Upload */}
      <button onClick={onUpload}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, border: '1.5px dashed #FFD4C2', backgroundColor: '#FFF4F0', color: '#FF6835', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', marginBottom: 12 }}>
        <Upload size={13} /> Cargar imagen
      </button>

      {/* Filters presets */}
      <p style={sLabel}>Filtros predefinidos</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {FILTER_PRESETS.map(p => (
          <button key={p.name} onClick={() => setAdj(p.values)}
            style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid #E5E7EB', backgroundColor: JSON.stringify(adj) === JSON.stringify(p.values) ? '#FF6835' : '#fff', color: JSON.stringify(adj) === JSON.stringify(p.values) ? '#fff' : '#374151', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '600' }}>
            {p.name}
          </button>
        ))}
      </div>

      {/* Adjustments */}
      <p style={sLabel}>Ajustes</p>
      {S('brightness', 'Brillo', 0, 200)}
      {S('contrast', 'Contraste', 0, 200)}
      {S('saturation', 'Saturación', 0, 200)}
      {S('hue', 'Tono', -180, 180)}
      {S('sepia', 'Sepia', 0, 100)}
      {S('blur', 'Desenfoque', 0, 20)}
      {S('opacity', 'Opacidad', 10, 100)}

      <button onClick={() => setAdj(DEFAULT_ADJ)}
        style={{ width: '100%', padding: '6px', borderRadius: 7, border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#6B7280', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600', marginBottom: 12 }}>
        ↺ Restablecer ajustes
      </button>

      {/* Transform */}
      <p style={sLabel}>Transformar</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 4 }}>
        <button onClick={() => setRotation((rotation - 90 + 360) % 360)} style={tBtn}>
          <RotateCcw size={12} /> Rotar ←
        </button>
        <button onClick={() => setRotation((rotation + 90) % 360)} style={tBtn}>
          <RotateCw size={12} /> Rotar →
        </button>
        <button onClick={() => setFlipH(!flipH)} style={{ ...tBtn, backgroundColor: flipH ? '#FFF4F0' : '#F9FAFB', color: flipH ? '#FF6835' : '#374151', border: flipH ? '1px solid #FFD4C2' : '1px solid #E5E7EB' }}>
          <FlipHorizontal size={12} /> Flip H
        </button>
        <button onClick={() => setFlipV(!flipV)} style={{ ...tBtn, backgroundColor: flipV ? '#FFF4F0' : '#F9FAFB', color: flipV ? '#FF6835' : '#374151', border: flipV ? '1px solid #FFD4C2' : '1px solid #E5E7EB' }}>
          <FlipVertical size={12} /> Flip V
        </button>
      </div>
    </div>
  );
}

/* ── Canvas ─────────────────────────────────────────────────────────────── */
function ImageCanvas({ imageSrc, adj, rotation, flipH, flipV, zoom, onZoom, onLoad }: {
  imageSrc: string | null; adj: Adjustments;
  rotation: number; flipH: boolean; flipV: boolean;
  zoom: number; onZoom: (z: number) => void;
  onLoad: (w: number, h: number) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  const transform = [
    `rotate(${rotation}deg)`,
    `scaleX(${flipH ? -1 : 1})`,
    `scaleY(${flipV ? -1 : 1})`,
  ].join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Zoom bar */}
      <div style={{ height: 40, backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0 }}>
        <button onClick={() => onZoom(Math.max(25, zoom - 10))} style={zBtn}><ZoomOut size={13} /></button>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#374151', minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
        <button onClick={() => onZoom(Math.min(200, zoom + 10))} style={zBtn}><ZoomIn size={13} /></button>
        <input type="range" min={25} max={200} step={5} value={zoom} onChange={e => onZoom(Number(e.target.value))}
          style={{ width: 80, accentColor: '#FF6835', cursor: 'pointer' }} />
        <button onClick={() => onZoom(100)} style={{ ...zBtn, fontSize: '0.65rem', fontWeight: '700', padding: '4px 8px', width: 'auto' }}>1:1</button>
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB', backgroundImage: 'repeating-conic-gradient(#D1D5DB 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }}>
        {!imageSrc ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>🖼️</div>
            <p style={{ fontSize: '0.88rem', fontWeight: '700', color: '#374151', margin: '0 0 4px' }}>Sin imagen cargada</p>
            <p style={{ fontSize: '0.75rem', margin: 0 }}>Usá el botón "Cargar imagen" o arrastrá un archivo aquí</p>
          </div>
        ) : (
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center', transition: 'transform 0.15s' }}>
            <img ref={imgRef} src={imageSrc} alt="editor"
              onLoad={e => { const img = e.currentTarget; onLoad(img.naturalWidth, img.naturalHeight); }}
              style={{ maxWidth: '70vw', maxHeight: '60vh', display: 'block', transform, filter: buildFilter(adj), boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Properties Panel ───────────────────────────────────────────────────── */
function PropertiesPanel({ imageSrc, adj, rotation, flipH, flipV, imgDims, onExport }: {
  imageSrc: string | null; adj: Adjustments; rotation: number; flipH: boolean; flipV: boolean;
  imgDims: { w: number; h: number } | null; onExport: (format: 'png' | 'jpeg', quality: number) => void;
}) {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(90);

  const activeFilters = Object.entries(adj).filter(([k, v]) => v !== (DEFAULT_ADJ as Record<string, number>)[k]).length;

  return (
    <div>
      {/* Dimensions */}
      {imgDims && (
        <>
          <p style={pLabel}>Dimensiones</p>
          <p style={{ fontSize: '0.78rem', color: '#111827', fontWeight: '700', marginBottom: 8 }}>{imgDims.w} × {imgDims.h} px</p>
        </>
      )}

      {/* Current state */}
      <p style={pLabel}>Estado actual</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {rotation > 0 && <Chip color="#FF6835">↻ {rotation}°</Chip>}
        {flipH && <Chip color="#3B82F6">↔ Flip H</Chip>}
        {flipV && <Chip color="#3B82F6">↕ Flip V</Chip>}
        {activeFilters > 0 && <Chip color="#10B981">✓ {activeFilters} ajuste{activeFilters > 1 ? 's' : ''}</Chip>}
        {!rotation && !flipH && !flipV && activeFilters === 0 && <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Sin modificaciones</span>}
      </div>

      {/* Export */}
      <p style={pLabel}>Exportar</p>
      <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
        {(['png', 'jpeg'] as const).map(f => (
          <button key={f} onClick={() => setFormat(f)}
            style={{ flex: 1, padding: '6px', borderRadius: 6, border: `1.5px solid ${format === f ? '#FF6835' : '#E5E7EB'}`, backgroundColor: format === f ? '#FFF4F0' : '#fff', color: format === f ? '#FF6835' : '#374151', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>
            .{f === 'jpeg' ? 'JPG' : 'PNG'}
          </button>
        ))}
      </div>
      {format === 'jpeg' && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <label style={{ fontSize: '0.68rem', fontWeight: '600', color: '#374151' }}>Calidad</label>
            <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{quality}%</span>
          </div>
          <input type="range" min={10} max={100} step={5} value={quality} onChange={e => setQuality(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#FF6835', cursor: 'pointer', height: 3 }} />
        </div>
      )}
      <button onClick={() => imageSrc && onExport(format, quality)} disabled={!imageSrc}
        style={{ width: '100%', padding: '9px', borderRadius: 8, border: 'none', backgroundColor: imageSrc ? '#FF6835' : '#E5E7EB', color: imageSrc ? '#fff' : '#9CA3AF', cursor: imageSrc ? 'pointer' : 'not-allowed', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <Download size={13} /> Descargar .{format === 'jpeg' ? 'JPG' : 'PNG'}
      </button>

      {!imageSrc && <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>Cargá una imagen para exportar</p>}
    </div>
  );
}

const Chip = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span style={{ padding: '2px 7px', borderRadius: 4, backgroundColor: `${color}15`, color, fontSize: '0.65rem', fontWeight: '700' }}>{children}</span>
);
const sLabel: React.CSSProperties = { fontSize: '0.6rem', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' };
const pLabel: React.CSSProperties = { fontSize: '0.62rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' };
const tBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 4px', borderRadius: 7, border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#374151', cursor: 'pointer', fontSize: '0.68rem', fontWeight: '600' };
const zBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' };

/* ── Main Component ─────────────────────────────────────────────────────── */
export function EditorImagenesWorkspace({ onNavigate }: Props) {
  const [imageSrc, setImageSrc]     = useState<string | null>(null);
  const [imageName, setImageName]   = useState('imagen');
  const [adj, setAdj]               = useState<Adjustments>(DEFAULT_ADJ);
  const [rotation, setRotation]     = useState(0);
  const [flipH, setFlipH]           = useState(false);
  const [flipV, setFlipV]           = useState(false);
  const [zoom, setZoom]             = useState(100);
  const [imgDims, setImgDims]       = useState<{ w: number; h: number } | null>(null);
  const fileRef                      = useRef<HTMLInputElement>(null);

  const handleFileLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      setImageSrc(e.target?.result as string);
      setImageName(file.name.replace(/\.[^.]+$/, ''));
      setAdj(DEFAULT_ADJ); setRotation(0); setFlipH(false); setFlipV(false); setZoom(100);
    };
    reader.readAsDataURL(file);
  };

  // Global drag & drop on canvas
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFileLoad(file);
  }, []);

  const handleExport = (format: 'png' | 'jpeg', quality: number) => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = buildFilter(adj);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -cx, -cy);
      const url = canvas.toDataURL(`image/${format}`, quality / 100);
      const a = document.createElement('a');
      a.href = url; a.download = `${imageName}.${format === 'jpeg' ? 'jpg' : 'png'}`; a.click();
    };
    img.src = imageSrc;
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileLoad(f); }} />
      <WorkspaceShell
        toolId="editor-imagenes"
        onNavigate={onNavigate}
        leftPanel={<LeftPanel adj={adj} setAdj={setAdj} rotation={rotation} setRotation={setRotation} flipH={flipH} setFlipH={setFlipH} flipV={flipV} setFlipV={setFlipV} onUpload={() => fileRef.current?.click()} />}
        canvas={
          <div style={{ height: '100%' }} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
            <ImageCanvas imageSrc={imageSrc} adj={adj} rotation={rotation} flipH={flipH} flipV={flipV} zoom={zoom} onZoom={setZoom} onLoad={(w, h) => setImgDims({ w, h })} />
          </div>
        }
        properties={<PropertiesPanel imageSrc={imageSrc} adj={adj} rotation={rotation} flipH={flipH} flipV={flipV} imgDims={imgDims} onExport={handleExport} />}
        actions={imageSrc ? (
          <>
            <span style={{ fontSize: '0.68rem', color: '#71717A' }}>{imageName}</span>
            <button onClick={() => handleExport('png', 100)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 5, border: 'none', backgroundColor: '#FF6835', color: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
              <Download size={12} /> Exportar
            </button>
          </>
        ) : undefined}
      />
    </>
  );
}
