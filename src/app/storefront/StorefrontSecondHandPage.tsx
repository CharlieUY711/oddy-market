/* =====================================================
   Charlie Marketplace Builder — Second Hand Browse
   ===================================================== */
import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal, RefreshCw, Heart, Eye, MapPin, ChevronDown, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { SECOND_HAND, CATEGORIES, CONDITION_LABELS, CONDITION_COLORS, type SecondHandListing } from './storefrontData';

const ORANGE = '#FF6835';

const PRICE_RANGES = [
  { label: 'Hasta $50', min: 0, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: '$100 – $300', min: 100, max: 300 },
  { label: '$300 – $600', min: 300, max: 600 },
  { label: 'Más de $600', min: 600, max: Infinity },
];

const SORT_OPTIONS = [
  { value: 'reciente', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'vistas', label: 'Más vistos' },
];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', marginBottom: '16px' }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px', fontWeight: 600, fontSize: '14px', color: '#111' }}>
        {title}
        <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && children}
    </div>
  );
}

function ListingCard({ item }: { item: SecondHandListing }) {
  const [wished, setWished] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0', transition: 'all 0.2s', boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.1)' : 'none', transform: hovered ? 'translateY(-3px)' : 'none' }}
    >
      <Link to={`/product/${item.id}?sh=1`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ position: 'relative', paddingBottom: '70%', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
          <img src={item.image} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />

          {/* Condition badge */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#fff', backgroundColor: CONDITION_COLORS[item.condition] }}>
            {CONDITION_LABELS[item.condition]}
          </div>

          {/* Stats */}
          <div style={{ position: 'absolute', bottom: '8px', left: '8px', display: 'flex', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 7px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', backdropFilter: 'blur(4px)' }}>
              <Eye size={10} /> {item.views}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 7px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', backdropFilter: 'blur(4px)' }}>
              <Heart size={10} /> {item.favorites}
            </span>
          </div>

          {/* Discount */}
          {discount > 0 && (
            <div style={{ position: 'absolute', top: '10px', right: '44px', padding: '3px 7px', borderRadius: '6px', backgroundColor: '#10B981', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
              -{discount}%
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <Link to={`/product/${item.id}?sh=1`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
          </Link>
          <button onClick={() => { setWished(!wished); toast.success(wished ? 'Eliminado de favoritos' : 'Añadido a favoritos'); }}
            style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <Heart size={16} fill={wished ? '#e53e3e' : 'none'} color={wished ? '#e53e3e' : '#ccc'} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
          <MapPin size={11} color="#aaa" />
          <span style={{ fontSize: '12px', color: '#aaa' }}>{item.location}</span>
          <span style={{ color: '#ddd', margin: '0 4px' }}>·</span>
          <span style={{ fontSize: '12px', color: '#aaa' }}>{item.seller}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: ORANGE }}>${item.price}</span>
            {item.originalPrice && (
              <span style={{ fontSize: '13px', color: '#bbb', textDecoration: 'line-through', marginLeft: '6px' }}>${item.originalPrice}</span>
            )}
          </div>
          <Link to={`/product/${item.id}?sh=1`}
            style={{ fontSize: '12px', color: ORANGE, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
            Ver <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontSecondHandPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sortBy, setSortBy] = useState('reciente');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleCat = (id: string) =>
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const toggleCondition = (c: string) =>
    setSelectedConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const filtered = useMemo(() => {
    let list = [...SECOND_HAND];
    if (search) list = list.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()));
    if (selectedCats.length) list = list.filter(i => selectedCats.includes(i.category));
    if (selectedConditions.length) list = list.filter(i => selectedConditions.includes(i.condition));
    if (priceRange) list = list.filter(i => i.price >= priceRange.min && i.price <= priceRange.max);

    switch (sortBy) {
      case 'precio-asc': return list.sort((a, b) => a.price - b.price);
      case 'precio-desc': return list.sort((a, b) => b.price - a.price);
      case 'vistas': return list.sort((a, b) => b.views - a.views);
      default: return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  }, [search, selectedCats, selectedConditions, priceRange, sortBy]);

  const hasFilters = selectedCats.length > 0 || selectedConditions.length > 0 || priceRange !== null;

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #7C3AED 100%)', padding: '48px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '24px', padding: '6px 16px', marginBottom: '16px' }}>
            <RefreshCw size={14} color="#fff" />
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Second Hand Marketplace</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 4vw, 40px)', marginBottom: '12px' }}>Encontrá tu próxima ganga</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', marginBottom: '28px' }}>
            Más de 5.000 artículos de segunda mano verificados. Ahorrá hasta 70% en tecnología, moda, hogar y más.
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto 20px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar artículos usados..."
              style={{ width: '100%', border: 'none', borderRadius: '14px', padding: '14px 14px 14px 46px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            />
          </div>

          <button
            onClick={() => navigate('/secondhand/publish')}
            style={{ padding: '12px 28px', backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            + Publicar gratis
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 64px', display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', gap: '28px', alignItems: 'start' }}
        className="max-lg:grid-cols-1">

        {/* Filters sidebar */}
        <div>
          {/* Mobile toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#fff', border: '1.5px solid #e0e0e0', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><SlidersHorizontal size={16} color={ORANGE} /> Filtros {hasFilters && `(activos)`}</span>
            <ChevronDown size={15} style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          <div className="max-lg:hidden" style={{ display: 'block' }}>
            <SidebarContent
              selectedCats={selectedCats} toggleCat={toggleCat}
              selectedConditions={selectedConditions} toggleCondition={toggleCondition}
              priceRange={priceRange} setPriceRange={setPriceRange}
              hasFilters={hasFilters} onClear={() => { setSelectedCats([]); setSelectedConditions([]); setPriceRange(null); setSearch(''); }}
            />
          </div>

          {filtersOpen && (
            <div className="lg:hidden" style={{ backgroundColor: '#fff', border: '1.5px solid #e0e0e0', borderRadius: '16px', padding: '20px' }}>
              <SidebarContent
                selectedCats={selectedCats} toggleCat={toggleCat}
                selectedConditions={selectedConditions} toggleCondition={toggleCondition}
                priceRange={priceRange} setPriceRange={setPriceRange}
                hasFilters={hasFilters} onClear={() => { setSelectedCats([]); setSelectedConditions([]); setPriceRange(null); setSearch(''); }}
              />
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              <strong style={{ color: '#111' }}>{filtered.length}</strong> publicaciones encontradas
            </p>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer', outline: 'none' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Active filters tags */}
          {hasFilters && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {selectedCats.map(c => (
                <span key={c} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: '#FFF5F2', border: `1px solid ${ORANGE}`, borderRadius: '20px', fontSize: '12px', color: ORANGE, fontWeight: 600 }}>
                  {CATEGORIES.find(cat => cat.id === c)?.name}
                  <button onClick={() => toggleCat(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: ORANGE }}><X size={12} /></button>
                </span>
              ))}
              {selectedConditions.map(c => (
                <span key={c} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: '#FFF5F2', border: `1px solid ${ORANGE}`, borderRadius: '20px', fontSize: '12px', color: ORANGE, fontWeight: 600 }}>
                  {CONDITION_LABELS[c as keyof typeof CONDITION_LABELS]}
                  <button onClick={() => toggleCondition(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: ORANGE }}><X size={12} /></button>
                </span>
              ))}
              {priceRange && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: '#FFF5F2', border: `1px solid ${ORANGE}`, borderRadius: '20px', fontSize: '12px', color: ORANGE, fontWeight: 600 }}>
                  {PRICE_RANGES.find(r => r.min === priceRange.min && r.max === priceRange.max)?.label}
                  <button onClick={() => setPriceRange(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: ORANGE }}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ color: '#333', marginBottom: '8px' }}>Sin resultados</h3>
              <p style={{ color: '#888', fontSize: '14px' }}>Probá con otras palabras o ajustá los filtros</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {filtered.map(item => <ListingCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ selectedCats, toggleCat, selectedConditions, toggleCondition, priceRange, setPriceRange, hasFilters, onClear }: {
  selectedCats: string[]; toggleCat: (c: string) => void;
  selectedConditions: string[]; toggleCondition: (c: string) => void;
  priceRange: { min: number; max: number } | null; setPriceRange: (r: { min: number; max: number } | null) => void;
  hasFilters: boolean; onClear: () => void;
}) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#111', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SlidersHorizontal size={15} color={ORANGE} /> Filtros
        </span>
        {hasFilters && (
          <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: ORANGE, fontWeight: 600 }}>Limpiar</button>
        )}
      </div>

      <FilterSection title="Categoría">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {CATEGORIES.map(c => (
            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 8px', borderRadius: '8px', backgroundColor: selectedCats.includes(c.id) ? '#FFF5F2' : 'transparent', transition: 'background 0.1s' }}>
              <input type="checkbox" checked={selectedCats.includes(c.id)} onChange={() => toggleCat(c.id)}
                style={{ accentColor: ORANGE }} />
              <span style={{ fontSize: '13px', color: '#333' }}>{c.emoji} {c.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Estado">
        {(['como-nuevo', 'buen-estado', 'aceptable', 'nuevo'] as const).map(cond => (
          <label key={cond} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 8px', borderRadius: '8px', marginBottom: '4px', backgroundColor: selectedConditions.includes(cond) ? '#FFF5F2' : 'transparent' }}>
            <input type="checkbox" checked={selectedConditions.includes(cond)} onChange={() => toggleCondition(cond)} style={{ accentColor: ORANGE }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CONDITION_COLORS[cond], flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#333' }}>{CONDITION_LABELS[cond]}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Precio">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {PRICE_RANGES.map(r => {
            const active = priceRange?.min === r.min && priceRange?.max === r.max;
            return (
              <button key={r.label} onClick={() => setPriceRange(active ? null : r)}
                style={{ textAlign: 'left', padding: '7px 10px', borderRadius: '8px', border: `1.5px solid ${active ? ORANGE : '#eee'}`, backgroundColor: active ? '#FFF5F2' : '#fff', color: active ? ORANGE : '#333', fontSize: '13px', cursor: 'pointer', fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
                {r.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}