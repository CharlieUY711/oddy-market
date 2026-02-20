/**
 * 🛠️ Herramientas Hub — Punto de entrada a la Suite de Herramientas
 * Workspace unificado: 6 herramientas especializadas + 3 rápidas
 */
import React from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { ArrowRight, Zap, Layout, Download } from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }
const ORANGE = '#FF6835';

interface WorkspaceTool {
  id: MainSection;
  emoji: string;
  name: string;
  description: string;
  features: string[];
  color: string;
  bg: string;
  border: string;
  status: 'available' | 'beta' | 'soon';
}

const WORKSPACE_TOOLS: WorkspaceTool[] = [
  {
    id: 'editor-imagenes',
    emoji: '🖼️', name: 'Editor de Imágenes',
    description: 'Filtros CSS en tiempo real, rotación, flip, 8 presets y export PNG/JPG con transformaciones aplicadas.',
    features: ['8 filtros predefinidos', 'Ajustes manuales', 'Export PNG · JPG'],
    color: '#FF6835', bg: '#FFF4F0', border: '#FFD4C2', status: 'available',
  },
  {
    id: 'biblioteca',
    emoji: '📁', name: 'Biblioteca de Assets',
    description: 'Repositorio centralizado de imágenes, documentos y archivos. Upload drag & drop, colecciones y tags.',
    features: ['Imágenes · Docs · Videos', 'Colecciones y tags', 'Vista grid / lista'],
    color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', status: 'available',
  },
  {
    id: 'gen-documentos',
    emoji: '📄', name: 'Generador de Documentos',
    description: 'Editor WYSIWYG con bloques arrastrables. Crea contratos, cartas e informes en formato A4 imprimible.',
    features: ['8 tipos de bloque', 'Plantilla A4', 'Export PDF'],
    color: '#10B981', bg: '#F0FDF8', border: '#A7F3D0', status: 'available',
  },
  {
    id: 'gen-presupuestos',
    emoji: '💰', name: 'Generador de Presupuestos',
    description: 'Crea presupuestos profesionales con líneas de ítems, IVA configurable, descuentos y export PDF.',
    features: ['Ítems · IVA · Descuentos', 'Multi-moneda', 'Export PDF'],
    color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', status: 'available',
  },
  {
    id: 'ocr',
    emoji: '🔍', name: 'OCR — Texto desde Imagen',
    description: 'Convierte fotos de facturas, documentos escaneados o imágenes a texto editable. 100% en el browser con Tesseract.js.',
    features: ['Tesseract.js · sin API', 'Español · Inglés · PT', 'Export TXT · copiar'],
    color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', status: 'available',
  },
  {
    id: 'impresion',
    emoji: '🖨️', name: 'Módulo de Impresión',
    description: 'Configurá papel, orientación, copias y modo color. Preview A4 antes de imprimir cualquier documento.',
    features: ['A4 · A5 · Letter · Legal', 'Color / B&N', 'Preview pre-impresión'],
    color: '#EC4899', bg: '#FDF2F8', border: '#FBCFE8', status: 'available',
  },
];

interface QuickTool {
  id: MainSection;
  emoji: string;
  name: string;
  description: string;
  color: string;
}

const QUICK_TOOLS: QuickTool[] = [
  { id: 'qr-generator', emoji: '⬛', name: 'Generador de QR', description: 'QR personalizado sin APIs. Export PNG y SVG vectorial.', color: '#111827' },
  { id: 'rueda-sorteos', emoji: '🎡', name: 'Rueda de Sorteos', description: 'Sorteos interactivos para campañas y concursos.', color: '#6D28D9' },
  { id: 'ideas-board', emoji: '💡', name: 'Ideas Board', description: 'Canvas visual tipo pizarrón con stickers y conectores.', color: '#0EA5E9' },
];

const STATUS_META = {
  available: { label: 'Disponible', color: '#10B981', bg: '#D1FAE5' },
  beta:      { label: 'Beta',       color: '#F59E0B', bg: '#FEF3C7' },
  soon:      { label: 'Próximamente', color: '#9CA3AF', bg: '#F3F4F6' },
};

