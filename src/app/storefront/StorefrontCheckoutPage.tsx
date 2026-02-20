/* =====================================================
   Charlie Marketplace Builder — Checkout (multi-step)
   ===================================================== */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, ChevronRight, CreditCard, Smartphone, Building2, Lock, ArrowRight, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from './cartContext';

const ORANGE = '#FF6835';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1
  nombre: string; apellido: string; email: string; telefono: string;
  // Step 2
  direccion: string; numero: string; ciudad: string; departamento: string; pais: string; metodoEnvio: string;
  // Step 3
  metodoPago: 'mp' | 'tarjeta' | 'transferencia';
  cardNumber: string; cardName: string; cardExpiry: string; cardCvc: string;
}

const SHIPPING_METHODS = [
  { id: 'estandar', label: 'Envío estándar', sub: '3–5 días hábiles', price: 12, icon: '📦' },
  { id: 'express', label: 'Envío express', sub: '1–2 días hábiles', price: 24, icon: '⚡' },
  { id: 'retiro', label: 'Retiro en punto', sub: 'Desde mañana · gratis', price: 0, icon: '🏪' },
];

const COUNTRIES = ['Uruguay', 'Argentina', 'Chile', 'Colombia', 'Perú', 'México'];

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: 'Contacto' },
    { n: 2, label: 'Envío' },
    { n: 3, label: 'Pago' },
    { n: 4, label: 'Confirmación' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '40px' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, transition: 'all 0.2s', backgroundColor: s.n < current ? ORANGE : s.n === current ? ORANGE : '#f0f0f0', color: s.n <= current ? '#fff' : '#aaa' }}>
              {s.n < current ? <Check size={16} /> : s.n}
            </div>
            <span style={{ fontSize: '11px', fontWeight: s.n === current ? 600 : 400, color: s.n === current ? ORANGE : s.n < current ? '#555' : '#aaa', whiteSpace: 'nowrap' }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: '60px', height: '2px', backgroundColor: s.n < current ? ORANGE : '#f0f0f0', marginTop: '-18px', transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: ORANGE }}>*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s', backgroundColor: '#FAFAFA' }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0e0e0'}
      />
    </div>
  );
}

