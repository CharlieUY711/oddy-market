import React from 'react';
import { HubView, HubCardDef, HubComingSoonItem } from '../HubView';
import type { MainSection } from '../../../AdminDashboard';
import {
  Share2, ArrowLeftRight, TrendingUp, Users, MessageCircle,
  BarChart2, Instagram, Zap, Calendar, Eye,
} from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

export function RRSSHubView({ onNavigate }: Props) {
  const nav = (s: MainSection) => () => onNavigate(s);

  const cards: HubCardDef[] = [
    {
      id: 'redes-sociales', icon: Share2, onClick: nav('redes-sociales'),
      gradient: 'linear-gradient(135deg, #E1306C 0%, #833AB4 100%)', color: '#E1306C',
      badge: 'Centro de control', label: 'Centro Operativo RRSS',
      description: 'Gestión unificada de todas tus redes sociales. Métricas, programación de posts y análisis de audiencia.',
      stats: [
        { icon: Users,         value: '18.4k', label: 'Seguidores'  },
        { icon: TrendingUp,    value: '+12%',  label: 'Crecimiento' },
        { icon: MessageCircle, value: '342',   label: 'Menciones'   },
      ],
    },
    {
      id: 'migracion-rrss', icon: ArrowLeftRight, onClick: nav('migracion-rrss'),
      gradient: 'linear-gradient(135deg, #1877F2 0%, #0a4fa6 100%)', color: '#1877F2',
      badge: 'Herramienta', label: 'Migración de RRSS',
      description: 'Herramienta de rebranding y migración para Instagram y Facebook. Migrá tu audiencia entre cuentas con total seguridad.',
      stats: [
        { icon: Users,      value: '3',   label: 'Cuentas activas' },
        { icon: BarChart2,  value: '97%', label: 'Compatibilidad'  },
        { icon: TrendingUp, value: '0',   label: 'Pendientes'      },
      ],
    },
  ];

  const comingSoon: HubComingSoonItem[] = [
    { icon: Calendar,   label: 'Programador de posts', desc: 'Scheduleador multi-plataforma'        },
    { icon: Eye,        label: 'Social Listening',     desc: 'Monitoreo de menciones en tiempo real' },
    { icon: BarChart2,  label: 'Analytics unificado',  desc: 'Métricas de todas las redes en un panel' },
    { icon: Zap,        label: 'Auto-respuestas',      desc: 'Respuestas automáticas con IA'         },
  ];

  return (
    <HubView
      hubIcon={Share2}
      title="Redes Sociales"
      subtitle="Centro de operaciones y herramientas para tus RRSS"
      sections={[{ cards }]}
      comingSoon={comingSoon}
      comingSoonText="Programador de posts multi-plataforma, social listening en tiempo real, analytics unificado y auto-respuestas con IA."
    />
  );
}
