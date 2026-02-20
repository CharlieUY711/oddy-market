/**
 * MODULE MANIFEST — Charlie Marketplace Builder v1.5
 * ═══════════════════════════════════════════════════
 * FUENTE ÚNICA DE VERDAD sobre qué vistas existen y qué IDs del checklist cubren.
 *
 * ┌─ REGLA ──────────────────────────────────────────────────────────────────────┐
 * │  Cuando construís una vista nueva, SOLO tenés que agregar/editar UNA entrada │
 * │  aquí. moduleRegistry.ts y el ChecklistRoadmap se actualizan solos.          │
 * └──────────────────────────────────────────────────────────────────────────────┘
 *
 * isReal = true  → Vista funcional con UI completa (puede ser mock o real Supabase)
 * isReal = false → Hub de navegación o placeholder; no cuenta como completado
 */

import type { MainSection } from '../AdminDashboard';

export interface ManifestEntry {
  /** IDs exactos en MODULES_DATA que esta vista cubre (vacío = hub, no mapea nada) */
  checklistIds: string[];
  /** Sección en AdminDashboard / sidebar */
  section: MainSection;
  /** Nombre del archivo de vista (solo informativo) */
  viewFile: string;
  /** true = vista funcional real | false = hub de navegación o placeholder */
  isReal: boolean;
  /** ¿Conecta con Supabase/backend? */
  hasSupabase?: boolean;
  /** Nota descriptiva */
  notes?: string;
}

