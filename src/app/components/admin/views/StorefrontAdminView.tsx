/* =====================================================
   ODDY Market — Storefront Admin View
   Vista de acceso rápido al Portal del Cliente
   ===================================================== */
import React from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { ExternalLink, ShoppingBag, Users, TrendingUp, Package, Eye, Star, ShoppingCart, ArrowRight, Store } from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

const ORANGE = '#FF6835';

const QUICK_STATS = [
  { label: 'Visitas hoy', value: '1.248', icon: Eye, change: '+12%', up: true },
  { label: 'Pedidos activos', value: '34', icon: ShoppingCart, change: '+5', up: true },
  { label: 'Productos online', value: '127', icon: Package, change: '=', up: true },
  { label: 'Clientes totales', value: '892', icon: Users, change: '+8%', up: true },
];

const PAGES = [
  { label: 'Inicio / Home', path: '/', desc: 'Hero, categorías, productos destacados, Second Hand CTA' },
  { label: 'Grilla de productos', path: '/', desc: 'Catálogo completo con filtros por categoría' },
  { label: 'Detalle de producto', path: '/product/p1', desc: 'Galería, variantes, talle, carrito, reseñas' },
  { label: 'Carrito', path: '/cart', desc: 'Items, cantidades, cupón de descuento, resumen' },
  { label: 'Checkout multi-paso', path: '/checkout', desc: 'Contacto → Envío → Pago (MP/Stripe) → Confirmación' },
  { label: 'Second Hand', path: '/secondhand', desc: 'Browse con filtros: categoría, estado, precio, ordenamiento' },
  { label: 'Publicar artículo', path: '/secondhand/publish', desc: 'Fotos → Info → Precio/ubicación → Preview y publicar' },
  { label: 'Mi cuenta', path: '/account', desc: 'Perfil, pedidos, publicaciones SH, favoritos, config.' },
];

export function StorefrontAdminView({ onNavigate }: Props) {
  const openStorefront = (path: string) => {
    window.open(path, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <OrangeHeader icon={Store} title="Portal del Cliente — Storefront" subtitle="Gestión y acceso al front-end público de Charlie Marketplace" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* CTA Hero */}
        <div style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #FF8C4A 100%)`, borderRadius: '20px', padding: '28px 32px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '6px' }}>Charlie Marketplace Storefront</div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', marginBottom: 0 }}>
              Portal del cliente con navbar, catálogo, carrito, checkout y Second Hand. Accedé desde el botón de la derecha.
            </p>
          </div>
          <button
            onClick={() => openStorefront('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#fff', color: ORANGE, border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'transform 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          >
            <ExternalLink size={16} /> Abrir Storefront
          </button>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {QUICK_STATS.map(stat => (
            <div key={stat.label} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFF5F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={20} color={ORANGE} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: stat.up ? '#10B981' : '#e53e3e', backgroundColor: stat.up ? '#ECFDF5' : '#FEF2F2', padding: '2px 8px', borderRadius: '6px' }}>
                  {stat.change}
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#111', marginBottom: '2px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Pages list */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #F0F0F0', overflow: 'hidden', marginBottom: '28px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color={ORANGE} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#111' }}>Páginas del Storefront</div>
              <div style={{ fontSize: '13px', color: '#888' }}>Todas las vistas del portal público implementadas</div>
            </div>
          </div>
          {PAGES.map((page, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px', borderBottom: i < PAGES.length - 1 ? '1px solid #F5F5F5' : 'none', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFAFA'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#111', marginBottom: '2px' }}>{page.label}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{page.desc}</div>
              </div>
              <span style={{ fontSize: '12px', color: '#aaa', fontFamily: 'monospace', backgroundColor: '#F5F5F5', padding: '3px 8px', borderRadius: '6px' }}>{page.path}</span>
              <button
                onClick={() => openStorefront(page.path)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#FFF5F2', border: `1px solid ${ORANGE}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: ORANGE, fontWeight: 600, whiteSpace: 'nowrap' }}>
                <ExternalLink size={12} /> Ver
              </button>
            </div>
          ))}
        </div>

        {/* Roadmap next */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #F0F0F0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <TrendingUp size={20} color={ORANGE} />
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#111' }}>Próximas mejoras — Storefront v2</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {[
              { icon: '🔗', title: 'Conexión a Supabase', desc: 'Productos y pedidos reales desde la DB' },
              { icon: '💳', title: 'Integración MP real', desc: 'Mercado Pago SDK + Webhooks' },
              { icon: '📧', title: 'Emails transaccionales', desc: 'Confirmación de pedido vía Resend' },
              { icon: '🔍', title: 'Búsqueda avanzada', desc: 'Autocomplete tipo ML con Elasticsearch' },
              { icon: '📱', title: 'PWA + App móvil', desc: 'Instalar como app en celular' },
              { icon: '⭐', title: 'Sistema de reseñas real', desc: 'Reseñas verificadas con compra' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#F9F9F9', borderRadius: '12px' }}>
                <span style={{ fontSize: '22px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#111', marginBottom: '2px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}