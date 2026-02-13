import React from 'react';
import { SharedModuleList } from '../SharedModuleList';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import styles from './Inventory.module.css';

export const InventoryList = () => {
  const getMockInventory = () => [
    {
      id: 'inv-mock-1',
      entity_id: 'default',
      product_id: 'art-001',
      product_name: 'Notebook Lenovo ThinkPad X1',
      current_stock: 15,
      min_stock: 5,
      max_stock: 50,
      warehouse: 'Almacén Principal',
      last_movement: { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'entrada', quantity: 10 }
    },
    {
      id: 'inv-mock-2',
      entity_id: 'default',
      product_id: 'art-002',
      product_name: 'Mouse Logitech MX Master 3',
      current_stock: 45,
      min_stock: 20,
      max_stock: 100,
      warehouse: 'Almacén Principal',
      last_movement: { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'salida', quantity: 5 }
    },
    {
      id: 'inv-mock-3',
      entity_id: 'default',
      product_id: 'art-003',
      product_name: 'Teclado Mecánico RGB Corsair',
      current_stock: 8,
      min_stock: 10,
      max_stock: 40,
      warehouse: 'Almacén Principal',
      last_movement: { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'salida', quantity: 2 }
    },
    {
      id: 'inv-mock-4',
      entity_id: 'default',
      product_id: 'art-004',
      product_name: 'Monitor Samsung 27" 4K UHD',
      current_stock: 5,
      min_stock: 3,
      max_stock: 20,
      warehouse: 'Almacén Principal',
      last_movement: { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'salida', quantity: 1 }
    },
    {
      id: 'inv-mock-5',
      entity_id: 'default',
      product_id: 'art-005',
      product_name: 'Webcam Logitech C920 HD Pro',
      current_stock: 22,
      min_stock: 15,
      max_stock: 60,
      warehouse: 'Almacén Principal',
      last_movement: { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), type: 'entrada', quantity: 20 }
    },
    {
      id: 'inv-mock-6',
      entity_id: 'default',
      product_id: 'art-006',
      product_name: 'Auriculares Sony WH-1000XM5',
      current_stock: 3,
      min_stock: 8,
      max_stock: 30,
      warehouse: 'Almacén Principal',
      last_movement: { date: new Date().toISOString(), type: 'salida', quantity: 5 }
    }
  ];

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
      mockData={getMockInventory()}
    />
  );
};
