"use client";

import { useState } from "react";
import {
  Instagram,
  Download,
  Trash2,
  Image as ImageIcon,
  Video,
  Camera,
  Save,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Palette,
  Type,
  Link as LinkIcon,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MetaMigrationSetup } from "./MetaMigrationSetup";
import { instagramMigrationService } from "../services/instagramMigrationService";

interface BackupProgress {
  posts: number;
  stories: number;
  reels: number;
  total: number;
  completed: number;
  status: "idle" | "backing-up" | "completed" | "error";
}

interface ProfileSettings {
  username: string;
  displayName: string;
  bio: string;
  website: string;
  profilePicture: string | null;
  isPrivate: boolean;
}

export function InstagramMigration() {
  const [activeTab, setActiveTab] = useState<"setup" | "backup" | "delete" | "rebrand">("setup");
  const [backupProgress, setBackupProgress] = useState<BackupProgress>({
    posts: 0,
    stories: 0,
    reels: 0,
    total: 0,
    completed: 0,
    status: "idle",
  });
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    username: "",
    displayName: "",
    bio: "",
    website: "",
    profilePicture: null,
    isPrivate: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<"posts" | "stories" | "reels" | "all" | null>(null);

  const tabs = [
    { id: "setup", label: "Configuración", icon: Settings },
    { id: "backup", label: "Respaldar Contenido", icon: Download },
    { id: "delete", label: "Eliminar Contenido", icon: Trash2 },
    { id: "rebrand", label: "Cambiar Look & Feel", icon: Palette },
  ];

  const handleBackup = async (type: "posts" | "stories" | "reels" | "all") => {
    setIsLoading(true);
    setBackupProgress({
      posts: 0,
      stories: 0,
      reels: 0,
      total: 0,
      completed: 0,
      status: "backing-up",
    });

    try {
      const result = await instagramMigrationService.backupContent({ type });
      setBackupProgress({
        posts: result.posts || 0,
        stories: result.stories || 0,
        reels: result.reels || 0,
        total: result.total || 0,
        completed: result.total || 0,
        status: "completed",
      });
      toast.success(`Respaldo completado: ${result.total} elementos descargados`);
    } catch (error: any) {
      console.error("Error en respaldo:", error);
      setBackupProgress((prev) => ({ ...prev, status: "error" }));
      toast.error(error.message || "Error al respaldar contenido. Por favor, intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: "posts" | "stories" | "reels" | "all") => {
    if (!deleteConfirm) {
      setDeleteType(type);
      setDeleteConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await instagramMigrationService.deleteContent({ type });
      toast.success(`Se eliminaron ${result.deleted} elementos`);
      setDeleteConfirm(false);
      setDeleteType(null);
    } catch (error: any) {
      console.error("Error eliminando:", error);
      toast.error(error.message || "Error al eliminar contenido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const result = await instagramMigrationService.updateProfile(profileSettings);
      toast.success(result.message || "Perfil actualizado exitosamente");
    } catch (error: any) {
      console.error("Error actualizando perfil:", error);
      toast.error(error.message || "Error al actualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const result = await instagramMigrationService.uploadProfilePicture(base64);
        setProfileSettings((prev) => ({ ...prev, profilePicture: result.url }));
        toast.success("Foto de perfil actualizada");
      } catch (error: any) {
        toast.error(error.message || "Error al subir foto");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #E4405F 0%, #C13584 100%)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(228, 64, 95, 0.3)',
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
          <Instagram style={{ width: '40px', height: '40px', color: 'white' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
            Migración de Perfil Instagram
          </h2>
          <p style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>
            Respaldar, eliminar y transformar tu perfil de Instagram para ODDY Market
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ borderBottom: '1px solid #e0e0e0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '4px', minWidth: 'max-content' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                background: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#E4405F' : '#757575',
                borderColor: activeTab === tab.id ? '#E4405F' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = '#212121';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = '#757575';
                }
              }}
            >
              <tab.icon style={{ width: '20px', height: '20px' }} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "setup" && (
          <div style={{ marginBottom: '24px' }}>
            <MetaMigrationSetup defaultPlatform="instagram" />
          </div>
        )}

        {activeTab === "backup" && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                margin: 0,
                marginBottom: '12px',
                color: '#212121',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Download size={24} color="#E4405F" />
                Respaldar Contenido
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#757575',
                margin: 0,
                marginBottom: '24px'
              }}>
                Descarga todo tu contenido de Instagram antes de realizar cambios.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {[
                  { type: "posts" as const, icon: ImageIcon, label: "Posts", subtitle: "Fotos y videos", color: "#E4405F" },
                  { type: "stories" as const, icon: Camera, label: "Stories", subtitle: "Historias guardadas", color: "#9c27b0" },
                  { type: "reels" as const, icon: Video, label: "Reels", subtitle: "Videos cortos", color: "#2196f3" },
                  { type: "all" as const, icon: Download, label: "Todo el Contenido", subtitle: "Respaldo completo", color: "#E4405F", isPrimary: true }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleBackup(item.type)}
                    disabled={isLoading}
                    style={{
                      background: item.isPrimary ? '#E4405F' : 'white',
                      color: item.isPrimary ? 'white' : '#212121',
                      padding: '20px',
                      borderRadius: '12px',
                      border: item.isPrimary ? 'none' : '2px solid #e0e0e0',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isLoading ? 0.5 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading && !item.isPrimary) {
                        e.currentTarget.style.borderColor = '#E4405F';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(228, 64, 95, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.isPrimary) {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <item.icon size={32} color={item.isPrimary ? 'white' : item.color} />
                    <div style={{ fontWeight: 600, fontSize: '16px', textAlign: 'center' }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.8,
                      textAlign: 'center'
                    }}>
                      {item.subtitle}
                    </div>
                  </button>
                ))}
              </div>

              {backupProgress.status !== "idle" && (
                <div style={{
                  background: '#f5f5f5',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#212121' }}>
                      Progreso del Respaldo
                    </span>
                    {backupProgress.status === "completed" && (
                      <CheckCircle2 size={20} color="#4caf50" />
                    )}
                    {backupProgress.status === "backing-up" && (
                      <Loader2 size={20} color="#E4405F" style={{ animation: 'spin 1s linear infinite' }} />
                    )}
                    {backupProgress.status === "error" && (
                      <AlertTriangle size={20} color="#f44336" />
                    )}
                  </div>
                  <div style={{
                    width: '100%',
                    background: '#e0e0e0',
                    borderRadius: '10px',
                    height: '8px',
                    marginBottom: '12px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        background: '#E4405F',
                        height: '100%',
                        borderRadius: '10px',
                        transition: 'width 0.3s ease',
                        width: `${
                          backupProgress.total > 0
                            ? (backupProgress.completed / backupProgress.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#757575'
                  }}>
                    <div>Posts: {backupProgress.posts}</div>
                    <div>Stories: {backupProgress.stories}</div>
                    <div>Reels: {backupProgress.reels}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "delete" && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              background: '#ffebee',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #ef5350',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                margin: 0,
                marginBottom: '12px',
                color: '#c62828',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertTriangle size={24} color="#c62828" />
                Eliminar Contenido
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#c62828',
                margin: 0,
                marginBottom: '24px',
                fontWeight: 500
              }}>
                ⚠️ Esta acción es irreversible. Asegúrate de haber respaldado tu contenido antes de proceder.
              </p>

              {deleteConfirm && (
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #ef5350',
                  marginBottom: '24px'
                }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: '16px',
                    color: '#212121'
                  }}>
                    ¿Estás seguro de que deseas eliminar {deleteType === "all" ? "todo el contenido" : `todos los ${deleteType}`}?
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleDelete(deleteType!)}
                      disabled={isLoading}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        opacity: isLoading ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) e.currentTarget.style.background = '#d32f2f';
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) e.currentTarget.style.background = '#f44336';
                      }}
                    >
                      {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirm(false);
                        setDeleteType(null);
                      }}
                      style={{
                        background: '#e0e0e0',
                        color: '#424242',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#bdbdbd'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#e0e0e0'}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {(["posts", "stories", "reels", "all"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleDelete(type)}
                    disabled={isLoading}
                    style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '2px solid #ef5350',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isLoading ? 0.5 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.borderColor = '#c62828';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(198, 40, 40, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#ef5350';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Trash2 size={32} color="#f44336" />
                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#212121' }}>
                      {type === "all" ? "Eliminar Todo" : `Eliminar ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "rebrand" && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                margin: 0,
                marginBottom: '12px',
                color: '#212121',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Palette size={24} color="#9c27b0" />
                Cambiar Look & Feel
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#757575',
                margin: 0,
                marginBottom: '24px'
              }}>
                Personaliza tu perfil de Instagram con la identidad de ODDY Market
              </p>

              <div style={{
                background: '#f5f5f5',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                marginBottom: '24px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: '16px',
                  color: '#212121',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Camera size={20} color="#9c27b0" />
                  Foto de Perfil
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div>
                    {profileSettings.profilePicture ? (
                      <img
                        src={profileSettings.profilePicture}
                        alt="Profile"
                        style={{
                          width: '96px',
                          height: '96px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #ce93d8'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '50%',
                        background: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #bdbdbd'
                      }}>
                        <Camera size={32} color="#9e9e9e" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        background: '#9c27b0',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'inline-block',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#7b1fa2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#9c27b0'}
                      >
                        Cambiar Foto
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f5f5f5',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: '8px',
                  color: '#212121',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Type size={20} color="#9c27b0" />
                  Información del Perfil
                </h4>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#212121'
                  }}>
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={profileSettings.username}
                    onChange={(e) =>
                      setProfileSettings((prev) => ({ ...prev, username: e.target.value }))
                    }
                    placeholder="oddymarket"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#9c27b0'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#212121'
                  }}>
                    Nombre para Mostrar
                  </label>
                  <input
                    type="text"
                    value={profileSettings.displayName}
                    onChange={(e) =>
                      setProfileSettings((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    placeholder="ODDY Market"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#9c27b0'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#212121'
                  }}>
                    Biografía
                  </label>
                  <textarea
                    value={profileSettings.bio}
                    onChange={(e) =>
                      setProfileSettings((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Tu biografía aquí (máximo 150 caracteres)"
                    maxLength={150}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#9c27b0'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px'
                  }}>
                    <p style={{ fontSize: '12px', color: '#757575', margin: 0 }}>
                      Puedes usar emojis y hashtags
                    </p>
                    <span style={{ fontSize: '12px', color: '#757575' }}>
                      {profileSettings.bio.length}/150
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#212121'
                  }}>
                    <LinkIcon size={16} />
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={profileSettings.website}
                    onChange={(e) =>
                      setProfileSettings((prev) => ({ ...prev, website: e.target.value }))
                    }
                    placeholder="https://oddymarket.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#9c27b0'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="private"
                    checked={profileSettings.isPrivate}
                    onChange={(e) =>
                      setProfileSettings((prev) => ({ ...prev, isPrivate: e.target.checked }))
                    }
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      accentColor: '#9c27b0'
                    }}
                  />
                  <label htmlFor="private" style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#212121',
                    cursor: 'pointer'
                  }}>
                    Cuenta Privada
                  </label>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: '#9c27b0',
                    color: 'white',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.background = '#7b1fa2';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.background = '#9c27b0';
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
