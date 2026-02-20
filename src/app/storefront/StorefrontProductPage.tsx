/* =====================================================
   Charlie Marketplace Builder — Product Detail Page
   ===================================================== */
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Star, Heart, ShoppingCart, Share2, Shield, Truck, RotateCcw, ChevronRight, Minus, Plus, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PRODUCTS, SECOND_HAND } from './storefrontData';
import { useCart } from './cartContext';

const ORANGE = '#FF6835';

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#FBB040' : 'none'} color={i <= Math.round(rating) ? '#FBB040' : '#ddd'} />
      ))}
    </div>
  );
}

const MOCK_REVIEWS = [
  { id: 1, user: 'María G.', avatar: 'M', rating: 5, date: '2026-02-10', text: 'Excelente producto, llegó en perfectas condiciones y mucho más rápido de lo esperado. 100% recomendado.' },
  { id: 2, user: 'Carlos M.', avatar: 'C', rating: 4, date: '2026-02-05', text: 'Muy buena calidad, el color es exactamente como en las fotos. Solo bajé 1 estrella porque el packaging podría ser mejor.' },
  { id: 3, user: 'Ana L.', avatar: 'A', rating: 5, date: '2026-01-28', text: 'Segunda vez que compro en Charlie Marketplace, siempre conforme. El producto supera las expectativas.' },
];

