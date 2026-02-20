/* =====================================================
   ConstructorView — Generador de proyectos
   Seleccioná módulos → generá un nuevo repo en GitHub
   ===================================================== */
import React, { useState } from 'react';
import {
  Blocks, ShoppingCart, Truck, Megaphone, Rss, Wrench,
  Database, Monitor, Plug, Search, GitBranch, Check,
  ChevronRight, Info, LogIn, Upload, Store, LayoutGrid,
} from 'lucide-react';
import type { MainSection } from '../../../AdminDashboard';

interface Props { onNavigate: (s: MainSection) => void; }

/* ── Definición de módulos disponibles ── */
interface Module {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: string;
  envVars?: string[];
  required?: boolean;
}

const MODULES: Module[] = [
  // eCommerce
  { id: 'ecommerce',        label: 'eCommerce Hub',       description: 'Catálogo, productos, storefront y pedidos',         icon: ShoppingCart, category: 'eCommerce',     envVars: ['VITE_STORE_NAME', 'VITE_CURRENCY'] },
  { id: 'clientes',         label: 'Clientes',            description: 'Gestión de clientes y contactos',                   icon: Database,     category: 'eCommerce' },
  { id: 'pedidos',          label: 'Pedidos',             description: 'Gestión y seguimiento de órdenes',                  icon: ShoppingCart, category: 'eCommerce' },
  { id: 'metodos-pago',     label: 'Métodos de Pago',     description: 'Configuración de pasarelas de pago',                icon: Database,     category: 'eCommerce',     envVars: ['VITE_PAYMENT_GATEWAY_KEY'] },
  { id: 'metodos-envio',    label: 'Métodos de Envío',    description: 'Configuración de envíos y tarifas',                 icon: Truck,        category: 'eCommerce' },
  { id: 'secondhand',       label: 'Segunda Mano',        description: 'Módulo de productos de segunda mano',               icon: ShoppingCart, category: 'eCommerce' },
  // Logística
  { id: 'logistica',        label: 'Logística Hub',       description: 'Centro de operaciones logísticas',                  icon: Truck,        category: 'Logística' },
  { id: 'fulfillment',      label: 'Fulfillment',         description: 'Gestión de preparación y despacho',                 icon: Truck,        category: 'Logística' },
  { id: 'transportistas',   label: 'Transportistas',      description: 'Gestión de transportistas y flotas',                icon: Truck,        category: 'Logística' },
  { id: 'rutas',            label: 'Rutas',               description: 'Planificación y optimización de rutas',             icon: Truck,        category: 'Logística' },
  { id: 'mapa-envios',      label: 'Mapa de Envíos',      description: 'Visualización geográfica de envíos',                icon: Truck,        category: 'Logística',     envVars: ['VITE_MAPS_API_KEY'] },
  { id: 'tracking-publico', label: 'Tracking Público',    description: 'Página pública de seguimiento de pedidos',          icon: Search,       category: 'Logística' },
  // Marketing
  { id: 'marketing',        label: 'Marketing Hub',       description: 'Centro de marketing digital',                       icon: Megaphone,    category: 'Marketing' },
  { id: 'mailing',          label: 'Mailing',             description: 'Campañas de email marketing',                      icon: Megaphone,    category: 'Marketing',     envVars: ['VITE_MAIL_API_KEY'] },
  { id: 'google-ads',       label: 'Google Ads',          description: 'Gestión de campañas de Google Ads',                icon: Megaphone,    category: 'Marketing',     envVars: ['VITE_GOOGLE_ADS_ID'] },
  { id: 'seo',              label: 'SEO',                 description: 'Optimización para buscadores',                      icon: Search,       category: 'Marketing' },
  { id: 'fidelizacion',     label: 'Fidelización',        description: 'Programas de puntos y recompensas',                 icon: Megaphone,    category: 'Marketing' },
  { id: 'rueda-sorteos',    label: 'Rueda de Sorteos',    description: 'Gamificación y sorteos interactivos',               icon: Megaphone,    category: 'Marketing' },
  { id: 'etiqueta-emotiva', label: 'Etiqueta Emotiva',   description: 'Generador de etiquetas con IA emotiva',             icon: Megaphone,    category: 'Marketing',     envVars: ['VITE_AI_API_KEY'] },
  // RRSS
  { id: 'rrss',             label: 'RRSS Hub',            description: 'Gestión de redes sociales',                         icon: Rss,          category: 'RRSS' },
  { id: 'redes-sociales',   label: 'Redes Sociales',      description: 'Publicación y programación de contenido',           icon: Rss,          category: 'RRSS' },
  { id: 'migracion-rrss',   label: 'Migración RRSS',      description: 'Migración de contenido entre plataformas',          icon: Rss,          category: 'RRSS' },
  // Gestión
  { id: 'gestion',          label: 'Gestión Hub',         description: 'ERP, CRM y gestión empresarial',                   icon: Database,     category: 'Gestión' },
  { id: 'erp-inventario',   label: 'ERP Inventario',      description: 'Control de stock e inventario',                    icon: Database,     category: 'Gestión' },
  { id: 'erp-facturacion',  label: 'ERP Facturación',     description: 'Facturación electrónica y comprobantes',           icon: Database,     category: 'Gestión' },
  { id: 'erp-compras',      label: 'ERP Compras',         description: 'Gestión de compras y proveedores',                 icon: Database,     category: 'Gestión' },
  { id: 'erp-crm',          label: 'ERP CRM',             description: 'Gestión de relaciones con clientes',               icon: Database,     category: 'Gestión' },
  { id: 'erp-contabilidad', label: 'ERP Contabilidad',    description: 'Contabilidad y reportes financieros',              icon: Database,     category: 'Gestión' },
  { id: 'erp-rrhh',         label: 'ERP RRHH',            description: 'Recursos humanos y nómina',                        icon: Database,     category: 'Gestión' },
  { id: 'proyectos',        label: 'Proyectos',           description: 'Gestión de proyectos y tareas',                    icon: Database,     category: 'Gestión' },
  { id: 'produccion',       label: 'Producción',          description: 'Control de producción y manufactura',              icon: Database,     category: 'Gestión' },
  { id: 'abastecimiento',   label: 'Abastecimiento',      description: 'Cadena de suministro y abastecimiento',            icon: Database,     category: 'Gestión' },
  { id: 'departamentos',    label: 'Departamentos',       description: 'Estructura organizacional',                        icon: Database,     category: 'Gestión' },
  { id: 'personas',         label: 'Personas',            description: 'Directorio de personas y contactos',              icon: Database,     category: 'Gestión' },
  { id: 'organizaciones',   label: 'Organizaciones',      description: 'Gestión de organizaciones y empresas',             icon: Database,     category: 'Gestión' },
  // Herramientas
  { id: 'herramientas',     label: 'Herramientas Hub',    description: 'Suite de herramientas internas',                   icon: Wrench,       category: 'Herramientas' },
  { id: 'qr-generator',     label: 'QR Generator',        description: 'Generador de códigos QR',                          icon: Wrench,       category: 'Herramientas' },
  { id: 'pos',              label: 'POS',                  description: 'Punto de venta físico',                            icon: Wrench,       category: 'Herramientas' },
  { id: 'diseno',           label: 'Diseño',              description: 'Herramientas de diseño y creatividad',             icon: Wrench,       category: 'Herramientas' },
  { id: 'biblioteca',       label: 'Biblioteca',          description: 'Repositorio de archivos y recursos',               icon: Wrench,       category: 'Herramientas',  envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] },
  { id: 'editor-imagenes',  label: 'Editor de Imágenes',  description: 'Editor de imágenes integrado',                    icon: Wrench,       category: 'Herramientas' },
  { id: 'gen-documentos',   label: 'Generador Docs',      description: 'Generación automática de documentos',              icon: Wrench,       category: 'Herramientas' },
  { id: 'gen-presupuestos', label: 'Generador Presupuestos', description: 'Cotizaciones y presupuestos',                  icon: Wrench,       category: 'Herramientas' },
  { id: 'ocr',              label: 'OCR',                  description: 'Reconocimiento óptico de caracteres',             icon: Wrench,       category: 'Herramientas',  envVars: ['VITE_OCR_API_KEY'] },
  { id: 'impresion',        label: 'Impresión',           description: 'Gestión de impresión y etiquetas',                 icon: Wrench,       category: 'Herramientas' },
  { id: 'checklist',        label: 'Checklist',           description: 'Listas de verificación y procesos',                icon: Wrench,       category: 'Herramientas' },
  { id: 'ideas-board',      label: 'Ideas Board',         description: 'Tablero de ideas y brainstorming',                 icon: Wrench,       category: 'Herramientas' },
  // Sistema
  { id: 'sistema',          label: 'Sistema Hub',         description: 'Configuración del sistema',                        icon: Monitor,      category: 'Sistema',       required: true },
  { id: 'auditoria',        label: 'Auditoría',           description: 'Logs y monitoreo del sistema',                     icon: Search,       category: 'Sistema' },
  // Integraciones
  { id: 'integraciones',          label: 'Integraciones Hub',       description: 'Centro de integraciones externas',       icon: Plug,         category: 'Integraciones' },
  { id: 'integraciones-pagos',    label: 'Integr. Pagos',          description: 'Stripe, MercadoPago, PayPal…',            icon: Plug,         category: 'Integraciones', envVars: ['VITE_STRIPE_KEY', 'VITE_MP_KEY'] },
  { id: 'integraciones-logistica',label: 'Integr. Logística',      description: 'Correo, Andreani, OCA…',                 icon: Plug,         category: 'Integraciones' },
  { id: 'integraciones-tiendas',  label: 'Integr. Tiendas',        description: 'MercadoLibre, Tiendanube…',              icon: Plug,         category: 'Integraciones',  envVars: ['VITE_ML_APP_ID', 'VITE_TN_TOKEN'] },
  { id: 'integraciones-rrss',     label: 'Integr. RRSS',           description: 'Meta, Instagram, TikTok…',               icon: Plug,         category: 'Integraciones',  envVars: ['VITE_META_APP_ID'] },
  { id: 'integraciones-servicios',label: 'Integr. Servicios',      description: 'Google, WhatsApp, Slack…',               icon: Plug,         category: 'Integraciones',  envVars: ['VITE_GOOGLE_CLIENT_ID', 'VITE_WA_TOKEN'] },
  { id: 'integraciones-apis',     label: 'Repositorio de APIs',    description: 'Catálogo central de APIs',               icon: Plug,         category: 'Integraciones' },
  // ── Auth ─────────────────────────────────────────────────────────────────────
  { id: 'auth-registro',    label: 'Registro y Login',      description: 'Sign up, sign in, recupero de contraseña, OAuth social (Google, Meta…)',  icon: LogIn,      category: 'Auth',         envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'VITE_GOOGLE_CLIENT_ID', 'VITE_META_APP_ID'] },
  // ── Archivos ──────────────────────────────────────────────────────────────────
  { id: 'carga-masiva',     label: 'Carga Masiva',          description: 'Upload masivo de archivos (CSV, imágenes, docs) con previsualización y validación', icon: Upload,     category: 'Herramientas', envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] },
  // ── RRSS Shop ────────────────────────────────────────────────────────────────
  { id: 'meta-business',    label: 'Meta Business / RRSS Shop', description: 'Catálogo en Facebook/Instagram, Meta Ads, píxel, Shops y sincronización de productos', icon: Store,      category: 'RRSS',         envVars: ['VITE_META_APP_ID', 'VITE_META_PIXEL_ID', 'VITE_META_ACCESS_TOKEN', 'VITE_CATALOG_ID'] },
  // ── Workspace ────────────────────────────────────────────────────────────────
  { id: 'unified-workspace',label: 'Unified Workspace',     description: 'Espacio de trabajo unificado: docs, tareas, chat interno, calendario y notas colaborativas', icon: LayoutGrid, category: 'Workspace',     envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'VITE_WS_REALTIME_KEY'] },
];

