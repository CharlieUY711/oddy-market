/* =====================================================
   ODDY Storefront — OddyStorefront.tsx
   Charlie Marketplace Builder v1.5
   Frontstore principal: Market + Segunda Mano
   ===================================================== */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import '../../styles/oddy.css';

// ── Images ────────────────────────────────────────────────────────────────────
const IMG_CASE    = 'https://images.unsplash.com/photo-1574682592200-948fd815c4f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_EARBUDS = 'https://images.unsplash.com/photo-1762553159827-7a5d2167b55d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_KITCHEN = 'https://images.unsplash.com/photo-1768875845344-5663fa9acf15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_PETBED  = 'https://images.unsplash.com/photo-1749703174207-257698ceb352?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_TV      = 'https://images.unsplash.com/photo-1730909352933-614f1673ac21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_SHOES   = 'https://images.unsplash.com/photo-1761942028138-794f1d151e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_IPHONE  = 'https://images.unsplash.com/photo-1635425730507-26c324aadbc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_MACBOOK = 'https://images.unsplash.com/photo-1574529395396-21637c4cf5df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_BIKE    = 'https://images.unsplash.com/photo-1571081790807-6933479d240f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_SONY    = 'https://images.unsplash.com/photo-1764557159396-419b85356035?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_WEIGHTS = 'https://images.unsplash.com/photo-1710746904729-f3ad9f682bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';
const IMG_CHAIR   = 'https://images.unsplash.com/photo-1528045535275-50e5d46dbae8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';

// Sample videos (BigBuckBunny clips — always available)
const VID_MKT = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const VID_SH  = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MktProduct {
  id: number; img: string; d: string; n: string;
  p: string; o: string | null; b: string | null; bt: string;
  desc: string; r: number; rv: number; q: string; vids?: string[]; // Array de videos (máximo 5)
  publishedDate?: string;
}
interface ShProduct {
  id: number; img: string; d: string; n: string;
  p: string; og: string; c: number;
  desc: string; r: number; rv: number; q: string; vids?: string[]; // Array de videos (máximo 5)
  publishedDate?: string;
}
interface CartItem { id: number; img: string; n: string; p: string; pNum: number; m: 'mkt' | 'sh'; }
interface HistItem { id: number; m: 'mkt' | 'sh'; img: string; n: string; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const parsePrice = (p: string) => parseInt(p.replace(/[\$\.]/g, ''), 10);
const fmtNum = (n: number) => '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const separatePrice = (price: string) => {
  if (!price) return price;
  // Si el precio contiene $, separarlo del valor con un espacio
  const dollarIndex = price.indexOf('$');
  if (dollarIndex !== -1) {
    const before = price.substring(0, dollarIndex).trim();
    const after = price.substring(dollarIndex + 1).trim();
    return <>{before ? before + ' ' : ''}$ {after}</>;
  }
  return price;
};

// ── Department Colors (Pastel) ──────────────────────────────────────────────
const DEPT_COLORS: Record<string, string> = {
  'Electro': '#DDA0DD',      // Lila pastel
  'Moda': '#FFB6C1',         // Rosa pastel
  'Hogar': '#FFDAB9',        // Melocotón
  'Almacén': '#FFF8DC',      // Amarillo pastel
  'Mascotas': '#FA8072',     // Salmón
  'Motos': '#AFEEEE',        // Turquesa
  'Limpieza': '#FFE4E1',     // Melocotón claro
  'Salud': '#B0E0E6',        // Azul claro
  'Deporte': '#D8BFD8',      // Morado pastel
  'Celulares': '#F5DEB3',    // Beige
  'Ferretería': '#F0FFF0',   // Menta
  'Librería': '#FFFDD0',     // Crema
  'Bebés': '#E0B0FF',        // Malva
  'Gaming': '#E6E6FA',       // Lavanda
  'Jardín': '#FF7F50',       // Coral
  'Autos': '#DDA0DD',        // Lila pastel (repetido si necesario)
  'Belleza': '#FFB6C1',      // Rosa pastel (repetido si necesario)
  'Delivery': '#FFDAB9',     // Melocotón (repetido si necesario)
};

// ── Data ──────────────────────────────────────────────────────────────────────
const MP: MktProduct[] = [
  { id:1,  img:IMG_CASE,    d:'Celulares', n:'Funda iPhone 15 silicona premium',  p:'$472',    o:'$590',   b:'-20%', bt:'',   desc:'Silicona líquida premium, compatible con carga inalámbrica. Protección para bordes y cámara. Disponible en 8 colores.', r:4.3, rv:89,  q:'¿Es compatible con MagSafe? Sí, totalmente.' },
  { id:2,  img:IMG_EARBUDS, d:'Electro',   n:'Auriculares TWS noise cancel',       p:'$1.890',  o:null,     b:'Nuevo',bt:'cy', desc:'Cancelación activa de ruido con 3 modos. 8hs + 22hs con estuche. Resistencia IPX4, driver 13mm, aptX.', r:4.7, rv:203, q:'¿Funciona con Android e iOS? Sí, ambos.', vids: [VID_MKT], publishedDate:'20/01/2025' },
  { id:3,  img:IMG_KITCHEN, d:'Hogar',     n:'Set organizadores cocina x6',        p:'$890',    o:null,     b:null,   bt:'',   desc:'Set 6 piezas: 3 rectangular + 2 cuadrado + 1 redondo. Tapa hermética, BPA free, apto microondas y lavavajillas.', r:4.1, rv:56,  q:'¿Son apilables? Sí, ahorra espacio.' },
  { id:4,  img:IMG_PETBED,  d:'Mascotas',  n:'Cama premium mascotas talle L',      p:'$1.290',  o:null,     b:'Top',  bt:'cy', desc:'Relleno memory foam ortopédico, funda extraíble lavable. Para mascotas hasta 25kg. Antideslizante.', r:4.8, rv:142, q:'¿La funda se lava en lavarropas? Sí, a 40°.' },
  { id:5,  img:IMG_TV,      d:'Electro',   n:'Smart TV 43" 4K Android TV',         p:'$18.500', o:'$22.000',b:'-16%', bt:'',   desc:'Panel VA 4K UHD, Android TV 11, Chromecast built-in, HDMI 2.1 ×3, USB ×2, WiFi 5GHz, 60Hz, HDR10.', r:4.5, rv:317, q:'¿Tiene Netflix y YouTube? Sí, preinstalados.' },
  { id:6,  img:IMG_SHOES,   d:'Moda',      n:'Zapatillas running urbanas',          p:'$2.890',  o:null,     b:'Nuevo',bt:'cy', desc:'Upper mesh transpirable, suela EVA amortiguada doble densidad, refuerzo talón. Talles 36-45. Unisex.', r:4.4, rv:78,  q:'¿Tallaje normal? Sí, talla normal.' },
  { id:7,  img:IMG_KITCHEN, d:'Hogar',     n:'Termo acero 1L doble pared',         p:'$650',    o:'$780',   b:'-17%', bt:'',   desc:'Acero inox 18/8 grado alimenticio. Doble pared al vacío. Mantiene frío 24hs, caliente 12hs. Boca 4.5cm.', r:4.6, rv:231, q:'¿Entra una bolsita de té? Sí, perfectamente.' },
  { id:8,  img:IMG_PETBED,  d:'Mascotas',  n:'Comedero automático 3L',             p:'$1.890',  o:null,     b:'Nuevo',bt:'cy', desc:'Temporizador con 6 porciones programables, pantalla LCD, altavoz para grabar voz. Capacidad 3L.', r:4.6, rv:94,  q:'¿Funciona sin luz? Tiene batería de respaldo.' },
];

