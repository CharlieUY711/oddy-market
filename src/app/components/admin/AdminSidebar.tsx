/* =====================================================
   AdminSidebar — con sub-menús expandibles por sección
   ===================================================== */
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingCart, Megaphone, Wrench, Database,
  Monitor, Sparkles, ChevronDown, Package, Receipt, ClipboardList,
  Users, Truck, BookOpen, UserCheck, FolderKanban, RefreshCw,
  Mail, BarChart3, Heart, Gift, Share2, ArrowLeftRight,
  Settings, Link2, Shield, CheckSquare, Store, Layers,
  ExternalLink, FolderTree, User, Building2, ShoppingBag,
  ShoppingCart as OrderIcon, CreditCard, MapPin, Navigation,
  QrCode, Rss, Map, Factory, Box, AlertTriangle, Radio,
  Search, Zap, Globe, Lightbulb, Plug, CreditCard as PayCard,
  Smartphone, Image, FileText, DollarSign, ScanLine, Printer, Library,
} from 'lucide-react';
import type { MainSection } from '../../AdminDashboard';

const ORANGE = '#FF6835';
const ACTIVE_BG = 'rgba(255,255,255,0.22)';
const HOVER_BG  = 'rgba(255,255,255,0.12)';

/* ── Sub-item definition ── */
interface SubItem {
  id: MainSection;
  label: string;
  icon: React.ElementType;
}

/* ── Top-level nav with optional children ── */
interface NavGroup {
  id: MainSection;
  icon: React.ElementType;
  label: string;
  children?: SubItem[];
}

