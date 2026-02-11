import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Mail,
  Settings,
  BarChart3,
  Globe,
  Shield,
  Zap,
  FileText,
  MessageSquare,
  Image,
  Truck,
  Tag,
  Heart,
  Star,
  Database,
  Lock,
  Eye,
  Activity,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AuditItem {
  name: string;
  description: string;
  status: 'complete' | 'partial' | 'missing';
  priority: 'critical' | 'high' | 'medium' | 'low';
  components?: string[];
  endpoints?: string[];
  notes?: string;
  subItems?: AuditItem[];
}

interface AuditCategory {
  category: string;
  icon: React.ReactNode;
  items: AuditItem[];
  weight: number;
}

export default function SystemAudit() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'complete' | 'partial' | 'missing'>('all');

  // Definición completa de todas las funcionalidades del sistema
  const auditData: AuditCategory[] = [
    {
      category: 'Core E-commerce',
      icon: <ShoppingCart className="h-5 w-5" />,
      weight: 20,
      items: [
        {
          name: 'Catálogo de Productos',
          description: 'Sistema completo de productos con categorías, búsqueda y filtros',
          status: 'complete',
          priority: 'critical',
          components: ['HomePage', 'ArticleCatalog', 'ProductCard', 'EnhancedProductsManagement'],
          endpoints: ['/products', '/categories'],
          notes: 'Implementado con búsqueda avanzada, filtros y categorización dinámica'
        },
        {
          name: 'Carrito de Compras',
          description: 'Gestión de carrito con persistencia y cálculos automáticos',
          status: 'complete',
          priority: 'critical',
          components: ['Cart'],
          endpoints: ['/cart'],
          notes: 'Carrito funcional con persistencia en localStorage y KV'
        },
        {
          name: 'Proceso de Checkout',
          description: 'Flujo completo de compra con validaciones',
          status: 'complete',
          priority: 'critical',
          components: ['Checkout'],
          endpoints: ['/orders'],
          notes: 'Checkout multi-paso con validaciones completas'
        },
        {
          name: 'Gestión de Órdenes',
          description: 'Sistema completo de pedidos con estados y tracking',
          status: 'complete',
          priority: 'critical',
          endpoints: ['/orders'],
          notes: 'Estados de orden, historial y seguimiento implementado'
        },
        {
          name: 'Reviews y Ratings',
          description: 'Sistema de valoraciones y reseñas de productos',
          status: 'partial',
          priority: 'high',
          notes: 'Pendiente: Sistema completo de reviews con moderación'
        },
        {
          name: 'Wishlist / Favoritos',
          description: 'Lista de deseos y productos favoritos',
          status: 'partial',
          priority: 'medium',
          notes: 'Pendiente: Implementación completa con sincronización'
        },
        {
          name: 'Comparador de Productos',
          description: 'Herramienta para comparar productos lado a lado',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        },
        {
          name: 'Recently Viewed',
          description: 'Historial de productos vistos recientemente',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Sistema de Roles y Permisos',
      icon: <Shield className="h-5 w-5" />,
      weight: 15,
      items: [
        {
          name: 'Autenticación Completa',
          description: 'Sistema de login, registro y recuperación de contraseña',
          status: 'complete',
          priority: 'critical',
          components: ['AuthComponent', 'PasswordResetHelper'],
          endpoints: ['/auth'],
          notes: 'Supabase Auth con email/password y OAuth'
        },
        {
          name: 'Sistema de 4 Roles',
          description: 'Admin, Editor, Proveedor, Cliente con permisos diferenciados',
          status: 'complete',
          priority: 'critical',
          components: ['RoleManagement', 'AdminDashboard', 'ProviderDashboard', 'ClientDashboard'],
          endpoints: ['/users'],
          notes: 'Sistema completo de roles con aprobación manual'
        },
        {
          name: 'Solicitud de Roles',
          description: 'Sistema para solicitar elevación de rol',
          status: 'complete',
          priority: 'high',
          components: ['RoleRequestModal'],
          notes: 'Modal de solicitud implementado con aprobación admin'
        },
        {
          name: 'Gestión de Sesiones',
          description: 'Control de sesiones activas y seguridad',
          status: 'complete',
          priority: 'high',
          components: ['AuditLogs'],
          notes: 'Auditoría de sesiones implementada en sistema de logs'
        },
        {
          name: 'OAuth Social Login',
          description: 'Login con Google, Facebook, etc.',
          status: 'partial',
          priority: 'medium',
          notes: 'Pendiente: Configuración de providers en Supabase'
        },
        {
          name: '2FA / MFA',
          description: 'Autenticación de dos factores',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado - Crítico para Admin'
        }
      ]
    },
    {
      category: 'Pasarelas de Pago',
      icon: <DollarSign className="h-5 w-5" />,
      weight: 15,
      items: [
        {
          name: 'Mercado Pago',
          description: 'Integración completa con MP (Checkout Pro + API)',
          status: 'complete',
          priority: 'critical',
          components: ['MercadoPagoConfig', 'MercadoPagoSetupWizard', 'PaymentIntegrations'],
          endpoints: ['/integrations/mercadopago'],
          notes: 'Implementado con wizard de configuración y procesamiento'
        },
        {
          name: 'Plexo (Visa/Mastercard)',
          description: 'Procesamiento de tarjetas de crédito vía Plexo',
          status: 'complete',
          priority: 'critical',
          components: ['PaymentIntegrations', 'BillingManagement'],
          endpoints: ['/billing'],
          notes: 'Integración completa con tokenización'
        },
        {
          name: 'PayPal',
          description: 'Integración con PayPal para pagos internacionales',
          status: 'partial',
          priority: 'high',
          notes: 'Pendiente: Configuración de PayPal SDK'
        },
        {
          name: 'Stripe',
          description: 'Procesador de pagos global',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado - Considerar para expansión internacional'
        },
        {
          name: 'Gestión de Reembolsos',
          description: 'Sistema de devoluciones y reembolsos',
          status: 'partial',
          priority: 'high',
          components: ['BillingManagement'],
          notes: 'Pendiente: Flujo completo de refunds automatizado'
        },
        {
          name: 'Split Payments',
          description: 'Pagos divididos para marketplace',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado - Necesario para comisiones de proveedores'
        }
      ]
    },
    {
      category: 'ERP Completo',
      icon: <Database className="h-5 w-5" />,
      weight: 15,
      items: [
        {
          name: 'Gestión de Inventario',
          description: 'Control de stock con alertas y movimientos',
          status: 'complete',
          priority: 'critical',
          components: ['InventoryManagement', 'StockMovementsManagement'],
          endpoints: ['/erp/inventory', '/erp/stock-movements'],
          notes: 'Sistema completo con alertas de stock bajo'
        },
        {
          name: 'Gestión de Proveedores',
          description: 'Base de datos y relaciones con proveedores',
          status: 'complete',
          priority: 'critical',
          components: ['SuppliersManagement'],
          endpoints: ['/erp/suppliers'],
          notes: 'CRUD completo de proveedores'
        },
        {
          name: 'Órdenes de Compra',
          description: 'Generación y seguimiento de POs',
          status: 'complete',
          priority: 'high',
          components: ['PurchaseOrdersManagement'],
          endpoints: ['/erp/purchase-orders'],
          notes: 'Sistema completo de órdenes de compra'
        },
        {
          name: 'Análisis de Costos y Márgenes',
          description: 'Reportes financieros y análisis de rentabilidad',
          status: 'complete',
          priority: 'high',
          components: ['CostMarginsAnalysis', 'FinancialReports'],
          endpoints: ['/erp/financial'],
          notes: 'Análisis avanzado implementado'
        },
        {
          name: 'Generación de Documentos',
          description: 'Facturas, remitos, órdenes de compra',
          status: 'complete',
          priority: 'critical',
          components: ['DocumentGenerator', 'PrintModule'],
          endpoints: ['/documents'],
          notes: 'Generación de PDF y impresión implementada'
        },
        {
          name: 'Batch Actions',
          description: 'Operaciones masivas sobre productos',
          status: 'complete',
          priority: 'medium',
          components: ['BatchActionsManager'],
          notes: 'Acciones en lote implementadas'
        },
        {
          name: 'Contabilidad Integrada',
          description: 'Libro mayor, asientos contables',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado - Considerar integración con software contable'
        },
        {
          name: 'Control de Calidad',
          description: 'Sistema de QC para productos',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'CRM Completo',
      icon: <Users className="h-5 w-5" />,
      weight: 10,
      items: [
        {
          name: 'Gestión de Clientes',
          description: 'Base de datos completa de clientes',
          status: 'complete',
          priority: 'critical',
          components: ['CustomersManagement'],
          endpoints: ['/crm/customers'],
          notes: 'CRUD completo con histórico de compras'
        },
        {
          name: 'Pipeline de Ventas',
          description: 'Tablero Kanban para oportunidades de venta',
          status: 'complete',
          priority: 'high',
          components: ['PipelineBoard'],
          endpoints: ['/crm/pipeline'],
          notes: 'Sistema de pipeline con drag & drop'
        },
        {
          name: 'Gestión de Tareas',
          description: 'Sistema de tareas y seguimiento',
          status: 'complete',
          priority: 'high',
          components: ['TasksManagement'],
          endpoints: ['/crm/tasks'],
          notes: 'Tareas con prioridades y asignaciones'
        },
        {
          name: 'Analytics de Ventas',
          description: 'Reportes y métricas de ventas',
          status: 'complete',
          priority: 'high',
          components: ['SalesAnalytics'],
          endpoints: ['/crm/analytics'],
          notes: 'Dashboards con Recharts implementados'
        },
        {
          name: 'Segmentación de Clientes',
          description: 'Segmentos automáticos basados en comportamiento',
          status: 'complete',
          priority: 'medium',
          components: ['SegmentationManagement'],
          endpoints: ['/mailing/segments'],
          notes: 'Segmentación avanzada implementada'
        },
        {
          name: 'Customer 360',
          description: 'Vista unificada del cliente',
          status: 'partial',
          priority: 'medium',
          notes: 'Pendiente: Consolidar toda la info del cliente en una vista'
        },
        {
          name: 'Lead Scoring',
          description: 'Puntuación automática de leads',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'Chatbot de Ventas',
          description: 'Bot para calificar leads automáticamente',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Marketing y Promociones',
      icon: <Tag className="h-5 w-5" />,
      weight: 10,
      items: [
        {
          name: 'Rueda de Sorteos',
          description: 'Spin wheel gamificada configurable',
          status: 'complete',
          priority: 'medium',
          components: ['SpinWheel'],
          endpoints: ['/wheel'],
          notes: 'Rueda con premios configurables implementada'
        },
        {
          name: 'Cupones y Descuentos',
          description: 'Sistema completo de cupones',
          status: 'complete',
          priority: 'high',
          components: ['CouponsManager'],
          endpoints: ['/marketing/coupons'],
          notes: 'Cupones con códigos, porcentajes y límites'
        },
        {
          name: 'Programa de Lealtad',
          description: 'Sistema de puntos y recompensas',
          status: 'complete',
          priority: 'medium',
          components: ['LoyaltyProgram'],
          endpoints: ['/marketing/loyalty'],
          notes: 'Sistema de puntos implementado'
        },
        {
          name: 'Campañas de Marketing',
          description: 'Gestión de campañas promocionales',
          status: 'complete',
          priority: 'high',
          components: ['CampaignsManager'],
          endpoints: ['/marketing/campaigns'],
          notes: 'Campañas con tracking implementadas'
        },
        {
          name: 'A/B Testing',
          description: 'Experimentos para optimizar conversiones',
          status: 'complete',
          priority: 'medium',
          components: ['ABTestingManager'],
          endpoints: ['/marketing/abtesting'],
          notes: 'A/B Testing básico implementado'
        },
        {
          name: 'Popups y Banners',
          description: 'Banners promocionales configurables',
          status: 'complete',
          priority: 'medium',
          components: ['PopupBannerManager'],
          endpoints: ['/marketing/popups'],
          notes: 'Sistema de popups con triggers'
        },
        {
          name: 'Google Ads Integration',
          description: 'Integración con Google Ads para tracking',
          status: 'partial',
          priority: 'high',
          components: ['GoogleAdsManager'],
          notes: 'Pendiente: Configuración de conversiones y remarketing'
        },
        {
          name: 'Referral Program',
          description: 'Programa de referidos',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'Flash Sales',
          description: 'Ventas flash con contador',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'Bundle Offers',
          description: 'Ofertas de productos combinados',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Email Marketing',
      icon: <Mail className="h-5 w-5" />,
      weight: 8,
      items: [
        {
          name: 'Integración Resend',
          description: 'Envío de emails transaccionales y marketing',
          status: 'complete',
          priority: 'critical',
          components: ['MailingManagement'],
          endpoints: ['/mailing'],
          notes: 'Resend configurado y funcionando'
        },
        {
          name: 'Gestión de Suscriptores',
          description: 'Base de datos de suscriptores con opt-in',
          status: 'complete',
          priority: 'high',
          components: ['SubscribersManagement'],
          endpoints: ['/mailing/subscribers'],
          notes: 'CRUD completo de suscriptores'
        },
        {
          name: 'Campañas de Email',
          description: 'Creación y envío de campañas',
          status: 'complete',
          priority: 'high',
          components: ['CampaignsManagement'],
          endpoints: ['/mailing/campaigns'],
          notes: 'Campañas con templates personalizables'
        },
        {
          name: 'Email Analytics',
          description: 'Métricas de apertura, clicks, conversiones',
          status: 'complete',
          priority: 'high',
          components: ['EmailAnalytics'],
          endpoints: ['/mailing/analytics'],
          notes: 'Analytics completo implementado'
        },
        {
          name: 'A/B Testing de Emails',
          description: 'Testing de subject lines y contenido',
          status: 'complete',
          priority: 'medium',
          components: ['ABTestingManagement'],
          endpoints: ['/mailing/abtesting'],
          notes: 'A/B testing de emails implementado'
        },
        {
          name: 'Automatizaciones',
          description: 'Workflows automáticos (welcome, abandono, etc.)',
          status: 'partial',
          priority: 'high',
          endpoints: ['/automation'],
          notes: 'Pendiente: Workflows complejos con triggers múltiples'
        },
        {
          name: 'Email Templates Avanzados',
          description: 'Editor drag & drop de emails',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado - Actualmente templates en código'
        },
        {
          name: 'Deliverability Monitor',
          description: 'Monitoreo de reputación de dominio',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Redes Sociales',
      icon: <MessageSquare className="h-5 w-5" />,
      weight: 8,
      items: [
        {
          name: 'WhatsApp Business',
          description: 'Integración completa con WhatsApp via Twilio',
          status: 'complete',
          priority: 'high',
          components: ['TwilioWhatsAppManager', 'WhatsAppManagement'],
          endpoints: ['/social/whatsapp'],
          notes: 'Envío y recepción de mensajes implementado'
        },
        {
          name: 'Facebook Management',
          description: 'Publicación y gestión de contenido en Facebook',
          status: 'complete',
          priority: 'medium',
          components: ['FacebookManagement'],
          endpoints: ['/social/facebook'],
          notes: 'Gestión de posts implementada'
        },
        {
          name: 'Instagram Management',
          description: 'Publicación y gestión de contenido en Instagram',
          status: 'complete',
          priority: 'medium',
          components: ['InstagramManagement'],
          endpoints: ['/social/instagram'],
          notes: 'Gestión de posts implementada'
        },
        {
          name: 'Calendario de Contenido',
          description: 'Planificación de publicaciones',
          status: 'complete',
          priority: 'medium',
          components: ['ContentCalendar'],
          endpoints: ['/social/calendar'],
          notes: 'Calendario con drag & drop'
        },
        {
          name: 'Dashboard Unificado',
          description: 'Vista consolidada de todas las redes',
          status: 'complete',
          priority: 'high',
          components: ['UnifiedDashboard'],
          endpoints: ['/social/dashboard'],
          notes: 'Dashboard multi-red implementado'
        },
        {
          name: 'Social Listening',
          description: 'Monitoreo de menciones y hashtags',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'TikTok Integration',
          description: 'Gestión de contenido en TikTok',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        },
        {
          name: 'X (Twitter) Integration',
          description: 'Gestión de tweets',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Integraciones Externas',
      icon: <Globe className="h-5 w-5" />,
      weight: 10,
      items: [
        {
          name: 'Mercado Libre',
          description: 'Sincronización bidireccional de catálogo',
          status: 'complete',
          priority: 'critical',
          components: ['MercadoLibreConfig', 'CatalogSyncManager'],
          endpoints: ['/integrations/mercadolibre'],
          notes: 'Sincronización completa implementada con OAuth'
        },
        {
          name: 'Gestión de API Keys',
          description: 'Sistema centralizado de API keys',
          status: 'complete',
          priority: 'high',
          components: ['ApiKeysManager'],
          endpoints: ['/api-keys'],
          notes: 'Gestión segura de claves implementada'
        },
        {
          name: 'Meta Business Suite',
          description: 'Integración con Meta para FB e IG',
          status: 'partial',
          priority: 'high',
          notes: 'Pendiente: OAuth completo con Meta'
        },
        {
          name: 'Google Shopping',
          description: 'Feed de productos para Google',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado - Importante para visibilidad'
        },
        {
          name: 'Amazon Integration',
          description: 'Venta en Amazon',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'eBay Integration',
          description: 'Venta en eBay',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        },
        {
          name: 'Shopify Sync',
          description: 'Sincronización con Shopify',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Logística y Envíos',
      icon: <Truck className="h-5 w-5" />,
      weight: 8,
      items: [
        {
          name: 'Gestión de Envíos',
          description: 'Configuración de métodos de envío',
          status: 'complete',
          priority: 'critical',
          components: ['ShippingManager'],
          endpoints: ['/shipping'],
          notes: 'Sistema básico de envíos implementado'
        },
        {
          name: 'Cálculo de Tarifas',
          description: 'Cálculo automático de costos de envío',
          status: 'partial',
          priority: 'high',
          notes: 'Pendiente: Integración con carriers para tarifas reales'
        },
        {
          name: 'Integración con Carriers',
          description: 'UPS, FedEx, DHL, Correo local',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado - Crítico para automatización'
        },
        {
          name: 'Tracking de Envíos',
          description: 'Seguimiento de paquetes',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado'
        },
        {
          name: 'Etiquetas de Envío',
          description: 'Generación automática de etiquetas',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'Pickup Points',
          description: 'Puntos de retiro',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'Same Day Delivery',
          description: 'Envío el mismo día',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Herramientas de Contenido',
      icon: <Image className="h-5 w-5" />,
      weight: 5,
      items: [
        {
          name: 'Editor de Imágenes',
          description: 'Edición de imágenes en la plataforma',
          status: 'complete',
          priority: 'high',
          components: ['ImageEditor'],
          endpoints: ['/images'],
          notes: 'Editor con crop, filtros y efectos'
        },
        {
          name: 'Biblioteca de Medios',
          description: 'Gestión de archivos multimedia',
          status: 'complete',
          priority: 'high',
          components: ['MediaLibrary'],
          endpoints: ['/media'],
          notes: 'Biblioteca con organización por carpetas'
        },
        {
          name: 'Generador de QR',
          description: 'Generación de códigos QR para productos',
          status: 'partial',
          priority: 'medium',
          notes: 'Pendiente: Implementación completa con personalización'
        },
        {
          name: 'Background Remover (IA)',
          description: 'Remoción de fondos con IA',
          status: 'partial',
          priority: 'medium',
          notes: 'Pendiente: Integración con RemoveBG API'
        },
        {
          name: 'AI Image Generation',
          description: 'Generación de imágenes con IA',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado - Considerar DALL-E o Midjourney'
        },
        {
          name: 'Video Editor',
          description: 'Editor básico de videos',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Inteligencia Artificial',
      icon: <Zap className="h-5 w-5" />,
      weight: 7,
      items: [
        {
          name: 'Chatbot de Atención',
          description: 'Bot con IA para soporte al cliente',
          status: 'complete',
          priority: 'high',
          components: ['AIChatbot'],
          endpoints: ['/ai/chat'],
          notes: 'Chatbot básico implementado'
        },
        {
          name: 'Recomendaciones de Productos',
          description: 'Sistema de recomendaciones con IA',
          status: 'complete',
          priority: 'high',
          components: ['AIRecommendations'],
          endpoints: ['/ai/recommendations'],
          notes: 'Recomendaciones basicas implementadas'
        },
        {
          name: 'AI Tools Suite',
          description: 'Conjunto de herramientas de IA',
          status: 'complete',
          priority: 'medium',
          components: ['AITools'],
          endpoints: ['/ai'],
          notes: 'Suite de herramientas disponible'
        },
        {
          name: 'Product Info Finder',
          description: 'Búsqueda de info de productos con IA',
          status: 'complete',
          priority: 'medium',
          components: ['ProductInfoFinder'],
          notes: 'Buscador de info implementado'
        },
        {
          name: 'Descripción Automática',
          description: 'Generación de descripciones con IA',
          status: 'partial',
          priority: 'medium',
          notes: 'Pendiente: Mejorar calidad y personalización'
        },
        {
          name: 'Sentiment Analysis',
          description: 'Análisis de sentimiento de reviews',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        },
        {
          name: 'Price Optimization',
          description: 'Optimización de precios con IA',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'Fraud Detection',
          description: 'Detección de fraude con ML',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado - Importante para seguridad'
        }
      ]
    },
    {
      category: 'Analytics y Reportes',
      icon: <BarChart3 className="h-5 w-5" />,
      weight: 8,
      items: [
        {
          name: 'Dashboard Principal',
          description: 'Dashboard con KPIs principales',
          status: 'complete',
          priority: 'critical',
          components: ['AdminDashboard'],
          endpoints: ['/dashboard', '/analytics'],
          notes: 'Dashboard con métricas clave implementado'
        },
        {
          name: 'Reportes Financieros',
          description: 'Reportes de ventas, ingresos, etc.',
          status: 'complete',
          priority: 'critical',
          components: ['FinancialReports'],
          endpoints: ['/erp/financial'],
          notes: 'Reportes completos con Recharts'
        },
        {
          name: 'Analytics de Productos',
          description: 'Métricas de rendimiento de productos',
          status: 'complete',
          priority: 'high',
          components: ['SalesAnalytics'],
          notes: 'Analytics de productos implementado'
        },
        {
          name: 'Customer Analytics',
          description: 'Análisis de comportamiento de clientes',
          status: 'partial',
          priority: 'high',
          notes: 'Pendiente: Análisis avanzado de cohortes y retención'
        },
        {
          name: 'Traffic Analytics',
          description: 'Análisis de tráfico web',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado - Considerar Google Analytics'
        },
        {
          name: 'Conversion Funnel',
          description: 'Análisis de embudo de conversión',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado - Crítico para optimización'
        },
        {
          name: 'Heatmaps',
          description: 'Mapas de calor de interacción',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Seguridad y Compliance',
      icon: <Lock className="h-5 w-5" />,
      weight: 10,
      items: [
        {
          name: 'Sistema de Auditoría',
          description: 'Logs completos de todas las acciones',
          status: 'complete',
          priority: 'critical',
          components: ['AuditLogs'],
          endpoints: ['/audit'],
          notes: 'Sistema de auditoría empresarial completo implementado'
        },
        {
          name: 'Verificación de Identidad',
          description: 'Sistema KYC para usuarios',
          status: 'complete',
          priority: 'high',
          components: ['IdentityVerification'],
          endpoints: ['/verification'],
          notes: 'Verificación de identidad implementada'
        },
        {
          name: 'Verificación de Edad',
          description: 'Age gate para productos restringidos',
          status: 'complete',
          priority: 'high',
          components: ['AgeVerification', 'DepartmentGuard'],
          notes: 'Gate de edad implementado'
        },
        {
          name: 'GDPR Compliance',
          description: 'Cumplimiento de GDPR',
          status: 'complete',
          priority: 'critical',
          notes: 'Implementado en sistema de auditoría'
        },
        {
          name: 'PCI DSS Compliance',
          description: 'Cumplimiento de estándares de pago',
          status: 'complete',
          priority: 'critical',
          notes: 'Implementado vía Plexo y tokenización'
        },
        {
          name: 'Data Encryption',
          description: 'Encriptación de datos sensibles',
          status: 'complete',
          priority: 'critical',
          notes: 'Supabase maneja encriptación en tránsito y reposo'
        },
        {
          name: 'Rate Limiting',
          description: 'Límites de solicitudes para prevenir abuso',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado - Importante para seguridad'
        },
        {
          name: 'IP Blacklisting',
          description: 'Bloqueo de IPs maliciosas',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'Security Scanning',
          description: 'Escaneo de vulnerabilidades',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        }
      ]
    },
    {
      category: 'Marketplace Second Hand',
      icon: <Package className="h-5 w-5" />,
      weight: 6,
      items: [
        {
          name: 'Marketplace de Usados',
          description: 'Plataforma C2C para productos de segunda mano',
          status: 'complete',
          priority: 'medium',
          components: ['SecondHandMain', 'SecondHandMarketplace', 'SecondHandAdmin'],
          endpoints: ['/secondhand'],
          notes: 'Marketplace completo con sistema de comisiones'
        },
        {
          name: 'Gestión de Listings',
          description: 'CRUD de publicaciones de usados',
          status: 'complete',
          priority: 'medium',
          components: ['SecondHandListingForm', 'SecondHandListingCard'],
          notes: 'Formularios y cards implementados'
        },
        {
          name: 'Panel de Vendedor',
          description: 'Dashboard para vendedores de usados',
          status: 'complete',
          priority: 'medium',
          components: ['SecondHandSeller'],
          notes: 'Panel con estadísticas implementado'
        },
        {
          name: 'Sistema de Valoraciones',
          description: 'Reviews entre compradores y vendedores',
          status: 'partial',
          priority: 'high',
          notes: 'Pendiente: Sistema completo de ratings bidireccionales'
        },
        {
          name: 'Sistema de Ofertas',
          description: 'Negociación de precios',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'Dispute Resolution',
          description: 'Resolución de disputas',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado - Importante para confianza'
        }
      ]
    },
    {
      category: 'Gestión de Departamentos',
      icon: <Settings className="h-5 w-5" />,
      weight: 5,
      items: [
        {
          name: 'Sistema de Departamentos',
          description: 'Gestión de categorías departamentales',
          status: 'complete',
          priority: 'critical',
          components: ['DepartmentManagement', 'DepartmentListManager'],
          endpoints: ['/departments'],
          notes: 'Sistema completo de departamentos dinámico'
        },
        {
          name: 'Configuración de Vistas',
          description: 'Personalización de vistas por departamento',
          status: 'complete',
          priority: 'medium',
          components: ['ViewConfiguration', 'DashboardConfig'],
          notes: 'Configuración de vistas implementada'
        },
        {
          name: 'Departamentos Restringidos',
          description: 'Departamentos con restricciones (edad, etc.)',
          status: 'complete',
          priority: 'high',
          components: ['DepartmentGuard', 'AgeVerification'],
          notes: 'Guards de departamento implementados'
        },
        {
          name: 'Mega Menu Dinámico',
          description: 'Menú de navegación generado dinámicamente',
          status: 'complete',
          priority: 'high',
          components: ['MegaMenu'],
          notes: 'Mega menú responsive implementado'
        }
      ]
    },
    {
      category: 'UX y Mobile',
      icon: <Eye className="h-5 w-5" />,
      weight: 8,
      items: [
        {
          name: 'Diseño Mobile-First',
          description: 'Responsive en todos los dispositivos',
          status: 'complete',
          priority: 'critical',
          notes: 'Todo el sitio es mobile-first con Tailwind'
        },
        {
          name: 'PWA Support',
          description: 'Soporte para Progressive Web App',
          status: 'missing',
          priority: 'high',
          notes: 'No implementado - Importante para experiencia móvil'
        },
        {
          name: 'Push Notifications',
          description: 'Notificaciones push',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado'
        },
        {
          name: 'Dark Mode',
          description: 'Modo oscuro',
          status: 'partial',
          priority: 'low',
          notes: 'Pendiente: Implementar toggle de tema'
        },
        {
          name: 'Accesibilidad (WCAG)',
          description: 'Cumplimiento de estándares de accesibilidad',
          status: 'partial',
          priority: 'medium',
          notes: 'Pendiente: Auditoría completa de accesibilidad'
        },
        {
          name: 'Multi-idioma',
          description: 'Soporte para múltiples idiomas',
          status: 'missing',
          priority: 'medium',
          notes: 'No implementado - Considerar i18n'
        },
        {
          name: 'Offline Mode',
          description: 'Funcionalidad offline',
          status: 'missing',
          priority: 'low',
          notes: 'No implementado'
        }
      ]
    }
  ];

  // Calcular puntuaciones
  useEffect(() => {
    calculateScores();
  }, []);

  const calculateScores = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const catScores: Record<string, number> = {};

    auditData.forEach((category) => {
      const { complete, partial, missing } = category.items.reduce(
        (acc, item) => {
          if (item.status === 'complete') acc.complete++;
          else if (item.status === 'partial') acc.partial++;
          else acc.missing++;
          return acc;
        },
        { complete: 0, partial: 0, missing: 0 }
      );

      const totalItems = complete + partial + missing;
      const categoryScore = ((complete + partial * 0.5) / totalItems) * 10;
      catScores[category.category] = categoryScore;

      totalWeightedScore += categoryScore * category.weight;
      totalWeight += category.weight;
    });

    const overallScore = totalWeightedScore / totalWeight;
    setOverallScore(overallScore);
    setCategoryScores(catScores);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      complete: 'default',
      partial: 'outline',
      missing: 'destructive',
    };
    const labels: Record<string, string> = {
      complete: 'Completo',
      partial: 'Parcial',
      missing: 'Faltante',
    };
    return (
      <Badge variant={variants[status]} className="ml-2">
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredData = auditData.map((category) => ({
    ...category,
    items: category.items.filter((item) => selectedFilter === 'all' || item.status === selectedFilter),
  }));

  const stats = auditData.reduce(
    (acc, category) => {
      category.items.forEach((item) => {
        acc.total++;
        if (item.status === 'complete') acc.complete++;
        else if (item.status === 'partial') acc.partial++;
        else acc.missing++;

        if (item.priority === 'critical' && item.status !== 'complete') acc.criticalPending++;
      });
      return acc;
    },
    { total: 0, complete: 0, partial: 0, missing: 0, criticalPending: 0 }
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Auditoría del Sistema ODDY Market</h1>
          <p className="text-muted-foreground mt-2">
            Análisis completo de funcionalidades implementadas y pendientes
          </p>
        </div>
        <Button onClick={calculateScores}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recalcular
        </Button>
      </div>

      {/* Score Principal */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Puntuación General del Sistema</span>
            <span className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(1)}/10
            </span>
          </CardTitle>
          <CardDescription>
            Tu sistema ha mejorado significativamente con las últimas implementaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallScore * 10} className="h-4 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Funcionalidades</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.complete}</div>
              <div className="text-sm text-muted-foreground">Completas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.partial}</div>
              <div className="text-sm text-muted-foreground">Parciales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.missing}</div>
              <div className="text-sm text-muted-foreground">Faltantes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.criticalPending}</div>
              <div className="text-sm text-muted-foreground">Críticas Pendientes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Importantes */}
      {stats.criticalPending > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atención: Funcionalidades Críticas Pendientes</AlertTitle>
          <AlertDescription>
            Hay {stats.criticalPending} funcionalidades críticas que requieren atención inmediata para alcanzar
            estándares de producción.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
            >
              Todas ({stats.total})
            </Button>
            <Button
              variant={selectedFilter === 'complete' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('complete')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completas ({stats.complete})
            </Button>
            <Button
              variant={selectedFilter === 'partial' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('partial')}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Parciales ({stats.partial})
            </Button>
            <Button
              variant={selectedFilter === 'missing' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('missing')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Faltantes ({stats.missing})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scores por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Puntuación por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {auditData.map((category) => (
              <Card key={category.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {category.icon}
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(categoryScores[category.category] || 0)}`}>
                    {(categoryScores[category.category] || 0).toFixed(1)}/10
                  </div>
                  <Progress value={(categoryScores[category.category] || 0) * 10} className="h-2 mt-2" />
                  <div className="text-xs text-muted-foreground mt-2">Peso: {category.weight}%</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalle por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {filteredData
              .filter((cat) => cat.items.length > 0)
              .map((category) => (
                <AccordionItem key={category.category} value={category.category}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      {category.icon}
                      <span className="font-semibold">{category.category}</span>
                      <Badge variant="outline" className="ml-auto mr-4">
                        {category.items.length} items
                      </Badge>
                      <span className={`text-lg font-bold ${getScoreColor(categoryScores[category.category] || 0)}`}>
                        {(categoryScores[category.category] || 0).toFixed(1)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 mt-4">
                      {category.items.map((item, idx) => (
                        <Card key={idx} className="border-l-4" style={{
                          borderLeftColor:
                            item.status === 'complete'
                              ? 'rgb(34, 197, 94)'
                              : item.status === 'partial'
                              ? 'rgb(234, 179, 8)'
                              : 'rgb(239, 68, 68)',
                        }}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}
                                <CardTitle className="text-base">{item.name}</CardTitle>
                                {getStatusBadge(item.status)}
                                {getPriorityBadge(item.priority)}
                              </div>
                            </div>
                            <CardDescription>{item.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {item.components && (
                              <div>
                                <div className="text-sm font-semibold mb-1">Componentes:</div>
                                <div className="flex flex-wrap gap-1">
                                  {item.components.map((comp, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {comp}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.endpoints && (
                              <div>
                                <div className="text-sm font-semibold mb-1">Endpoints:</div>
                                <div className="flex flex-wrap gap-1">
                                  {item.endpoints.map((endpoint, i) => (
                                    <Badge key={i} variant="outline" className="text-xs font-mono">
                                      {endpoint}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                <strong>Notas:</strong> {item.notes}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card className="border-2 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Próximos Pasos Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-bold">1</div>
              <div>
                <div className="font-semibold">Implementar 2FA para Administradores</div>
                <div className="text-sm text-muted-foreground">
                  Crítico para seguridad - Protección adicional para cuentas admin
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-orange-100 text-orange-800 rounded-full px-2 py-1 text-xs font-bold">2</div>
              <div>
                <div className="font-semibold">Integración con Carriers de Envío</div>
                <div className="text-sm text-muted-foreground">
                  Alto impacto - Automatización de etiquetas y tracking
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-orange-100 text-orange-800 rounded-full px-2 py-1 text-xs font-bold">3</div>
              <div>
                <div className="font-semibold">Google Shopping Feed</div>
                <div className="text-sm text-muted-foreground">
                  Alto impacto - Incrementará visibilidad y ventas significativamente
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-xs font-bold">4</div>
              <div>
                <div className="font-semibold">PWA Support</div>
                <div className="text-sm text-muted-foreground">
                  Mejora UX móvil - Instalación como app nativa
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-xs font-bold">5</div>
              <div>
                <div className="font-semibold">Rate Limiting y Fraud Detection</div>
                <div className="text-sm text-muted-foreground">
                  Seguridad adicional - Prevención de abuso y fraude
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-bold">6</div>
              <div>
                <div className="font-semibold">Sistema Completo de Reviews</div>
                <div className="text-sm text-muted-foreground">
                  Mejora conversión - Social proof y confianza
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
