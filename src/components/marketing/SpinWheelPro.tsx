import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import styles from './SpinWheelPro.module.css';

// Tipos TypeScript
interface Prize {
  id: string;
  label: string;
  color: string;
  probability?: number;
  weight?: number;
  icon?: string;
  emoji?: string;
}

interface SpinHistory {
  id: string;
  prize: Prize;
  timestamp: number;
}

interface PrizeStats {
  prizeId: string;
  label: string;
  color: string;
  timesWon: number;
}

interface SpinWheelProProps {
  prizes?: Prize[];
  onSpinComplete?: (prize: Prize) => void;
  enableSounds?: boolean;
  enableVibration?: boolean;
  spinDuration?: number;
  minSegments?: number;
  maxSegments?: number;
  theme?: 'light' | 'dark';
  showHistory?: boolean;
  showStats?: boolean;
  fullscreenMode?: boolean;
}

// Colores vibrantes por defecto
const DEFAULT_COLORS = [
  '#FF6B35', // Naranja
  '#004E89', // Azul oscuro
  '#F7B801', // Amarillo
  '#6A0572', // Púrpura
  '#00C9A7', // Turquesa
  '#C5283D', // Rojo
  '#FFB627', // Amarillo claro
  '#4ECDC4', // Cyan
  '#95E1D3', // Verde claro
  '#F38181', // Rosa
  '#AA96DA', // Lavanda
  '#FCBAD3', // Rosa claro
];

// Premios por defecto
const DEFAULT_PRIZES: Prize[] = [
  { id: '1', label: '10% OFF', color: DEFAULT_COLORS[0], probability: 20, emoji: '🎁' },
  { id: '2', label: '20% OFF', color: DEFAULT_COLORS[1], probability: 15, emoji: '🎉' },
  { id: '3', label: 'Envío Gratis', color: DEFAULT_COLORS[2], probability: 15, emoji: '🚚' },
  { id: '4', label: '30% OFF', color: DEFAULT_COLORS[3], probability: 10, emoji: '🏆' },
  { id: '5', label: '50% OFF', color: DEFAULT_COLORS[4], probability: 5, emoji: '💎' },
  { id: '6', label: 'Inténtalo otra vez', color: DEFAULT_COLORS[5], probability: 20, emoji: '🔄' },
  { id: '7', label: 'Producto Gratis', color: DEFAULT_COLORS[6], probability: 10, emoji: '🎁' },
  { id: '8', label: '15% OFF', color: DEFAULT_COLORS[7], probability: 5, emoji: '✨' },
];

// Hook para sonidos
const useSound = (enabled: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [enabled]);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled || !audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, [enabled]);

  const playSpinSound = useCallback(() => {
    if (!enabled) return;
    // Sonido de tictac mientras gira
    playTone(800, 0.1, 'square');
  }, [enabled, playTone]);

  const playWinSound = useCallback(() => {
    if (!enabled) return;
    // Sonido de victoria (acorde ascendente)
    playTone(523.25, 0.1); // Do
    setTimeout(() => playTone(659.25, 0.1), 100); // Mi
    setTimeout(() => playTone(783.99, 0.2), 200); // Sol
  }, [enabled, playTone]);

  return { playSpinSound, playWinSound };
};

// Hook para vibración
const useVibration = (enabled: boolean) => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (enabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [enabled]);

  return vibrate;
};

