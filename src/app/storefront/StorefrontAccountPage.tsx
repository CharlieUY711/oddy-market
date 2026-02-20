/* =====================================================
   Charlie Marketplace Builder — Account Page
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import {
  User, Package, Tag, Heart, Settings, ChevronRight,
  Edit3, MapPin, Phone, Mail, Star, Eye, RefreshCw,
  Check, Clock, Truck, AlertCircle, Plus, LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { PRODUCTS, SECOND_HAND, CONDITION_LABELS } from './storefrontData';

const ORANGE = '#FF6835';

/* ── Toggle row extraído como componente propio (evita hook en .map()) ── */
function ToggleRow({ label, sub, defaultChecked }: { label: string; sub: string; defaultChecked: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9F9F9', borderRadius: '14px' }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '14px', color: '#111', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '12px', color: '#888' }}>{sub}</p>
      </div>
      <button
        onClick={() => { setOn(!on); toast.success(`${label} ${!on ? 'activado' : 'desactivado'}`); }}
        style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: on ? ORANGE : '#ddd', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}
      >
        <div style={{ position: 'absolute', top: '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: on ? '22px' : '2px' }} />
      </button>
    </div>
  );
}

type TabId = 'perfil' | 'pedidos' | 'publicaciones' | 'favoritos' | 'configuracion';

const MOCK_ORDERS = [
  { id: 'OM-2026-A4F8', date: '2026-02-18', status: 'entregado', items: [{ name: 'Auriculares BT Studio Pro', qty: 1, price: 149, image: 'https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?w=80&q=80' }], total: 149 },
  { id: 'OM-2026-B2K1', date: '2026-02-14', status: 'en-camino', items: [{ name: 'Air Max Trainer Pro', qty: 1, price: 89, image: 'https://images.unsplash.com/photo-1625860191460-10a66c7384fb?w=80&q=80' }, { name: 'Mochila Urban Explorer', qty: 1, price: 55, image: 'https://images.unsplash.com/photo-1622560257067-108402fcedc0?w=80&q=80' }], total: 156 },
  { id: 'OM-2026-C9P3', date: '2026-01-28', status: 'confirmado', items: [{ name: 'Smartwatch Series X', qty: 1, price: 199, image: 'https://images.unsplash.com/photo-1767903622384-cfd81e2be7ba?w=80&q=80' }], total: 199 },
];

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string; icon: React.FC<any> }> = {
  'confirmado':   { label: 'Confirmado',   color: '#2563EB', bg: '#EFF6FF', icon: Check },
  'en-camino':    { label: 'En camino',    color: '#D97706', bg: '#FFFBEB', icon: Truck },
  'entregado':    { label: 'Entregado',    color: '#059669', bg: '#ECFDF5', icon: Check },
  'cancelado':    { label: 'Cancelado',    color: '#DC2626', bg: '#FEF2F2', icon: AlertCircle },
};

function NavItem({ id, icon: Icon, label, active, count, onClick }: {
  id: TabId; icon: React.FC<any>; label: string; active: boolean; count?: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', backgroundColor: active ? '#FFF5F2' : 'transparent', transition: 'all 0.15s' }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '#F9F9F9'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
    >
      <Icon size={17} color={active ? ORANGE : '#666'} />
      <span style={{ flex: 1, fontSize: '14px', fontWeight: active ? 600 : 400, color: active ? ORANGE : '#444' }}>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', backgroundColor: ORANGE, borderRadius: '10px', padding: '1px 7px', minWidth: '18px', textAlign: 'center' }}>{count}</span>
      )}
      {active && <ChevronRight size={14} color={ORANGE} />}
    </button>
  );
}

