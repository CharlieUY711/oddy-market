/* =====================================================
   Charlie Marketplace Builder — Storefront Mock Data
   ===================================================== */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  description: string;
  specs?: Record<string, string>;
  colors?: string[];
  sizes?: string[];
  stock: number;
  isNew?: boolean;
  ageRestricted?: boolean;   // ← nuevo
  minAge?: number;           // ← nuevo
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  count: number;
  color: string;
  ageRestricted?: boolean;   // ← nuevo
  minAge?: number;           // ← nuevo
}

export interface SecondHandListing {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  condition: 'nuevo' | 'como-nuevo' | 'buen-estado' | 'aceptable';
  category: string;
  seller: string;
  location: string;
  image: string;
  createdAt: string;
  views: number;
  favorites: number;
  description: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Auriculares BT Studio Pro',
    category: 'tecnologia',
    price: 149,
    originalPrice: undefined,
    rating: 4.8,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?w=600&q=80',
    description: 'Auriculares inalámbricos con cancelación activa de ruido, 30h de batería y sonido Hi-Fi de estudio.',
    specs: { 'Conectividad': 'Bluetooth 5.3', 'Batería': '30 horas', 'Driver': '40mm', 'Peso': '250g', 'Cancelación de ruido': 'Activa (ANC)' },
    colors: ['#1a1a1a', '#f5f5f5', '#FF6835'],
    stock: 24,
    isNew: true,
  },
  {
    id: 'p2',
    name: 'Air Max Trainer Pro',
    category: 'deportes',
    price: 89,
    originalPrice: 120,
    rating: 4.5,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1625860191460-10a66c7384fb?w=600&q=80',
    badge: 'Oferta',
    description: 'Zapatillas de entrenamiento con amortiguación Air Max, upper en mesh transpirable y suela de goma duradera.',
    specs: { 'Upper': 'Mesh transpirable', 'Suela': 'Goma vulcanizada', 'Cierre': 'Cordones', 'Talla disponible': '36–46', 'Peso por par': '580g' },
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    colors: ['#ffffff', '#1a1a1a', '#FF6835', '#3B82F6'],
    stock: 48,
  },
  {
    id: 'p3',
    name: 'Campera Denim Classic',
    category: 'moda',
    price: 69,
    originalPrice: 95,
    rating: 4.3,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1762343949052-c086a93fceac?w=600&q=80',
    badge: 'Oferta',
    description: 'Campera denim 100% algodón, corte recto, bolsillos frontales y detalle de costuras en contraste.',
    specs: { 'Material': '100% Algodón', 'Lavado': 'A máquina 30°C', 'Corte': 'Regular fit', 'Bolsillos': '4 frontales' },
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#4a6fa5', '#1a1a1a', '#c2956c'],
    stock: 32,
  },
  {
    id: 'p4',
    name: 'Sillón Escandinavo Oslo',
    category: 'hogar',
    price: 499,
    rating: 4.6,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1768946052273-0a2dd7f3e365?w=600&q=80',
    description: 'Sillón de diseño escandinavo con estructura en madera de roble y tapizado en tela premium antimanchas.',
    specs: { 'Material': 'Tela + Madera de roble', 'Medidas': '85×80×90cm', 'Peso máx.': '120kg', 'Garantía': '2 años' },
    colors: ['#d4c5a9', '#7a8b8b', '#4a3728'],
    stock: 8,
    isNew: true,
  },
  {
    id: 'p5',
    name: 'Smartwatch Series X',
    category: 'tecnologia',
    price: 199,
    originalPrice: 249,
    rating: 4.7,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1767903622384-cfd81e2be7ba?w=600&q=80',
    badge: '-20%',
    description: 'Reloj inteligente con pantalla AMOLED 1.4", GPS integrado, monitor cardíaco y 14 días de autonomía.',
    specs: { 'Pantalla': 'AMOLED 1.4"', 'GPS': 'Integrado', 'Batería': '14 días', 'Resistencia': '5ATM', 'SO Compatible': 'iOS + Android' },
    colors: ['#1a1a1a', '#c0c0c0', '#FF6835'],
    stock: 19,
  },
  {
    id: 'p6',
    name: 'Zapatillas Trail Runner',
    category: 'deportes',
    price: 79,
    rating: 4.4,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1765914448163-da25d773a87d?w=600&q=80',
    description: 'Zapatillas para trail running con suela Vibram, placa de carbono y sistema de amortiguación BOOST.',
    specs: { 'Suela': 'Vibram', 'Upper': 'Ripstop waterproof', 'Drop': '8mm', 'Peso': '310g' },
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    colors: ['#2d6a4f', '#FF6835', '#1a1a1a'],
    stock: 27,
  },
  {
    id: 'p7',
    name: 'Mochila Urban Explorer',
    category: 'accesorios',
    price: 55,
    originalPrice: 75,
    rating: 4.5,
    reviews: 193,
    image: 'https://images.unsplash.com/photo-1622560257067-108402fcedc0?w=600&q=80',
    badge: 'Oferta',
    description: 'Mochila urbana 30L con compartimento para laptop 15", panel trasero aireado y sistema de hidratación.',
    specs: { 'Capacidad': '30 litros', 'Laptop': 'Hasta 15"', 'Material': 'Nylon 600D', 'Peso': '750g' },
    colors: ['#1a1a1a', '#4a6fa5', '#2d6a4f'],
    stock: 41,
  },
  {
    id: 'p8',
    name: 'GameBox Pro 500',
    category: 'tecnologia',
    price: 399,
    rating: 4.9,
    reviews: 445,
    image: 'https://images.unsplash.com/photo-1605296830714-7c02e14957ac?w=600&q=80',
    badge: 'Más vendido',
    description: 'Consola de última generación con 8K gaming, SSD NVMe 1TB, ray tracing y controlador háptico.',
    specs: { 'CPU': '8 núcleos 3.5GHz', 'GPU': '12 TFLOPS', 'RAM': '16GB GDDR6', 'Almacenamiento': '1TB SSD NVMe', 'Resolución': 'Hasta 8K' },
    stock: 5,
    isNew: true,
  },
  /* ── Productos con restricción de edad ── */
  {
    id: 'p9',
    name: 'Vino Malbec Reserva 2022',
    category: 'alcohol',
    price: 28,
    rating: 4.7,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80',
    badge: '🍷 Reserva',
    description: 'Malbec Reserva de Mendoza. Notas de ciruela, tabaco y especias. 13.5% vol. Botella 750ml.',
    specs: { 'Varietal': 'Malbec 100%', 'Cosecha': '2022', 'Graduación': '13.5%', 'Contenido': '750 ml', 'Origen': 'Mendoza, AR' },
    stock: 48,
    ageRestricted: true,
    minAge: 18,
  },
  {
    id: 'p10',
    name: 'Pack Cerveza Artesanal IPA x6',
    category: 'alcohol',
    price: 18,
    originalPrice: 24,
    rating: 4.5,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80',
    badge: 'Oferta',
    description: 'Pack de 6 cervezas IPA artesanal. Lupulada, 6.2% vol. Lata 473ml. Producción local UY.',
    specs: { 'Estilo': 'India Pale Ale', 'Graduación': '6.2%', 'Contenido': '473 ml x6', 'Origen': 'Montevideo, UY' },
    stock: 34,
    ageRestricted: true,
    minAge: 18,
  },
  {
    id: 'p11',
    name: 'Whisky Single Malt 12 años',
    category: 'alcohol',
    price: 65,
    rating: 4.9,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80',
    description: 'Single Malt escocés 12 años. Notas de vainilla, miel y roble. 40% vol. 700ml.',
    specs: { 'Tipo': 'Single Malt Scotch', 'Añejamiento': '12 años', 'Graduación': '40%', 'Contenido': '700 ml', 'Origen': 'Highlands, UK' },
    stock: 12,
    ageRestricted: true,
    minAge: 18,
    isNew: true,
  },
];

