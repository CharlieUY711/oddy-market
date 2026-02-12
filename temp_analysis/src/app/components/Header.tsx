import { ShoppingCart, Menu, Search, User, Heart, Shield } from "lucide-react";
import { useState } from "react";
import logoBlack from "figma:asset/1f1fabcb77ec33f2dd4f6285e8fa133c70772ce8.png";

interface HeaderProps {
  cartCount: number;
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  user?: any;
  onUserClick: () => void;
}

export function Header({ cartCount, onNavigate, onCartClick, user, onUserClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Check if user is admin - support multiple metadata structures
  const isAdmin = user?.user_metadata?.role === "admin" || 
                  user?.raw_user_meta_data?.role === "admin" ||
                  user?.email === "cvaralla@gmail.com" ||
                  user?.email === "admin@oddymarket.com";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
        <p>🎉 Envío gratis en compras superiores a $50.000</p>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div
              onClick={() => onNavigate("home")}
              className="cursor-pointer hover:opacity-80 transition-opacity flex items-center"
            >
              <img 
                src={logoBlack} 
                alt="ODDY Market" 
                className="h-12 w-auto"
                style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(89%) saturate(2476%) hue-rotate(346deg) brightness(101%) contrast(101%)' }}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => onNavigate("home")}
              className="hover:text-primary transition-colors font-medium"
            >
              Inicio
            </button>
            <button
              onClick={() => onNavigate("shop")}
              className="hover:text-primary transition-colors font-medium"
            >
              Productos
            </button>
            <button
              onClick={() => onNavigate("departments")}
              className="hover:text-primary transition-colors font-medium"
            >
              Departamentos
            </button>
            <button
              onClick={() => onNavigate("secondhand")}
              className="hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              🔄 Second Hand
            </button>
            <button
              onClick={() => onNavigate("offers")}
              className="hover:text-primary transition-colors font-medium"
            >
              Ofertas
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate("admin")}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onNavigate("favorites")}
              className="p-2 hover:bg-muted rounded-lg transition-colors hidden sm:flex"
            >
              <Heart className="w-5 h-5" />
            </button>

            <button
              onClick={onUserClick}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors group"
              title={user ? "Mi cuenta" : "Iniciar sesión"}
            >
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                    {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user.user_metadata?.name?.split(' ')[0] || 'Mi cuenta'}
                  </span>
                </div>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Iniciar sesión
                  </span>
                </>
              )}
            </button>

            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-border">
            <input
              type="search"
              placeholder="Buscar productos..."
              className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate("home");
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Inicio
            </button>
            <button
              onClick={() => {
                onNavigate("shop");
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Productos
            </button>
            <button
              onClick={() => {
                onNavigate("departments");
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Departamentos
            </button>
            <button
              onClick={() => {
                onNavigate("offers");
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Ofertas
            </button>
            <button
              onClick={() => {
                onNavigate("favorites");
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Favoritos
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate("admin");
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium flex items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Panel de Administración
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
