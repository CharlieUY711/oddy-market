import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowRight, Mail, Phone } from 'lucide-react';
import styles from './CRM.module.css';

const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

const STAGES = [
  { id: 'lead', label: 'Lead', color: '#9c27b0' },
  { id: 'contacted', label: 'Contactado', color: '#2196f3' },
  { id: 'qualified', label: 'Calificado', color: '#4caf50' },
  { id: 'proposal', label: 'Propuesta', color: '#ff9800' },
  { id: 'negotiation', label: 'Negociación', color: '#fbc02d' },
  { id: 'won', label: 'Ganado', color: '#4caf50' },
  { id: 'lost', label: 'Perdido', color: '#f44336' },
];

export const PipelineBoard = ({ searchTerm = '' }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    value: 0,
    stage: 'lead',
    priority: 'medium',
    source: '',
    notes: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/crm/leads?entity_id=default`);
      
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data.leads) ? data.leads : []);
      } else {
        setLeads(getMockLeads());
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads(getMockLeads());
    } finally {
      setLoading(false);
    }
  };

  const getMockLeads = () => [
    {
      id: 'lead-1',
      name: 'Ana Martínez',
      email: 'ana.martinez@empresa.com',
      phone: '+598 99 123 456',
      company: 'Tech Solutions',
      value: 75000,
      stage: 'lead',
      priority: 'high',
      source: 'website',
      notes: 'Interesado en solución empresarial',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'lead-2',
      name: 'Roberto Silva',
      email: 'roberto.silva@tech.com',
      phone: '+598 99 234 567',
      company: 'Digital Corp',
      value: 120000,
      stage: 'qualified',
      priority: 'medium',
      source: 'referral',
      notes: 'Cliente potencial de alto valor',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'lead-3',
      name: 'Laura Fernández',
      email: 'laura.fernandez@startup.uy',
      phone: '+598 99 345 678',
      company: 'StartupUY',
      value: 250000,
      stage: 'proposal',
      priority: 'high',
      source: 'linkedin',
      notes: 'Reunión programada para próxima semana',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const saveLead = async () => {
    if (!formData.name || !formData.email) {
      alert('Nombre y email son requeridos');
      return;
    }

    try {
      const url = editingLead
        ? `${API_BASE}/crm/leads/${editingLead.id}?entity_id=default`
        : `${API_BASE}/crm/leads?entity_id=default`;

      const response = await fetch(url, {
        method: editingLead ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        loadLeads();
        closeModal();
      } else {
        alert('Error al guardar lead');
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Error al guardar lead');
    }
  };

  const deleteLead = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;

    try {
      const response = await fetch(`${API_BASE}/crm/leads/${id}?entity_id=default`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadLeads();
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const updateStage = async (leadId, newStage) => {
    try {
      const response = await fetch(`${API_BASE}/crm/leads/${leadId}/stage?entity_id=default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (response.ok) {
        loadLeads();
      }
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const openModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        value: lead.value || 0,
        stage: lead.stage || 'lead',
        priority: lead.priority || 'medium',
        source: lead.source || '',
        notes: lead.notes || '',
      });
    } else {
      setEditingLead(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        value: 0,
        stage: 'lead',
        priority: 'medium',
        source: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLead(null);
  };

  const getLeadsByStage = (stageId) => {
    return leads.filter((lead) => {
      const matchesStage = lead.stage === stageId;
      const matchesSearch = !searchTerm || 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStage && matchesSearch;
    });
  };

  const getTotalValue = (stageLeads) => {
    return stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando pipeline...</p>
      </div>
    );
  }

  return (
    <div className={styles.pipelineContainer}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Leads</div>
          <div className={styles.statValue}>{leads.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>En Pipeline</div>
          <div className={styles.statValue}>
            ${getTotalValue(leads.filter(l => !['won', 'lost'].includes(l.stage))).toLocaleString()}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Ganados</div>
          <div className={styles.statValue} style={{ color: '#4caf50' }}>
            ${getTotalValue(leads.filter(l => l.stage === 'won')).toLocaleString()}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tasa Conversión</div>
          <div className={styles.statValue}>
            {leads.length > 0
              ? ((leads.filter(l => l.stage === 'won').length / leads.length) * 100).toFixed(1)
              : 0}%
          </div>
        </div>
      </div>

      {/* Add Lead Button */}
      <div className={styles.actionBar}>
        <button className={styles.btnPrimary} onClick={() => openModal()}>
          <Plus size={18} />
          Nuevo Lead
        </button>
      </div>

      {/* Pipeline Board */}
      <div className={styles.pipelineBoard}>
        {STAGES.filter(s => !['won', 'lost'].includes(s.id)).map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          const stageValue = getTotalValue(stageLeads);

          return (
            <div key={stage.id} className={styles.pipelineColumn}>
              <div className={styles.columnHeader}>
                <h3>{stage.label}</h3>
                <span className={styles.columnCount}>
                  {stageLeads.length} · ${stageValue.toLocaleString()}
                </span>
              </div>
              <div className={styles.columnContent}>
                {stageLeads.map((lead) => (
                  <div key={lead.id} className={styles.leadCard}>
                    <div className={styles.leadHeader}>
                      <div className={styles.leadInfo}>
                        <h4>{lead.name}</h4>
                        {lead.company && <p className={styles.leadCompany}>{lead.company}</p>}
                      </div>
                      <div className={styles.leadActions}>
                        <button onClick={() => openModal(lead)} className={styles.iconBtn}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => deleteLead(lead.id)} className={styles.iconBtn}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.leadBody}>
                      <div className={styles.leadContact}>
                        <Mail size={12} />
                        <span>{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className={styles.leadContact}>
                          <Phone size={12} />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.leadFooter}>
                      <span className={styles.leadValue}>
                        ${(lead.value || 0).toLocaleString()}
                      </span>
                      {stage.id !== 'won' && stage.id !== 'lost' && (
                        <button
                          className={styles.moveBtn}
                          onClick={() => {
                            const currentIndex = STAGES.findIndex(s => s.id === stage.id);
                            const nextStage = STAGES[currentIndex + 1];
                            if (nextStage) updateStage(lead.id, nextStage.id);
                          }}
                        >
                          Siguiente <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className={styles.emptyColumn}>No hay leads en esta etapa</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Won/Lost Section */}
      <div className={styles.closedSection}>
        {STAGES.filter(s => ['won', 'lost'].includes(s.id)).map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          return (
            <div key={stage.id} className={styles.closedCard}>
              <div className={styles.closedHeader}>
                <h3>{stage.label}</h3>
                <span>{stageLeads.length} leads</span>
              </div>
              <div className={styles.closedList}>
                {stageLeads.map((lead) => (
                  <div key={lead.id} className={styles.closedItem}>
                    <div>
                      <strong>{lead.name}</strong>
                      <p>{lead.company}</p>
                    </div>
                    <span className={styles.closedValue}>
                      ${(lead.value || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className={styles.emptyClosed}>No hay leads {stage.id === 'won' ? 'ganados' : 'perdidos'}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingLead ? 'Editar Lead' : 'Nuevo Lead'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nombre *</label>
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
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Valor Potencial ($)</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Etapa</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Fuente</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="Ej: Web, Referido, Evento..."
                  />
                </div>
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
              <button className={styles.btnPrimary} onClick={saveLead}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