// Hook para animación de la rueda
const useWheelAnimation = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  prizes: Prize[],
  rotation: number,
  isSpinning: boolean
) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(window.innerWidth * 0.8, 600);
    canvas.width = size;
    canvas.height = size;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalSegments = prizes.length;
    const anglePerSegment = (2 * Math.PI) / totalSegments;

    // Dibujar segmentos
    prizes.forEach((prize, index) => {
      const startAngle = index * anglePerSegment + (rotation * Math.PI) / 180;
      const endAngle = startAngle + anglePerSegment;

      // Gradiente para efecto 3D
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.3,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, prize.color);
      gradient.addColorStop(1, darkenColor(prize.color, 0.3));

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Borde dorado/brillante
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Sombra para profundidad
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Texto del premio
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Sombra del texto
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Emoji o icono
      if (prize.emoji) {
        ctx.font = 'bold 32px Arial';
        ctx.fillText(prize.emoji, radius * 0.6, -10);
      }

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(12, Math.min(18, radius / 15))}px Arial`;
      ctx.fillText(prize.label, radius * 0.6, 15);

      // Probabilidad (solo en modo edición)
      if (prize.probability) {
        ctx.font = `${Math.max(10, Math.min(14, radius / 20))}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`${prize.probability}%`, radius * 0.6, 35);
      }

      ctx.restore();
    });

    // Centro de la rueda (círculo blanco)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [prizes, rotation, isSpinning]);
};

// Función auxiliar para oscurecer color
const darkenColor = (color: string, amount: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) - amount * 255));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) - amount * 255));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) - amount * 255));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// Función para seleccionar premio basado en probabilidades
const selectPrizeByProbability = (prizes: Prize[]): Prize => {
  const totalWeight = prizes.reduce((sum, prize) => {
    const weight = prize.weight || prize.probability || 1;
    return sum + weight;
  }, 0);

  let random = Math.random() * totalWeight;

  for (const prize of prizes) {
    const weight = prize.weight || prize.probability || 1;
    if (random < weight) {
      return prize;
    }
    random -= weight;
  }

  return prizes[0];
};

