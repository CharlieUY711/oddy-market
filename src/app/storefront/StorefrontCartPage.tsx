/* =====================================================
   Charlie Marketplace Builder — Cart Page
   ===================================================== */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, ChevronRight, Truck, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from './cartContext';

const ORANGE = '#FF6835';
const SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 12;

export default function StorefrontCartPage() {
  const { items, removeItem, setQty, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = promoApplied ? promoDiscount : 0;
  const total = subtotal - discount + shipping;
  const toFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  const handlePromo = () => {
    if (promoCode.toUpperCase() === 'CHARLIE10') {
      const d = Math.round(subtotal * 0.1);
      setPromoDiscount(d);
      setPromoApplied(true);
      toast.success(`Cupón aplicado: -$${d} (10% OFF)`);
    } else {
      toast.error('Código de cupón inválido');
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#FFF5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <ShoppingBag size={48} color={ORANGE} />
        </div>
        <h2 style={{ color: '#111', marginBottom: '12px' }}>Tu carrito está vacío</h2>
        <p style={{ color: '#888', fontSize: '15px', marginBottom: '32px' }}>Todavía no agregaste ningún producto. ¡Empezá a comprar ahora!</p>
        <Link to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', backgroundColor: ORANGE, color: '#fff', textDecoration: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600 }}
        >
          Explorar productos <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#111', marginBottom: '4px' }}>Mi carrito</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
        </div>
        <button onClick={() => { clearCart(); toast.info('Carrito vaciado'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px solid #f0f0f0', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: '#e53e3e' }}>
          <Trash2 size={14} /> Vaciar carrito
        </button>
      </div>

      {/* Free shipping progress */}
      {toFreeShipping > 0 && (
        <div style={{ backgroundColor: '#FFF5F2', border: '1.5px solid #FFD4C4', borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Truck size={20} color={ORANGE} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: '#333', fontWeight: 500, marginBottom: '6px' }}>
              Añadí <strong>${toFreeShipping.toFixed(2)}</strong> más para obtener envío gratis 🎉
            </p>
            <div style={{ height: '6px', backgroundColor: '#FFD4C4', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100)}%`, backgroundColor: ORANGE, borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
      )}

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: '32px', alignItems: 'start' }}
        className="max-lg:grid-cols-1">

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(item => (
            <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Image */}
              <div style={{ width: '88px', height: '88px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f5f5f5' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/product/${item.productId}`}
                  style={{ textDecoration: 'none', color: '#111', fontWeight: 600, fontSize: '15px', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </Link>
                {item.variant && (
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{item.variant}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Qty control */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => setQty(item.id, item.quantity - 1)}
                      style={{ width: '30px', height: '30px', borderRadius: '8px 0 0 8px', border: '1.5px solid #e0e0e0', backgroundColor: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={12} />
                    </button>
                    <div style={{ width: '44px', height: '30px', border: '1.5px solid #e0e0e0', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600 }}>
                      {item.quantity}
                    </div>
                    <button onClick={() => setQty(item.id, item.quantity + 1)}
                      style={{ width: '30px', height: '30px', borderRadius: '0 8px 8px 0', border: '1.5px solid #e0e0e0', backgroundColor: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Price + remove */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: ORANGE }}>${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => { removeItem(item.id); toast.info(`"${item.name}" eliminado`); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: '4px', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e53e3e'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#bbb'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: ORANGE, textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '12px 0' }}>
            ← Seguir comprando
          </Link>
        </div>

        {/* Order summary */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', padding: '24px', position: 'sticky', top: '80px' }}>
          <h3 style={{ color: '#111', marginBottom: '20px' }}>Resumen del pedido</h3>

          {/* Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Subtotal ({items.length} items)</span>
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>${subtotal.toFixed(2)}</span>
            </div>
            {promoApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#10B981', fontSize: '14px' }}>Descuento (CHARLIE10)</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#10B981' }}>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Envío</span>
              <span style={{ fontWeight: 600, fontSize: '14px', color: shipping === 0 ? '#10B981' : '#111' }}>
                {shipping === 0 ? '¡Gratis!' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Promo code */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                <input
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="Código de descuento"
                  disabled={promoApplied}
                  style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '10px 10px 10px 32px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: promoApplied ? '#f9f9f9' : '#fff', outline: 'none' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0e0e0'}
                  onKeyDown={e => e.key === 'Enter' && handlePromo()}
                />
              </div>
              <button onClick={handlePromo} disabled={promoApplied}
                style={{ padding: '10px 16px', backgroundColor: promoApplied ? '#f0f0f0' : ORANGE, color: promoApplied ? '#aaa' : '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: promoApplied ? 'default' : 'pointer' }}>
                {promoApplied ? 'Aplicado' : 'Aplicar'}
              </button>
            </div>
            {!promoApplied && <p style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>Probá con: <strong>CHARLIE10</strong></p>}
          </div>

          {/* Total */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#111' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '24px', color: ORANGE }}>${total.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>IVA incluido</p>
          </div>

          <button onClick={() => navigate('/checkout')}
            style={{ width: '100%', padding: '16px', backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.15s', marginBottom: '12px' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            Finalizar compra <ArrowRight size={16} />
          </button>

          {/* Trust */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Shield size={13} color="#10B981" />
            <span style={{ fontSize: '12px', color: '#888' }}>Compra 100% segura y protegida</span>
          </div>

          {/* Payment icons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            {['Visa', 'MC', 'MP', 'Stripe', 'QR'].map(p => (
              <span key={p} style={{ padding: '3px 8px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '11px', color: '#888', fontWeight: 600 }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}