import { useState } from "react";
import { Instagram, Facebook, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { InstagramMigration } from "./InstagramMigration";
import { FacebookMigration } from "./FacebookMigration";

type MigrationPlatform = "select" | "instagram" | "facebook";

export function SocialMediaMigration() {
  const [selectedPlatform, setSelectedPlatform] = useState<MigrationPlatform>("select");

  if (selectedPlatform === "instagram") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
        <button
          onClick={() => setSelectedPlatform("select")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#757575',
            transition: 'color 0.2s',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#212121'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#757575'}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Volver a Selección de Plataforma
        </button>
        <InstagramMigration />
      </div>
    );
  }

  if (selectedPlatform === "facebook") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
        <button
          onClick={() => setSelectedPlatform("select")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#757575',
            transition: 'color 0.2s',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#212121'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#757575'}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Volver a Selección de Plataforma
        </button>
        <FacebookMigration />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F43 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <RefreshCw style={{ width: '40px', height: '40px', color: 'white' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
            Migración de Redes Sociales
          </h2>
          <p style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>
            Respaldar, eliminar y transformar tus perfiles de redes sociales para ODDY Market
          </p>
        </div>
      </div>

      {/* Platform Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <motion.button
          onClick={() => setSelectedPlatform("instagram")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#E4405F';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(228, 64, 95, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #E4405F 0%, #C13584 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Instagram style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '8px', color: '#212121' }}>Instagram</h3>
            <p style={{ fontSize: '14px', margin: 0, color: '#757575' }}>
              Respaldar, eliminar y cambiar el look & feel de tu perfil de Instagram
            </p>
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#E4405F', fontWeight: 600 }}>
            Gestionar Instagram →
          </div>
        </motion.button>

        <motion.button
          onClick={() => setSelectedPlatform("facebook")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#1877F2';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 119, 242, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Facebook style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '8px', color: '#212121' }}>Facebook</h3>
            <p style={{ fontSize: '14px', margin: 0, color: '#757575' }}>
              Respaldar, eliminar y cambiar el look & feel de tu página de Facebook
            </p>
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#1877F2', fontWeight: 600 }}>
            Gestionar Facebook →
          </div>
        </motion.button>
      </div>

      {/* Info Box */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{ fontWeight: 700, marginBottom: '12px', color: '#212121' }}>Información Importante</h4>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#424242', paddingLeft: '20px' }}>
          <li style={{ listStyleType: 'disc', color: '#FF6B35' }}><span style={{ color: '#424242' }}>Estos módulos son independientes del módulo de integración con RRSS</span></li>
          <li style={{ listStyleType: 'disc', color: '#FF6B35' }}><span style={{ color: '#424242' }}>Asegúrate de respaldar tu contenido antes de eliminar cualquier elemento</span></li>
          <li style={{ listStyleType: 'disc', color: '#FF6B35' }}><span style={{ color: '#424242' }}>Los cambios en el perfil pueden tardar unos minutos en reflejarse</span></li>
          <li style={{ listStyleType: 'disc', color: '#FF6B35' }}><span style={{ color: '#424242' }}>Necesitarás tener acceso administrativo a los perfiles para realizar cambios</span></li>
        </ul>
      </div>
    </div>
  );
}
