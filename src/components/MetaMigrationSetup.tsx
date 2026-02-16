"use client";

import { useState } from "react";
import {
  Facebook,
  Instagram,
  CheckCircle2,
  ExternalLink,
  Info,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { instagramMigrationService } from "../services/instagramMigrationService";
import { facebookMigrationService } from "../services/facebookMigrationService";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
}

interface MetaMigrationSetupProps {
  defaultPlatform?: "instagram" | "facebook";
}

export function MetaMigrationSetup({ defaultPlatform }: MetaMigrationSetupProps = {}) {
  const [activePlatform, setActivePlatform] = useState<"instagram" | "facebook" | null>(defaultPlatform || null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    appId: "",
    appSecret: "",
    accessToken: "",
    pageId: "",
    instagramAccountId: "",
  });

  const instagramSteps: SetupStep[] = [
    {
      id: "1",
      title: "Crear Meta Business Account",
      description: "Asegúrate de tener una cuenta de Meta Business con Instagram Business conectado",
      completed: false,
      link: "https://business.facebook.com/",
    },
    {
      id: "2",
      title: "Crear App en Meta for Developers",
      description: "Crea una aplicación de tipo 'Business' en developers.facebook.com",
      completed: false,
      link: "https://developers.facebook.com/",
    },
    {
      id: "3",
      title: "Agregar Instagram Graph API",
      description: "Agrega el producto 'Instagram Graph API' a tu app",
      completed: false,
    },
    {
      id: "4",
      title: "Obtener Instagram Account ID",
      description: "Obtén el ID de tu cuenta de Instagram Business",
      completed: false,
    },
    {
      id: "5",
      title: "Generar Access Token",
      description: "Genera un Access Token de larga duración con los permisos necesarios",
      completed: false,
      link: "https://developers.facebook.com/tools/explorer/",
    },
    {
      id: "6",
      title: "Configurar Credenciales",
      description: "Ingresa las credenciales en el sistema",
      completed: false,
    },
  ];

  const facebookSteps: SetupStep[] = [
    {
      id: "1",
      title: "Crear Meta Business Account",
      description: "Asegúrate de tener una cuenta de Meta Business",
      completed: false,
      link: "https://business.facebook.com/",
    },
    {
      id: "2",
      title: "Crear Página de Facebook",
      description: "Crea o verifica tu página de Facebook",
      completed: false,
    },
    {
      id: "3",
      title: "Crear App en Meta for Developers",
      description: "Crea una aplicación de tipo 'Business' en developers.facebook.com",
      completed: false,
      link: "https://developers.facebook.com/",
    },
    {
      id: "4",
      title: "Obtener Page ID",
      description: "Obtén el ID de tu página de Facebook",
      completed: false,
    },
    {
      id: "5",
      title: "Generar Access Token",
      description: "Genera un Access Token de larga duración con permisos de página",
      completed: false,
      link: "https://developers.facebook.com/tools/explorer/",
    },
    {
      id: "6",
      title: "Configurar Credenciales",
      description: "Ingresa las credenciales en el sistema",
      completed: false,
    },
  ];

  const requiredPermissions = {
    instagram: [
      "instagram_basic",
      "instagram_content_publish",
      "pages_read_engagement",
      "pages_manage_posts",
      "pages_show_list",
    ],
    facebook: [
      "pages_read_engagement",
      "pages_manage_posts",
      "pages_read_user_content",
      "pages_show_list",
      "pages_manage_metadata",
    ],
  };

  const handleSaveCredentials = async () => {
    // TODO: Implementar guardado de credenciales en API Keys
    toast.success("Credenciales guardadas exitosamente");
  };

  const handleVerifyConnection = async () => {
    try {
      toast.info("Verificando conexión...");
      
      if (activePlatform === "instagram") {
        const result = await instagramMigrationService.verifyConnection();
        if (result.connected) {
          toast.success("Conexión con Instagram verificada exitosamente");
        } else {
          toast.error(result.error || "No se pudo verificar la conexión");
        }
      } else if (activePlatform === "facebook") {
        const result = await facebookMigrationService.verifyConnection();
        if (result.connected) {
          toast.success("Conexión con Facebook verificada exitosamente");
        } else {
          toast.error(result.error || "No se pudo verificar la conexión");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Error al verificar conexión");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  if (activePlatform === "instagram") {
    return (
      <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
        <button
          onClick={() => setActivePlatform(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#757575',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '24px',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#212121';
            e.currentTarget.style.background = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#757575';
            e.currentTarget.style.background = 'none';
          }}
        >
          ← Volver
        </button>

        <div style={{
          background: 'linear-gradient(135deg, #E4405F 0%, #C13584 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(228, 64, 95, 0.3)',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
            Configuración de Instagram
          </h2>
          <p style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>
            Sigue estos pasos para configurar la integración con Instagram
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#212121' }}>
            Pasos de Configuración
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {instagramSteps.map((step, index) => (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px',
                  background: '#f5f5f5',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: step.completed ? '#4caf50' : '#E4405F',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {step.completed ? <CheckCircle2 size={20} /> : index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#212121' }}>
                      {step.title}
                    </h4>
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#E4405F',
                          textDecoration: 'none',
                          fontSize: '12px'
                        }}
                      >
                        <ExternalLink size={14} />
                        Abrir
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#212121' }}>
            Permisos Requeridos
          </h3>
          <div style={{
            background: '#fff3e0',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #ffb74d',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '14px', color: '#e65100', margin: 0, marginBottom: '12px', fontWeight: 600 }}>
              ⚠️ Estos permisos deben ser aprobados en Meta for Developers
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {requiredPermissions.instagram.map((perm) => (
                <span
                  key={perm}
                  style={{
                    background: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#e65100',
                    border: '1px solid #ffb74d'
                  }}
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#212121' }}>
                Credenciales
              </h3>
              <button
                onClick={() => setShowCredentials(!showCredentials)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {showCredentials ? <EyeOff size={16} /> : <Eye size={16} />}
                {showCredentials ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#212121'
              }}>
                App ID
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showCredentials ? "text" : "password"}
                  value={credentials.appId}
                  onChange={(e) => setCredentials({ ...credentials, appId: e.target.value })}
                  placeholder="1234567890123456"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(credentials.appId)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#212121'
              }}>
                App Secret
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showCredentials ? "text" : "password"}
                  value={credentials.appSecret}
                  onChange={(e) => setCredentials({ ...credentials, appSecret: e.target.value })}
                  placeholder="abcdef1234567890abcdef1234567890"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(credentials.appSecret)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#212121'
              }}>
                Access Token
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showCredentials ? "text" : "password"}
                  value={credentials.accessToken}
                  onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
                  placeholder="EAAxxxxxxxxxxxxx"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(credentials.accessToken)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#212121'
              }}>
                Instagram Account ID
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={credentials.instagramAccountId}
                  onChange={(e) => setCredentials({ ...credentials, instagramAccountId: e.target.value })}
                  placeholder="12345678901234567"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(credentials.instagramAccountId)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px'
            }}>
              <button
                onClick={handleSaveCredentials}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: '#E4405F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#C13584'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#E4405F'}
              >
                Guardar Credenciales
              </button>
              <button
                onClick={handleVerifyConnection}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: '#f5f5f5',
                  color: '#212121',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
              >
                Verificar Conexión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activePlatform === "facebook") {
    return (
      <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
        <button
          onClick={() => setActivePlatform(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#757575',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '24px',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#212121';
            e.currentTarget.style.background = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#757575';
            e.currentTarget.style.background = 'none';
          }}
        >
          ← Volver
        </button>

        <div style={{
          background: 'linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(24, 119, 242, 0.3)',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
            Configuración de Facebook
          </h2>
          <p style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>
            Sigue estos pasos para configurar la integración con Facebook
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#212121' }}>
            Pasos de Configuración
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {facebookSteps.map((step, index) => (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px',
                  background: '#f5f5f5',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: step.completed ? '#4caf50' : '#1877F2',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {step.completed ? <CheckCircle2 size={20} /> : index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#212121' }}>
                      {step.title}
                    </h4>
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#1877F2',
                          textDecoration: 'none',
                          fontSize: '12px'
                        }}
                      >
                        <ExternalLink size={14} />
                        Abrir
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#212121' }}>
            Permisos Requeridos
          </h3>
          <div style={{
            background: '#e3f2fd',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #90caf9',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '14px', color: '#1565c0', margin: 0, marginBottom: '12px', fontWeight: 600 }}>
              ⚠️ Estos permisos deben ser aprobados en Meta for Developers
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {requiredPermissions.facebook.map((perm) => (
                <span
                  key={perm}
                  style={{
                    background: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1565c0',
                    border: '1px solid #90caf9'
                  }}
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#212121' }}>
              Credenciales
            </h3>
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {showCredentials ? <EyeOff size={16} /> : <Eye size={16} />}
              {showCredentials ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#212121'
              }}>
                App ID
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showCredentials ? "text" : "password"}
                  value={credentials.appId}
                  onChange={(e) => setCredentials({ ...credentials, appId: e.target.value })}
                  placeholder="1234567890123456"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(credentials.appId)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#212121'
              }}>
                App Secret
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showCredentials ? "text" : "password"}
                  value={credentials.appSecret}
                  onChange={(e) => setCredentials({ ...credentials, appSecret: e.target.value })}
                  placeholder="abcdef1234567890abcdef1234567890"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(credentials.appSecret)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#212121'
              }}>
                Access Token
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showCredentials ? "text" : "password"}
                  value={credentials.accessToken}
                  onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
                  placeholder="EAAxxxxxxxxxxxxx"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(credentials.accessToken)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#212121'
              }}>
                Page ID
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={credentials.pageId}
                  onChange={(e) => setCredentials({ ...credentials, pageId: e.target.value })}
                  placeholder="9876543210987654"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(credentials.pageId)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px'
            }}>
              <button
                onClick={handleSaveCredentials}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: '#1877F2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1565C0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1877F2'}
              >
                Guardar Credenciales
              </button>
              <button
                onClick={handleVerifyConnection}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: '#f5f5f5',
                  color: '#212121',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
              >
                Verificar Conexión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
          Configuración de Integración con Meta
        </h2>
        <p style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>
          Configura las credenciales necesarias para usar los módulos de migración de redes sociales
        </p>
      </div>

      <div style={{
        background: '#fff3e0',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #ffb74d',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Info size={24} color="#e65100" />
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, marginBottom: '8px', color: '#e65100' }}>
              Información Importante
            </h4>
            <p style={{ fontSize: '14px', color: '#e65100', margin: 0, lineHeight: '1.6' }}>
              Para usar los módulos de migración, necesitas tener acceso administrativo a los perfiles de Instagram y Facebook, 
              y haber creado una aplicación en Meta for Developers. Si aún no lo has hecho, sigue la guía paso a paso.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        <motion.button
          onClick={() => setActivePlatform("instagram")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            border: '2px solid #E4405F',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#C13584';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(228, 64, 95, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E4405F';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #E4405F 0%, #C13584 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Instagram size={40} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '8px', color: '#212121' }}>
                Configurar Instagram
              </h3>
              <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>
                Guía paso a paso para configurar Instagram
              </p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => setActivePlatform("facebook")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            border: '2px solid #1877F2',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#1565C0';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 119, 242, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1877F2';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Facebook size={40} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '8px', color: '#212121' }}>
                Configurar Facebook
              </h3>
              <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>
                Guía paso a paso para configurar Facebook
              </p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
