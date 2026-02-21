/**
 * 🖼️ Editor de Imágenes Pro v3
 * Strip · BG removal BFS · Auto-ajuste · Templates · Text overlay
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WorkspaceShell } from '../workspace/WorkspaceShell';
import type { MainSection } from '../../../AdminDashboard';
import {
  Upload, FlipHorizontal, FlipVertical, Download,
  ZoomIn, ZoomOut, RotateCcw, RotateCw, Eraser, Loader,
  Plus, Lock, Zap, X, CheckSquare, Square,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type,
} from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

/* ══════════════ TYPES ══════════════ */
interface Adjustments {
  brightness: number; contrast: number; saturation: number;
  hue: number; blur: number; sepia: number; opacity: number;
}
const DEFAULT_ADJ: Adjustments = {
  brightness: 100, contrast: 100, saturation: 100,
  hue: 0, blur: 0, sepia: 0, opacity: 100,
};

interface SlotState {
  src: string; adj: Adjustments;
  rotation: number; flipH: boolean; flipV: boolean; label: string;
}

/* ══════════════ TEMPLATES ══════════════ */
const CANVAS_TEMPLATES = [
  { id: 'square', name: 'Web Cuadrado', w: 1200, h: 1200, shape: 'rect',   emoji: '⬛', desc: '1200 × 1200' },
  { id: 'story',  name: 'Story 9:10',  w: 1080, h: 1200, shape: 'rect',   emoji: '📱', desc: '1080 × 1200' },
  { id: 'header', name: 'Encabezado',  w: 1200, h: 400,  shape: 'rect',   emoji: '▬',  desc: '1200 × 400'  },
  { id: 'footer', name: 'Pie',         w: 1200, h: 300,  shape: 'rect',   emoji: '▬',  desc: '1200 × 300'  },
  { id: 'label',  name: 'Etiq. Envío', w: 150,  h: 100,  shape: 'rect',   emoji: '🏷️', desc: '150 × 100 mm'},
  { id: 'circle', name: 'Circular',    w: 1200, h: 1200, shape: 'circle', emoji: '⭕', desc: '1200 × 1200' },
];

/* ══════════════ FILTER PRESETS ══════════════ */
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

const FONT_FAMILIES = [
  'Arial', 'Georgia', 'Verdana', 'Courier New',
  'Impact', 'Trebuchet MS', 'Palatino', 'Tahoma',
];

/* ══════════════ UTILS ══════════════ */
function buildFilter(adj: Adjustments): string {
  return [
    `brightness(${adj.brightness}%)`, `contrast(${adj.contrast}%)`,
    `saturate(${adj.saturation}%)`, `hue-rotate(${adj.hue}deg)`,
    `blur(${adj.blur}px)`, `sepia(${adj.sepia}%)`, `opacity(${adj.opacity}%)`,
  ].join(' ');
}
function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function aspectStr(w: number, h: number): string {
  const d = gcd(w, h); const rw = w / d, rh = h / d;
  return (rw > 20 || rh > 20) ? `${(w / h).toFixed(2)}:1` : `${rw}:${rh}`;
}

/* ══════════════ BFS BACKGROUND REMOVAL ══════════════ */
async function removeBg(src: string, tolerance = 58): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 2000;
      const sc = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const W = Math.round(img.naturalWidth * sc);
      const H = Math.round(img.naturalHeight * sc);
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, W, H);
      const imgData = ctx.getImageData(0, 0, W, H);
      const px = imgData.data;

      /* median border color */
      const samps: [number, number, number][] = [];
      const addS = (x: number, y: number) => {
        const i = (y * W + x) * 4;
        samps.push([px[i], px[i + 1], px[i + 2]]);
      };
      for (let x = 0; x < W; x++) { addS(x, 0); addS(x, H - 1); }
      for (let y = 1; y < H - 1; y++) { addS(0, y); addS(W - 1, y); }
      samps.sort((a, b) =>
        (0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]) -
        (0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2]));
      const [bgR, bgG, bgB] = samps[samps.length >> 1];

      const dist = (idx: number) => {
        const dr = px[idx] - bgR, dg = px[idx + 1] - bgG, db = px[idx + 2] - bgB;
        return Math.sqrt(dr * dr + dg * dg + db * db);
      };

      /* BFS */
      const visited = new Uint8Array(W * H);
      const queue = new Int32Array(W * H * 2);
      let head = 0, tail = 0;
      const enq = (pos: number) => {
        if (pos >= 0 && pos < W * H && !visited[pos]) { visited[pos] = 1; queue[tail++] = pos; }
      };
      for (let x = 0; x < W; x++) { enq(x); enq((H - 1) * W + x); }
      for (let y = 1; y < H - 1; y++) { enq(y * W); enq(y * W + W - 1); }
      while (head < tail) {
        const pos = queue[head++];
        const x = pos % W; const y = (pos / W) | 0;
        if (dist(pos * 4) <= tolerance) {
          px[pos * 4 + 3] = 0;
          if (x > 0) enq(pos - 1); if (x < W - 1) enq(pos + 1);
          if (y > 0) enq(pos - W); if (y < H - 1) enq(pos + W);
        }
      }

      /* edge feather */
      const snap = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) snap[i] = px[i * 4 + 3];
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const pos = y * W + x;
          if (snap[pos] > 0) {
            const hasTrans = snap[pos-1]===0||snap[pos+1]===0||snap[pos-W]===0||snap[pos+W]===0;
            if (hasTrans) {
              const d = dist(pos * 4); const t = tolerance * 0.6;
              px[pos * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, (d - t) / (tolerance - t))));
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('load failed'));
    img.src = src;
  });
}