const NAV_GROUPS: NavGroup[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  {
    id: 'ecommerce', icon: ShoppingCart, label: 'eCommerce',
    children: [
      { id: 'ecommerce',      label: 'eCommerce',                    icon: Store       },
      { id: 'pedidos',        label: 'Pedidos',                      icon: OrderIcon   },
      { id: 'pagos',          label: 'Pagos & Transacciones',        icon: CreditCard  },
      { id: 'departamentos',  label: 'Departamentos y Categorías',   icon: FolderTree  },
      { id: 'clientes',       label: 'Clientes',                     icon: ShoppingBag },
      { id: 'storefront',     label: 'Portal del Cliente',           icon: Layers      },
      { id: 'secondhand',     label: 'Second Hand',                  icon: RefreshCw   },
    ],
  },
  {
    id: 'logistica', icon: Truck, label: 'Logística',
    children: [
      { id: 'logistica',        label: 'Hub Logístico',          icon: Navigation  },
      { id: 'envios',           label: 'Envíos',                 icon: Truck       },
      { id: 'transportistas',   label: 'Transportistas',         icon: Users       },
      { id: 'rutas',            label: 'Rutas',                  icon: Map         },
      { id: 'fulfillment',      label: 'Fulfillment / Picking',  icon: Box         },
      { id: 'produccion',       label: 'Producción / Armado',    icon: Factory     },
      { id: 'abastecimiento',   label: 'Abastecimiento',         icon: Package     },
      { id: 'mapa-envios',      label: 'Mapa de Envíos',         icon: MapPin      },
      { id: 'tracking-publico', label: 'Tracking Público',       icon: Radio       },
    ],
  },
  {
    id: 'marketing', icon: Megaphone, label: 'Marketing',
    children: [
      { id: 'marketing',        label: 'Dashboard Marketing', icon: BarChart3     },
      { id: 'mailing',          label: 'Email / Mailing',    icon: Mail          },
      { id: 'google-ads',       label: 'Google Ads',         icon: BarChart3     },
      { id: 'seo',              label: 'SEO',                icon: Search        },
      { id: 'fidelizacion',     label: 'Fidelización',       icon: Heart         },
      { id: 'rueda-sorteos',    label: 'Rueda de Sorteos',   icon: Gift          },
      { id: 'etiqueta-emotiva', label: 'Etiqueta Emotiva',   icon: QrCode        },
    ],
  },
  {
    id: 'rrss', icon: Rss, label: 'RRSS',
    children: [
      { id: 'redes-sociales', label: 'Centro Operativo',  icon: Share2        },
      { id: 'migracion-rrss', label: 'Migración RRSS',    icon: ArrowLeftRight},
    ],
  },
  {
    id: 'herramientas', icon: Wrench, label: 'Herramientas',
    children: [
      { id: 'herramientas',     label: 'Hub Herramientas',  icon: Wrench      },
      { id: 'biblioteca',       label: 'Biblioteca',        icon: Library     },
      { id: 'editor-imagenes',  label: 'Editor de Imágenes',icon: Image       },
      { id: 'gen-documentos',   label: 'Documentos',        icon: FileText    },
      { id: 'gen-presupuestos', label: 'Presupuestos',      icon: DollarSign  },
      { id: 'ocr',              label: 'OCR',               icon: ScanLine    },
      { id: 'impresion',        label: 'Impresión',         icon: Printer     },
      { id: 'qr-generator',     label: 'Generador QR',      icon: QrCode      },
      { id: 'ideas-board',      label: 'Ideas Board',       icon: Lightbulb   },
    ],
  },
  {
    id: 'gestion', icon: Database, label: 'Gestión ERP',
    children: [
      { id: 'gestion',          label: 'Resumen ERP',                icon: Database      },
      { id: 'erp-inventario',   label: 'Catálogo de Artículos',      icon: Package       },
      { id: 'departamentos',    label: 'Departamentos y Categorías', icon: FolderTree    },
      { id: 'erp-facturacion',  label: 'Facturación',                icon: Receipt       },
      { id: 'erp-compras',      label: 'Compras',                    icon: ClipboardList },
      { id: 'erp-crm',          label: 'CRM',                        icon: Users         },
      { id: 'erp-contabilidad', label: 'Contabilidad',               icon: BookOpen      },
      { id: 'erp-rrhh',         label: 'RRHH',                       icon: UserCheck     },
      { id: 'proyectos',        label: 'Proyectos',                  icon: FolderKanban  },
      { id: 'personas',         label: 'Personas',                   icon: User          },
      { id: 'organizaciones',   label: 'Organizaciones',             icon: Building2     },
      { id: 'clientes',         label: 'Clientes',                   icon: ShoppingBag   },
    ],
  },
  {
    id: 'sistema', icon: Monitor, label: 'Sistema',
    children: [
      { id: 'sistema',       label: 'Configuración',     icon: Settings    },
      { id: 'metodos-pago',  label: 'Métodos de Pago',   icon: CreditCard  },
      { id: 'metodos-envio', label: 'Métodos de Envío',  icon: Truck       },
      { id: 'diseno',        label: 'Diseño / Marca',    icon: Sparkles    },
    ],
  },
  {
    id: 'integraciones', icon: Plug, label: 'Integraciones',
    children: [
      { id: 'integraciones',           label: 'Resumen',          icon: Plug        },
      { id: 'integraciones-pagos',     label: '💳 Pagos',         icon: PayCard     },
      { id: 'integraciones-logistica', label: '🚚 Logística',     icon: Truck       },
      { id: 'integraciones-tiendas',   label: '🏪 Tiendas',       icon: Store       },
      { id: 'integraciones-rrss',      label: '📱 Redes Sociales',icon: Smartphone  },
      { id: 'integraciones-servicios', label: '⚙️ Servicios',     icon: Zap         },
    ],
  },
  { id: 'roadmap', icon: Map, label: 'Checklist & Roadmap' },
];

/* ── Which group owns a given section ── */
function getParentGroup(section: MainSection): MainSection | null {
  for (const g of NAV_GROUPS) {
    if (g.children?.some(c => c.id === section)) return g.id;
  }
  return null;
}

interface Props {
  activeSection: MainSection;
  onNavigate: (section: MainSection) => void;
}

