import React from 'react';
import { SpinWheelPro } from '@components/marketing/SpinWheelPro';
import styles from './WheelPro.module.css';

export const WheelPro = () => {
  return (
    <div className={styles.container}>
      <SpinWheelPro
        enableSounds={true}
        enableVibration={true}
        spinDuration={4000}
        minSegments={8}
        maxSegments={16}
        theme="light"
        showHistory={true}
        showStats={true}
        onSpinComplete={(prize) => {
          console.log('Premio ganado:', prize);
        }}
      />
    </div>
  );
};
