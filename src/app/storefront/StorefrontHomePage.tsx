/* =====================================================
   Charlie Marketplace Builder — Home Page
   ===================================================== */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Star, Heart, ShoppingCart, ArrowRight, Zap, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { PRODUCTS, CATEGORIES, SECOND_HAND, CONDITION_LABELS, CONDITION_COLORS } from './storefrontData';
import { useCart } from './cartContext';
import { AgeGateModal, isAgeVerified } from '../components/AgeGateModal';

const ORANGE = '#FF6835';

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} fill={i <= Math.round(rating) ? '#FBB040' : 'none'} color={i <= Math.round(rating) ? '#FBB040' : '#ddd'} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  const { addItem } = useCart();
  const [wished, setWished] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, productId: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    toast.success(`"${product.name}" añadido al carrito`);
  };

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)', transform: hovered ? 'translateY(-4px)' : 'none', border: '1px solid #f0f0f0' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden', backgroundColor: '#F8F8F8' }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        {/* Badge */}
        {product.badge && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '3px 8px', borderRadius: '6px', backgroundColor: ORANGE, color: '#fff', fontSize: '11px', fontWeight: 700 }}>
            {product.badge}
          </div>
        )}
        {product.isNew && !product.badge && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#10B981', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
            Nuevo
          </div>
        )}
        {/* Wish button */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); setWished(!wished); toast.success(wished ? 'Eliminado de favoritos' : 'Añadido a favoritos'); }}
          style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        >
          <Heart size={15} fill={wished ? '#e53e3e' : 'none'} color={wished ? '#e53e3e' : '#999'} />
        </button>
        {/* Add to cart overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', transform: hovered ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.2s', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <button
            onClick={handleAdd}
            style={{ width: '100%', padding: '8px', backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <ShoppingCart size={15} /> Agregar al carrito
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{product.category}</p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111', marginBottom: '6px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <StarRating rating={product.rating} />
          <span style={{ fontSize: '11px', color: '#888' }}>({product.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: ORANGE }}>${product.price}</span>
          {product.originalPrice && (
            <>
              <span style={{ fontSize: '13px', color: '#bbb', textDecoration: 'line-through' }}>${product.originalPrice}</span>
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>-{discount}%</span>
            </>
          )}
        </div>
        {product.stock <= 5 && (
          <p style={{ fontSize: '11px', color: '#e53e3e', marginTop: '4px', fontWeight: 500 }}>¡Solo {product.stock} en stock!</p>
        )}
      </div>
    </div>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: 'Tu marketplace favorito en América Latina',
      subtitle: 'Encontrá todo lo que buscás: tecnología, moda, hogar y mucho más. Envíos rápidos a todo el país.',
      cta: 'Explorar productos',
      ctaLink: '/?cat=all',
      ctaSecondary: 'Ver ofertas',
      bg: 'linear-gradient(135deg, #FF6835 0%, #FF8C4A 50%, #FFB347 100%)',
      pattern: '🛍️',
    },
    {
      title: 'Second Hand: vendé lo que ya no usás',
      subtitle: 'Publicá gratis tus artículos usados y llegá a miles de compradores. Rápido, seguro y sin comisiones.',
      cta: 'Publicar ahora',
      ctaLink: '/secondhand/publish',
      ctaSecondary: 'Ver publicaciones',
      bg: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      pattern: '♻️',
    },
    {
      title: 'Pagos seguros con Mercado Pago y Stripe',
      subtitle: 'Comprá con confianza. Protección al comprador, devoluciones fáciles y pagos en cuotas sin interés.',
      cta: 'Comprar ahora',
      ctaLink: '/?cat=all',
      ctaSecondary: 'Saber más',
      bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      pattern: '🔒',
    },
  ];

  const current = slides[slide];

  return (
    <section style={{ background: current.bg, transition: 'background 0.4s', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '40%', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px 70px', position: 'relative' }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '24px', padding: '6px 14px', marginBottom: '20px', backdropFilter: 'blur(8px)' }}>
            <Zap size={13} color="#fff" />
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>Marketplace #1 de la región</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '18px' }}>
            {current.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px', maxWidth: '520px' }}>
            {current.subtitle}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(current.ctaLink)}
              style={{ padding: '14px 28px', backgroundColor: '#fff', color: '#FF6835', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
            >
              {current.cta} <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate(current.ctaLink)}
              style={{ padding: '14px 28px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)' }}
            >
              {current.ctaSecondary}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '32px', marginTop: '40px', flexWrap: 'wrap' }}>
            {[['50K+', 'Productos'], ['12K+', 'Vendedores'], ['6', 'Países'], ['4.8★', 'Valoración']].map(([num, label]) => (
              <div key={label}>
                <div style={{ color: '#fff', fontSize: '22px', fontWeight: 800 }}>{num}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)}
            style={{ width: i === slide ? '24px' : '8px', height: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.4)' }}
          />
        ))}
      </div>
      <button onClick={() => setSlide((slide - 1 + slides.length) % slides.length)}
        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => setSlide((slide + 1) % slides.length)}
        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
        <ChevronRight size={18} />
      </button>
    </section>
  );
}

export default function StorefrontHomePage() {
  const navigate = useNavigate();
  const [ageGate, setAgeGate] = useState<{ open: boolean; catId: string; catName: string; catEmoji: string } | null>(null);

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    if (cat.ageRestricted) {
      if (isAgeVerified()) {
        navigate(`/?cat=${cat.id}`);
      } else {
        setAgeGate({ open: true, catId: cat.id, catName: cat.name, catEmoji: cat.emoji });
      }
    } else {
      navigate(`/?cat=${cat.id}`);
    }
  };

  return (
    <div>
      {/* Age Gate Modal */}
      {ageGate && (
        <AgeGateModal
          isOpen={ageGate.open}
          categoryName={ageGate.catName}
          categoryEmoji={ageGate.catEmoji}
          onVerified={() => {
            setAgeGate(null);
            navigate(`/?cat=${ageGate.catId}`);
            toast.success(`Bienvenido a ${ageGate.catName}`);
          }}
          onBlocked={() => {
            setAgeGate(null);
            toast.error('Acceso restringido — Contenido solo para mayores de 18 años');
          }}
        />
      )}

      <HeroSection />

      {/* Trust badges */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {[
            { icon: Truck, label: 'Envío gratis', sub: 'En compras +$150' },
            { icon: Shield, label: 'Compra segura', sub: 'Protección garantizada' },
            { icon: RefreshCw, label: 'Devoluciones', sub: 'Hasta 30 días' },
            { icon: Zap, label: 'Pago rápido', sub: 'MP · Stripe · Cuotas' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFF5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={20} color={ORANGE} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#111', marginBottom: '4px' }}>Categorías destacadas</h2>
            <p style={{ color: '#888', fontSize: '14px' }}>Explorá por lo que más te gusta</p>
          </div>
          <Link to="/?cat=all" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: ORANGE, textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            Ver todas <ArrowRight size={15} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              style={{ backgroundColor: '#fff', border: `1.5px solid ${cat.ageRestricted ? '#7C3AED30' : '#f0f0f0'}`, borderRadius: '16px', padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = cat.ageRestricted ? '#7C3AED' : ORANGE; el.style.boxShadow = `0 4px 16px ${cat.ageRestricted ? 'rgba(124,58,237,0.14)' : 'rgba(255,104,53,0.12)'}` ; el.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = cat.ageRestricted ? '#7C3AED30' : '#f0f0f0'; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}
            >
              {/* Badge +18 */}
              {cat.ageRestricted && (
                <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '10px', fontWeight: '800', color: '#fff', backgroundColor: '#EF4444', borderRadius: '4px', padding: '1px 5px', lineHeight: '16px' }}>
                  18+
                </div>
              )}
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>{cat.emoji}</div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#111', marginBottom: '4px' }}>{cat.name}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{cat.count} productos</div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#111', marginBottom: '4px' }}>Productos destacados</h2>
            <p style={{ color: '#888', fontSize: '14px' }}>Los más buscados esta semana</p>
          </div>
          <Link to="/?cat=all" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: ORANGE, textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            Ver todos <ArrowRight size={15} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Second Hand section */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 0' }}>
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #7C3AED 100%)', borderRadius: '20px', padding: '32px 40px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '24px', padding: '4px 12px', marginBottom: '12px' }}>
              <RefreshCw size={13} color="#fff" />
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>Second Hand</span>
            </div>
            <h2 style={{ color: '#fff', marginBottom: '8px' }}>Dale una segunda vida a tus cosas</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', maxWidth: '480px' }}>
              Comprá y vendé artículos usados de forma segura. Más de 5000 publicaciones activas cada semana.
            </p>
          </div>
          <button
            onClick={() => navigate('/secondhand/publish')}
            style={{ padding: '14px 28px', backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            + Publicar gratis
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#111' }}>Publicaciones recientes</h3>
          <Link to="/secondhand" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: ORANGE, textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            Ver todas <ArrowRight size={15} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {SECOND_HAND.slice(0, 4).map(item => (
            <Link key={item.id} to={`/product/${item.id}?sh=1`} style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <div style={{ position: 'relative', paddingBottom: '65%', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                  <img src={item.image} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '8px', left: '8px', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#fff', backgroundColor: CONDITION_COLORS[item.condition] }}>
                    {CONDITION_LABELS[item.condition]}
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '4px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{item.location} · {item.seller}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: ORANGE }}>${item.price}</span>
                      {item.originalPrice && (
                        <span style={{ fontSize: '12px', color: '#bbb', textDecoration: 'line-through', marginLeft: '6px' }}>${item.originalPrice}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>👁 {item.views}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo CTA */}
      <section style={{ maxWidth: '1280px', margin: '48px auto 0', padding: '0 24px 60px' }}>
        <div style={{ background: 'linear-gradient(135deg, #FF6835 0%, #FF8C4A 100%)', borderRadius: '20px', padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '160px', height: '160px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(22px, 4vw, 36px)', marginBottom: '12px' }}>¿Sos vendedor? Unite a Charlie Marketplace</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', marginBottom: '32px', maxWidth: '560px', margin: '0 auto 32px' }}>
              Más de 12.000 vendedores ya confían en nuestra plataforma. Comisiones mínimas, herramientas de marketing incluidas.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/admin')}
                style={{ padding: '14px 32px', backgroundColor: '#fff', color: ORANGE, border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
              >
                Abrir mi tienda
              </button>
              <button style={{ padding: '14px 32px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                Saber más
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}