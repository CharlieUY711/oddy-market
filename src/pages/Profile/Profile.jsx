import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay usuario, redirigir al login
    if (!user) {
      navigate('/login');
      return;
    }

    // Cargar órdenes del usuario (mock por ahora)
    // TODO: Conectar con backend API
    setOrders([]);
    setLoading(false);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className={styles.userInfo}>
          <h1>{user?.name || 'Usuario'}</h1>
          <p className={styles.email}>{user?.email}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Mi Información</h2>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Nombre:</span>
              <span className={styles.value}>{user?.name || 'No disponible'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user?.email || 'No disponible'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Teléfono:</span>
              <span className={styles.value}>{user?.phone || 'No configurado'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Dirección:</span>
              <span className={styles.value}>{user?.address || 'No configurada'}</span>
            </div>
          </div>
          <button className={styles.editButton}>Editar Información</button>
        </div>

        <div className={styles.section}>
          <h2>Mis Pedidos</h2>
          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No tienes pedidos aún</p>
              <button 
                className={styles.shopButton}
                onClick={() => navigate('/products')}
              >
                Comenzar a Comprar
              </button>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>Pedido #{order.id}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                  </div>
                  <div className={styles.orderStatus}>{order.status}</div>
                  <div className={styles.orderTotal}>${order.total}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2>Configuración de Cuenta</h2>
          <div className={styles.actions}>
            <button className={styles.actionButton}>Cambiar Contraseña</button>
            <button className={styles.actionButton}>Preferencias de Notificaciones</button>
            <button 
              className={`${styles.actionButton} ${styles.dangerButton}`}
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