export const MODULE_MANIFEST: ManifestEntry[] = [

  // ══════════════════════════════════════════════════════
  // ADMIN / SISTEMA
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['admin-settings', 'admin-users'],
    section: 'dashboard',
    viewFile: 'DashboardView.tsx',
    isReal: true,
    notes: 'Dashboard con métricas, charts y navegación rápida',
  },
  {
    checklistIds: ['admin-settings', 'admin-users'],
    section: 'sistema',
    viewFile: 'SistemaView.tsx',
    isReal: true,
    notes: 'Configuración del sistema — hub con cards de config',
  },
  {
    checklistIds: ['admin-users'],
    section: 'departamentos',
    viewFile: 'DepartamentosView.tsx',
    isReal: true,
    notes: 'Gestión de departamentos, roles y permisos',
  },
  {
    checklistIds: ['admin-settings'],
    section: 'checklist',
    viewFile: 'ChecklistView.tsx',
    isReal: true,
    notes: 'Vista del checklist / roadmap con audit integrado',
  },
  {
    checklistIds: [],
    section: 'diseno',
    viewFile: 'DisenoView.tsx',
    isReal: false,
    notes: 'Hub de diseño y branding (tabs de navegación)',
  },

  // ══════════════════════════════════════════════════════
  // BASE DE PERSONAS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['base-personas'],
    section: 'personas',
    viewFile: 'PersonasView.tsx',
    isReal: true,
    hasSupabase: true,
    notes: 'CRUD completo de personas físicas y jurídicas',
  },
  {
    checklistIds: ['base-personas'],
    section: 'organizaciones',
    viewFile: 'OrganizacionesView.tsx',
    isReal: true,
    hasSupabase: true,
    notes: 'CRUD completo de empresas y organizaciones',
  },
  {
    checklistIds: ['base-personas'],
    section: 'clientes',
    viewFile: 'ClientesView.tsx',
    isReal: true,
    hasSupabase: true,
    notes: 'Vista filtrada de personas/organizaciones con rol cliente',
  },

  // ══════════════════════════════════════════════════════
  // eCOMMERCE
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'ecommerce',
    viewFile: 'EcommerceView.tsx',
    isReal: false,
    notes: 'Hub de navegación eCommerce (cards a sub-módulos)',
  },
  {
    checklistIds: ['ecommerce-pedidos'],
    section: 'pedidos',
    viewFile: 'PedidosView.tsx',
    isReal: true,
    hasSupabase: true,
    notes: 'CRUD de pedidos con estados, filtros y árbol madre/hijos',
  },
  {
    checklistIds: ['ecommerce-pedidos'],
    section: 'pagos',
    viewFile: 'PagosView.tsx',
    isReal: true,
    hasSupabase: true,
    notes: 'Transacciones y estados de pago operativos',
  },
  {
    checklistIds: ['ecommerce-metodos-pago'],
    section: 'metodos-pago',
    viewFile: 'MetodosPagoView.tsx',
    isReal: true,
    hasSupabase: true,
    notes: 'Configuración de pasarelas y métodos de pago',
  },
  {
    checklistIds: ['ecommerce-metodos-envio'],
    section: 'metodos-envio',
    viewFile: 'MetodosEnvioView.tsx',
    isReal: true,
    hasSupabase: true,
    notes: 'Configuración de métodos de envío y tarifas',
  },

  // ══════════════════════════════════════════════════════
  // LOGÍSTICA
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-hub'],
    section: 'logistica',
    viewFile: 'LogisticaView.tsx',
    isReal: false,
    notes: 'Hub con diagrama de flujo logístico 7 pasos (logistics-hub está hardcodeado como completed en MODULES_DATA)',
  },
  {
    checklistIds: [],
    section: 'envios',
    viewFile: 'EnviosView.tsx',
    isReal: false,
    notes: 'Placeholder — vista árbol pedido→envíos pendiente de construcción',
  },

  // ══════════════════════════════════════════════════════
  // MARKETING
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'marketing',
    viewFile: 'MarketingView.tsx',
    isReal: false,
    notes: 'Hub de navegación Marketing (cards a sub-módulos)',
  },
  {
    checklistIds: ['marketing-campaigns'],
    section: 'google-ads',
    viewFile: 'GoogleAdsView.tsx',
    isReal: true,
    notes: 'Dashboard Google Ads con charts recharts, KPIs y tabla de campañas',
  },
  {
    checklistIds: ['marketing-email'],
    // marketing-email-bulk (Mailing Masivo con Resend) → SIN implementar.
    // La vista tiene UI completa pero todo es mock data. Resend API no conectada.
    // Cuando el envío real esté listo, agregar 'marketing-email-bulk' aquí.
    section: 'mailing',
    viewFile: 'MailingView.tsx',
    isReal: true,
    hasSupabase: false,
    notes: 'UI completa (5 tabs: Campañas, Suscriptores, Segmentación, A/B Testing, Analíticas) — MOCK DATA. Resend API no conectada. marketing-email-bulk queda en backlog.',
  },
  {
    checklistIds: ['marketing-loyalty'],
    section: 'fidelizacion',
    viewFile: 'FidelizacionView.tsx',
    isReal: true,
    notes: 'Programa de fidelización con niveles y charts',
  },
  {
    checklistIds: ['marketing-loyalty'],
    section: 'rueda-sorteos',
    viewFile: 'RuedaSorteosView.tsx',
    isReal: true,
    notes: 'Rueda de sorteos interactiva con premios configurables',
  },
  {
    checklistIds: ['rrss-centro-operativo'],
    section: 'redes-sociales',
    viewFile: 'RedesSocialesView.tsx',
    isReal: true,
    notes: 'Centro Operativo RRSS — métricas, programación de posts y análisis de audiencia',
  },
  {
    checklistIds: ['rrss-migracion'],
    section: 'migracion-rrss',
    viewFile: 'MigracionRRSSView.tsx',
    isReal: true,
    notes: 'Herramienta de migración/rebranding Instagram + Facebook',
  },
  {
    checklistIds: ['marketing-etiqueta-emotiva'],
    section: 'etiqueta-emotiva',
    viewFile: 'EtiquetaEmotivaView.tsx',
    isReal: true,
    hasSupabase: true,
    notes: 'Mensajes personalizados con QR para envíos · Supabase + QR real',
  },

  // ══════════════════════════════════════════════════════
  // RRSS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'rrss',
    viewFile: 'RRSSHubView.tsx',
    isReal: false,
    notes: 'Hub de navegación RRSS — Centro Operativo + Migración RRSS',
  },

  // ══════════════════════════════════════════════════════
  // HERRAMIENTAS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'herramientas',
    viewFile: 'HerramientasView.tsx',
    isReal: false,
    notes: 'Hub de navegación (9 tarjetas: Editor, Docs, QR, IA, OCR, Presupuestos, Rueda, Impresión, Biblioteca)',
  },
  {
    checklistIds: ['tools-qr'],
    section: 'qr-generator',
    viewFile: 'QrGeneratorView.tsx',
    isReal: true,
    notes: 'Generador QR — sin APIs externas, genera PNG y SVG vectorial',
  },

  // ══════════════════════════════════════════════════════
  // ERP
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'gestion',
    viewFile: 'GestionView.tsx',
    isReal: false,
    notes: 'Hub de navegación ERP (cards a Inventario, Facturación, Compras, CRM, etc.)',
  },
  {
    checklistIds: ['erp-inventory'],
    section: 'erp-inventario',
    viewFile: 'ERPInventarioView.tsx',
    isReal: true,
    notes: 'Inventario con tabs: Artículos, Stock, Movimientos, Alertas',
  },
  {
    checklistIds: ['erp-invoicing'],
    section: 'erp-facturacion',
    viewFile: 'ERPFacturacionView.tsx',
    isReal: true,
    notes: 'Facturación con tabs: Facturas, Tickets, Nueva factura',
  },
  {
    checklistIds: ['erp-purchasing'],
    section: 'erp-compras',
    viewFile: 'ERPComprasView.tsx',
    isReal: true,
    notes: 'Compras con tabs: Órdenes, Proveedores, Nueva orden',
  },
  {
    checklistIds: ['crm-contacts', 'crm-opportunities', 'crm-activities'],
    section: 'erp-crm',
    viewFile: 'ERPCRMView.tsx',
    isReal: true,
    notes: 'CRM completo: Contactos, Pipeline de oportunidades, Actividades y seguimiento',
  },
  {
    checklistIds: ['erp-accounting'],
    section: 'erp-contabilidad',
    viewFile: 'ERPContabilidadView.tsx',
    isReal: true,
    notes: 'Contabilidad: Plan de cuentas, Asientos, Cobrar/Pagar, Bancos',
  },
  {
    checklistIds: ['erp-hr'],
    section: 'erp-rrhh',
    viewFile: 'ERPRRHHView.tsx',
    isReal: true,
    notes: 'RRHH: Empleados, Asistencia y Nómina',
  },

  // ══════════════════════════════════════════════════════
  // PROYECTOS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['projects-management', 'projects-tasks', 'projects-time'],
    section: 'proyectos',
    viewFile: 'ProyectosView.tsx',
    isReal: true,
    notes: 'Proyectos con Gantt simplificado y tablero Kanban',
  },

  // ══════════════════════════════════════════════════════
  // MARKETPLACE
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['marketplace-secondhand', 'marketplace-secondhand-mediacion'],
    section: 'secondhand',
    viewFile: 'SecondHandView.tsx',
    isReal: true,
    notes: 'Marketplace Segunda Mano: Estadísticas, Moderación, Publicaciones y ⚖️ Mediación de disputas',
  },
  {
    checklistIds: ['marketplace-storefront'],
    section: 'storefront',
    viewFile: 'StorefrontAdminView.tsx',
    isReal: true,
    notes: 'Panel de acceso rápido al storefront público con stats y links',
  },

  // ══════════════════════════════════════════════════════
  // INTEGRACIONES
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [
      'integrations-mercadolibre',  // tab Marketplaces — card UI
      'integrations-mercadopago',   // tab Pagos — card UI
      'integrations-plexo',         // tab Pagos — card UI (sandbox)
      'integrations-paypal',        // tab Pagos — card UI
      'integrations-stripe',        // tab Pagos — card UI
      'integrations-meta',          // tab Redes Sociales — cards Meta/IG/WA/FB
      'integrations-twilio',        // tab Mensajería — formulario real con campos
      // integrations-resend    → SIN UI en esta vista todavía
      // integrations-fixed     → SIN UI en esta vista todavía
      // integrations-replicate → SIN UI en esta vista todavía
      // integrations-removebg  → SIN UI en esta vista todavía
    ],
    section: 'integraciones',
    viewFile: 'IntegracionesView.tsx',
    isReal: true,
    notes: 'UI con 4 tabs: Marketplaces (ML), Pagos (MP+Plexo+PayPal+Stripe), Redes (Meta/IG/WA/FB→ 1 entry meta), Mensajería (Twilio form). Ninguna conecta APIs reales todavía.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS (consumidos por moduleRegistry y AuditPanel)
// ─────────────────────────────────────────────────────────────────────────────

/** Set de todos los checklistIds cubiertos por vistas reales */
export const REAL_CHECKLIST_IDS = new Set<string>(
  MODULE_MANIFEST.filter(e => e.isReal).flatMap(e => e.checklistIds)
);

/** Map sección → entry del manifest */
export const MANIFEST_BY_SECTION = new Map<MainSection, ManifestEntry>(
  MODULE_MANIFEST.map(e => [e.section, e])
);