export function HerramientasView({ onNavigate }: Props) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        title="🛠️ Suite de Herramientas"
        subtitle="6 herramientas especializadas · Workspace unificado · Export nativo"
        actions={[{ label: '📁 Abrir Biblioteca', onClick: () => onNavigate('biblioteca'), primary: true }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', backgroundColor: '#F8F9FA' }}>

        {/* ── Hero banner ── */}
        <div style={{
          marginBottom: 20, borderRadius: 14, overflow: 'hidden',
          background: 'linear-gradient(135deg, #18181B 0%, #27272A 60%, #1C1917 100%)',
          padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: '700', color: '#FF6835', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              CHARLIE WORKSPACE
            </p>
            <p style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: '800', color: '#fff', lineHeight: 1.3 }}>
              Todas las herramientas comparten el mismo layout profesional
            </p>
            <p style={{ margin: 0, fontSize: '0.77rem', color: '#A1A1AA', lineHeight: 1.5 }}>
              Barra superior con cambio de herramienta · Panel izquierdo específico · Panel derecho con Propiedades, Biblioteca, Impresión y Templates
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            {[
              { Icon: Zap,    v: '6',     l: 'herramientas'   },
              { Icon: Layout, v: '1',     l: 'workspace'      },
              { Icon: Download, v: '100%', l: 'export nativo' },
            ].map(({ Icon, v, l }) => (
              <div key={l} style={{ textAlign: 'center', padding: '10px 14px', borderRadius: 10, backgroundColor: '#ffffff10', border: '1px solid #ffffff15' }}>
                <Icon size={14} color="#FF6835" style={{ marginBottom: 4 }} />
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>{v}</div>
                <div style={{ fontSize: '0.6rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Workspace Suite ── */}
        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            WORKSPACE SUITE
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>6 herramientas</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {WORKSPACE_TOOLS.map(tool => {
            const sm = STATUS_META[tool.status];
            return (
              <div key={tool.id}
                style={{
                  backgroundColor: '#fff', borderRadius: 12,
                  border: `1px solid ${tool.border}`,
                  overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  transition: 'box-shadow 0.15s',
                  cursor: 'pointer',
                }}
                onClick={() => onNavigate(tool.id)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${tool.color}22`; e.currentTarget.style.borderColor = tool.color; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = tool.border; }}
              >
                <div style={{ height: 4, backgroundColor: tool.color }} />
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: tool.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                      {tool.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', color: '#111827', fontSize: '0.88rem' }}>{tool.name}</span>
                        <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: '0.58rem', fontWeight: '800', backgroundColor: sm.bg, color: sm.color }}>
                          {sm.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: '#6B7280', lineHeight: 1.5, flex: 1 }}>{tool.description}</p>

                  {/* Feature chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                    {tool.features.map(f => (
                      <span key={f} style={{ padding: '2px 7px', borderRadius: 4, backgroundColor: tool.bg, color: tool.color, fontSize: '0.63rem', fontWeight: '700' }}>
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={e => { e.stopPropagation(); onNavigate(tool.id); }}
                    style={{
                      width: '100%', padding: '8px', borderRadius: 8, border: 'none',
                      backgroundColor: tool.color, color: '#fff', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    Abrir herramienta <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Quick Tools ── */}
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            HERRAMIENTAS RÁPIDAS
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>3 herramientas</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {QUICK_TOOLS.map(tool => (
            <div key={tool.id}
              onClick={() => onNavigate(tool.id)}
              style={{
                backgroundColor: '#fff', borderRadius: 12,
                border: `1px solid #E5E7EB`,
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                transition: 'box-shadow 0.15s', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${tool.color}22`; e.currentTarget.style.borderColor = tool.color; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <div style={{ height: 4, backgroundColor: tool.color }} />
              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${tool.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    {tool.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: '800', color: '#111827', fontSize: '0.88rem' }}>{tool.name}</span>
                    </div>
                  </div>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: '0.74rem', color: '#6B7280', lineHeight: 1.5, flex: 1 }}>{tool.description}</p>
                <button
                  onClick={e => { e.stopPropagation(); onNavigate(tool.id); }}
                  style={{
                    width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${tool.color}40`,
                    backgroundColor: `${tool.color}10`, color: tool.color, cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                  Abrir herramienta <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}