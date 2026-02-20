/* =====================================================
   Charlie Marketplace Builder — Publicar Artículo Second Hand (multi-step)
   ===================================================== */
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Upload, X, ChevronRight, Check, ArrowRight, Image as ImageIcon, Tag, DollarSign, MapPin, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES, CONDITION_LABELS } from './storefrontData';

const ORANGE = '#FF6835';

type Step = 1 | 2 | 3 | 4;

interface PublishForm {
  images: string[];
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  originalPrice: string;
  location: string;
  country: string;
  phone: string;
  acceptTerms: boolean;
}

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: 'Fotos', icon: ImageIcon },
    { n: 2, label: 'Artículo', icon: Tag },
    { n: 3, label: 'Precio', icon: DollarSign },
    { n: 4, label: 'Publicar', icon: Eye },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '36px' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backgroundColor: s.n < current ? ORANGE : s.n === current ? ORANGE : '#f0f0f0', color: s.n <= current ? '#fff' : '#aaa' }}>
              {s.n < current ? <Check size={18} /> : <s.icon size={16} />}
            </div>
            <span style={{ fontSize: '11px', fontWeight: s.n === current ? 600 : 400, color: s.n === current ? ORANGE : s.n < current ? '#555' : '#aaa' }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: '56px', height: '2px', backgroundColor: s.n < current ? ORANGE : '#f0f0f0', marginTop: '-18px', transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Placeholder images for demo drag-drop
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1525446517618-9a9e5430288b?w=400&q=80',
  'https://images.unsplash.com/photo-1605296830714-7c02e14957ac?w=400&q=80',
  'https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?w=400&q=80',
  'https://images.unsplash.com/photo-1625860191460-10a66c7384fb?w=400&q=80',
];

