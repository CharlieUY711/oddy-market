-- ========================================
-- ODDY MARKET - Database Schema
-- ========================================
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- URL: https://app.supabase.com/project/yomgqobfmgatavnbtvdz/sql

-- ========================================
-- 1. TABLA DE PRODUCTOS
-- ========================================

CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  category TEXT,
  discount INTEGER DEFAULT 0,
  rating DECIMAL(2, 1),
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer productos
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  TO public
  USING (true);

-- Política: Solo usuarios autenticados pueden crear/editar
CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true);

-- ========================================
-- 2. TABLA DE PEDIDOS
-- ========================================

CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_zip TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven sus propios pedidos
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 3. TABLA DE ITEMS DE PEDIDO
-- ========================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Habilitar RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven items de sus propios pedidos
CREATE POLICY "Users can view items of their own orders"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ========================================
-- 4. TABLA DE FAVORITOS
-- ========================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON public.favorites(product_id);

-- Habilitar RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven sus propios favoritos
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 5. TRIGGER: Actualizar updated_at automáticamente
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a productos
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger a pedidos
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. DATOS DE EJEMPLO (Opcional)
-- ========================================

INSERT INTO public.products (name, description, price, image, category, discount, rating, stock) VALUES
  ('Smartphone Samsung Galaxy S23', 'Teléfono inteligente con pantalla AMOLED de 6.1 pulgadas, 128GB de almacenamiento', 29990, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', 'Tecnología', 15, 4.5, 10),
  ('Auriculares Bluetooth Sony WH-1000XM5', 'Auriculares inalámbricos con cancelación de ruido activa y batería de 30 horas', 12990, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 'Tecnología', 20, 4.8, 5),
  ('Zapatillas Nike Air Max 270', 'Zapatillas deportivas con tecnología Air Max para máximo confort', 8990, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 'Deportes y Fitness', 0, 4.3, 15),
  ('Cafetera Nespresso Essenza Mini', 'Cafetera de cápsulas compacta, perfecta para espacios pequeños', 5990, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop', 'Hogar y Decoración', 10, 4.6, 8),
  ('Tablet iPad Air 10.9"', 'Tablet Apple con chip M1, pantalla Liquid Retina y 64GB de almacenamiento', 34990, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', 'Tecnología', 5, 4.9, 3),
  ('Reloj Inteligente Apple Watch Series 9', 'Smartwatch con GPS, monitor de frecuencia cardíaca y resistencia al agua', 19990, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', 'Tecnología', 0, 4.7, 12),
  ('Bolso de Cuero Genuino', 'Bolso elegante de cuero genuino, perfecto para uso diario o formal', 4990, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', 'Moda y Accesorios', 25, 4.4, 7),
  ('Cámara Canon EOS R50', 'Cámara mirrorless con sensor APS-C y grabación de video 4K', 44990, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop', 'Tecnología', 0, 4.8, 4),
  ('Pizza Margherita Premium', 'Pizza artesanal con mozzarella fresca, tomate y albahaca', 890, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop', 'Alimentos y Bebidas', 30, 4.5, 20),
  ('Suplemento Vitamínico Multivitamínico', 'Complejo vitamínico con 30 vitaminas y minerales esenciales', 1990, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', 'Salud y Bienestar', 0, 4.2, 25),
  ('Lámpara de Escritorio LED', 'Lámpara LED ajustable con 3 niveles de brillo y puerto USB', 2490, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop', 'Hogar y Decoración', 15, 4.3, 18),
  ('Pelota de Fútbol Adidas', 'Pelota oficial de fútbol con diseño clásico y durabilidad superior', 1990, 'https://images.unsplash.com/photo-1614634713290-4b1ab2668329?w=400&h=400&fit=crop', 'Deportes y Fitness', 0, 4.6, 30)
ON CONFLICT DO NOTHING;

-- ========================================
-- ✅ SCHEMA COMPLETO
-- ========================================
-- Tablas creadas:
-- 1. products (con datos de ejemplo)
-- 2. orders
-- 3. order_items
-- 4. favorites
--
-- RLS habilitado en todas las tablas
-- Triggers para updated_at configurados
--
-- Próximo paso: Conectar el frontend