export default function StorefrontAccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>((searchParams.get('tab') as TabId) ?? 'perfil');
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    nombre: 'Usuario',
    apellido: 'Demo',
    email: 'usuario@charliemarketplace.com',
    telefono: '+598 99 000 000',
    ciudad: 'Montevideo',
    pais: 'Uruguay',
    bio: 'Comprador y vendedor activo en Charlie Marketplace.',
  });

  useEffect(() => {
    const tab = searchParams.get('tab') as TabId;
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const setTab = (tab: TabId) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const TABS: { id: TabId; icon: React.FC<any>; label: string; count?: number }[] = [
    { id: 'perfil', icon: User, label: 'Mi Perfil' },
    { id: 'pedidos', icon: Package, label: 'Mis Pedidos', count: MOCK_ORDERS.length },
    { id: 'publicaciones', icon: Tag, label: 'Publicaciones', count: SECOND_HAND.slice(0, 2).length },
    { id: 'favoritos', icon: Heart, label: 'Favoritos', count: 4 },
    { id: 'configuracion', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ color: '#111', marginBottom: '28px' }}>Mi cuenta</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', gap: '24px', alignItems: 'start' }}
        className="max-lg:grid-cols-1">

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Avatar card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '28px' }}>U</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '16px', color: '#111', marginBottom: '2px' }}>{profile.nombre} {profile.apellido}</p>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>{profile.ciudad}, {profile.pais}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {[['3', 'Pedidos'], ['2', 'Ventas'], ['4.9★', 'Rating']].map(([n, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: ORANGE }}>{n}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', padding: '12px' }}>
            {TABS.map(t => (
              <NavItem key={t.id} {...t} active={activeTab === t.id} onClick={() => setTab(t.id)} />
            ))}
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '8px', paddingTop: '8px' }}>
              <button onClick={() => { toast.success('Sesión cerrada'); navigate('/'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: '14px' }}>
                <LogOut size={17} color="#e53e3e" /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', padding: '28px' }}>

          {/* ── Perfil ── */}
          {activeTab === 'perfil' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ color: '#111' }}>Mis datos</h2>
                <button onClick={() => { setEditMode(!editMode); if (editMode) toast.success('Perfil actualizado'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: editMode ? ORANGE : '#f5f5f5', color: editMode ? '#fff' : '#333', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  {editMode ? <><Check size={14} /> Guardar</> : <><Edit3 size={14} /> Editar</>}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'Nombre', key: 'nombre', icon: User },
                  { label: 'Apellido', key: 'apellido', icon: User },
                  { label: 'Email', key: 'email', icon: Mail },
                  { label: 'Teléfono', key: 'telefono', icon: Phone },
                  { label: 'Ciudad', key: 'ciudad', icon: MapPin },
                  { label: 'País', key: 'pais', icon: MapPin },
                ].map(({ label, key, icon: Icon }) => (
                  <div key={key}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Icon size={12} /> {label}
                    </label>
                    {editMode ? (
                      <input value={profile[key as keyof typeof profile]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#FAFAFA' }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0e0e0'} />
                    ) : (
                      <p style={{ fontSize: '14px', color: '#111', padding: '10px 12px', backgroundColor: '#F9F9F9', borderRadius: '10px' }}>{profile[key as keyof typeof profile]}</p>
                    )}
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bio</label>
                  {editMode ? (
                    <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3}
                      style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#111', padding: '10px 12px', backgroundColor: '#F9F9F9', borderRadius: '10px' }}>{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Pedidos ── */}
          {activeTab === 'pedidos' && (
            <div>
              <h2 style={{ color: '#111', marginBottom: '24px' }}>Mis pedidos</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {MOCK_ORDERS.map(order => {
                  const statusInfo = ORDER_STATUS[order.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div key={order.id} style={{ border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 18px', backgroundColor: '#F9F9F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{order.id}</span>
                          <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '12px' }}>{order.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', backgroundColor: statusInfo.bg, borderRadius: '20px' }}>
                          <StatusIcon size={12} color={statusInfo.color} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: statusInfo.color }}>{statusInfo.label}</span>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px' }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: i < order.items.length - 1 ? '10px' : 0 }}>
                            <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{item.name}</p>
                              <p style={{ fontSize: '12px', color: '#888' }}>Cant: {item.qty} · ${item.price}</p>
                            </div>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>Total: <span style={{ color: ORANGE }}>${order.total}</span></span>
                          {order.status === 'entregado' && (
                            <button onClick={() => toast.info('Función de reseña próximamente')}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#FFF5F2', border: `1px solid ${ORANGE}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: ORANGE, fontWeight: 600 }}>
                              <Star size={13} /> Dejar reseña
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Publicaciones ── */}
          {activeTab === 'publicaciones' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ color: '#111' }}>Mis publicaciones</h2>
                <Link to="/secondhand/publish"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: ORANGE, color: '#fff', textDecoration: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}>
                  <Plus size={14} /> Nueva publicación
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {SECOND_HAND.slice(0, 2).map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', border: '1px solid #f0f0f0', borderRadius: '14px' }}>
                    <img src={item.image} alt={item.title} style={{ width: '72px', height: '72px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: '#111', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#888' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Eye size={11} /> {item.views} vistas</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Heart size={11} /> {item.favorites} favs</span>
                        <span style={{ color: '#10B981', fontWeight: 600 }}>Activa</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '16px', color: ORANGE }}>${item.price}</p>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#10B981' }}>
                        {CONDITION_LABELS[item.condition]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Favoritos ── */}
          {activeTab === 'favoritos' && (
            <div>
              <h2 style={{ color: '#111', marginBottom: '24px' }}>Mis favoritos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {PRODUCTS.slice(0, 4).map(p => (
                  <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ backgroundColor: '#F9F9F9', borderRadius: '14px', overflow: 'hidden', border: '1px solid #f0f0f0', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                    >
                      <div style={{ paddingBottom: '70%', position: 'relative', overflow: 'hidden' }}>
                        <img src={p.image} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '12px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: ORANGE }}>${p.price}</span>
                          <Heart size={14} fill="#e53e3e" color="#e53e3e" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Configuración ── */}
          {activeTab === 'configuracion' && (
            <div>
              <h2 style={{ color: '#111', marginBottom: '24px' }}>Configuración</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Notificaciones de pedidos', sub: 'Email cuando tu pedido cambia de estado', checked: true },
                  { label: 'Ofertas y promociones', sub: 'Recibí descuentos exclusivos por email', checked: true },
                  { label: 'Mensajes de compradores', sub: 'Alertas cuando alguien consulta tus artículos', checked: false },
                  { label: 'Newsletter semanal', sub: 'Novedades y productos destacados cada semana', checked: false },
                ].map((item, i) => (
                  <ToggleRow key={i} label={item.label} sub={item.sub} defaultChecked={item.checked} />
                ))}

                <div style={{ marginTop: '12px', padding: '20px', backgroundColor: '#FEF2F2', borderRadius: '14px', border: '1px solid #FECACA' }}>
                  <h4 style={{ color: '#DC2626', marginBottom: '8px', fontSize: '14px' }}>Zona de peligro</h4>
                  <p style={{ fontSize: '13px', color: '#9B1C1C', marginBottom: '14px' }}>Estas acciones son irreversibles. Procedé con cuidado.</p>
                  <button onClick={() => toast.error('Función disponible próximamente')}
                    style={{ padding: '8px 20px', backgroundColor: '#fff', color: '#DC2626', border: '1.5px solid #DC2626', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}