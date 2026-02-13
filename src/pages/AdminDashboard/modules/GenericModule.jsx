import React from 'react';
import { SharedModuleList } from './SharedModuleList';
import { FileText } from 'lucide-react';
import styles from './SharedModule.module.css';

/**
 * Módulo Genérico para visualizar cualquier endpoint del backend
 * Se puede usar para todos los módulos restantes
 */
export const GenericModule = ({ 
  endpoint, 
  title, 
  icon = '📦',
  description = 'Gestión de elementos'
}) => {
  const renderCard = (item) => {
    return (
      <div key={item.id} className={styles.card}>
        <div className={styles.cardHeader}>
          <FileText size={24} />
          <h3>{item.name || item.title || item.id?.slice(0, 12)}</h3>
        </div>
        <div className={styles.cardBody}>
          {item.description && (
            <p className={styles.description}>{item.description}</p>
          )}
          {item.status && (
            <span className={styles.badge}>{item.status}</span>
          )}
          {item.created_at && (
            <span className={styles.date}>
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={styles.moduleHeader}>
        <p className={styles.description}>{description}</p>
      </div>
      <SharedModuleList
        endpoint={endpoint}
        title={title}
        icon={icon}
        renderCard={renderCard}
        viewMode="cards"
      />
    </div>
  );
};

// Exportar módulos específicos
export const LibraryModule = () => (
  <GenericModule
    endpoint="/library/files"
    title="Biblioteca"
    icon="📁"
    description="Gestión de archivos e imágenes centralizados"
  />
);

export const ShippingModule = () => (
  <GenericModule
    endpoint="/shipments"
    title="Envíos"
    icon="🚚"
    description="Tracking en tiempo real de envíos y logística"
  />
);

export const MailingModule = () => (
  <GenericModule
    endpoint="/mailing/campaigns"
    title="Campañas de Email"
    icon="📧"
    description="Email marketing con Resend"
  />
);

export const SocialModule = () => (
  <GenericModule
    endpoint="/social/posts"
    title="Redes Sociales"
    icon="📱"
    description="Publicaciones en Meta, Instagram, WhatsApp"
  />
);

export const WheelModule = () => (
  <GenericModule
    endpoint="/wheel/games"
    title="Ruleta de Premios"
    icon="🎡"
    description="Gamificación y engagement"
  />
);

export const CouponsModule = () => (
  <GenericModule
    endpoint="/cart/coupons"
    title="Cupones"
    icon="🎟️"
    description="Descuentos y promociones"
  />
);

export const BillingModule = () => (
  <GenericModule
    endpoint="/billing/invoices"
    title="Facturación"
    icon="💰"
    description="Emisión de facturas y remitos"
  />
);

export const UsersModule = () => (
  <GenericModule
    endpoint="/users"
    title="Usuarios"
    icon="👥"
    description="Gestión de usuarios, roles y permisos"
  />
);

export const AuditModule = () => (
  <GenericModule
    endpoint="/audit/logs"
    title="Auditoría"
    icon="🔍"
    description="Historial de acciones del sistema"
  />
);

export const AnalyticsModule = () => (
  <GenericModule
    endpoint="/analytics/dashboard"
    title="Analíticas"
    icon="📊"
    description="Reportes avanzados y métricas"
  />
);

export const IntegrationsModule = () => (
  <GenericModule
    endpoint="/integrations/sync"
    title="Integraciones"
    icon="🔌"
    description="ML, RRSS, Pagos y más"
  />
);

export const DocumentsModule = () => (
  <GenericModule
    endpoint="/documents/list"
    title="Documentos"
    icon="📄"
    description="Generador de facturas, contratos y más con IA"
  />
);

export const ERPModule = () => (
  <GenericModule
    endpoint="/erp/dashboard"
    title="ERP"
    icon="🏢"
    description="Sistema completo de gestión empresarial"
  />
);

export const PurchaseModule = () => (
  <GenericModule
    endpoint="/provider/purchase-orders"
    title="Órdenes de Compra"
    icon="🛒"
    description="Gestión de compras a proveedores"
  />
);
