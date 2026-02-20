import React from 'react';
import { HubView, HubCardDef, HubComingSoonItem } from '../HubView';
import type { MainSection } from '../../../AdminDashboard';
import {
  Settings, Sparkles, CreditCard, Truck, Plug, CheckSquare,
  Activity, Shield, BarChart2, Eye, Clock, BookOpen,
  Box, DollarSign, Monitor, Zap, TrendingUp,
} from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

export function SistemaView({ onNavigate }: Props) {
  const nav = (s: MainSection) => () => onNavigate(s);

  const cards: HubCardDef[] = [
    {
      id: 'diseno', icon: Sparkles, onClick: nav('diseno'),
      gradient: 'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)', color: '#FF6835',
      badge: 'UI · Visual', label: 'Diseño & Pruebas',
      description: 'Espacio de diseño y pruebas visuales. Módulos, departamentos, artículos y herramientas en vista previa.',
      stats: [{ icon: Monitor, value: '4', label: 'Vistas' }, { icon: Sparkles, value: '5', label: 'Paleta' }, { icon: Eye, value: '—', label: 'Previews' }],
    },
    {
      id: 'metodos-pago', icon: CreditCard, onClick: nav('metodos-pago'),
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: '#8B5CF6',
      badge: 'Pagos · Cobros', label: 'Métodos de Pago',
      description: 'Configuración de pasarelas, transferencias y formas de cobro habilitadas para el checkout.',
      stats: [{ icon: CreditCard, value: '—', label: 'Métodos' }, { icon: Zap, value: '—', label: 'Activos' }, { icon: TrendingUp, value: '—', label: 'Cobros/día' }],
    },
    {
      id: 'metodos-envio', icon: Truck, onClick: nav('metodos-envio'),
      gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: '#EC4899',
      badge: 'Envío · Zonas', label: 'Métodos de Envío',
      description: 'Configuración de zonas, tarifas y opciones de entrega habilitadas para los pedidos.',
      stats: [{ icon: Truck, value: '—', label: 'Métodos' }, { icon: Zap, value: '—', label: 'Activos' }, { icon: Shield, value: '—', label: 'Zonas' }],
    },
    {
      id: 'integraciones', icon: Plug, onClick: nav('integraciones'),
      gradient: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)', color: '#14B8A6',
      badge: 'Conectores', label: 'Integraciones',
      description: 'RRSS, Mercado Libre, pagos, logística y más. 65 proveedores disponibles en 6 módulos.',
      stats: [{ icon: Plug, value: '6', label: 'Módulos' }, { icon: Zap, value: '1', label: 'Conectadas' }, { icon: Shield, value: '65', label: 'Disponibles' }],
    },
    {
      id: 'checklist', icon: CheckSquare, onClick: nav('checklist'),
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#F59E0B',
      badge: 'Roadmap · Progreso', label: 'Checklist & Roadmap',
      description: 'Estado de todos los módulos y progreso de Charlie. Cola de ejecución y auditoría del manifest.',
      stats: [{ icon: CheckSquare, value: '—', label: 'Módulos' }, { icon: TrendingUp, value: '—', label: 'Progreso' }, { icon: Clock, value: '—', label: 'Pendientes' }],
    },
  ];

  const comingSoon: HubComingSoonItem[] = [
    { icon: Box,       label: 'Module Marketplace', desc: 'Módulos enterprise portables'          },
    { icon: Activity,  label: 'Diagnóstico Backend', desc: 'Estado de servicios backend'          },
    { icon: DollarSign,label: 'Gen. Presupuestos',   desc: 'Presupuestos para clientes'           },
    { icon: BookOpen,  label: 'Documentación',       desc: 'Manuales y guías técnicas'            },
    { icon: Shield,    label: 'Auditoría Sistema',   desc: 'Evaluación de funcionalidades'        },
    { icon: BarChart2, label: 'Analíticas',          desc: 'Reportes y métricas avanzadas'        },
    { icon: Eye,       label: 'Config Vistas',       desc: 'Permisos de visualización por rol'    },
  ];

  return (
    <HubView
      hubIcon={Settings}
      title="Sistema"
      subtitle="Configuración · Integraciones · Diseño · Auditoría · Roadmap"
      sections={[{ cards }]}
      comingSoon={comingSoon}
    />
  );
}
