"use client";

import { useState } from "react";
import {
  Facebook,
  Download,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Camera,
  Palette,
  Type,
  Link as LinkIcon,
  MapPin,
  Calendar,
  Building2,
  Image as ImageIcon,
  Video,
  FileText,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MetaMigrationSetup } from "./MetaMigrationSetup";
import { facebookMigrationService } from "../services/facebookMigrationService";

interface BackupProgress {
  posts: number;
  photos: number;
  videos: number;
  events: number;
  total: number;
  completed: number;
  status: "idle" | "backing-up" | "completed" | "error";
}

interface PageSettings {
  name: string;
  username: string;
  category: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  coverPhoto: string | null;
  profilePicture: string | null;
}

export function FacebookMigration() {
  const [activeTab, setActiveTab] = useState<"setup" | "backup" | "delete" | "rebrand">("setup");
  const [backupProgress, setBackupProgress] = useState<BackupProgress>({
    posts: 0,
    photos: 0,
    videos: 0,
    events: 0,
    total: 0,
    completed: 0,
    status: "idle",
  });
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    name: "",
    username: "",
    category: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    coverPhoto: null,
    profilePicture: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<"posts" | "photos" | "videos" | "all" | null>(null);

  const tabs = [
    { id: "setup", label: "Configuración", icon: Settings },
    { id: "backup", label: "Respaldar Contenido", icon: Download },
    { id: "delete", label: "Eliminar Contenido", icon: Trash2 },
    { id: "rebrand", label: "Cambiar Look & Feel", icon: Palette },
  ];

  const handleBackup = async (type: "posts" | "photos" | "videos" | "events" | "all") => {
    setIsLoading(true);
    setBackupProgress({
      posts: 0,
      photos: 0,
      videos: 0,
      events: 0,
      total: 0,
      completed: 0,
      status: "backing-up",
    });

    try {
      const result = await facebookMigrationService.backupContent({ type });
      setBackupProgress({
        posts: result.posts || 0,
        photos: result.photos || 0,
        videos: result.videos || 0,
        events: result.events || 0,
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

  const handleDelete = async (type: "posts" | "photos" | "videos" | "all") => {
    if (!deleteConfirm) {
      setDeleteType(type);
      setDeleteConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await facebookMigrationService.deleteContent({ type });
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

  const handleUpdatePage = async () => {
    setIsLoading(true);
    try {
      const result = await facebookMigrationService.updatePage(pageSettings);
      toast.success(result.message || "Página actualizada exitosamente");
    } catch (error: any) {
      console.error("Error actualizando página:", error);
      toast.error(error.message || "Error al actualizar página");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "coverPhoto" | "profilePicture") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        let result;
        if (type === "coverPhoto") {
          result = await facebookMigrationService.uploadCoverPhoto(base64);
        } else {
          result = await facebookMigrationService.uploadProfilePicture(base64);
        }
        setPageSettings((prev) => ({ ...prev, [type]: result.url }));
        toast.success(`${type === "coverPhoto" ? "Foto de portada" : "Foto de perfil"} actualizada`);
      } catch (error: any) {
        toast.error(error.message || "Error al subir imagen");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(24, 119, 242, 0.3)',
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
          <Facebook size={40} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
            Migración de Página Facebook
          </h2>
          <p style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>
            Respaldar, eliminar y transformar tu página de Facebook para ODDY Market
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '8px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? '#1877F2' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#757575',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.color = '#212121';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#757575';
              }
            }}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "setup" && (
          <div style={{ marginBottom: '24px' }}>
            <MetaMigrationSetup defaultPlatform="facebook" />
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
                <Download size={24} color="#1877F2" />
                Respaldar Contenido
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#757575',
                margin: 0,
                marginBottom: '24px'
              }}>
                Descarga todo el contenido de tu página de Facebook antes de realizar cambios.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {[
                  { type: "posts" as const, icon: FileText, label: "Posts", color: "#1877F2" },
                  { type: "photos" as const, icon: ImageIcon, label: "Fotos", color: "#4caf50" },
                  { type: "videos" as const, icon: Video, label: "Videos", color: "#f44336" },
                  { type: "events" as const, icon: Calendar, label: "Eventos", color: "#9c27b0" },
                  { type: "all" as const, icon: Download, label: "Todo", color: "#1877F2", isPrimary: true }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleBackup(item.type)}
                    disabled={isLoading}
                    style={{
                      background: item.isPrimary ? '#1877F2' : 'white',
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
                        e.currentTarget.style.borderColor = '#1877F2';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.2)';
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
                      <Loader2 size={20} color="#1877F2" style={{ animation: 'spin 1s linear infinite' }} />
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
                        background: '#1877F2',
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
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#757575'
                  }}>
                    <div>Posts: {backupProgress.posts}</div>
                    <div>Fotos: {backupProgress.photos}</div>
                    <div>Videos: {backupProgress.videos}</div>
                    <div>Eventos: {backupProgress.events}</div>
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
                {(["posts", "photos", "videos", "all"] as const).map((type) => (
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
                <Palette size={24} color="#1877F2" />
                Cambiar Look & Feel
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#757575',
                margin: 0,
                marginBottom: '24px'
              }}>
                Personaliza tu página de Facebook con la identidad de ODDY Market
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
                  <Camera size={20} color="#1877F2" />
                  Imágenes de la Página
                </h4>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#212121'
                  }}>
                    Foto de Portada
                  </label>
                  <div>
                    {pageSettings.coverPhoto ? (
                      <img
                        src={pageSettings.coverPhoto}
                        alt="Cover"
                        style={{
                          width: '100%',
                          height: '192px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '2px solid #90caf9'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '192px',
                        background: '#e0e0e0',
                        borderRadius: '12px',
                        border: '2px solid #bdbdbd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Camera size={48} color="#9e9e9e" />
                      </div>
                    )}
                  </div>
                  <label style={{ cursor: 'pointer', display: 'inline-block', marginTop: '12px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "coverPhoto")}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      background: '#1877F2',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'inline-block',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1565C0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1877F2'}
                    >
                      Cambiar Foto de Portada
                    </span>
                  </label>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#212121'
                  }}>
                    Foto de Perfil
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div>
                      {pageSettings.profilePicture ? (
                        <img
                          src={pageSettings.profilePicture}
                          alt="Profile"
                          style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #90caf9'
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
                          onChange={(e) => handleImageUpload(e, "profilePicture")}
                          style={{ display: 'none' }}
                        />
                        <span style={{
                          background: '#1877F2',
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          display: 'inline-block',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1565C0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#1877F2'}
                        >
                          Cambiar Foto de Perfil
                        </span>
                      </label>
                    </div>
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
                  <Building2 size={20} color="#1877F2" />
                  Información Básica
                </h4>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#212121'
                  }}>
                    Nombre de la Página
                  </label>
                  <input
                    type="text"
                    value={pageSettings.name}
                    onChange={(e) =>
                      setPageSettings((prev) => ({ ...prev, name: e.target.value }))
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
                    onFocus={(e) => e.currentTarget.style.borderColor = '#1877F2'}
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
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={pageSettings.username}
                    onChange={(e) =>
                      setPageSettings((prev) => ({ ...prev, username: e.target.value }))
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
                    onFocus={(e) => e.currentTarget.style.borderColor = '#1877F2'}
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
                    Descripción
                  </label>
                  <textarea
                    value={pageSettings.description}
                    onChange={(e) =>
                      setPageSettings((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Descripción de tu página"
                    rows={4}
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
                    onFocus={(e) => e.currentTarget.style.borderColor = '#1877F2'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
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
                    value={pageSettings.website}
                    onChange={(e) =>
                      setPageSettings((prev) => ({ ...prev, website: e.target.value }))
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
                    onFocus={(e) => e.currentTarget.style.borderColor = '#1877F2'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: '#212121'
                    }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={pageSettings.phone}
                      onChange={(e) =>
                        setPageSettings((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+598 99 123 456"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#1877F2'}
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
                      Email
                    </label>
                    <input
                      type="email"
                      value={pageSettings.email}
                      onChange={(e) =>
                        setPageSettings((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="contacto@oddymarket.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#1877F2'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                    />
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
                    <MapPin size={16} />
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={pageSettings.address}
                    onChange={(e) =>
                      setPageSettings((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Dirección completa"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#1877F2'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <button
                  onClick={handleUpdatePage}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: '#1877F2',
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
                    if (!isLoading) e.currentTarget.style.background = '#1565C0';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.background = '#1877F2';
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