export default function StorefrontPublishPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PublishForm>({
    images: [],
    title: '', description: '', category: '', condition: '',
    price: '', originalPrice: '',
    location: '', country: 'Uruguay', phone: '',
    acceptTerms: false,
  });

  const set = (key: keyof PublishForm) => (v: string | boolean | string[]) =>
    setForm(f => ({ ...f, [key]: v }));

  const addDemoImage = () => {
    if (form.images.length >= 8) { toast.error('Máximo 8 imágenes'); return; }
    const next = DEMO_IMAGES[form.images.length % DEMO_IMAGES.length];
    set('images')([...form.images, next]);
    toast.success('Imagen añadida');
  };

  const removeImage = (i: number) =>
    set('images')(form.images.filter((_, idx) => idx !== i));

  const validateStep = (): boolean => {
    if (step === 1 && form.images.length === 0) { toast.error('Añadí al menos 1 foto'); return false; }
    if (step === 2 && (!form.title || !form.category || !form.condition)) { toast.error('Completá título, categoría y estado'); return false; }
    if (step === 3 && !form.price) { toast.error('Ingresá el precio'); return false; }
    if (step === 4 && !form.acceptTerms) { toast.error('Aceptá los términos para publicar'); return false; }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step === 4) {
      toast.loading('Publicando artículo...', { id: 'pub' });
      setTimeout(() => {
        toast.dismiss('pub');
        toast.success('¡Artículo publicado! Estará visible en minutos.');
        navigate('/secondhand');
      }, 1600);
    } else {
      setStep(prev => (prev + 1) as Step);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
        <Link to="/" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Inicio</Link>
        <ChevronRight size={13} color="#ccc" />
        <Link to="/secondhand" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Second Hand</Link>
        <ChevronRight size={13} color="#ccc" />
        <span style={{ color: '#333', fontSize: '13px', fontWeight: 500 }}>Publicar artículo</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#111', marginBottom: '8px' }}>Publicar artículo</h1>
        <p style={{ color: '#888', fontSize: '14px' }}>Publicá gratis en minutos y llegá a miles de compradores</p>
      </div>

      <StepIndicator current={step} />

      <div style={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #f0f0f0', padding: '36px' }}>

        {/* Step 1: Photos */}
        {step === 1 && (
          <div>
            <h2 style={{ color: '#111', marginBottom: '8px' }}>Fotos del artículo</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>Las publicaciones con más fotos se venden 3× más rápido. Máximo 8 fotos.</p>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addDemoImage(); }}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? ORANGE : '#e0e0e0'}`, borderRadius: '16px', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', backgroundColor: dragging ? '#FFF5F2' : '#FAFAFA', transition: 'all 0.2s', marginBottom: '20px' }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#FFF5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Upload size={26} color={ORANGE} />
              </div>
              <p style={{ fontWeight: 600, fontSize: '15px', color: '#333', marginBottom: '6px' }}>Arrastrá fotos aquí o hacé clic para subir</p>
              <p style={{ fontSize: '13px', color: '#aaa' }}>PNG, JPG o WEBP · Máx. 5MB cada una · Hasta 8 fotos</p>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addDemoImage} />
            </div>

            {/* Demo button */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button onClick={addDemoImage}
                style={{ padding: '8px 20px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#555', fontWeight: 600 }}>
                + Añadir foto de ejemplo (demo)
              </button>
            </div>

            {/* Grid */}
            {form.images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                {form.images.map((src, i) => (
                  <div key={i} style={{ position: 'relative', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', border: i === 0 ? `3px solid ${ORANGE}` : '2px solid #e0e0e0' }}>
                    <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === 0 && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: ORANGE, color: '#fff', fontSize: '10px', fontWeight: 700, textAlign: 'center', padding: '3px' }}>
                        PORTADA
                      </div>
                    )}
                    <button onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '12px', textAlign: 'center' }}>
              {form.images.length}/8 fotos · La primera foto es la portada
            </p>
          </div>
        )}

        {/* Step 2: Item info */}
        {step === 2 && (
          <div>
            <h2 style={{ color: '#111', marginBottom: '8px' }}>Información del artículo</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>Contanos qué estás vendiendo. Cuanto más detallado, mejor.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Título <span style={{ color: ORANGE }}>*</span></label>
                <input value={form.title} onChange={e => set('title')(e.target.value)}
                  placeholder="Ej: iPhone 13 Pro 256GB — Muy buen estado"
                  maxLength={80}
                  style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#FAFAFA' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0e0e0'} />
                <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', textAlign: 'right' }}>{form.title.length}/80 caracteres</p>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Descripción</label>
                <textarea value={form.description} onChange={e => set('description')(e.target.value)}
                  placeholder="Describí el estado del artículo, accesorios incluidos, motivo de venta..."
                  rows={5}
                  style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', backgroundColor: '#FAFAFA', fontFamily: 'inherit' }}
                  onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = ORANGE}
                  onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e0e0e0'} />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '10px' }}>Categoría <span style={{ color: ORANGE }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => set('category')(c.id)}
                      style={{ padding: '12px 8px', borderRadius: '12px', border: `2px solid ${form.category === c.id ? ORANGE : '#e0e0e0'}`, backgroundColor: form.category === c.id ? '#FFF5F2' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{c.emoji}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: form.category === c.id ? ORANGE : '#333' }}>{c.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '10px' }}>Estado del artículo <span style={{ color: ORANGE }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {(Object.entries(CONDITION_LABELS) as [string, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => set('condition')(key)}
                      style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${form.condition === key ? ORANGE : '#e0e0e0'}`, backgroundColor: form.condition === key ? '#FFF5F2' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: form.condition === key ? ORANGE : '#333', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontSize: '11px', color: '#aaa' }}>
                        {key === 'nuevo' && 'Sin usar, con etiquetas'}
                        {key === 'como-nuevo' && 'Poco uso, sin marcas'}
                        {key === 'buen-estado' && 'Usado, buen estado'}
                        {key === 'aceptable' && 'Marcas visibles de uso'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Price + location */}
        {step === 3 && (
          <div>
            <h2 style={{ color: '#111', marginBottom: '8px' }}>Precio y ubicación</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>Ponele precio y contanos desde dónde vendés.</p>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Precio de venta (USD) <span style={{ color: ORANGE }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontWeight: 600 }}>$</span>
                    <input type="number" value={form.price} onChange={e => set('price')(e.target.value)}
                      placeholder="0.00"
                      style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '11px 14px 11px 28px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', fontWeight: 600, backgroundColor: '#FAFAFA' }}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0e0e0'} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Precio original (opcional)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontWeight: 600 }}>$</span>
                    <input type="number" value={form.originalPrice} onChange={e => set('originalPrice')(e.target.value)}
                      placeholder="0.00"
                      style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '11px 14px 11px 28px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#FAFAFA' }}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0e0e0'} />
                  </div>
                  {form.price && form.originalPrice && parseFloat(form.price) < parseFloat(form.originalPrice) && (
                    <p style={{ fontSize: '11px', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>
                      Descuento: {Math.round((1 - parseFloat(form.price) / parseFloat(form.originalPrice)) * 100)}% OFF
                    </p>
                  )}
                </div>
              </div>

              {/* Tip */}
              <div style={{ padding: '14px', backgroundColor: '#FFFBF0', borderRadius: '12px', border: '1px solid #FDE68A', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', marginBottom: '4px' }}>Consejo de precio</p>
                  <p style={{ fontSize: '12px', color: '#B45309' }}>Los artículos con precio entre 20–40% del valor original se venden 5× más rápido. Sé flexible para negociar.</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Ciudad / Barrio <span style={{ color: ORANGE }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input value={form.location} onChange={e => set('location')(e.target.value)}
                    placeholder="Ej: Montevideo, Pocitos"
                    style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '11px 14px 11px 36px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#FAFAFA' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0e0e0'} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>País</label>
                <select value={form.country} onChange={e => set('country')(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', backgroundColor: '#FAFAFA', outline: 'none', boxSizing: 'border-box' }}>
                  {['Uruguay', 'Argentina', 'Chile', 'Colombia', 'Perú', 'México'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>WhatsApp de contacto</label>
                <input type="tel" value={form.phone} onChange={e => set('phone')(e.target.value)}
                  placeholder="+598 99 000 000"
                  style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#FAFAFA' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0e0e0'} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preview & Publish */}
        {step === 4 && (
          <div>
            <h2 style={{ color: '#111', marginBottom: '8px' }}>Vista previa y publicación</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>Revisá cómo verán tu artículo los compradores antes de publicar.</p>

            {/* Preview card */}
            <div style={{ backgroundColor: '#F9F9F9', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e0e0e0', marginBottom: '28px', maxWidth: '380px', margin: '0 auto 28px' }}>
              {form.images[0] ? (
                <img src={form.images[0]} alt="preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '200px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={40} color="#ccc" />
                </div>
              )}
              <div style={{ padding: '16px' }}>
                <p style={{ fontWeight: 600, fontSize: '15px', color: '#111', marginBottom: '6px' }}>{form.title || 'Sin título'}</p>
                <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>{form.location || 'Sin ubicación'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: ORANGE }}>{form.price ? `$${form.price}` : 'Sin precio'}</span>
                  <span style={{ fontSize: '11px', color: '#fff', padding: '3px 8px', borderRadius: '6px', backgroundColor: ORANGE }}>
                    {form.condition ? CONDITION_LABELS[form.condition as keyof typeof CONDITION_LABELS] : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
              {[
                ['Fotos', `${form.images.length} imágenes`],
                ['Categoría', CATEGORIES.find(c => c.id === form.category)?.name || '—'],
                ['Estado', form.condition ? CONDITION_LABELS[form.condition as keyof typeof CONDITION_LABELS] : '—'],
                ['Precio', form.price ? `$${form.price}` : '—'],
                ['Ubicación', form.location || '—'],
                ['País', form.country],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F9F9F9', borderRadius: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>{k}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', padding: '16px', backgroundColor: '#FFF5F2', borderRadius: '12px', border: `1.5px solid ${form.acceptTerms ? ORANGE : '#FFD4C4'}`, marginBottom: '4px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: form.acceptTerms ? ORANGE : '#fff', border: `2px solid ${form.acceptTerms ? ORANGE : '#ddd'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', transition: 'all 0.15s' }}
                onClick={() => set('acceptTerms')(!form.acceptTerms)}>
                {form.acceptTerms && <Check size={12} color="#fff" />}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '2px' }}>Acepto los Términos y Condiciones</p>
                <p style={{ fontSize: '12px', color: '#888' }}>Confirmo que el artículo es de mi propiedad, la descripción es veraz y acepto las <a href="#" style={{ color: ORANGE }}>políticas de Second Hand</a> de Charlie Marketplace.</p>
              </div>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          {step > 1 ? (
            <button onClick={() => setStep(prev => (prev - 1) as Step)}
              style={{ background: 'none', border: '1.5px solid #e0e0e0', borderRadius: '12px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#666' }}>
              ← Volver
            </button>
          ) : (
            <Link to="/secondhand" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>← Cancelar</Link>
          )}

          <button onClick={handleNext}
            style={{ padding: '12px 28px', backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            {step === 4 ? '🚀 Publicar ahora' : <>Continuar <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}