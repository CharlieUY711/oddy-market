/* =====================================================
   ODDY Market / Charlie Marketplace Builder v1.5
   AdminDashboard — Shell Principal
   ===================================================== */

import React, { useState } from 'react';
import { AdminSidebar }       from './components/admin/AdminSidebar';
import { DashboardView }      from './components/admin/views/DashboardView';
import { EcommerceView }      from './components/admin/views/EcommerceView';
import { MarketingView }      from './components/admin/views/MarketingView';
import { HerramientasView }   from './components/admin/views/HerramientasView';
import { QrGeneratorView }    from './components/admin/views/QrGeneratorView';
import { GestionView }        from './components/admin/views/GestionView';
import { SistemaView }        from './components/admin/views/SistemaView';
import { DisenoView }         from './components/admin/views/DisenoView';
import { ChecklistView }      from './components/admin/views/ChecklistView';
import { IntegracionesView }  from './components/admin/views/IntegracionesView';
import { MigracionRRSSView }  from './components/admin/views/MigracionRRSSView';
import { MailingView }        from './components/admin/views/MailingView';
import { GoogleAdsView }      from './components/admin/views/GoogleAdsView';
import { RuedaSorteosView }   from './components/admin/views/RuedaSorteosView';
import { FidelizacionView }   from './components/admin/views/FidelizacionView';
import { RedesSocialesView }  from './components/admin/views/RedesSocialesView';
import { RRSSHubView }        from './components/admin/views/RRSSHubView';
import { DepartamentosView }  from './components/admin/views/DepartamentosView';
import { SecondHandView }     from './components/admin/views/SecondHandView';
import { ERPInventarioView }  from './components/admin/views/ERPInventarioView';
import { ERPFacturacionView } from './components/admin/views/ERPFacturacionView';
import { ERPComprasView }     from './components/admin/views/ERPComprasView';
import { StorefrontAdminView } from './components/admin/views/StorefrontAdminView';
import { ERPCRMView }         from './components/admin/views/ERPCRMView';
import { ERPContabilidadView } from './components/admin/views/ERPContabilidadView';
import { ERPRRHHView }        from './components/admin/views/ERPRRHHView';
import { ProyectosView }      from './components/admin/views/ProyectosView';
import { PersonasView }       from './components/admin/views/PersonasView';
import { OrganizacionesView } from './components/admin/views/OrganizacionesView';
import { ClientesView }       from './components/admin/views/ClientesView';
import { PedidosView }        from './components/admin/views/PedidosView';
import { MetodosPagoView }    from './components/admin/views/MetodosPagoView';
import { MetodosEnvioView }   from './components/admin/views/MetodosEnvioView';
import { PagosView }          from './components/admin/views/PagosView';
import { EnviosView }         from './components/admin/views/EnviosView';
import { LogisticaView }      from './components/admin/views/LogisticaView';
import { EtiquetaEmotivaView } from './components/admin/views/EtiquetaEmotivaView';
import { Toaster } from 'sonner';