export default function StorefrontCheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [orderNumber] = useState(`OM-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  const [form, setForm] = useState<FormData>({
    nombre: '', apellido: '', email: '', telefono: '',
    direccion: '', numero: '', ciudad: '', departamento: '', pais: 'Uruguay', metodoEnvio: 'estandar',
    metodoPago: 'mp', cardNumber: '', cardName: '', cardExpiry: '', cardCvc: '',
  });

  const set = (key: keyof FormData) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const shipping = SHIPPING_METHODS.find(m => m.id === form.metodoEnvio)?.price ?? 12;
  const total = subtotal + shipping;

  const validateStep = () => {
    if (step === 1) {
      if (!form.nombre || !form.email) { toast.error('Completá nombre y email'); return false; }
    } else if (step === 2) {
      if (!form.direccion || !form.ciudad) { toast.error('Completá la dirección'); return false; }
    } else if (step === 3) {
      if (form.metodoPago === 'tarjeta' && (!form.cardNumber || !form.cardName)) {
        toast.error('Completá los datos de la tarjeta'); return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step === 3) {
      toast.loading('Procesando pago...', { id: 'pay' });
      setTimeout(() => {
        toast.dismiss('pay');
        toast.success('¡Pago aprobado!');
        clearCart();
        setStep(4);
      }, 1800);
    } else {
      setStep(prev => (prev + 1) as Step);
    }
  };

  if (items.length === 0 && step !== 4) {
    return (
      <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Tu carrito está vacío</h2>
        <Link to="/" style={{ color: ORANGE, fontWeight: 600 }}>← Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link to="/cart" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Carrito</Link>
        <ChevronRight size={13} color="#ccc" />
        <span style={{ color: '#333', fontSize: '13px', fontWeight: 500 }}>Checkout</span>
      </div>

      <StepIndicator current={step} />

      <div style={{ display: 'grid', gridTemplateColumns: step === 4 ? '1fr' : 'minmax(0,3fr) minmax(0,2fr)', gap: '32px', alignItems: 'start' }} className="max-lg:grid-cols-1">

        {/* Main form */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', padding: '32px', order: step === 4 ? 1 : 0 }}>

          {/* Step 1: Contact */}
          {step === 1 && (
            <div>
              <h2 style={{ color: '#111', marginBottom: '8px' }}>Datos de contacto</h2>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>¿A quién le enviamos la confirmación?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InputField label="Nombre" value={form.nombre} onChange={set('nombre')} placeholder="Juan" required />
                <InputField label="Apellido" value={form.apellido} onChange={set('apellido')} placeholder="García" />
                <div style={{ gridColumn: '1 / -1' }}>
                  <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="juan@email.com" required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <InputField label="Teléfono" type="tel" value={form.telefono} onChange={set('telefono')} placeholder="+598 99 000 000" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div>
              <h2 style={{ color: '#111', marginBottom: '8px' }}>Dirección de envío</h2>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>¿Dónde entregamos tu pedido?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <InputField label="Calle" value={form.direccion} onChange={set('direccion')} placeholder="Av. 18 de Julio" required />
                <InputField label="Nro." value={form.numero} onChange={set('numero')} placeholder="1234" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <InputField label="Ciudad" value={form.ciudad} onChange={set('ciudad')} placeholder="Montevideo" required />
                <InputField label="Departamento / Estado" value={form.departamento} onChange={set('departamento')} placeholder="Montevideo" />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>País</label>
                <select value={form.pais} onChange={e => set('pais')(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', backgroundColor: '#FAFAFA', outline: 'none' }}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <h3 style={{ color: '#111', marginBottom: '14px', fontSize: '15px' }}>Método de envío</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SHIPPING_METHODS.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '14px', border: `2px solid ${form.metodoEnvio === m.id ? ORANGE : '#e0e0e0'}`, cursor: 'pointer', backgroundColor: form.metodoEnvio === m.id ? '#FFF5F2' : '#fff', transition: 'all 0.15s' }}>
                    <input type="radio" name="shipping" value={m.id} checked={form.metodoEnvio === m.id} onChange={() => set('metodoEnvio')(m.id)} style={{ display: 'none' }} />
                    <span style={{ fontSize: '24px' }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{m.label}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{m.sub}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: m.price === 0 ? '#10B981' : '#111' }}>
                      {m.price === 0 ? 'Gratis' : `$${m.price}`}
                    </div>
                    {form.metodoEnvio === m.id && <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" /></div>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div>
              <h2 style={{ color: '#111', marginBottom: '8px' }}>Método de pago</h2>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>Tus datos están protegidos con cifrado SSL</p>

              {/* Payment method selector */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {[
                  { id: 'mp', icon: Smartphone, label: 'Mercado Pago', sub: 'Cuotas sin interés' },
                  { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta', sub: 'Visa / Mastercard' },
                  { id: 'transferencia', icon: Building2, label: 'Transferencia', sub: 'Descuento 5%' },
                ].map(m => (
                  <button key={m.id} onClick={() => set('metodoPago')(m.id as FormData['metodoPago'])}
                    style={{ padding: '16px 12px', borderRadius: '14px', border: `2px solid ${form.metodoPago === m.id ? ORANGE : '#e0e0e0'}`, backgroundColor: form.metodoPago === m.id ? '#FFF5F2' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    <m.icon size={22} color={form.metodoPago === m.id ? ORANGE : '#888'} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 600, fontSize: '12px', color: form.metodoPago === m.id ? ORANGE : '#333' }}>{m.label}</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>{m.sub}</div>
                  </button>
                ))}
              </div>

              {form.metodoPago === 'mp' && (
                <div style={{ padding: '24px', backgroundColor: '#F0F8FF', borderRadius: '14px', border: '1.5px solid #BEE3F8', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
                  <h4 style={{ color: '#1A365D', marginBottom: '8px' }}>Redirigiendo a Mercado Pago</h4>
                  <p style={{ fontSize: '13px', color: '#4A5568' }}>Al confirmar serás redirigido a la plataforma segura de Mercado Pago para completar el pago.</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {['Débito', 'Crédito', '12 cuotas', 'QR', 'Saldo MP'].map(t => (
                      <span key={t} style={{ padding: '3px 8px', backgroundColor: '#EBF8FF', borderRadius: '4px', fontSize: '11px', color: '#2C5282', fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {form.metodoPago === 'tarjeta' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <InputField label="Número de tarjeta" value={form.cardNumber} onChange={v => set('cardNumber')(v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim())} placeholder="0000 0000 0000 0000" />
                  <InputField label="Nombre en la tarjeta" value={form.cardName} onChange={set('cardName')} placeholder="JUAN GARCIA" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <InputField label="Vencimiento" value={form.cardExpiry} onChange={v => set('cardExpiry')(v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2'))} placeholder="MM/AA" />
                    <InputField label="CVC" value={form.cardCvc} onChange={v => set('cardCvc')(v.replace(/\D/g, '').slice(0, 4))} placeholder="123" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#F0FFF4', borderRadius: '10px', border: '1px solid #C6F6D5' }}>
                    <Lock size={14} color="#10B981" />
                    <span style={{ fontSize: '12px', color: '#276749' }}>Tus datos están protegidos con cifrado SSL de 256 bits</span>
                  </div>
                </div>
              )}

              {form.metodoPago === 'transferencia' && (
                <div style={{ padding: '24px', backgroundColor: '#F9F5FF', borderRadius: '14px', border: '1.5px solid #D6BCFA' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏦</div>
                  <h4 style={{ color: '#44337A', marginBottom: '12px' }}>Datos para transferencia</h4>
                  {[['Banco', 'BROU / Itaú / Santander'], ['Cuenta', '001-12345678-001'], ['RUT/CI', '21.345.678-9'], ['Titular', 'Charlie Marketplace S.A.']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E9D8FD' }}>
                      <span style={{ fontSize: '13px', color: '#6B46C1', fontWeight: 500 }}>{k}</span>
                      <span style={{ fontSize: '13px', color: '#44337A', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: '12px', color: '#805AD5', marginTop: '12px' }}>🎁 5% de descuento por pago por transferencia. Enviá el comprobante a hola@charliemarketplace.com</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'none' }}>
                <Check size={40} color="#10B981" />
              </div>
              <h2 style={{ color: '#111', marginBottom: '8px' }}>¡Pedido confirmado! 🎉</h2>
              <p style={{ color: '#888', fontSize: '15px', marginBottom: '24px' }}>
                Tu pedido fue procesado exitosamente. Recibirás una confirmación en <strong>{form.email || 'tu email'}</strong>.
              </p>

              <div style={{ backgroundColor: '#F9F9F9', borderRadius: '14px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Número de pedido</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: ORANGE }}>{orderNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Estado</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>Confirmado ✓</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Envío estimado</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>3–5 días hábiles</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Total pagado</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: ORANGE }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px', margin: '0 auto' }}>
                <Link to="/account?tab=pedidos"
                  style={{ padding: '14px', backgroundColor: ORANGE, color: '#fff', textDecoration: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Package size={16} /> Ver mis pedidos
                </Link>
                <Link to="/"
                  style={{ padding: '14px', backgroundColor: '#f5f5f5', color: '#333', textDecoration: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, textAlign: 'center' }}>
                  Seguir comprando
                </Link>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step !== 4 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
              {step > 1 ? (
                <button onClick={() => setStep(prev => (prev - 1) as Step)}
                  style={{ background: 'none', border: '1.5px solid #e0e0e0', borderRadius: '12px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#666' }}>
                  ← Volver
                </button>
              ) : (
                <Link to="/cart" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>← Volver al carrito</Link>
              )}
              <button onClick={handleNext}
                style={{ padding: '12px 28px', backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                {step === 3 ? 'Confirmar pago' : 'Continuar'} <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Order Summary sidebar */}
        {step !== 4 && (
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', padding: '24px', position: 'sticky', top: '80px' }}>
            <h3 style={{ color: '#111', marginBottom: '16px' }}>Resumen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto', marginBottom: '16px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: ORANGE, color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    {item.variant && <p style={{ fontSize: '11px', color: '#aaa' }}>{item.variant}</p>}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: ORANGE, flexShrink: 0 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Subtotal</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Envío</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: shipping === 0 ? '#10B981' : '#111' }}>{shipping === 0 ? 'Gratis' : `$${shipping}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '20px', color: ORANGE }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}