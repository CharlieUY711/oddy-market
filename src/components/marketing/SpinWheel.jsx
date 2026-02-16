import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { wheelService } from '../../services/wheelService';
import { getCurrentUser } from '../../utils/supabase';
import styles from './SpinWheel.module.css';

// Iconos simples (emojis)
const Icons = {
  Target: '🎯',
  Plus: '+',
  Play: '▶',
  Settings: '⚙',
  Trash: '🗑',
  Edit: '✏',
  Save: '💾',
  TrendingUp: '📈',
  Mail: '✉',
  MessageCircle: '💬',
  ShoppingCart: '🛒',
  Gift: '🎁',
  Percent: '%',
  Truck: '🚚',
  Award: '🏆',
  XCircle: '❌',
};

const prizeTypeLabels = {
  discount_percentage: 'Descuento %',
  discount_fixed: 'Descuento Fijo',
  free_shipping: 'Envío Gratis',
  free_product: 'Producto Gratis',
  add_to_cart: 'Agregar al Carrito',
  loyalty_points: 'Puntos de Lealtad',
  coupon_code: 'Código de Cupón',
  no_prize: 'Sin Premio',
};

export function SpinWheel({ mode = 'admin', wheelId, onSpinComplete }) {
  const { success, error, info } = useNotifications();
  const [configs, setConfigs] = useState([]);
  const [activeConfig, setActiveConfig] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const canvasRef = useRef(null);

  const defaultPrizes = [
    {
      id: '1',
      label: '10% OFF',
      color: '#FF6B6B',
      probability: 30,
      type: 'discount_percentage',
      value: 10,
      sendEmail: true,
      expiryDays: 7,
      description: '10% de descuento en tu próxima compra',
    },
    {
      id: '2',
      label: '20% OFF',
      color: '#4ECDC4',
      probability: 20,
      type: 'discount_percentage',
      value: 20,
      sendEmail: true,
      expiryDays: 7,
      description: '20% de descuento en tu próxima compra',
    },
    {
      id: '3',
      label: 'Envío Gratis',
      color: '#FFE66D',
      probability: 25,
      type: 'free_shipping',
      sendEmail: true,
      expiryDays: 14,
      description: 'Envío gratis en tu próxima compra',
    },
    {
      id: '4',
      label: '30% OFF',
      color: '#95E1D3',
      probability: 10,
      type: 'discount_percentage',
      value: 30,
      sendEmail: true,
      sendWhatsApp: true,
      expiryDays: 5,
      description: '30% de descuento en tu próxima compra',
    },
    {
      id: '5',
      label: 'Inténtalo otra vez',
      color: '#F38181',
      probability: 10,
      type: 'no_prize',
      description: 'Mejor suerte la próxima vez',
    },
    {
      id: '6',
      label: '50% OFF',
      color: '#AA96DA',
      probability: 5,
      type: 'discount_percentage',
      value: 50,
      sendEmail: true,
      sendWhatsApp: true,
      shareOnSocial: true,
      expiryDays: 3,
      description: '50% de descuento en tu próxima compra - ¡Premio especial!',
    },
  ];

  useEffect(() => {
    loadUser();
    if (mode === 'admin') {
      loadConfigs();
    } else if (mode === 'public') {
      loadActiveWheel();
    }
  }, [mode, wheelId]);

  useEffect(() => {
    if (activeConfig) {
      drawWheel();
    }
  }, [activeConfig, rotation]);

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error loading user:', err);
    }
  }

  async function loadConfigs() {
    try {
      const data = await wheelService.getConfigs();
      setConfigs(data.wheels || []);
      if (data.wheels?.length > 0 && !activeConfig) {
        setActiveConfig(data.wheels[0]);
      }
    } catch (err) {
      console.error('Error loading wheel configs:', err);
      error('Error al cargar configuraciones de rueda');
    }
  }

  async function loadActiveWheel() {
    try {
      const data = await wheelService.getActive();
      if (data.wheel) {
        setActiveConfig(data.wheel);
      } else if (wheelId) {
        const configsData = await wheelService.getConfigs();
        const wheel = configsData.wheels?.find((w) => w.id === wheelId);
        if (wheel) {
          setActiveConfig(wheel);
        }
      }
    } catch (err) {
      console.error('Error loading active wheel:', err);
      error('Error al cargar la rueda');
    }
  }

  async function saveConfig(config) {
    try {
      const totalProb = config.prizes.reduce((sum, p) => sum + (p.probability || 0), 0);
      if (Math.abs(totalProb - 100) > 0.1) {
        error(`Las probabilidades deben sumar 100% (actual: ${totalProb.toFixed(1)}%)`);
        return;
      }

      await wheelService.saveConfig(config);
      success('Configuración guardada');
      await loadConfigs();
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving wheel config:', err);
      error(err.message || 'Error al guardar configuración');
    }
  }

  async function loadStats(wheelId) {
    try {
      const data = await wheelService.getStats(wheelId);
      setStats(data.stats);
      setShowStats(true);
    } catch (err) {
      console.error('Error loading stats:', err);
      error('Error cargando estadísticas');
    }
  }

  function drawWheel() {
    const canvas = canvasRef.current;
    if (!canvas || !activeConfig) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalSegments = activeConfig.prizes.length;
    const anglePerSegment = (2 * Math.PI) / totalSegments;

    activeConfig.prizes.forEach((prize, index) => {
      const startAngle = index * anglePerSegment + (rotation * Math.PI) / 180;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(prize.label, radius * 0.65, 5);
      ctx.font = '10px Arial';
      ctx.fillText(`${prize.probability}%`, radius * 0.65, 20);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - 15, 10);
    ctx.lineTo(centerX + 15, 10);
    ctx.lineTo(centerX, 40);
    ctx.closePath();
    ctx.fillStyle = '#FF6B35';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  async function handleSpin() {
    if (isSpinning || !activeConfig) return;

    if (activeConfig.requireEmail && !email && !user?.email) {
      setShowEmailModal(true);
      return;
    }

    if (activeConfig.requireLogin && !user) {
      error('Se requiere iniciar sesión para girar');
      return;
    }

    setIsSpinning(true);
    setWinner(null);

    try {
      const sessionId = localStorage.getItem('oddy_session_id') || 
                       `session_${Date.now()}_${Math.random()}`;
      if (!localStorage.getItem('oddy_session_id')) {
        localStorage.setItem('oddy_session_id', sessionId);
      }

      const data = await wheelService.spin(activeConfig.id, {
        userId: user?.id,
        email: email || user?.email,
        sessionId,
      });

      const winningPrize = data.prize;
      const prizeIndex = activeConfig.prizes.findIndex((p) => p.id === winningPrize.id);
      const anglePerSegment = 360 / activeConfig.prizes.length;
      const winningAngle = prizeIndex * anglePerSegment;
      const randomOffset = Math.random() * anglePerSegment * 0.8;
      const totalRotation = 360 * 5 + (360 - winningAngle) + randomOffset;

      setRotation(totalRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setWinner(winningPrize);
        
        let message = `¡Ganaste: ${winningPrize.label}!`;
        if (winningPrize.couponCode) {
          message += ` Código: ${winningPrize.couponCode}`;
        }
        success(message);

        if (activeConfig.showConfetti) {
          showConfetti();
        }

        if (onSpinComplete) {
          onSpinComplete(winningPrize);
        }
      }, activeConfig.spinDuration);
    } catch (err) {
      console.error('Error spinning wheel:', err);
      error(err.message || 'Error al girar la rueda');
      setIsSpinning(false);
    }
  }

  function showConfetti() {
    const confetti = document.createElement('div');
    confetti.className = styles.confetti;
    document.body.appendChild(confetti);
    setTimeout(() => {
      if (document.body.contains(confetti)) {
        document.body.removeChild(confetti);
      }
    }, 3000);
  }

  function createNewWheel() {
    const newWheel = {
      id: `wheel_config:${Date.now()}`,
      name: 'Nueva Rueda',
      prizes: defaultPrizes,
      spinDuration: 3000,
      showConfetti: true,
      requireEmail: true,
      requireLogin: false,
      enableEmailNotifications: true,
      enableWhatsAppNotifications: false,
      enableSocialSharing: true,
      active: false,
    };
    setActiveConfig(newWheel);
    setIsEditing(true);
  }

  function updatePrize(id, field, value) {
    if (!activeConfig) return;
    setActiveConfig({
      ...activeConfig,
      prizes: activeConfig.prizes.map((prize) =>
        prize.id === id ? { ...prize, [field]: value } : prize
      ),
    });
  }

  function addPrize() {
    if (!activeConfig) return;
    const currentTotal = activeConfig.prizes.reduce((sum, p) => sum + (p.probability || 0), 0);
    const suggestedProbability = Math.max(1, Math.min(20, Math.floor((100 - currentTotal) / 2)));

    const newPrize = {
      id: `prize_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: 'Nuevo Premio',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      probability: suggestedProbability,
      type: 'discount_percentage',
      value: 10,
      sendEmail: true,
      expiryDays: 7,
      description: '',
    };

    setActiveConfig({
      ...activeConfig,
      prizes: [...activeConfig.prizes, newPrize],
    });

    info(`Premio agregado. Probabilidad sugerida: ${suggestedProbability}%`);
  }

  function duplicatePrize(prizeId) {
    if (!activeConfig) return;
    const prizeToDuplicate = activeConfig.prizes.find((p) => p.id === prizeId);
    if (!prizeToDuplicate) return;

    const duplicatedPrize = {
      ...prizeToDuplicate,
      id: `prize_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: `${prizeToDuplicate.label} (Copia)`,
    };

    const prizeIndex = activeConfig.prizes.findIndex((p) => p.id === prizeId);
    const newPrizes = [...activeConfig.prizes];
    newPrizes.splice(prizeIndex + 1, 0, duplicatedPrize);

    setActiveConfig({
      ...activeConfig,
      prizes: newPrizes,
    });

    info('Premio duplicado');
  }

  function removePrize(id) {
    if (!activeConfig || activeConfig.prizes.length <= 2) {
      error('Debe haber al menos 2 premios');
      return;
    }
    setActiveConfig({
      ...activeConfig,
      prizes: activeConfig.prizes.filter((prize) => prize.id !== id),
    });
  }

  const totalProbability = activeConfig?.prizes.reduce((sum, p) => sum + (p.probability || 0), 0) || 0;

  // Modo público
  if (mode === 'public') {
    if (!activeConfig) {
      return (
        <div className={styles.publicContainer}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando rueda...</p>
          </div>
        </div>
      );
    }

    if (!activeConfig.active) {
      return (
        <div className={styles.publicContainer}>
          <p className={styles.noWheelText}>No hay rueda activa en este momento</p>
        </div>
      );
    }

    return (
      <div className={styles.publicContainer}>
        <div className={styles.wheelContainer}>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className={styles.canvas}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? `transform ${activeConfig.spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                : 'none',
            }}
          />
        </div>
        <button
          onClick={handleSpin}
          disabled={isSpinning || !activeConfig.active}
          className={styles.spinButton}
        >
          {isSpinning ? 'Girando...' : '¡GIRAR!'}
        </button>
        {winner && (
          <div className={styles.winnerDisplay}>
            <h2 className={styles.winnerTitle}>¡FELICITACIONES!</h2>
            <h3 className={styles.winnerLabel}>{winner.label}</h3>
            {winner.description && (
              <p className={styles.winnerDescription}>{winner.description}</p>
            )}
            {winner.couponCode && (
              <div className={styles.couponBox}>
                <p className={styles.couponLabel}>Tu código:</p>
                <h1 className={styles.couponCode}>{winner.couponCode}</h1>
                {winner.expiresAt && (
                  <p className={styles.couponExpiry}>
                    Válido hasta: {new Date(winner.expiresAt).toLocaleDateString('es-AR')}
                  </p>
                )}
              </div>
            )}
            {winner.product && (
              <div className={styles.productDisplay}>
                <p className={styles.productLabel}>Producto ganado:</p>
                <div className={styles.productInfo}>
                  {winner.product.image && (
                    <img
                      src={winner.product.image}
                      alt={winner.product.name}
                      className={styles.productImage}
                    />
                  )}
                  <div>
                    <p className={styles.productName}>{winner.product.name}</p>
                    <p className={styles.productStatus}>
                      {winner.type === 'add_to_cart'
                        ? '✅ Agregado a tu carrito'
                        : 'Te lo enviaremos pronto'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Modo admin
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            {Icons.Target} Rueda de Sorteos Integrada
          </h2>
          <p className={styles.subtitle}>
            Stock, carrito, email, WhatsApp y redes sociales
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={createNewWheel} className={styles.buttonPrimary}>
            {Icons.Plus} Nueva Rueda
          </button>
          {activeConfig && (
            <button
              onClick={() => loadStats(activeConfig.id)}
              className={styles.buttonSecondary}
            >
              {Icons.TrendingUp} Estadísticas
            </button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.wheelSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  {activeConfig?.name || 'Selecciona o crea una rueda'}
                </h3>
                {activeConfig && (
                  <p className={styles.cardSubtitle}>
                    {activeConfig.active ? '✅ Activa' : '⏸️ Inactiva'} •{' '}
                    {activeConfig.totalSpins || 0} giros
                  </p>
                )}
              </div>
              {activeConfig && (
                <div className={styles.cardActions}>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={styles.iconButton}
                  >
                    {isEditing ? Icons.Save : Icons.Edit}
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => saveConfig(activeConfig)}
                      className={styles.buttonPrimary}
                    >
                      Guardar
                    </button>
                  )}
                </div>
              )}
            </div>

            {activeConfig ? (
              <div className={styles.wheelContent}>
                <div className={styles.canvasContainer}>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className={styles.canvas}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning
                        ? `transform ${activeConfig.spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : 'none',
                    }}
                  />
                </div>

                {!isEditing && (
                  <div className={styles.spinButtonContainer}>
                    <button
                      onClick={handleSpin}
                      disabled={isSpinning}
                      className={styles.spinButton}
                    >
                      {Icons.Play} {isSpinning ? 'Girando...' : '¡GIRAR!'}
                    </button>
                  </div>
                )}

                {winner && (
                  <div className={styles.winnerDisplay}>
                    <h2 className={styles.winnerTitle}>¡FELICITACIONES!</h2>
                    <h3 className={styles.winnerLabel}>{winner.label}</h3>
                    {winner.description && (
                      <p className={styles.winnerDescription}>{winner.description}</p>
                    )}
                    {winner.couponCode && (
                      <div className={styles.couponBox}>
                        <p className={styles.couponLabel}>Tu código:</p>
                        <h1 className={styles.couponCode}>{winner.couponCode}</h1>
                        {winner.expiresAt && (
                          <p className={styles.couponExpiry}>
                            Válido hasta: {new Date(winner.expiresAt).toLocaleDateString('es-AR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>{Icons.Target}</span>
                <p className={styles.emptyTitle}>No hay rueda seleccionada</p>
                <p className={styles.emptySubtitle}>
                  Crea una nueva rueda o selecciona una existente
                </p>
                <button onClick={createNewWheel} className={styles.buttonPrimary}>
                  Crear Primera Rueda
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.configSection}>
          <div className={styles.card}>
            <h3 className={styles.configTitle}>Ruedas Guardadas</h3>
            <div className={styles.wheelList}>
              {configs.length > 0 ? (
                configs.map((config) => (
                  <button
                    key={config.id}
                    onClick={() => {
                      setActiveConfig(config);
                      setIsEditing(false);
                    }}
                    className={`${styles.wheelItem} ${
                      activeConfig?.id === config.id ? styles.wheelItemActive : ''
                    }`}
                  >
                    <p className={styles.wheelItemName}>{config.name}</p>
                    <p className={styles.wheelItemMeta}>
                      {config.prizes.length} premios • {config.totalSpins || 0} giros
                    </p>
                  </button>
                ))
              ) : (
                <p className={styles.emptyText}>No hay ruedas guardadas</p>
              )}
            </div>
          </div>

          {isEditing && activeConfig && (
            <>
              <div className={styles.card}>
                <div className={styles.configHeader}>
                  <div>
                    <h3 className={styles.configTitle}>Editar Premios</h3>
                    <p
                      className={`${styles.probabilityTotal} ${
                        Math.abs(totalProbability - 100) < 0.1
                          ? styles.probabilityValid
                          : styles.probabilityInvalid
                      }`}
                    >
                      Total probabilidad: {totalProbability.toFixed(1)}%
                      {Math.abs(totalProbability - 100) >= 0.1 && ' ⚠️'}
                    </p>
                  </div>
                  <button onClick={addPrize} className={styles.buttonPrimary}>
                    {Icons.Plus} Agregar Premio
                  </button>
                </div>

                <div className={styles.prizesList}>
                  {activeConfig.prizes.map((prize, index) => (
                    <div key={prize.id} className={styles.prizeItem}>
                      <div className={styles.prizeItemHeader}>
                        <span className={styles.prizeNumber}>#{index + 1}</span>
                        <div className={styles.prizeHeader}>
                          <input
                            type="text"
                            value={prize.label}
                            onChange={(e) => updatePrize(prize.id, 'label', e.target.value)}
                            className={styles.input}
                            placeholder="Etiqueta del premio"
                          />
                          <input
                            type="color"
                            value={prize.color}
                            onChange={(e) => updatePrize(prize.id, 'color', e.target.value)}
                            className={styles.colorInput}
                            title="Color del segmento"
                          />
                          <button
                            onClick={() => duplicatePrize(prize.id)}
                            className={styles.duplicateButton}
                            title="Duplicar premio"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => removePrize(prize.id)}
                            className={styles.deleteButton}
                            title="Eliminar premio"
                          >
                            {Icons.Trash}
                          </button>
                        </div>
                      </div>

                      {prize.description !== undefined && (
                        <input
                          type="text"
                          value={prize.description || ''}
                          onChange={(e) => updatePrize(prize.id, 'description', e.target.value)}
                          className={styles.input}
                          placeholder="Descripción (opcional)"
                        />
                      )}

                      <select
                        value={prize.type}
                        onChange={(e) => updatePrize(prize.id, 'type', e.target.value)}
                        className={styles.select}
                      >
                        {Object.entries(prizeTypeLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>

                      {(prize.type === 'discount_percentage' ||
                        prize.type === 'discount_fixed' ||
                        prize.type === 'loyalty_points') && (
                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            {prize.type === 'discount_percentage' && 'Porcentaje de descuento (%)'}
                            {prize.type === 'discount_fixed' && 'Monto fijo (en centavos)'}
                            {prize.type === 'loyalty_points' && 'Cantidad de puntos'}
                          </label>
                          <input
                            type="number"
                            value={prize.value || 0}
                            onChange={(e) =>
                              updatePrize(prize.id, 'value', parseInt(e.target.value) || 0)
                            }
                            className={styles.input}
                            placeholder="Valor"
                            min="0"
                          />
                        </div>
                      )}

                      {(prize.type === 'discount_percentage' ||
                        prize.type === 'discount_fixed' ||
                        prize.type === 'free_shipping') && (
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Días de validez del cupón</label>
                          <input
                            type="number"
                            value={prize.expiryDays || 7}
                            onChange={(e) =>
                              updatePrize(prize.id, 'expiryDays', parseInt(e.target.value) || 7)
                            }
                            className={styles.input}
                            min="1"
                            max="365"
                          />
                        </div>
                      )}

                      <div className={styles.probabilitySlider}>
                        <label className={styles.sliderLabel}>
                          Probabilidad: {prize.probability}%
                        </label>
                        <div className={styles.sliderContainer}>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={prize.probability}
                            onChange={(e) =>
                              updatePrize(prize.id, 'probability', parseInt(e.target.value))
                            }
                            className={styles.slider}
                          />
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={prize.probability}
                            onChange={(e) =>
                              updatePrize(prize.id, 'probability', parseInt(e.target.value) || 1)
                            }
                            className={styles.probabilityInput}
                          />
                        </div>
                      </div>

                      <div className={styles.prizeOptions}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={prize.sendEmail || false}
                            onChange={(e) =>
                              updatePrize(prize.id, 'sendEmail', e.target.checked)
                            }
                          />
                          {Icons.Mail} Email
                        </label>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={prize.sendWhatsApp || false}
                            onChange={(e) =>
                              updatePrize(prize.id, 'sendWhatsApp', e.target.checked)
                            }
                          />
                          {Icons.MessageCircle} WhatsApp
                        </label>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={prize.requiresStock || false}
                            onChange={(e) =>
                              updatePrize(prize.id, 'requiresStock', e.target.checked)
                            }
                          />
                          Verificar stock
                        </label>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={prize.decrementStock || false}
                            onChange={(e) =>
                              updatePrize(prize.id, 'decrementStock', e.target.checked)
                            }
                          />
                          Descontar stock
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.configTitle}>
                  {Icons.Settings} Configuración
                </h3>

                <div className={styles.settingsForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nombre de la Rueda</label>
                    <input
                      type="text"
                      value={activeConfig.name}
                      onChange={(e) =>
                        setActiveConfig({ ...activeConfig, name: e.target.value })
                      }
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Duración del giro (ms): {activeConfig.spinDuration}
                    </label>
                    <input
                      type="range"
                      min="2000"
                      max="8000"
                      step="500"
                      value={activeConfig.spinDuration}
                      onChange={(e) =>
                        setActiveConfig({
                          ...activeConfig,
                          spinDuration: parseInt(e.target.value),
                        })
                      }
                      className={styles.slider}
                    />
                  </div>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={activeConfig.showConfetti}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            showConfetti: e.target.checked,
                          })
                        }
                      />
                      Mostrar confetti
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={activeConfig.requireEmail}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            requireEmail: e.target.checked,
                          })
                        }
                      />
                      Requerir email
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={activeConfig.requireLogin}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            requireLogin: e.target.checked,
                          })
                        }
                      />
                      Requerir login
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={activeConfig.enableEmailNotifications}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            enableEmailNotifications: e.target.checked,
                          })
                        }
                      />
                      Notificaciones por email
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={activeConfig.enableWhatsAppNotifications}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            enableWhatsAppNotifications: e.target.checked,
                          })
                        }
                      />
                      Notificaciones por WhatsApp
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={activeConfig.enableSocialSharing}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            enableSocialSharing: e.target.checked,
                          })
                        }
                      />
                      Compartir en redes sociales
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={activeConfig.active}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            active: e.target.checked,
                          })
                        }
                      />
                      <strong>Activar en el sitio web</strong>
                    </label>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Max giros/usuario</label>
                      <input
                        type="number"
                        value={activeConfig.maxSpinsPerUser || ''}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            maxSpinsPerUser: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        className={styles.input}
                        placeholder="Sin límite"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Max giros/día</label>
                      <input
                        type="number"
                        value={activeConfig.maxSpinsPerDay || ''}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            maxSpinsPerDay: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        className={styles.input}
                        placeholder="Sin límite"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showEmailModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Ingresa tu email</h3>
            <p className={styles.modalText}>
              Te enviaremos tu premio por email
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={styles.input}
            />
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowEmailModal(false)}
                className={styles.buttonSecondary}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  handleSpin();
                }}
                disabled={!email}
                className={styles.buttonPrimary}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {showStats && stats && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowStats(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {Icons.TrendingUp} Estadísticas de la Rueda
            </h3>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <p className={styles.statValue}>{stats.totalSpins}</p>
                <p className={styles.statLabel}>Giros Totales</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statValue}>{stats.uniqueEmails}</p>
                <p className={styles.statLabel}>Emails Únicos</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statValue}>{stats.uniqueUsers}</p>
                <p className={styles.statLabel}>Usuarios Únicos</p>
              </div>
            </div>

            <h4 className={styles.statsSubtitle}>Distribución de Premios:</h4>
            <div className={styles.prizeStatsList}>
              {stats.prizes.map((prize) => (
                <div key={prize.id} className={styles.prizeStatItem}>
                  <div className={styles.prizeStatInfo}>
                    <div
                      className={styles.prizeStatColor}
                      style={{ backgroundColor: prize.color }}
                    />
                    <span className={styles.prizeStatLabel}>{prize.label}</span>
                  </div>
                  <div className={styles.prizeStatData}>
                    <p className={styles.prizeStatValue}>{prize.timesWon} veces</p>
                    <p className={styles.prizeStatProbability}>
                      {prize.actualProbability}% real vs {prize.probability}% esperado
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowStats(false)}
              className={styles.buttonSecondary}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
