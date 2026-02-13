import React from 'react';
import { SharedModuleList } from '../SharedModuleList';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import styles from './CRM.module.css';

export const CRMList = () => {
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
    />
  );
};