export const CATEGORIES: Category[] = [
  { id: 'tecnologia', name: 'Tecnología', emoji: '💻', count: 142, color: '#3B82F6' },
  { id: 'moda',       name: 'Moda',       emoji: '👗', count: 318, color: '#EC4899' },
  { id: 'hogar',      name: 'Hogar',      emoji: '🏠', count: 97,  color: '#10B981' },
  { id: 'deportes',   name: 'Deportes',   emoji: '⚽', count: 204, color: '#F59E0B' },
  { id: 'accesorios', name: 'Accesorios', emoji: '🎒', count: 156, color: '#8B5CF6' },
  { id: 'bebes',      name: 'Bebés',      emoji: '🍼', count: 83,  color: '#F97316' },
  { id: 'alcohol',    name: 'Alcohol & Bebidas', emoji: '🍷', count: 48, color: '#7C3AED', ageRestricted: true, minAge: 18 },
  { id: 'tabaco',     name: 'Tabaco',     emoji: '🚬', count: 22,  color: '#6B7280', ageRestricted: true, minAge: 18 },
];

export const SECOND_HAND: SecondHandListing[] = [
  {
    id: 'sh1',
    title: 'iPhone 13 Pro 256GB — Muy buen estado',
    price: 650,
    originalPrice: 999,
    condition: 'como-nuevo',
    category: 'tecnologia',
    seller: 'Juan P.',
    location: 'Montevideo, UY',
    image: 'https://images.unsplash.com/photo-1525446517618-9a9e5430288b?w=600&q=80',
    createdAt: '2026-02-18',
    views: 234,
    favorites: 18,
    description: 'Vendido con caja original, cargador y funda. Sin rayones. Batería al 91%.',
  },
  {
    id: 'sh2',
    title: 'Bicicleta Trek Marlin 7 — R26',
    price: 280,
    originalPrice: 650,
    condition: 'buen-estado',
    category: 'deportes',
    seller: 'Carlos M.',
    location: 'Buenos Aires, AR',
    image: 'https://images.unsplash.com/photo-1760141993036-4e62095fe0f8?w=600&q=80',
    createdAt: '2026-02-17',
    views: 189,
    favorites: 12,
    description: 'Bici de montaña, rueda 26, shimano 21v, frenos hidráulicos. Necesita limpieza de cadena.',
  },
  {
    id: 'sh3',
    title: 'PS5 + 3 juegos incluidos',
    price: 420,
    originalPrice: 699,
    condition: 'como-nuevo',
    category: 'tecnologia',
    seller: 'Pedro R.',
    location: 'Santiago, CL',
    image: 'https://images.unsplash.com/photo-1605296830714-7c02e14957ac?w=600&q=80',
    createdAt: '2026-02-15',
    views: 512,
    favorites: 47,
    description: 'Consola en perfecto estado, 2 controles DualSense. Juegos: Horizon, Spider-Man, FIFA 26.',
  },
  {
    id: 'sh4',
    title: 'Auriculares Studio Pro — caja original',
    price: 95,
    originalPrice: 149,
    condition: 'buen-estado',
    category: 'tecnologia',
    seller: 'Ana L.',
    location: 'Bogotá, CO',
    image: 'https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?w=600&q=80',
    createdAt: '2026-02-16',
    views: 143,
    favorites: 9,
    description: 'Uso 6 meses, funcionan perfecto. Incluye estuche, cable y adaptador de avión.',
  },
  {
    id: 'sh5',
    title: 'Air Jordan Retro XI talle 42',
    price: 95,
    condition: 'buen-estado',
    category: 'deportes',
    seller: 'Marco S.',
    location: 'Lima, PE',
    image: 'https://images.unsplash.com/photo-1625860191460-10a66c7384fb?w=600&q=80',
    createdAt: '2026-02-14',
    views: 87,
    favorites: 6,
    description: 'Originales compradas en USA. Usadas 3 veces. Vienen con caja y medias de regalo.',
  },
  {
    id: 'sh6',
    title: 'Campera cuero genuino talle M',
    price: 85,
    originalPrice: 220,
    condition: 'aceptable',
    category: 'moda',
    seller: 'Laura S.',
    location: 'Montevideo, UY',
    image: 'https://images.unsplash.com/photo-1762343949052-c086a93fceac?w=600&q=80',
    createdAt: '2026-02-19',
    views: 61,
    favorites: 4,
    description: 'Campera de cuero genuino, tiene pequeñas marcas en el codo izquierdo. Precio acorde al estado.',
  },
];

export const CONDITION_LABELS: Record<SecondHandListing['condition'], string> = {
  'nuevo': 'Nuevo',
  'como-nuevo': 'Como nuevo',
  'buen-estado': 'Buen estado',
  'aceptable': 'Aceptable',
};

export const CONDITION_COLORS: Record<SecondHandListing['condition'], string> = {
  'nuevo': '#10B981',
  'como-nuevo': '#3B82F6',
  'buen-estado': '#F59E0B',
  'aceptable': '#9CA3AF',
};