import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Package, Clock, CheckCircle, XCircle, TruckIcon } from 'lucide-react';
import styles from './Orders.module.css';

export const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/orders?entity_id=default`);
      const data = await response.json();
      
      let ordersData = Array.isArray(data) ? data : [];
      
      // Si no hay datos del backend, usar datos mock
      if (ordersData.length === 0) {
        ordersData = getMockOrders();
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const getMockOrders = () => [
    {
      id: 'order-mock-1',
      entity_id: 'default',
      customer: {
        email: 'juan.perez@example.com',
        name: 'Juan Pérez'
      },
      items: [
        { product_id: 'art-001', name: 'Notebook Lenovo ThinkPad', quantity: 1, price: 45000 }
      ],
      totals: {
        subtotal: 45000,
        tax: 9450,
        shipping: 0,
        discount: 0,
        grand_total: 54450
      },
      status: 'pending',
      tracking_number: 'ODYK7H3MP',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-mock-2',
      entity_id: 'default',
      customer: {
        email: 'maria.gonzalez@example.com',
        name: 'María González'
      },
      items: [
        { product_id: 'art-002', name: 'Mouse Logitech MX Master', quantity: 2, price: 8500 },
        { product_id: 'art-003', name: 'Teclado Mecánico RGB', quantity: 1, price: 12000 }
      ],
      totals: {
        subtotal: 29000,
        tax: 6090,
        shipping: 500,
        discount: 0,
        grand_total: 35590
      },
      status: 'processing',
      tracking_number: 'ODYM9K4LT',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-mock-3',
      entity_id: 'default',
      customer: {
        email: 'carlos.rodriguez@example.com',
        name: 'Carlos Rodríguez'
      },
      items: [
        { product_id: 'art-004', name: 'Monitor Samsung 27" 4K', quantity: 1, price: 32000 }
      ],
      totals: {
        subtotal: 32000,
        tax: 6720,
        shipping: 800,
        discount: 1600,
        grand_total: 37920
      },
      status: 'shipped',
      tracking_number: 'ODYP5N8QW',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-mock-4',
      entity_id: 'default',
      customer: {
        email: 'ana.martinez@example.com',
        name: 'Ana Martínez'
      },
      items: [
        { product_id: 'art-005', name: 'Webcam Logitech C920', quantity: 3, price: 6500 }
      ],
      totals: {
        subtotal: 19500,
        tax: 4095,
        shipping: 500,
        discount: 0,
        grand_total: 24095
      },
      status: 'delivered',
      tracking_number: 'ODYR2X6VB',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-mock-5',
      entity_id: 'default',
      customer: {
        email: 'diego.costa@example.com',
        name: 'Diego Costa'
      },
      items: [
        { product_id: 'art-006', name: 'Auriculares Sony WH-1000XM5', quantity: 1, price: 18500 }
      ],
      totals: {
        subtotal: 18500,
        tax: 3885,
        shipping: 0,
        discount: 925,
        grand_total: 21460
      },
      status: 'cancelled',
      tracking_number: 'ODYS8T3NJ',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pendiente', icon: <Clock size={16} />, color: '#ff9800' },
      processing: { label: 'Procesando', icon: <Package size={16} />, color: '#2196f3' },
      shipped: { label: 'Enviado', icon: <TruckIcon size={16} />, color: '#9c27b0' },
      delivered: { label: 'Entregado', icon: <CheckCircle size={16} />, color: '#4caf50' },
      cancelled: { label: 'Cancelado', icon: <XCircle size={16} />, color: '#f44336' }
    };
    return configs[status] || configs.pending;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-UY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>🛍️ Pedidos</h1>
          <p className={styles.subtitle}>{filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por ID, email o tracking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              className={`${styles.filterBtn} ${statusFilter === status ? styles.active : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'Todos' : getStatusConfig(status).label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={64} color="#bdbdbd" />
          <h3>No hay pedidos</h3>
          <p>Los pedidos aparecerán aquí</p>
        </div>
      ) : (
        <div className={styles.ordersTable}>
          {filteredOrders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>#{order.id?.slice(6, 12).toUpperCase()}</span>
                    <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className={styles.orderStatus} style={{ color: statusConfig.color }}>
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.orderCustomer}>
                    <strong>Cliente:</strong> {order.customer?.email || order.customer?.name || 'N/A'}
                  </div>
                  <div className={styles.orderItems}>
                    <strong>Items:</strong> {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
                  </div>
                  {order.tracking_number && (
                    <div className={styles.orderTracking}>
                      <strong>Tracking:</strong> {order.tracking_number}
                    </div>
                  )}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderTotal}>
                    <strong>Total:</strong>
                    <span className={styles.amount}>{formatCurrency(order.totals?.grand_total)}</span>
                  </div>
                  <button
                    className={styles.btnView}
                    onClick={() => navigate(`/admin-dashboard/ecommerce/orders/${order.id}`)}
                  >
                    <Eye size={16} />
                    Ver Detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