const CATEGORIES = [...new Set(MODULES.map(m => m.category))];

const ORANGE = '#FF6835';

/* ── Vars base siempre incluidas ── */
const BASE_ENV = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_APP_NAME',
  'VITE_APP_URL',
];

export function ConstructorView({ onNavigate }: Props) {
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [projectName, setProjectName] = useState('');
  const [step, setStep]           = useState<'select' | 'config'>('select');
  const [filterCat, setFilterCat] = useState<string>('Todos');

  const toggle = (id: string) => {
    const mod = MODULES.find(m => m.id === id);
    if (mod?.required) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll   = () => setSelected(new Set(MODULES.filter(m => !m.required).map(m => m.id)));
  const clearAll    = () => setSelected(new Set());

  /* Calcular env vars necesarias */
  const allEnvVars = Array.from(new Set([
    ...BASE_ENV,
    ...MODULES
      .filter(m => selected.has(m.id) || m.required)
      .flatMap(m => m.envVars ?? []),
  ]));

  const visibleModules = filterCat === 'Todos'
    ? MODULES
    : MODULES.filter(m => m.category === filterCat);

  const totalSelected = selected.size + MODULES.filter(m => m.required).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      {/* ── Top Bar ── */}
      <div style={{
        height: '56px', flexShrink: 0,
        backgroundColor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center',
        padding: '0 28px', gap: '14px',
      }}>
        <Blocks size={20} color={ORANGE} />
        <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#111' }}>
          Constructor de Proyectos
        </h1>
        <span style={{
          marginLeft: '4px',
          backgroundColor: ORANGE, color: '#fff',
          fontSize: '0.7rem', fontWeight: '700',
          padding: '2px 8px', borderRadius: '20px',
        }}>
          {totalSelected} módulos
        </span>

        <div style={{ flex: 1 }} />

        {/* Tabs */}
        {(['select', 'config'] as const).map(s => (
          <button key={s} onClick={() => setStep(s)} style={{
            padding: '6px 16px', borderRadius: '8px', border: 'none',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600',
            backgroundColor: step === s ? ORANGE : 'transparent',
            color: step === s ? '#fff' : '#6B7280',
            transition: 'all 0.15s',
          }}>
            {s === 'select' ? '1 · Módulos' : '2 · Configuración'}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      {step === 'select' && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Filtros + acciones */}
          <div style={{
            padding: '14px 28px', backgroundColor: '#fff',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
          }}>
            {['Todos', ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                padding: '4px 12px', borderRadius: '20px', border: '1.5px solid',
                borderColor: filterCat === cat ? ORANGE : '#E5E7EB',
                backgroundColor: filterCat === cat ? `${ORANGE}15` : '#fff',
                color: filterCat === cat ? ORANGE : '#6B7280',
                fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
              }}>
                {cat}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={selectAll} style={{
              fontSize: '0.75rem', color: ORANGE, background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: '600',
            }}>
              Seleccionar todo
            </button>
            <button onClick={clearAll} style={{
              fontSize: '0.75rem', color: '#9CA3AF', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: '600',
            }}>
              Limpiar
            </button>
          </div>

          {/* Grid módulos */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '12px',
            }}>
              {visibleModules.map(mod => {
                const isSelected = selected.has(mod.id) || mod.required;
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggle(mod.id)}
                    style={{
                      backgroundColor: '#fff',
                      border: `2px solid ${isSelected ? ORANGE : '#E5E7EB'}`,
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: mod.required ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? `0 0 0 3px ${ORANGE}20` : 'none',
                      position: 'relative',
                    }}
                  >
                    {/* Ícono módulo */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      backgroundColor: isSelected ? `${ORANGE}15` : '#F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} color={isSelected ? ORANGE : '#9CA3AF'} />
                    </div>

                    {/* Texto */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '700', color: '#111' }}>
                          {mod.label}
                        </p>
                        {mod.required && (
                          <span style={{
                            fontSize: '0.6rem', backgroundColor: '#F3F4F6',
                            color: '#6B7280', padding: '1px 5px', borderRadius: '4px', fontWeight: '600',
                          }}>
                            BASE
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.71rem', color: '#6B7280', lineHeight: '1.3' }}>
                        {mod.description}
                      </p>
                      {mod.envVars && mod.envVars.length > 0 && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.67rem', color: '#9CA3AF' }}>
                          🔑 {mod.envVars.length} var{mod.envVars.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Checkbox */}
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                      border: `2px solid ${isSelected ? ORANGE : '#D1D5DB'}`,
                      backgroundColor: isSelected ? ORANGE : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <Check size={11} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 28px', backgroundColor: '#fff',
            borderTop: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
              <b style={{ color: '#111' }}>{totalSelected}</b> módulos seleccionados
              · <b style={{ color: '#111' }}>{allEnvVars.length}</b> variables de entorno requeridas
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setStep('config')}
              disabled={selected.size === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 20px', borderRadius: '10px', border: 'none',
                backgroundColor: selected.size > 0 ? ORANGE : '#E5E7EB',
                color: selected.size > 0 ? '#fff' : '#9CA3AF',
                fontSize: '0.85rem', fontWeight: '700', cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              Continuar <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Configuración ── */}
      {step === 'config' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Nombre del proyecto */}
            <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #E5E7EB' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: '700', color: '#111' }}>
                🚀 Datos del proyecto
              </h2>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                Nombre del repositorio
              </label>
              <input
                value={projectName}
                onChange={e => setProjectName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                placeholder="ej: mi-tienda-online"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '0.88rem',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
              <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#9CA3AF' }}>
                Se creará como <b>github.com/Charlie711/{projectName || 'nombre-del-proyecto'}</b>
              </p>
            </div>

            {/* Módulos seleccionados (solo lectura) */}
            <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #E5E7EB' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: '700', color: '#111' }}>
                📦 Módulos incluidos <span style={{ color: '#6B7280', fontWeight: '400' }}>({totalSelected})</span>
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {MODULES.filter(m => selected.has(m.id) || m.required).map(mod => (
                  <span key={mod.id} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '20px',
                    backgroundColor: mod.required ? '#F3F4F6' : `${ORANGE}15`,
                    color: mod.required ? '#6B7280' : ORANGE,
                    fontSize: '0.75rem', fontWeight: '600',
                  }}>
                    <Check size={10} strokeWidth={3} />
                    {mod.label}
                    {mod.required && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>(base)</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Variables de entorno */}
            <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#111' }}>
                  🔑 Variables de entorno requeridas
                </h2>
                <div title="Se generará un archivo .env.example en el nuevo repositorio" style={{ cursor: 'help' }}>
                  <Info size={14} color="#9CA3AF" />
                </div>
              </div>
              <div style={{
                backgroundColor: '#0F172A', borderRadius: '10px',
                padding: '16px', fontFamily: 'monospace',
              }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.67rem', color: '#64748B' }}># .env.example — generado automáticamente</p>
                {allEnvVars.map(v => (
                  <p key={v} style={{ margin: '3px 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                    <span style={{ color: '#7DD3FC' }}>{v}</span>
                    <span style={{ color: '#64748B' }}>=</span>
                    <span style={{ color: '#86EFAC' }}>""</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Config mínima */}
            <div style={{
              backgroundColor: '#FFF7ED', borderRadius: '14px',
              padding: '22px', border: '1.5px solid #FED7AA',
            }}>
              <h2 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: '700', color: '#9A3412' }}>
                ⚙️ Configuración mínima para funcionar
              </h2>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li style={{ fontSize: '0.78rem', color: '#7C2D12' }}>Proyecto Supabase creado y configurado</li>
                <li style={{ fontSize: '0.78rem', color: '#7C2D12' }}>Variables <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> completadas</li>
                <li style={{ fontSize: '0.78rem', color: '#7C2D12' }}>Deploy en Vercel/Netlify conectado al nuevo repositorio</li>
                {allEnvVars.some(v => v.includes('PAYMENT')) && (
                  <li style={{ fontSize: '0.78rem', color: '#7C2D12' }}>Cuenta activa en la pasarela de pagos configurada</li>
                )}
                {allEnvVars.some(v => v.includes('MAPS')) && (
                  <li style={{ fontSize: '0.78rem', color: '#7C2D12' }}>API Key de Google Maps habilitada para el dominio</li>
                )}
              </ul>
            </div>

            {/* CTA Generar */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingBottom: '20px' }}>
              <button onClick={() => setStep('select')} style={{
                padding: '11px 22px', borderRadius: '10px',
                border: '1.5px solid #E5E7EB', backgroundColor: '#fff',
                color: '#374151', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
              }}>
                ← Volver
              </button>
              <button
                disabled={!projectName}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '11px 28px', borderRadius: '10px', border: 'none',
                  backgroundColor: projectName ? ORANGE : '#E5E7EB',
                  color: projectName ? '#fff' : '#9CA3AF',
                  fontSize: '0.88rem', fontWeight: '700',
                  cursor: projectName ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                <GitBranch size={16} />
                Generar repositorio en GitHub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}