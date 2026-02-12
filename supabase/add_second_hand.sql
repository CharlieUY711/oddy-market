-- ========================================
-- SECOND HAND MARKET - Actualización del Schema
-- ========================================
-- Ejecutar en: Supabase Dashboard → SQL Editor

-- 1. Agregar columna "condition" a products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new';

-- 2. Agregar índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition);

-- 3. Agregar constraint para valores válidos
ALTER TABLE public.products
ADD CONSTRAINT check_condition CHECK (condition IN ('new', 'like_new', 'very_good', 'good', 'acceptable', 'refurbished'));

-- 4. Insertar productos de segunda mano
INSERT INTO public.products (name, description, price, image, category, discount, rating, stock, condition) VALUES
  (
    'iPhone 13 Pro - Usado (Excelente Estado)',
    'iPhone 13 Pro de 256GB, excelente estado. Incluye caja original, cargador y funda protectora. Batería al 92%.',
    24990,
    'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=400&fit=crop',
    'Tecnología',
    0,
    4.7,
    1,
    'like_new'
  ),
  (
    'MacBook Air M1 - Seminuevo',
    'MacBook Air M1 2020, 8GB RAM, 256GB SSD. Muy poco uso, como nuevo. Sin rayones ni golpes.',
    44990,
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    'Tecnología',
    0,
    4.8,
    2,
    'like_new'
  ),
  (
    'PlayStation 5 - Usado (Buen Estado)',
    'PS5 Standard Edition con lector de discos. Incluye 2 controles y 3 juegos físicos. Funcionamiento perfecto.',
    29990,
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
    'Tecnología',
    10,
    4.5,
    1,
    'very_good'
  ),
  (
    'Bicicleta Mountain Bike - Usada',
    'MTB Rodado 29, 21 cambios Shimano. Cuadro de aluminio. Mantenimiento reciente. Lista para usar.',
    8990,
    'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=400&fit=crop',
    'Deportes y Fitness',
    0,
    4.2,
    1,
    'good'
  ),
  (
    'Cámara Canon EOS Rebel T7 - Seminueva',
    'Cámara DSLR Canon Rebel T7 con lente 18-55mm. Pocos disparos realizados. Incluye bolso y tarjeta SD 64GB.',
    19990,
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop',
    'Tecnología',
    15,
    4.6,
    1,
    'like_new'
  ),
  (
    'Sofá de 3 Cuerpos - Usado (Buen Estado)',
    'Sofá de tela color gris, 3 plazas. Muy cómodo, estructura sólida. Algunas marcas de uso normal.',
    12990,
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    'Hogar y Decoración',
    20,
    4.0,
    1,
    'good'
  ),
  (
    'Apple Watch Series 7 - Usado',
    'Apple Watch Series 7 45mm. GPS + Celular. Incluye caja, cargador y 3 mallas adicionales.',
    14990,
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
    'Tecnología',
    0,
    4.4,
    2,
    'very_good'
  ),
  (
    'Mesa de Comedor Extensible - Usada',
    'Mesa de madera maciza con capacidad para 6-8 personas. Excelente estado, muy resistente.',
    15990,
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',
    'Hogar y Decoración',
    0,
    4.3,
    1,
    'very_good'
  )
ON CONFLICT DO NOTHING;

-- 5. Actualizar productos existentes como "new"
UPDATE public.products
SET condition = 'new'
WHERE condition IS NULL;

-- ✅ Schema actualizado y productos de segunda mano agregados