export const SpinWheelPro: React.FC<SpinWheelProProps> = ({
  prizes = DEFAULT_PRIZES,
  onSpinComplete,
  enableSounds = true,
  enableVibration = true,
  spinDuration = 4000,
  minSegments = 8,
  maxSegments = 16,
  theme = 'light',
  showHistory = true,
  showStats = true,
  fullscreenMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [history, setHistory] = useState<SpinHistory[]>([]);
  const [stats, setStats] = useState<PrizeStats[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editablePrizes, setEditablePrizes] = useState<Prize[]>(prizes);
  const [isFullscreen, setIsFullscreen] = useState(fullscreenMode);
  const [currentTheme, setCurrentTheme] = useState(theme);

  const { playSpinSound, playWinSound } = useSound(enableSounds);
  const vibrate = useVibration(enableVibration);

  // Validar número de segmentos
  const validatedPrizes = editablePrizes.slice(0, Math.min(maxSegments, Math.max(minSegments, editablePrizes.length)));

  // Usar animación de la rueda
  useWheelAnimation(canvasRef, validatedPrizes, rotation, isSpinning);

  // Calcular estadísticas
  useEffect(() => {
    const prizeStatsMap = new Map<string, PrizeStats>();

    validatedPrizes.forEach((prize) => {
      prizeStatsMap.set(prize.id, {
        prizeId: prize.id,
        label: prize.label,
        color: prize.color,
        timesWon: 0,
      });
    });

    history.forEach((entry) => {
      const stat = prizeStatsMap.get(entry.prize.id);
      if (stat) {
        stat.timesWon++;
      }
    });

    setStats(Array.from(prizeStatsMap.values()));
  }, [history, validatedPrizes]);

  // Función para girar la rueda
  const handleSpin = useCallback(() => {
    if (isSpinning || validatedPrizes.length < minSegments) return;

    setIsSpinning(true);
    setWinner(null);
    setShowWinnerModal(false);

    // Seleccionar premio ganador
    const winningPrize = selectPrizeByProbability(validatedPrizes);
    const prizeIndex = validatedPrizes.findIndex((p) => p.id === winningPrize.id);

    // Calcular rotación
    const anglePerSegment = 360 / validatedPrizes.length;
    const winningAngle = prizeIndex * anglePerSegment;
    const randomOffset = Math.random() * anglePerSegment * 0.6;
    const totalRotation = 360 * (5 + Math.random() * 2) + (360 - winningAngle) + randomOffset;

    // Sonido de inicio
    playSpinSound();

    // Animación de giro
    setRotation(totalRotation);

    // Sonido de tictac mientras gira
    let tickCount = 0;
    const maxTicks = Math.floor(spinDuration / 200);
    const tickInterval = setInterval(() => {
      tickCount++;
      if (tickCount >= maxTicks) {
        clearInterval(tickInterval);
        return;
      }
      playSpinSound();
    }, 200);

    // Finalizar giro
    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWinner(winningPrize);

      // Agregar al historial
      const newHistory: SpinHistory = {
        id: `spin_${Date.now()}`,
        prize: winningPrize,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newHistory, ...prev].slice(0, 10));

      // Efectos de victoria
      playWinSound();
      vibrate([200, 100, 200]);
      setShowWinnerModal(true);

      // Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Callback
      if (onSpinComplete) {
        onSpinComplete(winningPrize);
      }
    }, spinDuration);
  }, [isSpinning, validatedPrizes, minSegments, spinDuration, playSpinSound, playWinSound, vibrate, onSpinComplete]);

  // Exportar configuración
  const exportConfig = () => {
    const config = {
      prizes: editablePrizes,
      spinDuration,
      theme: currentTheme,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spinwheel-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar configuración
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.prizes && Array.isArray(config.prizes)) {
          setEditablePrizes(config.prizes);
          if (config.theme) setCurrentTheme(config.theme);
          if (config.spinDuration) {
            // spinDuration es prop, no se puede cambiar directamente
          }
        }
      } catch (error) {
        console.error('Error importing config:', error);
        alert('Error al importar configuración');
      }
    };
    reader.readAsText(file);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Agregar premio
  const addPrize = () => {
    if (editablePrizes.length >= maxSegments) {
      alert(`Máximo ${maxSegments} segmentos permitidos`);
      return;
    }

    const newPrize: Prize = {
      id: `prize_${Date.now()}`,
      label: `Premio ${editablePrizes.length + 1}`,
      color: DEFAULT_COLORS[editablePrizes.length % DEFAULT_COLORS.length],
      probability: Math.floor(100 / (editablePrizes.length + 1)),
    };

    setEditablePrizes([...editablePrizes, newPrize]);
  };

  // Eliminar premio
  const removePrize = (id: string) => {
    if (editablePrizes.length <= minSegments) {
      alert(`Mínimo ${minSegments} segmentos requeridos`);
      return;
    }
    setEditablePrizes(editablePrizes.filter((p) => p.id !== id));
  };

  // Actualizar premio
  const updatePrize = (id: string, field: keyof Prize, value: any) => {
    setEditablePrizes(
      editablePrizes.map((prize) => (prize.id === id ? { ...prize, [field]: value } : prize))
    );
  };

  const containerClass = `${styles.container} ${styles[`theme-${currentTheme}`]} ${
    isFullscreen ? styles.fullscreen : ''
  }`;

  return (
    <div className={containerClass}>
      {/* Header con controles */}
      <div className={styles.header}>
        <h1 className={styles.title}>🎡 Rueda de la Suerte</h1>
        <div className={styles.controls}>
          <button
            onClick={() => setShowEditor(!showEditor)}
            className={styles.controlButton}
            title="Editor de premios"
          >
            ⚙️
          </button>
          {showStats && (
            <button
              onClick={() => setShowEditor(false)}
              className={styles.controlButton}
              title="Estadísticas"
            >
              📊
            </button>
          )}
          <button
            onClick={() => setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light')}
            className={styles.controlButton}
            title="Cambiar tema"
          >
            {currentTheme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={toggleFullscreen}
            className={styles.controlButton}
            title="Pantalla completa"
          >
            ⛶
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Editor de premios */}
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.editor}
          >
            <h2>Editor de Premios</h2>
            <div className={styles.editorActions}>
              <button onClick={addPrize} className={styles.button}>
                ➕ Agregar Premio
              </button>
              <button onClick={exportConfig} className={styles.button}>
                💾 Exportar
              </button>
              <label className={styles.button}>
                📥 Importar
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfig}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div className={styles.prizesEditor}>
              {editablePrizes.map((prize, index) => (
                <div key={prize.id} className={styles.prizeEditorItem}>
                  <div className={styles.prizeEditorHeader}>
                    <span className={styles.prizeNumber}>#{index + 1}</span>
                    <button
                      onClick={() => removePrize(prize.id)}
                      className={styles.deleteButton}
                      disabled={editablePrizes.length <= minSegments}
                    >
                      🗑️
                    </button>
                  </div>
                  <input
                    type="text"
                    value={prize.label}
                    onChange={(e) => updatePrize(prize.id, 'label', e.target.value)}
                    className={styles.input}
                    placeholder="Nombre del premio"
                  />
                  <input
                    type="color"
                    value={prize.color}
                    onChange={(e) => updatePrize(prize.id, 'color', e.target.value)}
                    className={styles.colorInput}
                  />
                  <input
                    type="text"
                    value={prize.emoji || ''}
                    onChange={(e) => updatePrize(prize.id, 'emoji', e.target.value)}
                    className={styles.input}
                    placeholder="Emoji (opcional)"
                  />
                  <div className={styles.probabilityInput}>
                    <label>Probabilidad: {prize.probability || 0}%</label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={prize.probability || 10}
                      onChange={(e) =>
                        updatePrize(prize.id, 'probability', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowEditor(false)} className={styles.button}>
              ✅ Guardar y Cerrar
            </button>
          </motion.div>
        )}

        {/* Estadísticas */}
        {showStats && !showEditor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.stats}
          >
            <h2>📊 Estadísticas</h2>
            <div className={styles.statsGrid}>
              {stats.map((stat) => (
                <div key={stat.prizeId} className={styles.statCard}>
                  <div
                    className={styles.statColor}
                    style={{ backgroundColor: stat.color }}
                  />
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>{stat.label}</p>
                    <p className={styles.statValue}>{stat.timesWon} veces</p>
                  </div>
                </div>
              ))}
            </div>
            {history.length > 0 && (
              <div className={styles.history}>
                <h3>Historial (últimos 10)</h3>
                <div className={styles.historyList}>
                  {history.map((entry) => (
                    <div key={entry.id} className={styles.historyItem}>
                      <span
                        className={styles.historyColor}
                        style={{ backgroundColor: entry.prize.color }}
                      />
                      <span>{entry.prize.label}</span>
                      <span className={styles.historyTime}>
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Rueda principal */}
        {!showEditor && (
          <div className={styles.wheelContainer}>
            <div className={styles.canvasWrapper}>
              <canvas ref={canvasRef} className={styles.canvas} />
              <div className={styles.indicator} />
            </div>

            <motion.button
              onClick={handleSpin}
              disabled={isSpinning || validatedPrizes.length < minSegments}
              className={styles.spinButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
            >
              {isSpinning ? '🎡 GIRANDO...' : '🎯 ¡GIRAR!'}
            </motion.button>
          </div>
        )}
      </div>

      {/* Modal de ganador */}
      <AnimatePresence>
        {showWinnerModal && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setShowWinnerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className={styles.winnerModal}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={styles.winnerIcon}
                style={{ backgroundColor: winner.color }}
              >
                {winner.emoji || '🎁'}
              </motion.div>
              <h2 className={styles.winnerTitle}>¡FELICITACIONES!</h2>
              <h3 className={styles.winnerLabel}>{winner.label}</h3>
              <button
                onClick={() => setShowWinnerModal(false)}
                className={styles.closeButton}
              >
                ✕ Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