/* ══════════════ AUTO-ADJUST ══════════════ */
async function autoAdjust(src: string): Promise<Adjustments> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const S = 80;
      const c = document.createElement('canvas'); c.width = S; c.height = S;
      const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0, S, S);
      const { data } = ctx.getImageData(0, 0, S, S);
      let sumL = 0, sumSq = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 80) continue;
        const l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
        sumL += l; sumSq += l * l; n++;
      }
      if (!n) { resolve(DEFAULT_ADJ); return; }
      const mean = sumL / n;
      const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
      let brightness = 100, contrast = 100;
      if (mean < 0.35) brightness = Math.min(130, Math.round(0.42 / (mean + 0.01) * 100));
      else if (mean > 0.78) brightness = Math.max(80, Math.round(0.6 / (mean + 0.01) * 100));
      if (std < 0.1) contrast = 118; else if (std > 0.38) contrast = 90;
      resolve({ ...DEFAULT_ADJ, brightness, contrast, saturation: 108 });
    };
    img.onerror = () => resolve(DEFAULT_ADJ);
    img.src = src;
  });
}

/* ══════════════ LEFT PANEL ══════════════ */
function LeftPanel({
  adj, setAdj, onUpload, onRemoveBg, processing, hasImage, bgTolerance, setBgTolerance, bgColor, setBgColor,
}: {
  adj: Adjustments; setAdj: (a: Adjustments) => void;
  onUpload: () => void; onRemoveBg: () => void;
  processing: boolean; hasImage: boolean;
  bgTolerance: number; setBgTolerance: (v: number) => void;
  bgColor: string; setBgColor: (c: string) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const S = (key: keyof Adjustments, label: string, min: number, max: number, step = 1) => (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <label style={{ fontSize: '0.66rem', fontWeight: '600', color: '#374151' }}>{label}</label>
        <span style={{ fontSize: '0.66rem', color: '#9CA3AF', fontWeight: '600' }}>
          {adj[key]}{key === 'hue' ? '°' : key === 'blur' ? 'px' : '%'}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={adj[key]}
        onChange={e => setAdj({ ...adj, [key]: Number(e.target.value) })}
        style={{ width: '100%', accentColor: '#FF6835', cursor: 'pointer', height: 3 }} />
    </div>
  );

  /* active filter preset name */
  const activePreset = FILTER_PRESETS.find(p => JSON.stringify(p.values) === JSON.stringify(adj))?.name ?? '';

  return (
    <div style={{ padding: '10px 12px' }}>
      {/* Upload */}
      <button onClick={onUpload}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, border: '1.5px dashed #FFD4C2', backgroundColor: '#FFF4F0', color: '#FF6835', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', marginBottom: 8 }}>
        <Upload size={13} /> Cargar imagen
      </button>

      {/* Remove BG */}
      <button onClick={onRemoveBg} disabled={!hasImage || processing}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, border: `1.5px solid ${hasImage && !processing ? '#818CF8' : '#E5E7EB'}`, backgroundColor: hasImage && !processing ? '#EEF2FF' : '#F9FAFB', color: hasImage && !processing ? '#4F46E5' : '#9CA3AF', cursor: hasImage && !processing ? 'pointer' : 'not-allowed', fontSize: '0.75rem', fontWeight: '700', marginBottom: 6 }}>
        {processing
          ? <><Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Procesando...</>
          : <><Eraser size={13} /> Quitar fondo</>}
      </button>

      {/* Tolerance dial */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <label style={{ fontSize: '0.62rem', fontWeight: '600', color: '#6B7280' }}>Tolerancia</label>
          <span style={{ fontSize: '0.62rem', color: '#9CA3AF', fontWeight: '600' }}>{bgTolerance}</span>
        </div>
        <input type="range" min={5} max={120} step={1} value={bgTolerance}
          onChange={e => setBgTolerance(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#4F46E5', cursor: 'pointer', height: 3 }} />
      </div>

      {/* Background color */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: '0.62rem', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: 4 }}>Color de fondo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Transparent swatch */}
          <button onClick={() => setBgColor('')}
            title="Transparente"
            style={{ width: 24, height: 24, borderRadius: 5, border: `2px solid ${bgColor === '' ? '#FF6835' : '#E5E7EB'}`, backgroundImage: 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)', backgroundSize: '8px 8px', cursor: 'pointer', flexShrink: 0 }} />
          {/* Color picker */}
          <label style={{ position: 'relative', cursor: 'pointer', width: 24, height: 24, flexShrink: 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: 5, border: `2px solid ${bgColor ? '#FF6835' : '#E5E7EB'}`, backgroundColor: bgColor || '#fff', cursor: 'pointer' }} />
            <input type="color" value={bgColor || '#ffffff'}
              onChange={e => setBgColor(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
          </label>
          {/* Quick whites / blacks */}
          {['#ffffff', '#f8f8f8', '#000000', '#f0f0f0'].map(c => (
            <button key={c} onClick={() => setBgColor(c)}
              style={{ width: 20, height: 20, borderRadius: 4, border: `1.5px solid ${bgColor === c ? '#FF6835' : '#D1D5DB'}`, backgroundColor: c, cursor: 'pointer', flexShrink: 0 }} />
          ))}
        </div>
      </div>

      {/* Filters dropdown */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setFiltersOpen(o => !o)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 7, border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#374151', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
          <span>🎨 Filtros{activePreset ? ` — ${activePreset}` : ''}</span>
          <span style={{ fontSize: '0.65rem', color: '#9CA3AF', transition: 'transform 0.15s', display: 'inline-block', transform: filtersOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
        </button>
        {filtersOpen && (
          <div style={{ marginTop: 4, padding: '8px', borderRadius: 7, border: '1px solid #E5E7EB', backgroundColor: '#fff', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {FILTER_PRESETS.map(p => {
              const active = JSON.stringify(adj) === JSON.stringify(p.values);
              return (
                <button key={p.name} onClick={() => { setAdj(p.values); setFiltersOpen(false); }}
                  style={{ padding: '4px 9px', borderRadius: 5, border: `1px solid ${active ? '#FF6835' : '#E5E7EB'}`, backgroundColor: active ? '#FF6835' : '#fff', color: active ? '#fff' : '#374151', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '600' }}>
                  {p.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Adjustments */}
      <p style={sLbl}>Ajustes</p>
      {S('brightness', 'Brillo', 0, 200)}
      {S('contrast', 'Contraste', 0, 200)}
      {S('saturation', 'Saturación', 0, 200)}
      {S('hue', 'Tono', -180, 180)}
      {S('sepia', 'Sepia', 0, 100)}
      {S('blur', 'Desenfoque', 0, 20)}
      {S('opacity', 'Opacidad', 10, 100)}

      <button onClick={() => setAdj(DEFAULT_ADJ)}
        style={{ width: '100%', padding: '6px', borderRadius: 7, border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#6B7280', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600' }}>
        ↺ Restablecer
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ══════════════ SLOT STRIP ══════════════ */
const SLOT_LABELS = ['Original', 'Auto', 'V1', 'V2', 'V3', 'V4'];
const SLOT_ICONS  = [Lock, Zap, Plus, Plus, Plus, Plus];

function SlotStrip({ slots, activeSlot, slotSize, onSlotClick }: {
  slots: (SlotState | null)[];
  activeSlot: number;
  slotSize: number;
  onSlotClick: (i: number) => void;
}) {
  return (
    <div style={{ width: slotSize, flexShrink: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#B0B0B0', borderRight: '1px solid #9A9A9A' }}>
      {slots.map((slot, i) => {
        const Icon = SLOT_ICONS[i];
        const isActive = i === activeSlot;
        const isEmpty = !slot;
        return (
          <div key={i} onClick={() => onSlotClick(i)} title={SLOT_LABELS[i]}
            style={{ width: slotSize, height: slotSize, flexShrink: 0, position: 'relative', cursor: 'pointer', border: `2px solid ${isActive ? '#FF6835' : 'transparent'}`, boxSizing: 'border-box', backgroundColor: '#C8C8C8', overflow: 'hidden', transition: 'border-color 0.1s' }}>

            {/* Thumbnail */}
            {slot ? (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-conic-gradient(#B0B0B0 0% 25%, transparent 0% 50%)', backgroundSize: '8px 8px' }}>
                <img src={slot.src} alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: buildFilter(slot.adj), transform: `rotate(${slot.rotation}deg) scaleX(${slot.flipH ? -1 : 1}) scaleY(${slot.flipV ? -1 : 1})` }} />
              </div>
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={Math.round(slotSize * 0.25)} style={{ color: '#888', opacity: 0.6 }} />
              </div>
            )}

            {/* Active border accent */}
            {isActive && <div style={{ position: 'absolute', inset: 0, border: '2px solid #FF6835', pointerEvents: 'none', boxSizing: 'border-box' }} />}

            {/* Tiny index dot */}
            <div style={{ position: 'absolute', bottom: 3, right: 4, fontSize: '0.45rem', fontWeight: '800', color: 'rgba(255,255,255,0.8)', textShadow: '0 0 3px rgba(0,0,0,0.6)', userSelect: 'none', pointerEvents: 'none' }}>
              {SLOT_LABELS[i][0]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════ CANVAS AREA ══════════════ */
function CanvasArea({
  imageSrc, adj, rotation, setRotation, flipH, setFlipH, flipV, setFlipV,
  zoom, onZoom, onLoad, imgDims,
  slots, activeSlot, onSlotClick,
  selectedTemplate, processing, bgColor,
  fontFamily, setFontFamily, fontSize, setFontSize,
  fontBold, setFontBold, fontItalic, setFontItalic, fontUnderline, setFontUnderline,
  textAlign, setTextAlign, textColor, setTextColor, textContent, setTextContent,
}: {
  imageSrc: string | null; adj: Adjustments;
  rotation: number; setRotation: (r: number) => void;
  flipH: boolean; setFlipH: (v: boolean) => void;
  flipV: boolean; setFlipV: (v: boolean) => void;
  zoom: number; onZoom: (z: number) => void;
  onLoad: (w: number, h: number) => void;
  imgDims: { w: number; h: number } | null;
  slots: (SlotState | null)[];
  activeSlot: number;
  onSlotClick: (i: number) => void;
  selectedTemplate: string;
  processing: boolean;
  bgColor: string;
  fontFamily: string; setFontFamily: (v: string) => void;
  fontSize: number; setFontSize: (v: number) => void;
  fontBold: boolean; setFontBold: (v: boolean) => void;
  fontItalic: boolean; setFontItalic: (v: boolean) => void;
  fontUnderline: boolean; setFontUnderline: (v: boolean) => void;
  textAlign: 'left' | 'center' | 'right'; setTextAlign: (v: 'left' | 'center' | 'right') => void;
  textColor: string; setTextColor: (v: string) => void;
  textContent: string; setTextContent: (v: string) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [slotSize, setSlotSize] = useState(80);
  const [frameW, setFrameW]     = useState(400);
  const [frameH, setFrameH]     = useState(400);
  const [textActive, setTextActive] = useState(false);

  const tpl = CANVAS_TEMPLATES.find(t => t.id === selectedTemplate) ?? CANVAS_TEMPLATES[0];

  useEffect(() => {
    const el = contentRef.current; if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const ss = Math.max(52, Math.floor(height / 6));
      setSlotSize(ss);
      const avW = width - ss - 32;
      const avH = height - 20;
      const ratio = tpl.w / tpl.h;
      if (avW / avH > ratio) { const fh = avH; setFrameH(fh); setFrameW(Math.round(fh * ratio)); }
      else                   { const fw = avW; setFrameW(fw); setFrameH(Math.round(fw / ratio)); }
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [tpl.w, tpl.h]);

  const imgTransform = `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;
  const aspectLabel  = imgDims ? aspectStr(imgDims.w, imgDims.h) : null;

  const tglBtn = (active: boolean): React.CSSProperties => ({
    ...tbBtn, backgroundColor: active ? '#FFF4F0' : '#fff',
    color: active ? '#FF6835' : '#374151',
    border: `1px solid ${active ? '#FFD4C2' : '#E5E7EB'}`,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── ROW 1: Zoom · Rotation · Flip · Aspect ── */}
      <div style={{ height: 42, backgroundColor: '#fff', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 5, flexShrink: 0, overflowX: 'auto' }}>
        {/* Zoom */}
        <button onClick={() => onZoom(Math.max(25, zoom - 10))} style={tbBtn}><ZoomOut size={13} /></button>
        <span style={tbVal}>{zoom}%</span>
        <button onClick={() => onZoom(Math.min(200, zoom + 10))} style={tbBtn}><ZoomIn size={13} /></button>
        <input type="range" min={25} max={200} step={5} value={zoom}
          onChange={e => onZoom(Number(e.target.value))}
          style={{ width: 70, accentColor: '#FF6835', cursor: 'pointer', flexShrink: 0 }} />
        <button onClick={() => onZoom(100)} style={{ ...tbBtn, fontSize: '0.62rem', fontWeight: '700', padding: '3px 7px', width: 'auto' }}>1:1</button>

        <div style={tbSep} />

        {/* Rotation */}
        <button onClick={() => setRotation((rotation - 1 + 360) % 360)} style={tbBtn}><RotateCcw size={13} /></button>
        <span style={tbVal}>{rotation}°</span>
        <button onClick={() => setRotation((rotation + 1) % 360)} style={tbBtn}><RotateCw size={13} /></button>
        <input type="range" min={0} max={360} step={1} value={rotation}
          onChange={e => { const v = Number(e.target.value); setRotation(v >= 360 ? 0 : v); }}
          style={{ width: 70, accentColor: '#FF6835', cursor: 'pointer', flexShrink: 0 }} />
        <button onClick={() => setRotation(0)} style={{ ...tbBtn, fontSize: '0.62rem', fontWeight: '700', padding: '3px 7px', width: 'auto' }}>0°</button>

        <div style={tbSep} />

        {/* Flip */}
        <button onClick={() => setFlipH(!flipH)} title="Flip H"
          style={{ ...tbBtn, backgroundColor: flipH ? '#EFF6FF' : '#fff', color: flipH ? '#3B82F6' : '#374151', border: `1px solid ${flipH ? '#BFDBFE' : '#E5E7EB'}` }}>
          <FlipHorizontal size={14} />
        </button>
        <button onClick={() => setFlipV(!flipV)} title="Flip V"
          style={{ ...tbBtn, backgroundColor: flipV ? '#EFF6FF' : '#fff', color: flipV ? '#3B82F6' : '#374151', border: `1px solid ${flipV ? '#BFDBFE' : '#E5E7EB'}` }}>
          <FlipVertical size={14} />
        </button>

        {/* Aspect */}
        {aspectLabel && (
          <>
            <div style={tbSep} />
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', whiteSpace: 'nowrap', userSelect: 'none' }}>{aspectLabel}</span>
            {imgDims && <span style={{ fontSize: '0.62rem', color: '#9CA3AF', whiteSpace: 'nowrap', userSelect: 'none' }}>{imgDims.w}×{imgDims.h}</span>}
          </>
        )}
      </div>

      {/* ── ROW 2: Text tools ── */}
      <div style={{ height: 40, backgroundColor: '#FAFAFA', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 5, flexShrink: 0, overflowX: 'auto' }}>

        {/* Text toggle */}
        <button onClick={() => setTextActive(!textActive)} title="Herramienta de texto"
          style={{ ...tbBtn, backgroundColor: textActive ? '#FFF4F0' : '#fff', color: textActive ? '#FF6835' : '#374151', border: `1px solid ${textActive ? '#FFD4C2' : '#E5E7EB'}` }}>
          <Type size={14} />
        </button>

        <div style={tbSep} />

        {/* Font family */}
        <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
          style={{ height: 28, padding: '0 6px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.72rem', backgroundColor: '#fff', cursor: 'pointer', color: '#374151', outline: 'none', flexShrink: 0, fontFamily }}>
          {FONT_FAMILIES.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>

        {/* Font size */}
        <button onClick={() => setFontSize(Math.max(8, fontSize - 2))} style={{ ...tbBtn, width: 22, height: 28 }}>−</button>
        <input type="number" value={fontSize} min={8} max={200}
          onChange={e => setFontSize(Math.max(8, Math.min(200, Number(e.target.value))))}
          style={{ width: 42, height: 28, padding: '0 4px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.72rem', fontWeight: '700', textAlign: 'center', color: '#374151', outline: 'none', flexShrink: 0 }} />
        <button onClick={() => setFontSize(Math.min(200, fontSize + 2))} style={{ ...tbBtn, width: 22, height: 28 }}>+</button>

        <div style={tbSep} />

        {/* Style */}
        <button onClick={() => setFontBold(!fontBold)} style={tglBtn(fontBold)}><Bold size={13} /></button>
        <button onClick={() => setFontItalic(!fontItalic)} style={tglBtn(fontItalic)}><Italic size={13} /></button>
        <button onClick={() => setFontUnderline(!fontUnderline)} style={tglBtn(fontUnderline)}><Underline size={13} /></button>

        <div style={tbSep} />

        {/* Alignment */}
        <button onClick={() => setTextAlign('left')}   style={tglBtn(textAlign === 'left')}><AlignLeft size={13} /></button>
        <button onClick={() => setTextAlign('center')} style={tglBtn(textAlign === 'center')}><AlignCenter size={13} /></button>
        <button onClick={() => setTextAlign('right')}  style={tglBtn(textAlign === 'right')}><AlignRight size={13} /></button>

        <div style={tbSep} />

        {/* Text color */}
        <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, border: '1.5px solid #E5E7EB', backgroundColor: textColor, cursor: 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: 5, backgroundColor: textColor, borderTop: '2px solid rgba(0,0,0,0.15)' }} />
          </div>
          <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
        </label>

        {/* Text input (when active) */}
        {textActive && (
          <>
            <div style={tbSep} />
            <input
              type="text"
              placeholder="Escribir texto..."
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              style={{ flex: 1, minWidth: 120, maxWidth: 260, height: 28, padding: '0 8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.72rem', color: '#374151', outline: 'none', fontFamily, fontWeight: fontBold ? '700' : '400', fontStyle: fontItalic ? 'italic' : 'normal' }}
            />
          </>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div ref={contentRef} style={{ flex: 1, display: 'flex', overflow: 'hidden', backgroundColor: '#C2C2C2' }}>

        <SlotStrip slots={slots} activeSlot={activeSlot} slotSize={slotSize} onSlotClick={onSlotClick} />

        {/* Gray area + frame */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>

          {/* Frame */}
          <div style={{
            width: frameW, height: frameH, flexShrink: 0, position: 'relative',
            /* bg: solid color if set, otherwise checkerboard */
            backgroundColor: bgColor || '#fff',
            backgroundImage: bgColor ? 'none' : 'repeating-conic-gradient(#D1D5DB 0% 25%, transparent 0% 50%)',
            backgroundSize: '20px 20px',
            borderRadius: tpl.shape === 'circle' ? '50%' : 4,
            boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
            overflow: 'hidden',
          }}>

            {/* Dim label */}
            <div style={{ position: 'absolute', bottom: 5, right: 7, fontSize: '0.52rem', fontWeight: '700', color: bgColor ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.25)', pointerEvents: 'none', userSelect: 'none', zIndex: 2 }}>{tpl.desc}</div>

            {/* Image */}
            {imageSrc && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center', transition: 'transform 0.12s' }}>
                  <img src={imageSrc} alt="editor"
                    onLoad={e => { const im = e.currentTarget; onLoad(im.naturalWidth, im.naturalHeight); }}
                    style={{ maxWidth: frameW, maxHeight: frameH, display: 'block', transform: imgTransform, filter: buildFilter(adj) }} />
                </div>
              </div>
            )}

            {/* Text overlay */}
            {textContent && (
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: '12%',
                textAlign,
                padding: '0 16px',
                pointerEvents: 'none', zIndex: 5,
              }}>
                <span style={{
                  fontFamily, fontSize: Math.max(10, Math.round(fontSize * frameH / 800)),
                  fontWeight: fontBold ? '700' : '400',
                  fontStyle: fontItalic ? 'italic' : 'normal',
                  textDecoration: fontUnderline ? 'underline' : 'none',
                  color: textColor,
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>{textContent}</span>
              </div>
            )}

            {/* Processing overlay */}
            {processing && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(79,70,229,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 10 }}>
                <Loader size={28} color="#4F46E5" style={{ animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4F46E5', backgroundColor: 'rgba(255,255,255,0.9)', padding: '4px 12px', borderRadius: 20 }}>Quitando fondo...</span>
              </div>
            )}
          </div>

          {/* Empty state */}
          {!imageSrc && !processing && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: 6 }}>
              <div style={{ fontSize: '3rem' }}>🖼️</div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>Sin imagen</p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>Cargá o arrastrá una imagen aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════ PROPERTIES PANEL ══════════════ */
function PropertiesPanel({
  imageSrc, adj, rotation, flipH, flipV, imgDims,
  onExport, selectedTemplate, setSelectedTemplate,
}: {
  imageSrc: string | null; adj: Adjustments; rotation: number; flipH: boolean; flipV: boolean;
  imgDims: { w: number; h: number } | null;
  onExport: () => void;
  selectedTemplate: string; setSelectedTemplate: (id: string) => void;
}) {
  const active = Object.entries(adj).filter(([k, v]) => v !== (DEFAULT_ADJ as Record<string, number>)[k]).length;

  return (
    <div>
      {imgDims && (
        <>
          <p style={pLbl}>Dimensiones</p>
          <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#111827', margin: '0 0 2px' }}>{imgDims.w} × {imgDims.h} px</p>
          <p style={{ fontSize: '0.68rem', color: '#9CA3AF', margin: '0 0 10px' }}>{aspectStr(imgDims.w, imgDims.h)}</p>
        </>
      )}

      <p style={pLbl}>Estado</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {rotation > 0 && <Chip c="#FF6835">↻ {rotation}°</Chip>}
        {flipH && <Chip c="#3B82F6">↔ H</Chip>}
        {flipV && <Chip c="#3B82F6">↕ V</Chip>}
        {active > 0 && <Chip c="#10B981">✓ {active} aj.</Chip>}
        {!rotation && !flipH && !flipV && active === 0 && <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Sin modificaciones</span>}
      </div>

      <button onClick={() => imageSrc && onExport()} disabled={!imageSrc}
        style={{ width: '100%', padding: '9px', borderRadius: 8, border: 'none', backgroundColor: imageSrc ? '#FF6835' : '#E5E7EB', color: imageSrc ? '#fff' : '#9CA3AF', cursor: imageSrc ? 'pointer' : 'not-allowed', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 16 }}>
        <Download size={13} /> Exportar
      </button>

      <p style={pLbl}>Templates</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {CANVAS_TEMPLATES.map(t => {
          const isActive = selectedTemplate === t.id;
          const ratio = t.w / t.h;
          const bH = Math.min(28, Math.round(36 / ratio));
          const bW = Math.round(bH * ratio);
          return (
            <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 7, border: `1.5px solid ${isActive ? '#FF6835' : '#E5E7EB'}`, backgroundColor: isActive ? '#FFF4F0' : '#fff', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: bW, height: bH, border: `1.5px solid ${isActive ? '#FF6835' : '#9CA3AF'}`, borderRadius: t.shape === 'circle' ? '50%' : 2, backgroundColor: isActive ? '#FECDD3' : '#F3F4F6' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: isActive ? '#FF6835' : '#111827' }}>{t.name}</div>
                <div style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>{t.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════ EXPORT DIALOG ══════════════ */
function ExportDialog({ slots, onClose, onExportSelected }: {
  slots: (SlotState | null)[];
  onClose: () => void;
  onExportSelected: (indices: number[]) => void;
}) {
  const filled = slots.map((s, i) => ({ s, i })).filter(({ s }) => s !== null);
  const [checked, setChecked] = useState<boolean[]>(slots.map((s, i) => i <= 1 && s !== null));
  const toggle = (i: number) => setChecked(prev => prev.map((v, j) => j === i ? !v : v));
  const selected = checked.map((v, i) => v ? i : -1).filter(i => i >= 0);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 24, width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>¿Qué exportar?</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {filled.map(({ s, i }) => s ? (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${checked[i] ? '#FF6835' : '#E5E7EB'}`, backgroundColor: checked[i] ? '#FFF4F0' : '#fff', cursor: 'pointer' }}>
              <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} style={{ display: 'none' }} />
              {checked[i] ? <CheckSquare size={15} color="#FF6835" /> : <Square size={15} color="#9CA3AF" />}
              <img src={s.src} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 4, border: '1px solid #F3F4F6', backgroundImage: 'repeating-conic-gradient(#eee 0% 25%, transparent 0% 50%)', backgroundSize: '6px 6px' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151' }}>{SLOT_LABELS[i]}</span>
            </label>
          ) : null)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}>Cancelar</button>
          <button onClick={() => { onExportSelected(selected); onClose(); }} disabled={selected.length === 0}
            style={{ flex: 2, padding: '9px', borderRadius: 8, border: 'none', backgroundColor: selected.length > 0 ? '#FF6835' : '#E5E7EB', color: selected.length > 0 ? '#fff' : '#9CA3AF', cursor: selected.length > 0 ? 'pointer' : 'not-allowed', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Download size={13} /> Exportar {selected.length > 0 ? `(${selected.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ STYLE TOKENS ══════════════ */
const Chip = ({ children, c }: { children: React.ReactNode; c: string }) => (
  <span style={{ padding: '2px 7px', borderRadius: 4, backgroundColor: `${c}18`, color: c, fontSize: '0.65rem', fontWeight: '700' }}>{children}</span>
);
const sLbl: React.CSSProperties = { fontSize: '0.6rem', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' };
const pLbl: React.CSSProperties = { fontSize: '0.6rem', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 5px' };
const tbBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', flexShrink: 0 };
const tbVal: React.CSSProperties = { fontSize: '0.72rem', fontWeight: '700', color: '#374151', minWidth: 36, textAlign: 'center', userSelect: 'none', flexShrink: 0 };
const tbSep: React.CSSProperties = { width: 1, height: 20, backgroundColor: '#E5E7EB', margin: '0 2px', flexShrink: 0 };

/* ══════════════ MAIN ══════════════ */
export function EditorImagenesWorkspace({ onNavigate }: Props) {
  const [imageSrc, setImageSrc]   = useState<string | null>(null);
  const [imageName, setImageName] = useState('imagen');
  const [adj, setAdj]             = useState<Adjustments>(DEFAULT_ADJ);
  const [rotation, setRotation]   = useState(0);
  const [flipH, setFlipH]         = useState(false);
  const [flipV, setFlipV]         = useState(false);
  const [zoom, setZoom]           = useState(100);
  const [imgDims, setImgDims]     = useState<{ w: number; h: number } | null>(null);
  const [slots, setSlots]         = useState<(SlotState | null)[]>(Array(6).fill(null));
  const [activeSlot, setActiveSlot] = useState(-1);
  const [processing, setProcessing] = useState(false);
  const [bgTolerance, setBgTolerance] = useState(58);
  const [bgColor, setBgColor]     = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('square');
  const [showExportDialog, setShowExportDialog] = useState(false);

  /* Text state */
  const [fontFamily, setFontFamily]     = useState('Arial');
  const [fontSize, setFontSize]         = useState(72);
  const [fontBold, setFontBold]         = useState(false);
  const [fontItalic, setFontItalic]     = useState(false);
  const [fontUnderline, setFontUnderline] = useState(false);
  const [textAlign, setTextAlign]       = useState<'left' | 'center' | 'right'>('center');
  const [textColor, setTextColor]       = useState('#ffffff');
  const [textContent, setTextContent]   = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  /* ── File load ── */
  const handleFileLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = async e => {
      const src = e.target?.result as string;
      setImageSrc(src);
      setImageName(file.name.replace(/\.[^.]+$/, ''));
      setAdj(DEFAULT_ADJ); setRotation(0); setFlipH(false); setFlipV(false); setZoom(100);
      const newSlots: (SlotState | null)[] = Array(6).fill(null);
      newSlots[0] = { src, adj: DEFAULT_ADJ, rotation: 0, flipH: false, flipV: false, label: 'Original' };
      setSlots(newSlots); setActiveSlot(0);

      setProcessing(true);
      setTimeout(async () => {
        try {
          const bgRemoved = await removeBg(src, bgTolerance);
          const aa = await autoAdjust(bgRemoved);
          setSlots(prev => {
            const next = [...prev];
            next[1] = { src: bgRemoved, adj: aa, rotation: 0, flipH: false, flipV: false, label: 'Auto' };
            return next;
          });
          setImageSrc(bgRemoved); setAdj(aa); setActiveSlot(1);
        } catch { /* keep original */ }
        finally { setProcessing(false); }
      }, 60);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFileLoad(file);
  }, [bgTolerance]);

  /* ── Manual BG removal ── */
  const handleRemoveBg = () => {
    if (!imageSrc || processing) return;
    setProcessing(true);
    setTimeout(async () => {
      try { setImageSrc(await removeBg(imageSrc, bgTolerance)); }
      catch { /* noop */ }
      finally { setProcessing(false); }
    }, 60);
  };

  /* ── Slot click ── */
  const handleSlotClick = (i: number) => {
    const s = slots[i];
    if (!s) {
      if (!imageSrc) return;
      setSlots(prev => {
        const next = [...prev];
        next[i] = { src: imageSrc, adj, rotation, flipH, flipV, label: SLOT_LABELS[i] };
        return next;
      });
      setActiveSlot(i);
    } else {
      setImageSrc(s.src); setAdj(s.adj); setRotation(s.rotation);
      setFlipH(s.flipH); setFlipV(s.flipV); setActiveSlot(i);
    }
  };

  /* ── Export ── */
  const doExport = (s: SlotState, fname: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = buildFilter(s.adj);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.scale(s.flipH ? -1 : 1, s.flipV ? -1 : 1);
      ctx.drawImage(img, -cx, -cy);
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = `${fname}.png`; a.click();
    };
    img.src = s.src;
  };

  const handleExportSelected = (indices: number[]) =>
    indices.forEach(i => { const s = slots[i]; if (s) doExport(s, `${imageName}_${SLOT_LABELS[i].toLowerCase()}`); });

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileLoad(f); }} />

      {showExportDialog && (
        <ExportDialog slots={slots} onClose={() => setShowExportDialog(false)} onExportSelected={handleExportSelected} />
      )}

      <WorkspaceShell
        toolId="editor-imagenes"
        onNavigate={onNavigate}
        leftPanel={
          <LeftPanel adj={adj} setAdj={setAdj}
            onUpload={() => fileRef.current?.click()}
            onRemoveBg={handleRemoveBg}
            processing={processing} hasImage={!!imageSrc}
            bgTolerance={bgTolerance} setBgTolerance={setBgTolerance}
            bgColor={bgColor} setBgColor={setBgColor}
          />
        }
        canvas={
          <div style={{ height: '100%' }} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
            <CanvasArea
              imageSrc={imageSrc} adj={adj}
              rotation={rotation} setRotation={setRotation}
              flipH={flipH} setFlipH={setFlipH}
              flipV={flipV} setFlipV={setFlipV}
              zoom={zoom} onZoom={setZoom}
              onLoad={(w, h) => setImgDims({ w, h })}
              imgDims={imgDims}
              slots={slots} activeSlot={activeSlot} onSlotClick={handleSlotClick}
              selectedTemplate={selectedTemplate}
              processing={processing}
              bgColor={bgColor}
              fontFamily={fontFamily} setFontFamily={setFontFamily}
              fontSize={fontSize} setFontSize={setFontSize}
              fontBold={fontBold} setFontBold={setFontBold}
              fontItalic={fontItalic} setFontItalic={setFontItalic}
              fontUnderline={fontUnderline} setFontUnderline={setFontUnderline}
              textAlign={textAlign} setTextAlign={setTextAlign}
              textColor={textColor} setTextColor={setTextColor}
              textContent={textContent} setTextContent={setTextContent}
            />
          </div>
        }
        properties={
          <PropertiesPanel
            imageSrc={imageSrc} adj={adj} rotation={rotation}
            flipH={flipH} flipV={flipV} imgDims={imgDims}
            onExport={() => setShowExportDialog(true)}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />
        }
        actions={imageSrc ? (
          <>
            <span style={{ fontSize: '0.68rem', color: '#71717A' }}>{imageName}</span>
            <button onClick={() => setShowExportDialog(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 5, border: 'none', backgroundColor: '#FF6835', color: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
              <Download size={12} /> Exportar
            </button>
          </>
        ) : undefined}
      />
    </>
  );
}