const SH: ShProduct[] = [
  { id:10, img:IMG_IPHONE,  d:'Celulares', n:'iPhone 13 128GB · Muy bueno',            p:'$11.500', og:'Nuevo $18.000', c:4, desc:'Batería 91% (verificado). Sin rayones en pantalla ni cuerpo. Con caja original, cargador y funda.', r:4.8, rv:12, q:'¿Tiene Face ID funcionando? Sí, perfecto.', vids: [VID_SH], publishedDate:'16/01/2025' },
  { id:11, img:IMG_MACBOOK, d:'Electro',   n:'MacBook Air M1 8GB · Excelente',          p:'$28.000', og:'Nuevo $42.000', c:5, desc:'Sin uso visible. Batería 45 ciclos. Caja original, cargador MagSafe. macOS Sonoma actualizado.', r:5.0, rv:8,  q:'¿Tiene rayones? Sin rayones, excelente estado.', publishedDate:'24/01/2025' },
  { id:12, img:IMG_BIKE,    d:'Deporte',   n:'Bicicleta mtb Rod 29 · Buen estado',      p:'$8.500',  og:'Nuevo $14.000', c:3, desc:'Frenos hidráulicos Shimano, 21 velocidades. Neumáticos Kenda nuevos. Cuadro aluminio.', r:4.2, rv:5,  q:'¿Incluye candado? No, se vende sola.', publishedDate:'14/01/2025' },
  { id:13, img:IMG_SONY,    d:'Electro',   n:'Sony WH-1000XM4 · Muy bueno',             p:'$4.200',  og:'Nuevo $7.500',  c:4, desc:'Estuche y cable originales. ANC funcionando perfectamente. Batería 95% de capacidad.', r:4.9, rv:15, q:'¿Conecta a dos dispositivos? Sí, multipoint.', publishedDate:'25/01/2025' },
  { id:14, img:IMG_WEIGHTS, d:'Deporte',   n:'Pesas ajustables 20kg set',               p:'$3.800',  og:'Nuevo $6.200',  c:3, desc:'Set completo: barra + 10 discos goma (1.25–5kg). Marcas de uso normales. Funcional al 100%.', r:4.3, rv:7,  q:'¿Pesan exacto? Sí, verificadas en balanza.', publishedDate:'13/01/2025' },
  { id:15, img:IMG_CHAIR,   d:'Hogar',     n:'Sillón reclinable cuero eco · Muy bueno', p:'$6.900',  og:'Nuevo $12.000', c:4, desc:'Motor eléctrico silencioso, 3 posiciones. Cuero eco sin grietas. Un año de uso. Retiro mdeo.', r:4.7, rv:9,  q:'¿Tiene garantía? Se puede transferir al comprador.', publishedDate:'26/01/2025' },
  { id:16, img:IMG_IPHONE,  d:'Celulares', n:'Samsung S22 128GB · Muy bueno',           p:'$9.800',  og:'Nuevo $16.000', c:4, desc:'Pantalla sin rayones. Batería 88% (medida con AccuBattery). Con cargador original.', r:4.6, rv:11, q:'¿Tiene microSD? No tiene expansión de almacenamiento.', publishedDate:'12/01/2025' },
  { id:17, img:IMG_MACBOOK, d:'Electro',   n:'iPad Air 5ta gen · Excelente',            p:'$19.500', og:'Nuevo $29.000', c:5, desc:'Sin uso visible. Apple Pencil 2da gen + Smart Folio incluidos. iCloud borrado, listo para usar.', r:4.9, rv:6,  q:'¿Tiene cellular? No, es Wi-Fi únicamente.', publishedDate:'27/01/2025' },
];

