/* =====================================================
   ODDY Market — Storefront Layout (Navbar + Footer)
   ===================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { Toaster, toast } from 'sonner';
import {
  ShoppingCart, Search, Menu, X, ChevronDown, User, Package,
  Heart, LogOut, Settings, LayoutDashboard, Tag, Home,
  RefreshCw, Zap, Facebook, Instagram, Twitter, Youtube,
  MapPin, Phone, Mail, ChevronRight,
} from 'lucide-react';
import { CartProvider, useCart } from './cartContext';

const ORANGE = '#FF6835';

function NavbarInner() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/secondhand?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const navLinks = [
    { label: 'Inicio', to: '/' },
    { label: 'Categorías', to: '/?cat=all' },
    { label: 'Second Hand', to: '/secondhand' },
    { label: 'Ofertas', to: '/?ofertas=1' },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      {/* Top announcement bar */}
      <div style={{ backgroundColor: ORANGE, color: '#fff', textAlign: 'center', padding: '6px 16px', fontSize: '13px' }}>
        🚀 Envío gratis en compras mayores a $150 · <strong>Código: CHARLIE10</strong> para 10% OFF en tu primera compra
      </div>

      {/* Main navbar */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', height: '64px', gap: '16px' }}>
        {/* Mobile hamburger */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#333' }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>O</span>
          </div>
          <div>
            <div style={{ color: '#111', fontWeight: 700, fontSize: '17px', lineHeight: 1.1 }}>Charlie</div>
            <div style={{ color: ORANGE, fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1 }}>MARKETPLACE</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: '4px' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              style={{ padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', color: '#444', fontSize: '14px', fontWeight: 500, transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = '#FFF5F2'; (e.target as HTMLElement).style.color = ORANGE; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; (e.target as HTMLElement).style.color = '#444'; }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Search bar — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex" style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
          <input
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Buscar productos, marcas y más..."
            style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '24px', padding: '9px 44px 9px 16px', fontSize: '14px', outline: 'none', transition: 'border-color 0.15s', backgroundColor: '#FAFAFA' }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#f0f0f0'}
          />
          <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            <Search size={17} />
          </button>
        </form>

        {/* Right icons */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mobile search toggle */}
          <button
            className="md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#555' }}
          >
            <Search size={20} />
          </button>

          {/* Favorites */}
          <Link to="/account?tab=favoritos" style={{ padding: '8px', color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center' }} className="hidden sm:flex">
            <Heart size={20} />
          </Link>

          {/* Cart */}
          <Link to="/cart" style={{ position: 'relative', padding: '8px', color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: ORANGE, color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* User dropdown */}
          <div ref={userRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserOpen(!userOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px solid #eee', borderRadius: '24px', padding: '6px 12px 6px 8px', cursor: 'pointer', color: '#333', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = ORANGE}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#eee'}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FF6835', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>U</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500 }} className="hidden sm:inline">Mi cuenta</span>
              <ChevronDown size={14} color="#888" />
            </button>

            {userOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f0f0f0', overflow: 'hidden', zIndex: 200 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5', backgroundColor: '#FFFAF8' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>Usuario Demo</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>usuario@charliemarketplace.com</div>
                </div>
                {[
                  { icon: User, label: 'Mi Perfil', to: '/account' },
                  { icon: Package, label: 'Mis Pedidos', to: '/account?tab=pedidos' },
                  { icon: Tag, label: 'Mis Publicaciones', to: '/account?tab=publicaciones' },
                  { icon: Heart, label: 'Favoritos', to: '/account?tab=favoritos' },
                  { icon: RefreshCw, label: 'Publicar Artículo', to: '/secondhand/publish' },
                ].map(item => (
                  <Link key={item.to} to={item.to}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF5F2'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <item.icon size={16} color={ORANGE} />
                    {item.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid #f5f5f5' }}>
                  <Link to="/admin"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', textDecoration: 'none', color: '#333', fontSize: '14px' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF5F2'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <LayoutDashboard size={16} color="#888" />
                    Panel Admin
                  </Link>
                  <button
                    onClick={() => { setUserOpen(false); toast.success('Sesión cerrada'); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: '14px', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF5F2'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', backgroundColor: '#FAFAFA' }} className="md:hidden">
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Buscar productos..."
              autoFocus
              style={{ width: '100%', border: '2px solid #f0f0f0', borderRadius: '24px', padding: '9px 44px 9px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#f0f0f0'}
            />
            <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
              <Search size={17} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid #f0f0f0', backgroundColor: '#fff', padding: '8px 0' }} className="lg:hidden">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              style={{ display: 'block', padding: '12px 20px', textDecoration: 'none', color: '#333', fontSize: '15px', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF5F2'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/secondhand/publish"
            style={{ display: 'block', margin: '8px 16px 12px', padding: '10px 16px', textDecoration: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, textAlign: 'center', backgroundColor: ORANGE, borderRadius: '8px' }}
          >
            + Publicar artículo
          </Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ backgroundColor: '#111', color: '#ccc', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>O</span>
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '17px', lineHeight: 1.1 }}>Charlie Marketplace</div>
                <div style={{ color: ORANGE, fontSize: '11px', fontWeight: 600 }}>MARKETPLACE</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#999', marginBottom: '16px' }}>
              Tu marketplace favorito para comprar, vender y encontrar artículos nuevos y usados en toda América Latina.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <button key={i}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#222', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ORANGE; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#222'; (e.currentTarget as HTMLElement).style.color = '#888'; }}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Links: Tienda */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '16px', fontSize: '14px' }}>Tienda</h4>
            {['Novedades', 'Ofertas', 'Más vendidos', 'Categorías', 'Second Hand', 'Marcas'].map(l => (
              <div key={l} style={{ marginBottom: '8px' }}>
                <Link to="/" style={{ color: '#999', textDecoration: 'none', fontSize: '13px', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = ORANGE}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = '#999'}
                >{l}</Link>
              </div>
            ))}
          </div>

          {/* Links: Cuenta */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '16px', fontSize: '14px' }}>Mi Cuenta</h4>
            {['Mi perfil', 'Mis pedidos', 'Mis publicaciones', 'Favoritos', 'Configuración'].map(l => (
              <div key={l} style={{ marginBottom: '8px' }}>
                <Link to="/account" style={{ color: '#999', textDecoration: 'none', fontSize: '13px' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = ORANGE}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = '#999'}
                >{l}</Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '16px', fontSize: '14px' }}>Contacto</h4>
            {[
              { icon: MapPin, text: 'Montevideo, Uruguay' },
              { icon: Phone, text: '+598 99 000 000' },
              { icon: Mail, text: 'hola@charliemarketplace.com' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#999', fontSize: '13px' }}>
                <item.icon size={14} color={ORANGE} />
                {item.text}
              </div>
            ))}
            <div style={{ marginTop: '16px' }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Métodos de pago</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Visa', 'Mastercard', 'MP', 'Stripe'].map(p => (
                  <span key={p} style={{ padding: '3px 8px', backgroundColor: '#222', borderRadius: '4px', fontSize: '11px', color: '#ccc', fontWeight: 600 }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #222', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>© 2026 Charlie Marketplace Builder v1.5. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Términos', 'Privacidad', 'Cookies'].map(l => (
              <Link key={l} to="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = ORANGE}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#666'}
              >{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function StorefrontLayout() {
  return (
    <CartProvider>
      <Toaster position="top-right" richColors />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA' }}>
        <NavbarInner />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}