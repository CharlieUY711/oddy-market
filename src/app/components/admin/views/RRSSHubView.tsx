/* =====================================================
   RRSSHubView — Hub de Redes Sociales
   ===================================================== */
import React from 'react';
import { Share2, ArrowLeftRight, TrendingUp, Users, MessageCircle, BarChart2 } from 'lucide-react';
import type { MainSection } from '../../../AdminDashboard';

const ORANGE = '#FF6835';

interface Props {
  onNavigate: (section: MainSection) => void;
}

const CARDS = [
  {
    id: 'redes-sociales' as MainSection,
    icon: Share2,
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #E1306C 0%, #833AB4 100%)',
    label: 'Centro Operativo RRSS',
    description: 'Gestión unificada de todas tus redes sociales. Métricas, programación de posts y análisis de audiencia.',
    stats: [
      { icon: Users,          value: '18.4k', label: 'Seguidores' },
      { icon: TrendingUp,     value: '+12%',  label: 'Crecimiento' },
      { icon: MessageCircle,  value: '342',   label: 'Menciones' },
    ],
    badge: 'Centro de control',
  },
  {
    id: 'migracion-rrss' as MainSection,
    icon: ArrowLeftRight,
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0a4fa6 100%)',
    label: 'Migración de RRSS',
    description: 'Herramienta de rebranding y migración para Instagram y Facebook. Migrá tu audiencia entre cuentas.',
    stats: [
      { icon: Users,      value: '3',    label: 'Cuentas activas' },
      { icon: BarChart2,  value: '97%',  label: 'Compatibilidad' },
      { icon: TrendingUp, value: '0',    label: 'Pendientes' },
    ],
    badge: 'Herramienta',
  },
];

export function RRSSHubView({ onNavigate }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '28px 32px 20px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #E9ECEF',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${ORANGE} 0%, #ff8c42 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Share2 size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1A1A2E' }}>
              Redes Sociales
            </h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6C757D' }}>
              Centro de operaciones y herramientas para tus RRSS
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

        {/* Subtitle */}
        <p style={{ fontSize: '0.9rem', color: '#6C757D', marginBottom: '28px', marginTop: 0 }}>
          Seleccioná un módulo para comenzar
        </p>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          maxWidth: '820px',
        }}>
          {CARDS.map(card => (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              style={{
                background: '#fff',
                border: '1px solid #E9ECEF',
                borderRadius: '16px',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = card.color;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E9ECEF';
              }}
            >
              {/* Card header with gradient */}
              <div style={{
                background: card.gradient,
                padding: '22px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <card.icon size={22} color="#fff" strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
                      {card.badge}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '1.05rem', color: '#fff', fontWeight: '800' }}>
                      {card.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '18px 24px 20px' }}>
                <p style={{ margin: '0 0 18px', fontSize: '0.84rem', color: '#6C757D', lineHeight: '1.5' }}>
                  {card.description}
                </p>

                {/* Stats row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  paddingTop: '14px',
                  borderTop: '1px solid #F0F0F0',
                }}>
                  {card.stats.map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <stat.icon size={14} color={card.color} style={{ marginBottom: '4px' }} />
                      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1A1A2E' }}>
                        {stat.value}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: '#ADB5BD' }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: card.color,
                }}>
                  Abrir módulo →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info footer */}
        <div style={{
          marginTop: '32px',
          padding: '16px 20px',
          backgroundColor: 'rgba(255,104,53,0.07)',
          borderRadius: '10px',
          border: '1px solid rgba(255,104,53,0.18)',
          maxWidth: '820px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <Share2 size={16} color={ORANGE} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '0.82rem', fontWeight: '700', color: ORANGE }}>
              Próximamente
            </p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#6C757D', lineHeight: '1.5' }}>
              Publicador de contenido multi-red, calendario editorial y análisis de sentimiento con IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