export function AdminSidebar({ activeSection, onNavigate }: Props) {
  const parentGroup = getParentGroup(activeSection) ?? activeSection;

  /* groups that are currently open */
  const [openGroups, setOpenGroups] = useState<Set<MainSection>>(() => {
    const s = new Set<MainSection>();
    const pg = getParentGroup(activeSection);
    if (pg) s.add(pg);
    // also open the group if activeSection IS the group and it has children
    const self = NAV_GROUPS.find(g => g.id === activeSection);
    if (self?.children) s.add(activeSection);
    return s;
  });

  /* keep open group in sync when activeSection changes externally */
  useEffect(() => {
    const pg = getParentGroup(activeSection);
    if (pg) setOpenGroups(prev => new Set([...prev, pg]));
  }, [activeSection]);

  const toggle = (id: MainSection) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <aside
      style={{
        width: '210px',
        minHeight: '100vh',
        backgroundColor: ORANGE,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* ── Logo ── */}
      <div style={{ height: '100px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.18)', flexShrink: 0 }}>
        <div>
          <span style={{ color: '#fff', fontWeight: '900', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
            ODDY Market
          </span>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68rem', margin: '2px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Charlie v1.5
          </p>
        </div>
      </div>

      {/* ── User ── */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.18)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '0.82rem', flexShrink: 0, border: '2px solid rgba(255,255,255,0.4)' }}>
            CV
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontWeight: '700', fontSize: '0.875rem', margin: 0, whiteSpace: 'nowrap' }}>Carlos Varalla</p>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.72rem', margin: 0 }}>Administrador</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV_GROUPS.map(group => {
          const hasChildren = !!group.children?.length;
          const isOpen      = openGroups.has(group.id);
          const isParentActive = parentGroup === group.id;

          return (
            <div key={group.id}>
              {/* ── Top-level button ── */}
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggle(group.id);
                    // also navigate to the group hub
                    onNavigate(group.id);
                  } else {
                    onNavigate(group.id);
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isParentActive ? ACTIVE_BG : 'transparent',
                  color: '#fff',
                  borderLeft: isParentActive ? '3px solid #fff' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isParentActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = HOVER_BG; }}
                onMouseLeave={e => { if (!isParentActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
              >
                <group.icon size={17} strokeWidth={isParentActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.86rem', fontWeight: isParentActive ? '700' : '500', textAlign: 'left' }}>
                  {group.label}
                </span>
                {hasChildren && (
                  <ChevronDown
                    size={13}
                    style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.75 }}
                  />
                )}
              </button>

              {/* ── Sub-items ── */}
              {hasChildren && isOpen && (
                <div style={{ backgroundColor: 'rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {group.children!.map(child => {
                    const isChildActive = activeSection === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(child.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '9px',
                          padding: '9px 16px 9px 30px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: isChildActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                          color: '#fff',
                          borderLeft: isChildActive ? '3px solid rgba(255,255,255,0.9)' : '3px solid transparent',
                          transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { if (!isChildActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { if (!isChildActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                      >
                        <child.icon size={14} strokeWidth={isChildActive ? 2.5 : 1.8} style={{ flexShrink: 0, opacity: isChildActive ? 1 : 0.75 }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: isChildActive ? '700' : '400', opacity: isChildActive ? 1 : 0.88 }}>
                          {child.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Tip ── */}
      <div style={{ margin: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: '10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Sparkles size={13} color="#fff" />
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.78rem' }}>Tip del día</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.71rem', margin: 0, lineHeight: '1.45' }}>
          Usá las herramientas de IA para optimizar tus descripciones de productos automáticamente
        </p>
      </div>

      {/* ── Ver Tienda ── */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          margin: '0 12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          padding: '10px 0',
          backgroundColor: '#fff',
          color: ORANGE,
          borderRadius: '10px',
          textDecoration: 'none',
          fontSize: '0.82rem',
          fontWeight: '700',
          flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
      >
        <ExternalLink size={14} />
        Ver tienda
      </a>
    </aside>
  );
}