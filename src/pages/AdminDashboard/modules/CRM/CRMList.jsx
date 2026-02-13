import React from 'react';
import { SharedModuleList } from '../SharedModuleList';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import styles from './CRM.module.css';

export const CRMList = () => {
  const getMockCRM = () => [
    {
      id: 'crm-mock-1',
      entity_id: 'default',
      name: 'Ana Martínez',
      email: 'ana.martinez@empresa.com',
      phone: '+598 99 123 456',
      stage: 'lead',
      deal_value: 75000,
      source: 'website',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'crm-mock-2',
      entity_id: 'default',
      name: 'Roberto Silva',
      email: 'roberto.silva@tech.com',
      phone: '+598 99 234 567',
      stage: 'qualified',
      deal_value: 120000,
      source: 'referral',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'crm-mock-3',
      entity_id: 'default',
      name: 'Laura Fernández',
      email: 'laura.fernandez@startup.uy',
      phone: '+598 99 345 678',
      stage: 'proposal',
      deal_value: 250000,
      source: 'linkedin',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'crm-mock-4',
      entity_id: 'default',
      name: 'Diego Costa',
      email: 'diego.costa@corp.com',
      phone: '+598 99 456 789',
      stage: 'won',
      deal_value: 180000,
      source: 'event',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'crm-mock-5',
      entity_id: 'default',
      name: 'Sofía Ramírez',
      email: 'sofia.ramirez@innovate.uy',
      phone: '+598 99 567 890',
      stage: 'negotiation',
      deal_value: 95000,
      source: 'cold_call',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'crm-mock-6',
      entity_id: 'default',
      name: 'Pablo Méndez',
      email: 'pablo.mendez@solutions.com',
      phone: '+598 99 678 901',
      stage: 'lost',
      deal_value: 60000,
      source: 'email',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const renderCard = (item) => {
    const getStageColor = (stage) => {
      const colors = {
        lead: '#9c27b0',
        qualified: '#2196f3',
        proposal: '#ff9800',
        negotiation: '#fbc02d',
        won: '#4caf50',
        lost: '#f44336'
      };
      return colors[stage] || '#757575';
    };

    return (
      <div key={item.id} className={styles.crmCard}>
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>
            <User size={24} />
          </div>
          <div className={styles.headerInfo}>
            <h3>{item.name || item.email}</h3>
            <span 
              className={styles.stage}
              style={{ background: getStageColor(item.stage) }}
            >
              {item.stage || 'lead'}
            </span>
          </div>
        </div>
        <div className={styles.cardBody}>
          {item.email && (
            <div className={styles.contactItem}>
              <Mail size={16} />
              <span>{item.email}</span>
            </div>
          )}
          {item.phone && (
            <div className={styles.contactItem}>
              <Phone size={16} />
              <span>{item.phone}</span>
            </div>
          )}
          {item.created_at && (
            <div className={styles.contactItem}>
              <Calendar size={16} />
              <span>Creado: {new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        {item.deal_value && (
          <div className={styles.cardFooter}>
            <span className={styles.dealValue}>
              ${item.deal_value.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <SharedModuleList
      endpoint="/crm/leads"
      title="CRM"
      icon="👥"
      renderCard={renderCard}
      viewMode="cards"
      mockData={getMockCRM()}
    />
  );
};
