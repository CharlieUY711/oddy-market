import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Check, Clock, AlertCircle, User } from 'lucide-react';
import styles from './CRM.module.css';

const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

export const TasksManagement = ({ searchTerm = '' }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'call',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    relatedTo: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/crm/tasks?entity_id=default`);
      
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      } else {
        setTasks(getMockTasks());
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks(getMockTasks());
    } finally {
      setLoading(false);
    }
  };

  const getMockTasks = () => [
    {
      id: 'task-1',
      title: 'Llamar a Ana Martínez',
      description: 'Seguimiento de propuesta enviada',
      type: 'call',
      priority: 'high',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: 'Juan Pérez',
      relatedTo: 'lead-1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Enviar email de seguimiento',
      description: 'Recordar reunión programada',
      type: 'email',
      priority: 'medium',
      status: 'in-progress',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: 'María García',
      relatedTo: 'lead-2',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const saveTask = async () => {
    if (!formData.title) {
      alert('El título es requerido');
      return;
    }

    try {
      const url = editingTask
        ? `${API_BASE}/crm/tasks/${editingTask.id}?entity_id=default`
        : `${API_BASE}/crm/tasks?entity_id=default`;

      const response = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        loadTasks();
        closeModal();
      } else {
        alert('Error al guardar tarea');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error al guardar tarea');
    }
  };

  const completeTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/crm/tasks/${id}/complete?entity_id=default`, {
        method: 'PUT',
      });

      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const deleteTask = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      const response = await fetch(`${API_BASE}/crm/tasks/${id}?entity_id=default`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'call',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
        assignedTo: task.assignedTo || '',
        relatedTo: task.relatedTo || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        type: 'call',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: '',
        relatedTo: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#f44336',
      high: '#ff9800',
      medium: '#ffc107',
      low: '#757575',
    };
    return colors[priority] || '#757575';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#4caf50',
      'in-progress': '#2196f3',
      cancelled: '#f44336',
      pending: '#757575',
    };
    return colors[status] || '#757575';
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = !searchTerm ||
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todayTasks = filteredTasks.filter(
    (task) => task.dueDate === new Date().toISOString().split('T')[0] && task.status !== 'completed'
  );
  const overdueTasks = filteredTasks.filter(
    (task) => new Date(task.dueDate) < new Date() && task.status !== 'completed'
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando tareas...</p>
      </div>
    );
  }

  return (
    <div className={styles.tasksContainer}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Para Hoy</div>
          <div className={styles.statValue} style={{ color: '#2196f3' }}>
            {todayTasks.length}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Atrasadas</div>
          <div className={styles.statValue} style={{ color: '#f44336' }}>
            {overdueTasks.length}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Completadas</div>
          <div className={styles.statValue} style={{ color: '#4caf50' }}>
            {filteredTasks.filter(t => t.status === 'completed').length}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Tareas</div>
          <div className={styles.statValue}>{filteredTasks.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in-progress">En Progreso</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <button className={styles.btnPrimary} onClick={() => openModal()}>
          <Plus size={18} />
          Nueva Tarea
        </button>
      </div>

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <div className={styles.alert}>
          <AlertCircle size={18} />
          <span>Tienes {overdueTasks.length} tarea(s) atrasada(s) que requieren atención.</span>
        </div>
      )}

      {/* Tasks List */}
      <div className={styles.tasksList}>
        {filteredTasks.map((task) => {
          const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
          const isToday = task.dueDate === new Date().toISOString().split('T')[0];

          return (
            <div
              key={task.id}
              className={`${styles.taskCard} ${isOverdue ? styles.taskOverdue : ''} ${isToday ? styles.taskToday : ''}`}
            >
              <div className={styles.taskCheckbox}>
                <button
                  onClick={() => completeTask(task.id)}
                  disabled={task.status === 'completed'}
                  className={styles.checkbox}
                  style={{
                    background: task.status === 'completed' ? '#4caf50' : 'transparent',
                    borderColor: task.status === 'completed' ? '#4caf50' : '#e0e0e0',
                  }}
                >
                  {task.status === 'completed' && <Check size={14} color="white" />}
                </button>
              </div>
              <div className={styles.taskContent}>
                <div className={styles.taskHeader}>
                  <h4
                    style={{
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      opacity: task.status === 'completed' ? 0.6 : 1,
                    }}
                  >
                    {task.title}
                  </h4>
                  <div className={styles.taskBadges}>
                    <span
                      className={styles.badge}
                      style={{ background: getPriorityColor(task.priority) }}
                    >
                      {task.priority === 'urgent' ? 'Urgente' : task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                    <span
                      className={styles.badge}
                      style={{ background: getStatusColor(task.status) }}
                    >
                      {task.status === 'completed' ? 'Completada' : task.status === 'in-progress' ? 'En Progreso' : task.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
                {task.description && (
                  <p className={styles.taskDescription}>{task.description}</p>
                )}
                <div className={styles.taskMeta}>
                  <span className={styles.taskDate}>
                    <Clock size={12} />
                    {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue && ' (Atrasada)'}
                    {isToday && ' (Hoy)'}
                  </span>
                  {task.assignedTo && (
                    <span className={styles.taskAssignee}>
                      <User size={12} />
                      {task.assignedTo}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.taskActions}>
                <button onClick={() => openModal(task)} className={styles.iconBtn}>
                  <Calendar size={14} />
                </button>
                <button onClick={() => deleteTask(task.id)} className={styles.iconBtn}>
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className={styles.emptyState}>
          <h3>No se encontraron tareas</h3>
          <p>Comienza creando tu primera tarea</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="call">Llamada</option>
                    <option value="meeting">Reunión</option>
                    <option value="email">Email</option>
                    <option value="follow-up">Seguimiento</option>
                    <option value="demo">Demo</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Asignado a</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Nombre del responsable"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeModal}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={saveTask}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