export default function StorefrontProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Find product in either list
  const product = PRODUCTS.find(p => p.id === id);
  const shItem = SECOND_HAND.find(s => s.id === id);
  const item = product || (shItem ? {
    id: shItem.id,
    name: shItem.title,
    category: shItem.category,
    price: shItem.price,
    originalPrice: shItem.originalPrice,
    rating: 4.2,
    reviews: shItem.views,
    image: shItem.image,
    description: shItem.description,
    stock: 1,
    specs: { 'Condición': shItem.condition, 'Vendedor': shItem.seller, 'Ubicación': shItem.location },
    colors: undefined,
    sizes: undefined,
    badge: undefined,
    isNew: false,
  } : null);

  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(product?.colors?.[0] ?? null);
  const [selectedSize, setSelectedSize] = useState<string | null>(product?.sizes?.[0] ?? null);
  const [wished, setWished] = useState(false);
  const [activeTab, setActiveTab] = useState<'descripcion' | 'especificaciones' | 'resenas'>('descripcion');
  const [mainImg, setMainImg] = useState(item?.image ?? '');

  if (!item) {
    return (
      <div style={{ maxWidth: '1280px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ color: '#333', marginBottom: '12px' }}>Producto no encontrado</h2>
        <Link to="/" style={{ color: ORANGE, fontWeight: 600 }}>← Volver al inicio</Link>
      </div>
    );
  }

  const discount = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    const variant = [selectedColor, selectedSize].filter(Boolean).join(' / ') || undefined;
    addItem({ id: `${item.id}-${variant ?? 'default'}`, productId: item.id, name: item.name, price: item.price, image: item.image, quantity: qty, variant });
    toast.success(`"${item.name}" añadido al carrito`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  // Thumbnail images (reuse same for demo)
  const thumbs = [item.image, ...PRODUCTS.filter(p => p.id !== item.id).slice(0, 3).map(p => p.image)];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[{ label: 'Inicio', to: '/' }, { label: item.category, to: `/?cat=${item.category}` }, { label: item.name }].map((b, i, arr) => (
          <React.Fragment key={i}>
            {b.to ? (
              <Link to={b.to} style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = ORANGE}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#888'}
              >{b.label}</Link>
            ) : (
              <span style={{ color: '#333', fontSize: '13px', fontWeight: 500 }}>{b.label}</span>
            )}
            {i < arr.length - 1 && <ChevronRight size={13} color="#ccc" />}
          </React.Fragment>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '48px', alignItems: 'start' }}
        className="max-md:grid-cols-1">

        {/* LEFT: Images */}
        <div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #f0f0f0', marginBottom: '12px', backgroundColor: '#F8F8F8', position: 'relative', paddingBottom: '80%' }}>
            <img src={mainImg} alt={item.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            {item.badge && (
              <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '4px 12px', borderRadius: '8px', backgroundColor: ORANGE, color: '#fff', fontSize: '13px', fontWeight: 700 }}>
                {item.badge}
              </div>
            )}
            <button
              onClick={() => { setWished(!wished); toast.success(wished ? 'Eliminado de favoritos' : 'Añadido a favoritos'); }}
              style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Heart size={18} fill={wished ? '#e53e3e' : 'none'} color={wished ? '#e53e3e' : '#999'} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {thumbs.map((src, i) => (
              <button key={i} onClick={() => setMainImg(src)}
                style={{ flex: 1, paddingBottom: '20%', position: 'relative', borderRadius: '10px', overflow: 'hidden', border: mainImg === src ? `2px solid ${ORANGE}` : '2px solid #f0f0f0', cursor: 'pointer', backgroundColor: '#F8F8F8', transition: 'border-color 0.15s' }}
              >
                <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div>
          <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{item.category}</p>
          <h1 style={{ color: '#111', marginBottom: '12px', lineHeight: 1.3 }}>{item.name}</h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <StarRating rating={item.rating} />
            <span style={{ fontSize: '14px', color: '#555', fontWeight: 500 }}>{item.rating.toFixed(1)}</span>
            <span style={{ fontSize: '13px', color: '#aaa' }}>({item.reviews} reseñas)</span>
            {item.stock <= 5 && item.stock > 0 && (
              <span style={{ fontSize: '12px', color: '#e53e3e', fontWeight: 600, backgroundColor: '#FEF2F2', padding: '2px 8px', borderRadius: '6px' }}>
                ¡Solo {item.stock}!
              </span>
            )}
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '36px', fontWeight: 800, color: ORANGE }}>${item.price}</span>
            {item.originalPrice && (
              <>
                <span style={{ fontSize: '18px', color: '#bbb', textDecoration: 'line-through' }}>${item.originalPrice}</span>
                <span style={{ fontSize: '14px', color: '#10B981', fontWeight: 700, backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '8px' }}>
                  Ahorrás ${item.originalPrice - item.price} ({discount}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Cuotas */}
          <div style={{ backgroundColor: '#FFF5F2', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>💳 En 12 cuotas de <strong style={{ color: ORANGE }}>${Math.round(item.price / 12)}/mes</strong> sin interés con MP</span>
          </div>

          {/* Colors */}
          {product?.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '10px' }}>Color: <span style={{ fontWeight: 400, color: '#666' }}>{selectedColor}</span></p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: c, border: selectedColor === c ? `3px solid ${ORANGE}` : '2px solid #e0e0e0', cursor: 'pointer', outline: selectedColor === c ? `2px solid #fff` : 'none', outlineOffset: '-4px', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product?.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '10px' }}>Talle: <span style={{ fontWeight: 400, color: '#666' }}>{selectedSize}</span></p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: selectedSize === s ? `2px solid ${ORANGE}` : '1.5px solid #e0e0e0', backgroundColor: selectedSize === s ? '#FFF5F2' : '#fff', color: selectedSize === s ? ORANGE : '#444', transition: 'all 0.15s' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '10px' }}>Cantidad</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ width: '40px', height: '40px', borderRadius: '10px 0 0 10px', border: '1.5px solid #e0e0e0', backgroundColor: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                <Minus size={15} />
              </button>
              <div style={{ width: '56px', height: '40px', border: '1.5px solid #e0e0e0', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '15px', color: '#111' }}>{qty}</div>
              <button onClick={() => setQty(Math.min(item.stock, qty + 1))}
                style={{ width: '40px', height: '40px', borderRadius: '0 10px 10px 0', border: '1.5px solid #e0e0e0', backgroundColor: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                <Plus size={15} />
              </button>
              <span style={{ marginLeft: '12px', fontSize: '13px', color: '#888' }}>{item.stock} disponibles</span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button onClick={handleAddToCart}
              style={{ flex: 1, padding: '14px', backgroundColor: '#FFF5F2', color: ORANGE, border: `2px solid ${ORANGE}`, borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FFE8E0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF5F2'; }}
            >
              <ShoppingCart size={18} /> Agregar
            </button>
            <button onClick={handleBuyNow}
              style={{ flex: 2, padding: '14px', backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              Comprar ahora
            </button>
          </div>

          {/* Share / guarantee */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Enlace copiado'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px solid #e0e0e0', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: '#666' }}>
              <Share2 size={14} /> Compartir
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px solid #e0e0e0', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: '#666' }}>
              <MessageCircle size={14} /> Consultar
            </button>
          </div>

          {/* Guarantees */}
          <div style={{ backgroundColor: '#F9F9F9', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: Truck, text: 'Envío gratis en compras mayores a $150' },
              { icon: Shield, text: 'Compra protegida — Garantía Charlie Marketplace' },
              { icon: RotateCcw, text: 'Devoluciones gratuitas hasta 30 días' },
              { icon: Check, text: 'Vendedor verificado · 98% de satisfacción' },
            ].map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <g.icon size={14} color={ORANGE} />
                </div>
                <span style={{ fontSize: '13px', color: '#555' }}>{g.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: '48px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
          {(['descripcion', 'especificaciones', 'resenas'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '16px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: activeTab === tab ? ORANGE : '#888', borderBottom: activeTab === tab ? `3px solid ${ORANGE}` : '3px solid transparent', transition: 'all 0.15s', textTransform: 'capitalize' }}
            >
              {tab === 'resenas' ? `Reseñas (${MOCK_REVIEWS.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ padding: '28px' }}>
          {activeTab === 'descripcion' && (
            <p style={{ color: '#444', fontSize: '15px', lineHeight: 1.8 }}>{item.description}</p>
          )}
          {activeTab === 'especificaciones' && item.specs && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {Object.entries(item.specs).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F9F9F9', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>{k}</span>
                  <span style={{ fontSize: '13px', color: '#111', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'resenas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {MOCK_REVIEWS.map(r => (
                <div key={r.id} style={{ padding: '20px', backgroundColor: '#F9F9F9', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '15px' }}>
                      {r.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{r.user}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{r.date}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}><StarRating rating={r.rating} size={14} /></div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      <div style={{ marginTop: '48px', paddingBottom: '48px' }}>
        <h3 style={{ color: '#111', marginBottom: '20px' }}>También te puede interesar</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {PRODUCTS.filter(p => p.id !== id).slice(0, 4).map(p => (
            <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #f0f0f0', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <div style={{ paddingBottom: '70%', position: 'relative', overflow: 'hidden', backgroundColor: '#f8f8f8' }}>
                  <img src={p.image} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</p>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: ORANGE }}>${p.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}