export type MainSection =
  | 'dashboard'
  | 'ecommerce'
  | 'marketing'
  | 'herramientas'
  | 'qr-generator'
  | 'gestion'
  | 'sistema'
  | 'diseno'
  | 'checklist'
  | 'integraciones'
  | 'migracion-rrss'
  | 'mailing'
  | 'google-ads'
  | 'rueda-sorteos'
  | 'fidelizacion'
  | 'redes-sociales'
  | 'rrss'
  | 'departamentos'
  | 'secondhand'
  | 'erp-inventario'
  | 'erp-facturacion'
  | 'erp-compras'
  | 'erp-crm'
  | 'erp-contabilidad'
  | 'erp-rrhh'
  | 'proyectos'
  | 'storefront'
  | 'personas'
  | 'organizaciones'
  | 'clientes'
  | 'pedidos'
  | 'metodos-pago'
  | 'metodos-envio'
  | 'pagos'
  | 'envios'
  | 'logistica'
  | 'etiqueta-emotiva'
  | 'roadmap';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<MainSection>('dashboard');
  const nav = (s: MainSection) => setActiveSection(s);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#F8F9FA', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }}>
        <AdminSidebar activeSection={activeSection} onNavigate={nav} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {activeSection === 'dashboard'       && <DashboardView      onNavigate={nav} />}
          {activeSection === 'ecommerce'       && <EcommerceView      onNavigate={nav} />}
          {activeSection === 'marketing'       && <MarketingView      onNavigate={nav} />}
          {activeSection === 'herramientas'    && <HerramientasView   onNavigate={nav} />}
          {activeSection === 'qr-generator'    && <QrGeneratorView    onNavigate={nav} />}
          {activeSection === 'gestion'         && <GestionView        onNavigate={nav} />}
          {activeSection === 'sistema'         && <SistemaView        onNavigate={nav} />}
          {activeSection === 'diseno'          && <DisenoView         onNavigate={nav} />}
          {activeSection === 'checklist'       && <ChecklistView      onNavigate={nav} />}
          {activeSection === 'roadmap'         && <ChecklistView      onNavigate={nav} />}
          {activeSection === 'integraciones'   && <IntegracionesView  onNavigate={nav} />}
          {activeSection === 'migracion-rrss'  && <MigracionRRSSView  onNavigate={nav} />}
          {activeSection === 'mailing'         && <MailingView        onNavigate={nav} />}
          {activeSection === 'google-ads'      && <GoogleAdsView      onNavigate={nav} />}
          {activeSection === 'rueda-sorteos'   && <RuedaSorteosView   onNavigate={nav} />}
          {activeSection === 'fidelizacion'    && <FidelizacionView   onNavigate={nav} />}
          {activeSection === 'redes-sociales'  && <RedesSocialesView  onNavigate={nav} />}
          {activeSection === 'rrss'            && <RRSSHubView          onNavigate={nav} />}
          {activeSection === 'departamentos'   && <DepartamentosView  onNavigate={nav} />}
          {activeSection === 'secondhand'      && <SecondHandView     onNavigate={nav} />}
          {activeSection === 'erp-inventario'  && <ERPInventarioView  onNavigate={nav} />}
          {activeSection === 'erp-facturacion' && <ERPFacturacionView onNavigate={nav} />}
          {activeSection === 'erp-compras'     && <ERPComprasView     onNavigate={nav} />}
          {activeSection === 'erp-crm'         && <ERPCRMView         onNavigate={nav} />}
          {activeSection === 'erp-contabilidad'&& <ERPContabilidadView onNavigate={nav} />}
          {activeSection === 'erp-rrhh'        && <ERPRRHHView        onNavigate={nav} />}
          {activeSection === 'proyectos'       && <ProyectosView      onNavigate={nav} />}
          {activeSection === 'storefront'      && <StorefrontAdminView onNavigate={nav} />}
          {activeSection === 'personas'        && <PersonasView        onNavigate={nav} />}
          {activeSection === 'organizaciones'  && <OrganizacionesView  onNavigate={nav} />}
          {activeSection === 'clientes'        && <ClientesView        onNavigate={nav} />}
          {activeSection === 'pedidos'         && <PedidosView         onNavigate={nav} />}
          {activeSection === 'metodos-pago'    && <MetodosPagoView     onNavigate={nav} />}
          {activeSection === 'metodos-envio'   && <MetodosEnvioView    onNavigate={nav} />}
          {activeSection === 'pagos'           && <PagosView           onNavigate={nav} />}
          {activeSection === 'envios'          && <EnviosView          onNavigate={nav} />}
          {activeSection === 'logistica'       && <LogisticaView       onNavigate={nav} />}
          {activeSection === 'etiqueta-emotiva'&& <EtiquetaEmotivaView onNavigate={nav} />}
        </main>
      </div>
    </>
  );
}