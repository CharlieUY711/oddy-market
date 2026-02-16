import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, MapPin, Star, Tag } from 'lucide-react';
import styles from './CRM.module.css';

const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

export const CustomersManagement = ({ searchTerm = '' }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: 'Uruguay',
    category: 'Minorista',
    tags: [],
    notes: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/crm/customers?entity_id=default`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
      } else {
        setCustomers(getMockCustomers());
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers(getMockCustomers());
    } finally {
      setLoading(false);
    }
  };

  const getMockCustomers = () => [
    {
      id: 'cust-1',
      name: 'Juan Pérez',
      email: 'juan.perez@empresa.com',
      phone: '+598 99 111 222',
      company: 'Empresa ABC',
      address: 'Av. 18 de Julio 1234',
      city: 'Montevideo',
      country: 'Uruguay',
      category: 'VIP',
      tags: ['VIP', 'Frecuente'],
      score: 85,
      totalPurchases: 12,
      totalSpent: 450000,
      averageOrderValue: 37500,
      lastPurchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Cliente preferencial',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'cust-2',
      name: 'María González',
      email: 'maria.gonzalez@corp.com',
      phone: '+598 99 333 444',
      company: 'Corporación XYZ',
      address: 'Bvar. Artigas 5678',
      city: 'Montevideo',
      country: 'Uruguay',
      category: 'Mayorista',
      tags: ['Mayorista', 'Alto Valor'],
      score: 72,
      totalPurchases: 8,
      totalSpent: 320000,
      averageOrderValue: 40000,
      lastPurchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Negociaciones en curso',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const saveCustomer = async () => {
    if (!formData.name || !formData.email) {
      alert('Nombre y email son requeridos');
      return;
    }

    try {
      const url = editingCustomer
        ? `${API_BASE}/crm/customers/${editingCustomer.id}?entity_id=default`
        : `${API_BASE}/crm/customers?entity_id=default`;

      const response = await fetch(url, {
        method: editingCustomer ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        loadCustomers();
        closeModal();
      } else {
        alert('Error al guardar cliente');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error al guardar cliente');
    }
  };

  const deleteCustomer = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      const response = await fetch(`${API_BASE}/crm/customers/${id}?entity_id=default`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadCustomers();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || 'Uruguay',
        category: customer.category || 'Minorista',
        tags: customer.tags || [],
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        country: 'Uruguay',
        category: 'Minorista',
        tags: [],
        notes: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#2196f3';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  };

  const getCategoryColor = (category) => {
    const colors = {
      VIP: '#9c27b0',
      Mayorista: '#2196f3',
      Minorista: '#4caf50',
      Prospecto: '#757575',
    };
    return colors[category] || '#757575';
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = !searchTerm ||
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || customer.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter((c) => c.category === 'VIP').length,
    avgScore: customers.reduce((sum, c) => sum + (c.score || 0), 0) / (customers.length || 1),
    totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className={styles.customersContainer}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Clientes</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Clientes VIP</div>
          <div className={styles.statValue} style={{ color: '#9c27b0' }}>
            {stats.vip}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Score Promedio</div>
          <div className={styles.statValue}>{stats.avgScore.toFixed(0)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Ingresos Totales</div>
          <div className={styles.statValue} style={{ color: '#4caf50' }}>
            ${stats.totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Todas las categorías</option>
          <option value="VIP">VIP</option>
          <option value="Mayorista">Mayorista</option>
          <option value="Minorista">Minorista</option>
          <option value="Prospecto">Prospecto</option>
        </select>
        <button className={styles.btnPrimary} onClick={() => openModal()}>
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      {/* Customers Grid */}
      <div className={styles.customersGrid}>
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className={styles.customerCard}>
            <div className={styles.customerHeader}>
              <div className={styles.customerInfo}>
                <h4>{customer.name}</h4>
                {customer.company && <p className={styles.customerCompany}>{customer.company}</p>}
              </div>
              <div className={styles.customerActions}>
                <button onClick={() => openModal(customer)} className={styles.iconBtn}>
                  <Edit size={14} />
                </button>
                <button onClick={() => deleteCustomer(customer.id)} className={styles.iconBtn}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className={styles.customerBody}>
              <div className={styles.customerContact}>
                <Mail size={12} />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div className={styles.customerContact}>
                  <Phone size={12} />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.city && (
                <div className={styles.customerContact}>
                  <MapPin size={12} />
                  <span>{customer.city}, {customer.country}</span>
                </div>
              )}
            </div>
            <div className={styles.customerMeta}>
              <span
                className={styles.categoryBadge}
                style={{ background: getCategoryColor(customer.category) }}
              >
                {customer.category}
              </span>
              <div className={styles.scoreBadge}>
                <Star size={12} fill="#ffc107" />
                <span style={{ color: getScoreColor(customer.score || 0) }}>
                  {customer.score || 0}
                </span>
              </div>
            </div>
            {customer.tags && customer.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {customer.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className={styles.customerStats}>
              <div className={styles.customerStat}>
                <span className={styles.statLabel}>Compras</span>
                <span className={styles.statValue}>{customer.totalPurchases || 0}</span>
              </div>
              <div className={styles.customerStat}>
                <span className={styles.statLabel}>Total</span>
                <span className={styles.statValue} style={{ color: '#4caf50' }}>
                  ${(customer.totalSpent || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className={styles.emptyState}>
          <h3>No se encontraron clientes</h3>
          <p>Comienza creando tu primer cliente</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Empresa</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>País</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Prospecto">Prospecto</option>
                  <option value="Minorista">Minorista</option>
                  <option value="Mayorista">Mayorista</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeModal}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={saveCustomer}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
