import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, Award } from 'lucide-react';
import styles from './CRM.module.css';

const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

export const SalesAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/crm/analytics?range=${timeRange}&entity_id=default`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setAnalytics(getMockAnalytics());
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalytics = () => ({
    leads: {
      total: 150,
      byStage: { lead: 45, contacted: 35, qualified: 30, proposal: 20, negotiation: 15, won: 5 },
      totalValue: 3250000,
    },
    customers: {
      total: 120,
      byCategory: { VIP: 15, Mayorista: 25, Minorista: 70, Prospecto: 10 },
      totalRevenue: 2450000,
    },
    conversionRate: 24.5,
    averageDealValue: 13500,
    monthlyRevenue: [
      { month: 'Ene', revenue: 45000, leads: 30 },
      { month: 'Feb', revenue: 52000, leads: 35 },
      { month: 'Mar', revenue: 48000, leads: 28 },
      { month: 'Abr', revenue: 61000, leads: 40 },
      { month: 'May', revenue: 55000, leads: 32 },
      { month: 'Jun', revenue: 67000, leads: 45 },
    ],
    leadSources: [
      { name: 'Website', value: 40, color: '#fb923c' },
      { name: 'Referidos', value: 25, color: '#3b82f6' },
      { name: 'Redes Sociales', value: 20, color: '#8b5cf6' },
      { name: 'Email', value: 10, color: '#22c55e' },
      { name: 'Otros', value: 5, color: '#6b7280' },
    ],
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando analíticas...</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className={styles.analyticsContainer}>
      {/* Time Range Selector */}
      <div className={styles.timeRangeSelector}>
        <h3>Analíticas de Ventas</h3>
        <div className={styles.rangeButtons}>
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`${styles.rangeBtn} ${timeRange === range ? styles.rangeBtnActive : ''}`}
            >
              {range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : range === 'quarter' ? 'Trimestre' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#4caf50' }}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Ingresos del Mes</div>
            <div className={styles.statValue}>${analytics.monthlyRevenue?.[analytics.monthlyRevenue.length - 1]?.revenue?.toLocaleString() || '0'}</div>
            <div className={styles.statChange} style={{ color: '#4caf50' }}>+12%</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#2196f3' }}>
            <Target size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Nuevos Leads</div>
            <div className={styles.statValue}>{analytics.leads?.total || 0}</div>
            <div className={styles.statChange} style={{ color: '#2196f3' }}>+8%</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#9c27b0' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tasa de Conversión</div>
            <div className={styles.statValue}>{analytics.conversionRate || 0}%</div>
            <div className={styles.statChange} style={{ color: '#9c27b0' }}>+5%</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#ff9800' }}>
            <Award size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Ticket Promedio</div>
            <div className={styles.statValue}>${analytics.averageDealValue?.toLocaleString() || '0'}</div>
            <div className={styles.statChange}>Estable</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Monthly Revenue Chart */}
        <div className={styles.chartCard}>
          <h4>Ingresos Mensuales</h4>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartBars}>
              {analytics.monthlyRevenue?.map((month, idx) => (
                <div key={idx} className={styles.chartBarContainer}>
                  <div
                    className={styles.chartBar}
                    style={{
                      height: `${(month.revenue / 70000) * 100}%`,
                      background: '#ff6b35',
                    }}
                  >
                    <span className={styles.chartBarValue}>${(month.revenue / 1000).toFixed(0)}k</span>
                  </div>
                  <span className={styles.chartBarLabel}>{month.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Sources Chart */}
        <div className={styles.chartCard}>
          <h4>Fuentes de Leads</h4>
          <div className={styles.pieChart}>
            {analytics.leadSources?.map((source, idx) => (
              <div key={idx} className={styles.pieSegment}>
                <div
                  className={styles.pieSegmentBar}
                  style={{
                    width: `${source.value}%`,
                    background: source.color,
                  }}
                />
                <span className={styles.pieSegmentLabel}>
                  {source.name}: {source.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className={styles.chartCard}>
        <h4>Embudo de Conversión</h4>
        <div className={styles.funnel}>
          {Object.entries(analytics.leads?.byStage || {}).map(([stage, count], idx) => {
            const percentage = (count / analytics.leads.total) * 100;
            return (
              <div key={stage} className={styles.funnelStage}>
                <div className={styles.funnelStageHeader}>
                  <span className={styles.funnelStageLabel}>{stage}</span>
                  <span className={styles.funnelStageCount}>{count} leads</span>
                </div>
                <div
                  className={styles.funnelStageBar}
                  style={{
                    width: `${percentage}%`,
                    background: `hsl(${220 - idx * 20}, 70%, 50%)`,
                  }}
                />
                <span className={styles.funnelStagePercentage}>{percentage.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className={styles.chartCard}>
        <h4>Mejores Vendedores</h4>
        <div className={styles.performersTable}>
          <table>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Deals</th>
                <th>Ingresos</th>
                <th>Conversión</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Juan Pérez', deals: 12, revenue: 145000, conversion: 45 },
                { name: 'María García', deals: 10, revenue: 128000, conversion: 42 },
                { name: 'Carlos López', deals: 8, revenue: 95000, conversion: 38 },
              ].map((performer, idx) => (
                <tr key={idx}>
                  <td>
                    <div className={styles.performerRank}>{idx + 1}</div>
                    <span>{performer.name}</span>
                  </td>
                  <td>{performer.deals}</td>
                  <td className={styles.revenueCell}>${performer.revenue.toLocaleString()}</td>
                  <td>
                    <div className={styles.conversionBar}>
                      <div
                        className={styles.conversionBarFill}
                        style={{ width: `${performer.conversion}%` }}
                      />
                      <span>{performer.conversion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
