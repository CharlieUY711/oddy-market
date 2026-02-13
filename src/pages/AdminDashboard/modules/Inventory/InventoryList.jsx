import React from 'react';
import { SharedModuleList } from '../SharedModuleList';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import styles from './Inventory.module.css';

export const InventoryList = () => {
  const renderCard = (item) => {
    const stockLevel = item.current_stock / (item.min_stock || 1);
    const getStockStatus = () => {
      if (stockLevel < 0.5) return { label: 'Crítico', color: '#f44336', icon: <AlertTriangle size={16} /> };
      if (stockLevel < 1) return { label: 'Bajo', color: '#ff9800', icon: <TrendingDown size={16} /> };
      return { label: 'Normal', color: '#4caf50', icon: <TrendingUp size={16} /> };
    };
    
    const status = getStockStatus();

    return (
      <div key={item.id} className={styles.inventoryCard}>
        <div className={styles.cardHeader}>
          <h3>{item.product_name || item.product_id}</h3>
          <span className={styles.badge} style={{ background: status.color }}>
            {status.icon}
            {status.label}
          </span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.stockInfo}>
            <div className={styles.stockItem}>
              <span className={styles.label}>Stock Actual:</span>
              <span className={styles.value}>{item.current_stock || 0}</span>
            </div>
            <div className={styles.stockItem}>
              <span className={styles.label}>Stock Mínimo:</span>
              <span className={styles.value}>{item.min_stock || 0}</span>
            </div>
            <div className={styles.stockItem}>
              <span className={styles.label}>Stock Máximo:</span>
              <span className={styles.value}>{item.max_stock || 0}</span>
            </div>
          </div>
          {item.last_movement && (
            <div className={styles.lastMovement}>
              <span>Último movimiento: {new Date(item.last_movement.date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <SharedModuleList
      endpoint="/inventory/stock"
      title="Inventario"
      icon="📦"
      renderCard={renderCard}
      viewMode="cards"
    />
  );
};