const COND = ['','Regular','Buen estado','Buen estado','Muy bueno','Excelente'];
const DEPTS = [
  '⚡ Electro','👗 Moda','🏠 Hogar','🛒 Almacén','🐾 Mascotas','🏍️ Motos',
  '🧼 Limpieza','💊 Salud','⚽ Deporte','📱 Celulares','🔧 Ferretería','📚 Librería',
  '🍼 Bebés','🎮 Gaming','🌿 Jardín','🚗 Autos','💄 Belleza','🍕 Delivery',
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconHome   = () => <svg className="oddy-nico" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
const IconGrid   = () => <svg className="oddy-nico" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconShield = () => <svg className="oddy-nico" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconSearch = () => <svg className="oddy-nico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconUser   = () => <svg className="oddy-nico" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconBag    = () => <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconSrchSm = () => <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconCart   = () => <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IconBell   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconPlay   = () => (
  <svg viewBox="0 0 12 12" width="10" height="10" fill="#222" stroke="none">
    <path d="M2.5 1.5 L10 6 L2.5 10.5 Z" />
  </svg>
);
// Iconos para controles de video - aceptan color como prop
const IconPlayTriangle = ({ filled = false, color = "#fff" }: { filled?: boolean; color?: string }) => (
  <svg viewBox="0 0 12 12" width="12" height="12" fill={filled ? color : "none"} stroke={color} strokeWidth={filled ? "0" : "1.5"} strokeLinejoin="round">
    <path d="M2.5 1.5 L10 6 L2.5 10.5 Z" />
  </svg>
);
const IconVolume = ({ color = "#fff" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const IconRewind = ({ color = "#fff" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 19 2 12 11 5 11 19"/>
    <polygon points="22 19 13 12 22 5 22 19"/>
  </svg>
);
const IconPause = ({ color = "#fff" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill={color} stroke="none">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const IconForward = ({ color = "#fff" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 19 22 12 13 5 13 19"/>
    <polygon points="2 19 11 12 2 5 2 19"/>
  </svg>
);
const IconBack = ({ color = "#fff" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

// ── Sub-components ────────────────────────────────────────────────────────────
function Dots({ count }: { count: number }) {
  // Los puntos mantienen su color original (verde para Second Hand según CSS)
  // No cambian según la luminosidad del fondo
  return (
    <div className="oddy-crow">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`oddy-cd${i <= count ? ' on' : ''}`} />
      ))}
    </div>
  );
}

function Stars({ r, rv, label }: { r: number; rv: number; label: string }) {
  const filled = Math.round(r);
  return (
    <div className="oddy-stars">
      <span className="oddy-stars-ico">{'★'.repeat(filled)}{'☆'.repeat(5 - filled)}</span>
      <span className="oddy-stars-txt">{r.toFixed(1)} · {rv} {label}</span>
    </div>
  );
}

// ── Market Flip Card ──────────────────────────────────────────────────────────
function FlipCard({ p, onAdd, onFlipped }: {
  p: MktProduct; onAdd: () => void; onFlipped: () => void;
}) {
  const [flipped, setFlipped]   = useState(false);
  const [playing, setPlaying]   = useState(false);
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(null);
  const [label,   setLabel]     = useState('Agregar al Carrito');
  const [btnStyle, setBtnStyle] = useState<React.CSSProperties>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [iconColor, setIconColor] = useState('#fff'); // Color de los iconos basado en luminosidad
  const imgRef = useRef<HTMLImageElement>(null);
  const [showBackArrow, setShowBackArrow] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    if (next) onFlipped();
  };
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd();
    setLabel('✓ Listo'); setBtnStyle({ background: '#FF6835' });
    setTimeout(() => { setLabel('Agregar al Carrito'); setBtnStyle({}); }, 1100);
  };

  // Crear array de imágenes del artículo (la primera es la principal)
  const articleImages: (string | null)[] = [p.img, null, null, null, null];
  const selectedImage = articleImages[selectedImageIndex] || p.img;
  
  // Array de videos (máximo 5)
  const videos = p.vids || [];
  const videoArray: (string | null)[] = [...videos.slice(0, 5)];
  while (videoArray.length < 5) videoArray.push(null);
  
  const handleVideoClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoArray[index]) {
      setPlayingVideoIndex(index);
      setPlaying(true);
      setIsPaused(false);
      setShowBackArrow(false);
      // Mostrar flecha después de 2 segundos
      setTimeout(() => {
        setShowBackArrow(true);
      }, 2000);
    }
  };
  
  const handleCloseVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(false);
    setPlayingVideoIndex(null);
    setShowBackArrow(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };
  
  const handleVideoCenterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clickX = e.clientX;
    const clickY = e.clientY;
    
    // Calcular distancia desde el centro (área central del 30% del video)
    const centerArea = 0.3;
    const distX = Math.abs(clickX - centerX) / rect.width;
    const distY = Math.abs(clickY - centerY) / rect.height;
    
    // Si el clic está en el área central, cerrar el video
    if (distX < centerArea && distY < centerArea) {
      handleCloseVideo(e);
    } else {
      // Si no está en el centro, toggle play/pause
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };
  
  const handleVideoControl = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    switch (action) {
      case 'pause':
        videoRef.current.pause();
        setIsPaused(true);
        break;
      case 'play':
        videoRef.current.play();
        setIsPaused(false);
        break;
      case 'rewind':
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        break;
      case 'forward':
        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
        break;
      case 'speed1.5':
        videoRef.current.playbackRate = 1.5;
        setPlaybackRate(1.5);
        break;
      case 'speed2':
        videoRef.current.playbackRate = 2;
        setPlaybackRate(2);
        break;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const vol = parseFloat(e.target.value);
      videoRef.current.volume = vol;
      setVolume(vol);
      if (vol > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleVolumeIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isMuted) {
        // Desmutear
        videoRef.current.muted = false;
        setIsMuted(false);
      } else {
        // Mutear
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };
  
  // Detectar luminosidad de la imagen para ajustar color de iconos blancos
  useEffect(() => {
    const detectImageBrightness = () => {
      if (!imgRef.current) return;
      const img = imgRef.current;
      
      // Verificar que la imagen tenga dimensiones válidas
      if (!img.naturalWidth && !img.width) return;
      if (!img.naturalHeight && !img.height) return;
      
      // Intentar con crossOrigin primero
      let triedCrossOrigin = false;
      const tryDetection = (useCrossOrigin = false) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return;
          
          const imgWidth = img.naturalWidth || img.width;
          const imgHeight = img.naturalHeight || img.height;
          canvas.width = Math.min(imgWidth, 200);
          canvas.height = Math.min(imgHeight, 200);
          
          // Si necesitamos crossOrigin, crear una nueva imagen
          if (useCrossOrigin && !triedCrossOrigin) {
            const testImg = new Image();
            testImg.crossOrigin = 'anonymous';
            testImg.onload = () => {
              try {
                ctx.drawImage(testImg, 0, 0, canvas.width, canvas.height);
                analyzeCanvas(ctx, canvas.width, canvas.height);
              } catch (e) {
                // Fallback: usar heurística basada en la URL o análisis visual
                useHeuristicFallback();
              }
            };
            testImg.onerror = () => {
              triedCrossOrigin = true;
              useHeuristicFallback();
            };
            testImg.src = p.img;
            return;
          }
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          analyzeCanvas(ctx, canvas.width, canvas.height);
        } catch (e) {
          // Si falla, intentar con crossOrigin si no lo hemos intentado
          if (!triedCrossOrigin) {
            triedCrossOrigin = true;
            tryDetection(true);
          } else {
            useHeuristicFallback();
          }
        }
      };
      
      const analyzeCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const sampleSize = 20;
        const corners = [
          { x: 0, y: 0 },
          { x: width - sampleSize, y: 0 },
          { x: 0, y: height - sampleSize },
          { x: width - sampleSize, y: height - sampleSize }
        ];
        
        let totalBrightness = 0;
        let sampleCount = 0;
        
        corners.forEach(corner => {
          try {
            const imageData = ctx.getImageData(
              Math.max(0, corner.x), 
              Math.max(0, corner.y), 
              sampleSize, 
              sampleSize
            );
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];
              
              if (a > 128) {
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                totalBrightness += brightness;
                sampleCount++;
              }
            }
          } catch (e) {
            // Continuar con siguiente esquina
          }
        });
        
        if (sampleCount > 0) {
          const avgBrightness = totalBrightness / sampleCount;
          // Umbral más bajo (0.45) para ser más sensible a fondos claros
          setIconColor(avgBrightness > 0.45 ? '#333' : '#fff');
        } else {
          useHeuristicFallback();
        }
      };
      
      const useHeuristicFallback = () => {
        // Heurística: analizar la URL de la imagen para detectar imágenes claras comunes
        const url = p.img.toLowerCase();
        const lightKeywords = ['white', 'light', 'bright', 'clear', 'iphone', 'phone', 'device', 'photo-1635425730507'];
        const hasLightKeyword = lightKeywords.some(keyword => url.includes(keyword));
        
        // Para Second Hand, ser más agresivo con el gris oscuro
        // Especialmente para productos como iPhone que típicamente tienen fondos blancos
        if (hasLightKeyword || p.d === 'Celulares') {
          setIconColor('#333');
        } else {
          // Por defecto, usar gris oscuro para mejor contraste en Second Hand
          setIconColor('#333');
        }
      };
      
      tryDetection();
    };
    
    // Intentar múltiples veces para asegurar que funcione
    const attemptDetection = () => {
      if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
        detectImageBrightness();
      }
    };
    
    // Intentar inmediatamente
    attemptDetection();
    
    // Intentar después de un delay
    const timeout1 = setTimeout(attemptDetection, 100);
    const timeout2 = setTimeout(attemptDetection, 500);
    
    // También escuchar el evento load
    const handleLoad = () => {
      setTimeout(attemptDetection, 100);
    };
    
    const img = imgRef.current;
    if (img) {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', () => {
        // Si hay error cargando, usar fallback
        setIconColor('#fff');
      });
      
      return () => {
        img.removeEventListener('load', handleLoad);
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [p.img]);

  return (
    <div id={`fc${p.id}`} className={`oddy-fc${flipped ? ' flipped' : ''}`} onClick={handleFlip}>
      <div className="oddy-fi">

        {/* ── FRONT FACE ── */}
        <div className="oddy-ff">
          <div className="oddy-cimg" style={{ borderBottomColor: DEPT_COLORS[p.d] || '#C8C4BE' }}>
            {playing && playingVideoIndex !== null && videoArray[playingVideoIndex] ? (
              <>
              <video
                  ref={videoRef}
                className="oddy-vid-frame"
                  src={videoArray[playingVideoIndex] || ''}
                  autoPlay={!isPaused}
                  muted={isMuted}
                  playsInline
                  loop={false}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '102%',
                    height: '102%',
                    objectFit: 'cover',
                    margin: 0,
                    padding: 0,
                    border: 'none',
                    outline: 'none',
                    minWidth: '100%',
                    minHeight: '100%'
                  }}
                  onClick={handleVideoCenterClick}
                />
                {/* Flecha de volver - Esquina superior derecha */}
                {showBackArrow && (
                  <button
                    onClick={handleCloseVideo}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      zIndex: 6,
                      background: iconColor === '#333' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <IconBack color={iconColor} />
                  </button>
                )}
                {/* Controles de video - Esquina inferior izquierda */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  zIndex: 5,
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                  backgroundColor: iconColor === '#333' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  backdropFilter: 'blur(4px)'
                }}>
                  <button onClick={(e) => handleVideoControl('rewind', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                    <IconRewind color={iconColor} />
                  </button>
                  <button onClick={(e) => handleVideoControl(isPaused ? 'play' : 'pause', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                    {isPaused ? <IconPlayTriangle filled color={iconColor} /> : <IconPause color={iconColor} />}
                  </button>
                  <button onClick={(e) => handleVideoControl('forward', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                    <IconForward color={iconColor} />
                  </button>
                  <button onClick={(e) => handleVideoControl('speed1.5', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: iconColor, fontSize: '11px', fontWeight: 600 }}>1.5x</button>
                  <button onClick={(e) => handleVideoControl('speed2', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: iconColor, fontSize: '11px', fontWeight: 600 }}>2x</button>
                </div>
                {/* Controles de volumen - Esquina inferior derecha */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  zIndex: 5,
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <button 
                    onClick={handleVolumeIconClick}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconVolume color={iconColor} />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      width: '60px', 
                      height: '3px', 
                      cursor: 'pointer',
                      accentColor: iconColor === '#333' ? '#333' : '#fff',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      background: iconColor === '#333' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                      outline: 'none'
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <img ref={imgRef} src={p.img} alt={p.n} />
                {/* Indicadores de video - Esquina superior derecha */}
                {videoArray.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 4,
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                  }}>
                    {videoArray.map((vid, idx) => (
                  <button
                        key={idx}
                        onClick={(e) => handleVideoClick(idx, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: vid ? 'pointer' : 'default',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          opacity: vid ? 1 : 0.5
                        }}
                      >
                        <IconPlayTriangle filled={!!vid} color={iconColor} />
                  </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {!playing && (
              <div style={{ 
                position: 'absolute', 
                top: '12px', 
                left: '8px', 
                zIndex: 2 
              }}>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} style={{ color: i <= Math.round(p.r) ? '#FFD700' : '#C8C4BE', fontSize: '12px' }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="oddy-cbody">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', paddingTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                <div className="oddy-cdept" style={{ color: '#FF6835' }}>{p.d}</div>
                {p.o && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 400, color: 'var(--muted)', textDecoration: 'line-through' }}>{separatePrice(p.o)}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
            <div className="oddy-cname">{p.n}</div>
                <div className="oddy-cprice" style={{ flexShrink: 0, textAlign: 'right' }}>{separatePrice(p.p)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div className="oddy-fb">
          <img className="oddy-ghost-img" src={selectedImage} alt="" aria-hidden="true" />
          <div className="oddy-fb-content">
            {/* Miniaturas */}
            <div className="oddy-panel-miniatures" style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '12px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {articleImages.map((img, idx) => (
                <div 
                  key={`mini-${p.id}-${idx}`} 
                  onClick={img ? (e) => { 
                    e.stopPropagation(); 
                    setSelectedImageIndex(idx); 
                  } : undefined}
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: img && selectedImageIndex === idx 
                      ? '2px solid #FF6835' 
                      : '1.5px solid rgba(255,255,255,0.3)',
                    flexShrink: 0,
                    cursor: img ? 'pointer' : 'default',
                    transition: 'transform 0.2s, border-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: img ? (selectedImageIndex === idx ? 1 : 0.8) : 0.3,
                    backgroundColor: img ? 'transparent' : 'rgba(255,255,255,0.1)',
                  }}
                  onMouseEnter={img ? (e) => {
                    if (selectedImageIndex !== idx) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.opacity = '1';
                    }
                  } : undefined}
                  onMouseLeave={img ? (e) => {
                    if (selectedImageIndex !== idx) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.opacity = '0.8';
                    }
                  } : undefined}
                >
                  {img ? (
                    <img 
                      src={img} 
                      alt={`${p.n} - Foto ${idx + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : null}
            </div>
              ))}
            </div>
            {/* Barra de color del departamento */}
            <div style={{ 
              width: 'calc(100% + 16px)', 
              height: '10px', 
              backgroundColor: DEPT_COLORS[p.d] || '#C8C4BE',
              marginLeft: '-8px',
              marginRight: '-8px',
              marginBottom: '12px',
            }}></div>
            {/* Información igual a la primera tarjeta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                <div className="oddy-cdept" style={{ color: '#FF6835' }}>{p.d}</div>
                {p.o && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 400, color: 'var(--muted)', textDecoration: 'line-through' }}>{separatePrice(p.o)}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                <div className="oddy-cname">{p.n}</div>
                <div className="oddy-cprice" style={{ flexShrink: 0, textAlign: 'right' }}>{separatePrice(p.p)}</div>
              </div>
            </div>
            <div className="oddy-panel-desc">{p.desc}</div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '5px', width: '100%' }}>
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowRatings(true)}
                onMouseLeave={() => setShowRatings(false)}
              >
                <button className="oddy-panel-btn-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {(() => {
                    const filled = Math.round(p.r);
                    const IconPerson = () => (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    );
                    return (
                      <>
                        <span style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} style={{ color: i <= filled ? '#FF6835' : '#C8C4BE', display: 'flex', alignItems: 'center' }}>
                              <IconPerson />
                            </span>
                          ))}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 700 }}>{p.r.toFixed(1)}</span>
                      </>
                    );
                  })()}
                </button>
                {/* Tooltip con últimas 3 valoraciones */}
                {showRatings && (
                  <div className="oddy-ratings-tooltip">
                    <div className="oddy-rating-item">
                      <span className="oddy-rating-date">20/01/2025</span>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'center', marginTop: '2px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} style={{ color: i <= 5 ? '#FF6835' : '#C8C4BE', display: 'flex', alignItems: 'center' }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="oddy-rating-item">
                      <span className="oddy-rating-date">18/01/2025</span>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'center', marginTop: '2px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} style={{ color: i <= 4 ? '#FF6835' : '#C8C4BE', display: 'flex', alignItems: 'center' }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="oddy-rating-item">
                      <span className="oddy-rating-date">15/01/2025</span>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'center', marginTop: '2px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} style={{ color: i <= 5 ? '#FF6835' : '#C8C4BE', display: 'flex', alignItems: 'center' }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button className="oddy-panel-btn-white" style={{ flexDirection: 'column', gap: '2px', padding: '5px 4px' }}>
                <span style={{ fontSize: '9px', fontWeight: 600, lineHeight: '1.2' }}>{p.rv} visitas</span>
                <span style={{ fontSize: '8px', fontWeight: 400, color: 'var(--muted)', lineHeight: '1.2' }}>{p.publishedDate || 'N/A'}</span>
              </button>
              <button className="oddy-fb-add" style={{ ...btnStyle, background: btnStyle.background || '#FF6835', flex: 2 }} onClick={handleAdd}>
              <IconCart />{label}
            </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── SH Slide Card ─────────────────────────────────────────────────────────────
function SlideCard({ p, isOpen, dir, onToggle, onAdd }: {
  p: ShProduct; isOpen: boolean; dir: 'right' | 'left';
  onToggle: () => void; onAdd: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(null);
  const [label,   setLabel]   = useState('Agregar al Carrito');
  const [style,   setStyle]   = useState<React.CSSProperties>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [iconColor, setIconColor] = useState('#fff'); // Color de los iconos basado en luminosidad
  const imgRef = useRef<HTMLImageElement>(null);
  const [showBackArrow, setShowBackArrow] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showRatings, setShowRatings] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd();
    setLabel('✓ Listo'); setStyle({ background: '#6BB87A' });
    setTimeout(() => { setLabel('Agregar al Carrito'); setStyle({}); }, 1100);
  };

  // Crear array de imágenes del artículo (la primera es la principal)
  // Por ahora usamos solo la imagen principal, las demás serán null/vacías
  // Esto se puede expandir para tener múltiples imágenes reales del producto
  const articleImages: (string | null)[] = [p.img, null, null, null, null];
  const selectedImage = articleImages[selectedImageIndex] || p.img;
  
  // Array de videos (máximo 5)
  const videos = p.vids || [];
  const videoArray: (string | null)[] = [...videos.slice(0, 5)];
  while (videoArray.length < 5) videoArray.push(null);
  
  const handleVideoClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoArray[index]) {
      setPlayingVideoIndex(index);
      setPlaying(true);
      setIsPaused(false);
      setShowBackArrow(false);
      // Mostrar flecha después de 2 segundos
      setTimeout(() => {
        setShowBackArrow(true);
      }, 2000);
    }
  };
  
  const handleCloseVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(false);
    setPlayingVideoIndex(null);
    setShowBackArrow(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };
  
  const handleVideoCenterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clickX = e.clientX;
    const clickY = e.clientY;
    
    // Calcular distancia desde el centro (área central del 30% del video)
    const centerArea = 0.3;
    const distX = Math.abs(clickX - centerX) / rect.width;
    const distY = Math.abs(clickY - centerY) / rect.height;
    
    // Si el clic está en el área central, cerrar el video
    if (distX < centerArea && distY < centerArea) {
      handleCloseVideo(e);
    } else {
      // Si no está en el centro, toggle play/pause
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };
  
  const handleVideoControl = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    switch (action) {
      case 'pause':
        videoRef.current.pause();
        setIsPaused(true);
        break;
      case 'play':
        videoRef.current.play();
        setIsPaused(false);
        break;
      case 'rewind':
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        break;
      case 'forward':
        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
        break;
      case 'speed1.5':
        videoRef.current.playbackRate = 1.5;
        setPlaybackRate(1.5);
        break;
      case 'speed2':
        videoRef.current.playbackRate = 2;
        setPlaybackRate(2);
        break;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const vol = parseFloat(e.target.value);
      videoRef.current.volume = vol;
      setVolume(vol);
      if (vol > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleVolumeIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isMuted) {
        // Desmutear
        videoRef.current.muted = false;
        setIsMuted(false);
      } else {
        // Mutear
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };
  
  // Detectar luminosidad de la imagen para ajustar color de iconos blancos
  useEffect(() => {
    const useHeuristicFallback = () => {
      // Heurística: analizar la URL de la imagen para detectar imágenes claras comunes
      const url = p.img.toLowerCase();
      const lightKeywords = ['white', 'light', 'bright', 'clear', 'iphone', 'phone', 'device', 'photo-1635425730507'];
      const hasLightKeyword = lightKeywords.some(keyword => url.includes(keyword));
      
      // Para Second Hand, ser más agresivo con el gris oscuro ya que muchas imágenes tienen fondos claros
      // Especialmente para productos como iPhone que típicamente tienen fondos blancos
      if (hasLightKeyword || p.d === 'Celulares') {
        setIconColor('#333');
      } else {
        // Por defecto, asumir que puede ser claro y usar gris oscuro para mejor contraste
        setIconColor('#333');
      }
    };
    
    const detectImageBrightness = () => {
      if (!imgRef.current) return;
      const img = imgRef.current;
      
      // Verificar que la imagen tenga dimensiones válidas
      if (!img.naturalWidth && !img.width) return;
      if (!img.naturalHeight && !img.height) return;
      
      // Intentar con crossOrigin primero
      let triedCrossOrigin = false;
      const tryDetection = (useCrossOrigin = false) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return;
          
          const imgWidth = img.naturalWidth || img.width;
          const imgHeight = img.naturalHeight || img.height;
          canvas.width = Math.min(imgWidth, 200);
          canvas.height = Math.min(imgHeight, 200);
          
          // Si necesitamos crossOrigin, crear una nueva imagen
          if (useCrossOrigin && !triedCrossOrigin) {
            const testImg = new Image();
            testImg.crossOrigin = 'anonymous';
            testImg.onload = () => {
              try {
                ctx.drawImage(testImg, 0, 0, canvas.width, canvas.height);
                analyzeCanvas(ctx, canvas.width, canvas.height);
              } catch (e) {
                useHeuristicFallback();
              }
            };
            testImg.onerror = () => {
              triedCrossOrigin = true;
              useHeuristicFallback();
            };
            testImg.src = p.img;
            return;
          }
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          analyzeCanvas(ctx, canvas.width, canvas.height);
        } catch (e) {
          // Si falla, intentar con crossOrigin si no lo hemos intentado
          if (!triedCrossOrigin) {
            triedCrossOrigin = true;
            tryDetection(true);
          } else {
            useHeuristicFallback();
          }
        }
      };
      
      const analyzeCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const sampleSize = 20;
        const corners = [
          { x: 0, y: 0 },
          { x: width - sampleSize, y: 0 },
          { x: 0, y: height - sampleSize },
          { x: width - sampleSize, y: height - sampleSize }
        ];
        
        let totalBrightness = 0;
        let sampleCount = 0;
        
        corners.forEach(corner => {
          try {
            const imageData = ctx.getImageData(
              Math.max(0, corner.x), 
              Math.max(0, corner.y), 
              sampleSize, 
              sampleSize
            );
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];
              
              if (a > 128) {
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                totalBrightness += brightness;
                sampleCount++;
              }
            }
          } catch (e) {
            // Continuar con siguiente esquina
          }
        });
        
        if (sampleCount > 0) {
          const avgBrightness = totalBrightness / sampleCount;
          // Umbral más bajo (0.45) para ser más sensible a fondos claros
          setIconColor(avgBrightness > 0.45 ? '#333' : '#fff');
        } else {
          useHeuristicFallback();
        }
      };
      
      tryDetection();
    };
    
    // Para productos de celulares en Second Hand, usar gris oscuro por defecto
    if (p.d === 'Celulares') {
      setIconColor('#333');
    }
    
    // Intentar múltiples veces para asegurar que funcione
    const attemptDetection = () => {
      if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
        detectImageBrightness();
      } else {
        // Si la imagen no está lista, usar fallback después de un tiempo
        setTimeout(() => {
          if (!imgRef.current?.complete || imgRef.current.naturalWidth === 0) {
            useHeuristicFallback();
          }
        }, 1000);
      }
    };
    
    // Intentar inmediatamente
    attemptDetection();
    
    // Intentar después de un delay
    const timeout1 = setTimeout(attemptDetection, 100);
    const timeout2 = setTimeout(attemptDetection, 500);
    const timeout3 = setTimeout(() => {
      // Si después de 1 segundo no se ha detectado, usar fallback
      useHeuristicFallback();
    }, 1000);
    
    // También escuchar el evento load
    const handleLoad = () => {
      setTimeout(attemptDetection, 100);
    };
    
    const img = imgRef.current;
    if (img) {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', () => {
        useHeuristicFallback();
      });
      
      return () => {
        img.removeEventListener('load', handleLoad);
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
      };
    } else {
      // Si no hay imagen ref aún, usar fallback
      useHeuristicFallback();
    }
  }, [p.img, p.d]);

  return (
    <div className="oddy-card-slot">
      {/* Static card */}
      <div
        id={`ec${p.id}`}
        className={`oddy-ec${isOpen ? ' sh-open' : ''}`}
        onClick={onToggle}
      >
        <div className="oddy-eimg" style={{ borderBottomColor: DEPT_COLORS[p.d] || '#C8C4BE' }}>
          {playing && playingVideoIndex !== null && videoArray[playingVideoIndex] ? (
            <>
            <video
                ref={videoRef}
              className="oddy-vid-frame"
                src={videoArray[playingVideoIndex] || ''}
                autoPlay={!isPaused}
                muted={isMuted}
                playsInline
                loop={false}
                onClick={handleVideoCenterClick}
              />
              {/* Flecha de volver - Esquina superior derecha */}
              {showBackArrow && (
                <button
                  onClick={handleCloseVideo}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 6,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconBack color={iconColor} />
                </button>
              )}
              {/* Controles de video - Esquina inferior izquierda */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                zIndex: 5,
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}>
                <button onClick={(e) => handleVideoControl('rewind', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                  <IconRewind color={iconColor} />
                </button>
                <button onClick={(e) => handleVideoControl(isPaused ? 'play' : 'pause', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                  {isPaused ? <IconPlayTriangle filled color={iconColor} /> : <IconPause color={iconColor} />}
                </button>
                <button onClick={(e) => handleVideoControl('forward', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                  <IconForward color={iconColor} />
                </button>
                <button onClick={(e) => handleVideoControl('speed1.5', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: iconColor, fontSize: '11px', fontWeight: 600 }}>1.5x</button>
                <button onClick={(e) => handleVideoControl('speed2', e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: iconColor, fontSize: '11px', fontWeight: 600 }}>2x</button>
              </div>
              {/* Controles de volumen - Esquina inferior derecha */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                zIndex: 5,
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                backgroundColor: iconColor === '#333' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)',
                padding: '4px 6px',
                borderRadius: '4px'
              }}>
                <button 
                  onClick={handleVolumeIconClick}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                >
                  <IconVolume color={iconColor} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '60px', height: '3px', cursor: 'pointer' }}
                />
              </div>
            </>
          ) : (
            <>
                <img ref={imgRef} src={p.img} alt={p.n} />
              {/* Indicadores de video - Esquina superior derecha */}
              {videoArray.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  zIndex: 4,
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  {videoArray.map((vid, idx) => (
                <button
                      key={idx}
                      onClick={(e) => handleVideoClick(idx, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: vid ? 'pointer' : 'default',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: vid ? 1 : 0.5
                      }}
                    >
                      <IconPlayTriangle filled={!!vid} color={iconColor} />
                </button>
                  ))}
                </div>
              )}
            </>
          )}
          {!playing && (
            <div style={{ 
              position: 'absolute', 
              top: '12px', 
              left: '8px', 
              zIndex: 2 
            }}>
              <Dots count={p.c} />
            </div>
          )}
        </div>
        <div className="oddy-ebody">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', paddingTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
          <div className="oddy-cdept">{p.d}</div>
              {p.og && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 400, color: 'var(--muted)', textDecoration: 'line-through' }}>{separatePrice(p.og)}</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
          <div className="oddy-cname">{p.n}</div>
              <div className="oddy-cprice" style={{ flexShrink: 0, textAlign: 'right' }}>{separatePrice(p.p)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding panel */}
      <div className={`oddy-panel-wrap dir-${dir}${isOpen ? ' open' : ''}`}>
        <div className="oddy-panel-inner">
          <img className="oddy-ghost-img" src={selectedImage} alt="" aria-hidden="true" />
          <div className="oddy-panel-body">
            {/* Miniaturas */}
            <div className="oddy-panel-miniatures" style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '12px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {articleImages.map((img, idx) => (
                <div 
                  key={`mini-${p.id}-${idx}`} 
                  onClick={img ? (e) => { 
                    e.stopPropagation(); 
                    setSelectedImageIndex(idx); 
                  } : undefined}
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: img && selectedImageIndex === idx 
                      ? '2px solid #6BB87A' 
                      : '1.5px solid rgba(255,255,255,0.3)',
                    flexShrink: 0,
                    cursor: img ? 'pointer' : 'default',
                    transition: 'transform 0.2s, border-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: img ? (selectedImageIndex === idx ? 1 : 0.8) : 0.3,
                    backgroundColor: img ? 'transparent' : 'rgba(255,255,255,0.1)',
                  }}
                  onMouseEnter={img ? (e) => {
                    if (selectedImageIndex !== idx) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.opacity = '1';
                    }
                  } : undefined}
                  onMouseLeave={img ? (e) => {
                    if (selectedImageIndex !== idx) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.opacity = '0.8';
                    }
                  } : undefined}
                >
                  {img ? (
                    <img 
                      src={img} 
                      alt={`${p.n} - Foto ${idx + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
            {/* Barra de color del departamento */}
            <div style={{ 
              width: 'calc(100% + 16px)', 
              height: '10px', 
              backgroundColor: DEPT_COLORS[p.d] || '#C8C4BE',
              marginLeft: '-8px',
              marginRight: '-8px',
              marginBottom: '12px',
            }}></div>
            {/* Información igual a la primera tarjeta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                <div className="oddy-cdept">{p.d}</div>
                {p.og && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 400, color: 'var(--muted)', textDecoration: 'line-through' }}>{separatePrice(p.og)}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                <div className="oddy-cname">{p.n}</div>
                <div className="oddy-cprice" style={{ flexShrink: 0, textAlign: 'right' }}>{separatePrice(p.p)}</div>
              </div>
            </div>
            <div className="oddy-panel-desc">{p.desc}</div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '5px', width: '100%' }}>
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowRatings(true)}
                onMouseLeave={() => setShowRatings(false)}
              >
                <button className="oddy-panel-btn-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {(() => {
                    const filled = Math.round(p.r);
                    const IconPerson = () => (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    );
                    return (
                      <>
                        <span style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} style={{ color: i <= filled ? '#6BB87A' : '#C8C4BE', display: 'flex', alignItems: 'center' }}>
                              <IconPerson />
                            </span>
                          ))}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 700 }}>{p.r.toFixed(1)}</span>
                      </>
                    );
                  })()}
                </button>
                {/* Tooltip con últimas 3 valoraciones */}
                {showRatings && (
                  <div className="oddy-ratings-tooltip">
                    <div className="oddy-rating-item">
                      <span className="oddy-rating-date">20/01/2025</span>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'center', marginTop: '2px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} style={{ color: i <= 5 ? '#6BB87A' : '#C8C4BE', display: 'flex', alignItems: 'center' }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="oddy-rating-item">
                      <span className="oddy-rating-date">18/01/2025</span>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'center', marginTop: '2px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} style={{ color: i <= 4 ? '#6BB87A' : '#C8C4BE', display: 'flex', alignItems: 'center' }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="oddy-rating-item">
                      <span className="oddy-rating-date">15/01/2025</span>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'center', marginTop: '2px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} style={{ color: i <= 5 ? '#6BB87A' : '#C8C4BE', display: 'flex', alignItems: 'center' }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button className="oddy-panel-btn-white" style={{ flexDirection: 'column', gap: '2px', padding: '5px 4px' }}>
                <span style={{ fontSize: '9px', fontWeight: 600, lineHeight: '1.2' }}>{p.rv} visitas</span>
                <span style={{ fontSize: '8px', fontWeight: 400, color: 'var(--muted)', lineHeight: '1.2' }}>{p.publishedDate || 'N/A'}</span>
              </button>
            <button className="oddy-panel-add" style={style} onClick={handleAdd}>
              <IconCart />{label}
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cross-sell sticky bar ─────────────────────────────────────────────────────
function CrossSellBar({ isSH }: { isSH: boolean }) {
  const items  = isSH ? MP : SH;
  const label  = isSH ? '♻️ También en 2da Mano' : '🛍️ También en Market';
  return (
    <div className="oddy-cs-sticky">
      <span className="oddy-cs-lbl">{label}</span>
      <div className="oddy-cs-scroller">
        {items.map(p => (
          <div key={p.id} className="oddy-cs-thumb">
            <img src={p.img} alt={p.n} />
            <div className="oddy-cs-thumb-p">{p.p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function OddyStorefront() {
  const [mode,       setMode]       = useState<'mkt' | 'sh'>('mkt');
  const [activeDept, setActiveDept] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hist,       setHist]       = useState<HistItem[]>([]);
  const [flash,      setFlash]      = useState(false);
  const [flashText,  setFlashText]  = useState('MARKET');
  const [flashKey,   setFlashKey]   = useState(0);
  const [showCart,   setShowCart]   = useState(false);

  // Pre-populated cart: 2 Market + 1 SH
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id:2,  img:IMG_EARBUDS, n:'Auriculares TWS noise cancel', p:'$1.890',  pNum:1890,  m:'mkt' },
    { id:5,  img:IMG_TV,      n:'Smart TV 43" 4K Android TV',   p:'$18.500', pNum:18500, m:'mkt' },
    { id:10, img:IMG_IPHONE,  n:'iPhone 13 128GB · Muy bueno',  p:'$11.500', pNum:11500, m:'sh'  },
  ]);

  const isSH = mode === 'sh';

  const addToCart = useCallback((p: MktProduct | ShProduct, m: 'mkt' | 'sh') => {
    setCartItems(prev => {
      if (prev.find(i => i.id === p.id && i.m === m)) return prev;
      return [...prev, { id:p.id, img:p.img, n:p.n, p:p.p, pNum:parsePrice(p.p), m }];
    });
  }, []);

  const addToHist = useCallback((id: number, m: 'mkt' | 'sh') => {
    const arr = m === 'mkt' ? MP : SH;
    const p = arr.find(x => x.id === id);
    if (!p) return;
    setHist(prev => {
      const filtered = prev.filter(h => !(h.id === id && h.m === m));
      return [{ id, m, img: p.img, n: p.n }, ...filtered].slice(0, 5);
    });
  }, []);

  const toggleMode = useCallback((silent = false) => {
    if (!silent) { setFlash(true); setFlashKey(k => k + 1); }
    setTimeout(() => {
      setMode(prev => {
        const next = prev === 'mkt' ? 'sh' : 'mkt';
        setFlashText(next === 'sh' ? 'SEGUNDA MANO' : 'ODDY MARKET');
        return next;
      });
      if (!silent) setTimeout(() => setFlash(false), 500);
    }, silent ? 0 : 200);
  }, []);

  const handleFlipped = (id: number) => addToHist(id, 'mkt');

  const handleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
    addToHist(id, 'sh');
  };

  const handleHistClick = (item: HistItem) => {
    if (item.m !== mode) {
      toggleMode(true);
      setTimeout(() => {
        if (item.m === 'sh') setExpandedId(item.id);
        document.getElementById(`${item.m === 'mkt' ? 'fc' : 'ec'}${item.id}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      if (item.m === 'sh') setExpandedId(item.id);
      document.getElementById(`${item.m === 'mkt' ? 'fc' : 'ec'}${item.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const panelDir = (idx: number): 'right' | 'left' => idx % 5 < 3 ? 'right' : 'left';

  const cartTotal = cartItems.reduce((s, i) => s + i.pNum, 0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Animación del carrusel infinito
  useEffect(() => {
    if (!carouselRef.current) return;
    
    const carousel = carouselRef.current;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // píxeles por frame
    
    // Calcular el ancho de un conjunto completo de artículos
    const itemsPerSet = isSH ? MP.length : SH.length;
    const itemWidth = 70; // ancho de cada miniatura
    const gap = 8; // gap entre items
    const setWidth = itemsPerSet * (itemWidth + gap);
    
    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Cuando llegamos al final de un conjunto, reiniciamos suavemente
      if (scrollPosition >= setWidth) {
        scrollPosition = 0;
      }
      
      carousel.scrollLeft = scrollPosition;
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isSH]);

  return (
    <div data-sh={isSH ? 'true' : 'false'}>
      {/* FLASH */}
      <div className={`oddy-flash${flash ? ' show' : ''}`}>
        <div key={flashKey} className="oddy-fw">{flashText}</div>
      </div>

      {/* ── TOPBAR ── */}
      <header className="oddy-tb">
        {/* ── LOGO ── */}
        <div className="oddy-logo-header">
          <svg viewBox="0 0 200 120" width="70" height="60" style={{ display: 'block' }}>
            {/* Hexágonos interconectados - tres hexágonos: dos abajo, uno arriba centrado */}
            <g fill="none" stroke={isSH ? '#FF6835' : '#00C4DC'} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" transform="translate(0, 5)">
              {/* Hexágono superior (centrado) */}
              <path d="M 100 10 L 130 25 L 130 55 L 100 70 L 70 55 L 70 25 Z" />
              {/* Hexágono inferior izquierdo */}
              <path d="M 70 55 L 100 70 L 100 100 L 70 115 L 40 100 L 40 70 Z" />
              {/* Hexágono inferior derecho */}
              <path d="M 130 55 L 160 70 L 160 100 L 130 115 L 100 100 L 100 70 Z" />
            </g>
          </svg>
          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '32px', fontWeight: 'bold', color: isSH ? '#FF6835' : '#00C4DC', marginLeft: '0px', display: 'flex', alignItems: 'flex-end', paddingBottom: '10px', lineHeight: '1' }}>ODDY</span>
        </div>
        <div className="oddy-topbar-group">
          {isSH ? (
            <button className="oddy-secondhand-btn" onClick={() => setMode('mkt')}>MARKET</button>
          ) : (
            <button className="oddy-secondhand-btn oddy-secondhand-btn-green" onClick={() => setMode('sh')}>Second Hand</button>
          )}
          <div className="oddy-srch" style={{ marginLeft: '20px' }}>
          <IconSrchSm />
            <input type="text" placeholder="encontra lo que buscas" />
        </div>
          <div className="oddy-bell-icon">
            <IconBell />
          </div>
          <div className="oddy-auth-buttons">
            <button className="oddy-auth-btn">Mi cuenta</button>
            <button className="oddy-auth-btn">Registro</button>
          </div>
          <div className="oddy-cart-icon">
            <IconBag />
          </div>
        </div>
        <div className="oddy-tbr" style={{ marginLeft: 'auto', display: 'none' }}>
          <div className="oddy-mpill" onClick={() => toggleMode()}>
            <div className="oddy-mdot" />
            <span>{isSH ? '2DA MANO' : 'MARKET'}</span>
          </div>

          {/* ── Botón Ritual ── */}
          <Link
            to="/ritual"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '20px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(184,155,85,0.35)',
              color: '#B89B55',
              fontSize: '0.68rem',
              fontWeight: '700',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'opacity 0.15s, transform 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.opacity = '0.75';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
              (e.currentTarget as HTMLElement).style.transform = '';
            }}
          >
            ◆ Privilegio
          </Link>

          {/* ── Botón Admin ── */}
          <Link
            to="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '20px',
              backgroundColor: '#FF6835',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: '800',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              transition: 'opacity 0.15s, transform 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.opacity = '0.85';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
              (e.currentTarget as HTMLElement).style.transform = '';
            }}
          >
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
            Admin
          </Link>

          {/* Cart button + hover dropdown */}
          <div
            className="oddy-cart-wrap"
            onMouseEnter={() => setShowCart(true)}
            onMouseLeave={() => setShowCart(false)}
          >
            <div className="oddy-ibtn">
              <IconBag />
              <div className="oddy-bdg">{cartItems.length}</div>
            </div>

            {showCart && cartItems.length > 0 && (
              <div className="oddy-cart-drop">
                <div className="oddy-cart-list">
                  {cartItems.map(item => (
                    <div key={`${item.m}-${item.id}`} className="oddy-cart-ci">
                      <img src={item.img} alt={item.n} />
                      <span className={`oddy-cart-ptag ${item.m}`}>{item.p}</span>
                    </div>
                  ))}
                </div>
                <div className="oddy-cart-foot">
                  <span className="oddy-cart-foot-lbl">Total</span>
                  {fmtNum(cartTotal)}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* DEPT STRIP */}
      <div className="oddy-dstrip">
        {DEPTS.map((d, i) => {
          const [emoji, ...rest] = d.split(' ');
          const deptName = rest.join(' ');
          const deptColor = DEPT_COLORS[deptName] || (activeDept === i ? (isSH ? '#6BB87A' : '#FF6835') : undefined);
          return (
            <div 
              key={i} 
              className={`oddy-dchip${activeDept === i ? ' on' : ''}`} 
              onClick={() => setActiveDept(i)}
              style={activeDept === i && deptColor ? {
                background: deptColor,
                borderColor: deptColor,
                color: '#000'
              } : undefined}
            >
              <em>{emoji}</em>{deptName}
            </div>
          );
        })}
      </div>

      {/* MAIN */}
      <main className="oddy-main">
        {/* HERO */}
        <div className="oddy-hero">
          <div className="oddy-hero-in">
            {!isSH && (
              <p className="oddy-hsub" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 8vw, 48px)', lineHeight: '1.1', marginBottom: '16px', maxWidth: '90%', color: '#333' }}>
                Todo lo que necesitas lo <span style={{ color: '#FF6835' }}>encontras</span> en Oddy Market. Ya encontrastes donde <span style={{ color: '#6BB87A' }}>vender</span> aquello que ya no necesitas.
              </p>
            )}
            {isSH && (
              <p className="oddy-hsub" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 8vw, 48px)', lineHeight: '1.1', marginBottom: '16px', maxWidth: '90%', color: '#333' }}>
                Aquí podrás <span style={{ color: '#6BB87A' }}>vender</span> lo que ya no necesitas y podrás <span style={{ color: '#FF6835' }}>comprar</span>, lo que no encontrabas.
              </p>
            )}
            </div>
          <div ref={carouselRef} className="oddy-hstats" style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-start', padding: '0 0 10px 0', overflowX: 'hidden', scrollbarWidth: 'none', WebkitScrollbar: { display: 'none' }, width: '100%', marginLeft: '-18px', marginRight: '-18px', paddingLeft: '18px', paddingRight: '18px' }}>
            {Array(10).fill(null).flatMap(() => (isSH ? MP : SH)).map((p, idx) => (
              <div key={`${p.id}-${idx}`} style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '8px', 
                overflow: 'hidden',
                border: '1.5px solid rgba(255,255,255,0.3)',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <img 
                  src={p.img} 
                  alt={p.n}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
          </div>
            ))}
          </div>
        </div>

        {/* ── MARKET ── */}
        {!isSH && (
          <>
            <div className="oddy-shdr">
              <div className="oddy-stitle">DESTACADOS</div>
              <span className="oddy-slink">Ver más →</span>
            </div>
            <div className="oddy-grid">
              {MP.map(p => (
                <div key={p.id} className="oddy-card-slot">
                  <FlipCard
                    p={p}
                    onAdd={() => addToCart(p, 'mkt')}
                    onFlipped={() => handleFlipped(p.id)}
                  />
                </div>
              ))}
            </div>

          </>
        )}

        {/* ── SEGUNDA MANO ── */}
        {isSH && (
          <>
            <div className="oddy-shdr">
              <div className="oddy-stitle">PUBLICACIONES</div>
              <span className="oddy-slink">Ver todas →</span>
            </div>
            <div className="oddy-grid">
              {SH.map((p, idx) => (
                <SlideCard
                  key={p.id}
                  p={p}
                  isOpen={expandedId === p.id}
                  dir={panelDir(idx)}
                  onToggle={() => handleExpand(p.id)}
                  onAdd={() => addToCart(p, 'sh')}
                />
              ))}
            </div>
            <div className="oddy-sp" />
          </>
        )}
      </main>
    </div>
  );
}