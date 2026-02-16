import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  File, 
  Upload, 
  Trash2, 
  Download, 
  Eye, 
  Search, 
  Grid3x3, 
  List, 
  Folder, 
  Copy,
  Wand2,
  FileText,
  Loader2,
  FolderPlus
} from 'lucide-react';
import { getViewContext, getMenuBarType } from '@utils/viewConfig';
import styles from './Library.module.css';

export const LibraryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('images');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [uploading, setUploading] = useState(false);

  // Configuración de API
  const getApiUrl = (endpoint) => {
    const apiBase = import.meta.env.VITE_API_URL || 'https://yomgqobfmgatavnbtvdz.supabase.co';
    const apiPrefix = import.meta.env.VITE_API_PREFIX || '/functions/v1';
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${apiBase}${apiPrefix}${path}`;
  };
  
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWdxb2JmbWdhdGF2bmJ0dmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzAzMTksImV4cCI6MjA4NjAwNjMxOX0.yZ9Zb6Jz9BKZTkn7Ld8TzeLyHsb8YhBAoCvFLPBiqZk';

  // Configuración de vista
  const [menuBarType, setMenuBarType] = useState(null);
  const [viewContext, setViewContext] = useState({
    name: 'Biblioteca',
    tipoVista: 'list',
    permisos: 'admin'
  });

  useEffect(() => {
    const menuType = getMenuBarType(location.pathname);
    const context = getViewContext(location.pathname);
    setMenuBarType(menuType);
    setViewContext(context);
  }, [location.pathname]);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeTab, selectedFolder, files]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        getApiUrl('make-server-0dd48dc4/library?entity_id=default'),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const adaptedFiles = (data.files || []).map(file => ({
          id: file.id,
          name: file.filename || file.original_filename || 'Sin nombre',
          type: file.file_type === 'image' ? 'image' : 'document',
          url: file.url,
          size: file.size_bytes || 0,
          mimeType: file.mime_type || 'application/octet-stream',
          folder: file.folder_path || null,
          uploadedAt: file.created_at || new Date().toISOString(),
          thumbnail: file.thumbnail_url || null,
        }));
        setFiles(adaptedFiles);
      } else {
        console.warn('No se pudieron cargar archivos desde el backend');
        setFiles([]);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = files.filter(f => {
      const fileType = activeTab === 'images' ? 'image' : 'document';
      return f.type === fileType;
    });

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query)
      );
    }

    if (selectedFolder !== 'all') {
      filtered = filtered.filter(f => f.folder === selectedFolder);
    }

    setFilteredFiles(filtered);
  };

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(fileList).map(async (file) => {
        try {
          const formData = new FormData();
          
          if (activeTab === 'images') {
            formData.append('image', file);
            
            const uploadResponse = await fetch(
              getApiUrl('make-server-0dd48dc4/images/upload'),
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: formData,
              }
            );

            if (!uploadResponse.ok) {
              throw new Error('Error al subir imagen');
            }

            const uploadData = await uploadResponse.json();
            const fileUrl = uploadData.url;

            const libraryResponse = await fetch(
              getApiUrl('make-server-0dd48dc4/library/upload'),
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  filename: file.name,
                  url: fileUrl,
                  original_filename: file.name,
                  file_type: 'image',
                  mime_type: file.type,
                  size_bytes: file.size,
                  folder_path: selectedFolder !== 'all' ? selectedFolder : '/',
                  entity_id: 'default',
                }),
              }
            );

            return libraryResponse.ok;
          } else {
            // Para documentos, usar un endpoint genérico o simular
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yomgqobfmgatavnbtvdz.supabase.co';
            const mockUrl = `${supabaseUrl}/storage/v1/object/public/make-0dd48dc4-media/documents/${fileName}`;
            
            const libraryResponse = await fetch(
              getApiUrl('make-server-0dd48dc4/library/upload'),
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  filename: fileName,
                  url: mockUrl,
                  original_filename: file.name,
                  file_type: 'document',
                  mime_type: file.type,
                  size_bytes: file.size,
                  folder_path: selectedFolder !== 'all' ? selectedFolder : '/',
                  entity_id: 'default',
                }),
              }
            );

            return libraryResponse.ok;
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          return false;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(Boolean).length;

      if (successCount > 0) {
        alert(`${successCount} archivo(s) subido(s) exitosamente`);
        loadFiles();
      } else {
        alert('Error al subir archivos. Por favor, verifica la configuración del servidor.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id) => {
    if (!confirm('¿Eliminar este archivo?')) return;

    try {
      const response = await fetch(
        getApiUrl(`make-server-0dd48dc4/library/${id}`),
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (response.ok) {
        alert('Archivo eliminado');
        loadFiles();
      } else {
        alert('Error al eliminar archivo');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error al eliminar archivo');
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('URL copiada al portapapeles');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Error al copiar URL');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const folders = Array.from(new Set(files.map(f => f.folder).filter(Boolean)));
  const stats = {
    images: {
      total: files.filter(f => f.type === 'image').length,
      size: files.filter(f => f.type === 'image').reduce((sum, f) => sum + f.size, 0),
    },
    documents: {
      total: files.filter(f => f.type === 'document').length,
      size: files.filter(f => f.type === 'document').reduce((sum, f) => sum + f.size, 0),
    },
  };

  return (
    <div className={styles.libraryContainer}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Biblioteca de Medios</h2>
            <p className={styles.subtitle}>
              Gestiona todas tus imágenes y archivos en un solo lugar
            </p>
          </div>

          <div className={styles.headerActions}>
            {activeTab === 'images' && (
              <button
                onClick={() => {}}
                className={styles.editorButton}
              >
                <Wand2 size={16} />
                <span>Editor de Imágenes</span>
              </button>
            )}

            <label className={styles.uploadButton}>
              <Upload size={16} />
              <span>{uploading ? 'Subiendo...' : 'Subir Archivos'}</span>
              <input
                type="file"
                multiple
                accept={activeTab === 'images' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.txt'}
                onChange={(e) => handleUpload(e.target.files)}
                className={styles.hiddenInput}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('images')}
            className={`${styles.tab} ${activeTab === 'images' ? styles.tabActive : ''}`}
          >
            <ImageIcon size={20} />
            <span>Imágenes</span>
            <span className={styles.tabBadge}>{stats.images.total}</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`${styles.tab} ${activeTab === 'documents' ? styles.tabActive : ''}`}
          >
            <File size={20} />
            <span>Documentos</span>
            <span className={styles.tabBadge}>{stats.documents.total}</span>
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total de Archivos</span>
              {activeTab === 'images' ? (
                <ImageIcon size={20} className={styles.statIcon} />
              ) : (
                <File size={20} className={styles.statIcon} />
              )}
            </div>
            <p className={styles.statValue}>
              {activeTab === 'images' ? stats.images.total : stats.documents.total}
            </p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Espacio Utilizado</span>
              <Folder size={20} className={styles.statIcon} />
            </div>
            <p className={styles.statValue}>
              {formatFileSize(activeTab === 'images' ? stats.images.size : stats.documents.size)}
            </p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Carpetas</span>
              <FolderPlus size={20} className={styles.statIcon} />
            </div>
            <p className={styles.statValue}>{folders.length}</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className={styles.folderSelect}
          >
            <option value="all">Todas las carpetas</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>

          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.viewButtonActive : ''}`}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.viewButtonActive : ''}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Cargando archivos...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className={styles.emptyState}>
            {activeTab === 'images' ? (
              <ImageIcon size={64} className={styles.emptyIcon} />
            ) : (
              <File size={64} className={styles.emptyIcon} />
            )}
            <h3 className={styles.emptyTitle}>No hay archivos</h3>
            <p className={styles.emptyText}>
              {searchQuery ? 'No se encontraron resultados' : 'Sube tu primer archivo'}
            </p>
            <label className={styles.uploadButton}>
              <Upload size={16} />
              <span>Subir Archivos</span>
              <input
                type="file"
                multiple
                accept={activeTab === 'images' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.txt'}
                onChange={(e) => handleUpload(e.target.files)}
                className={styles.hiddenInput}
              />
            </label>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.grid}>
            {filteredFiles.map(file => (
              <div key={file.id} className={styles.fileCard}>
                <div className={styles.fileThumbnail}>
                  {file.type === 'image' ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className={styles.fileImage}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagen%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className={styles.fileDocument}>
                      <FileText size={48} />
                    </div>
                  )}

                  <div className={styles.fileOverlay}>
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className={styles.overlayButton}
                      title="Ver"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className={styles.overlayButton}
                      title="Copiar URL"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className={`${styles.overlayButton} ${styles.deleteButton}`}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.fileInfo}>
                  <p className={styles.fileName} title={file.name}>{file.name}</p>
                  <p className={styles.fileSize}>{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {filteredFiles.map((file, index) => (
              <div 
                key={file.id} 
                className={`${styles.listItem} ${index !== 0 ? styles.listItemBorder : ''}`}
              >
                <div className={styles.listThumbnail}>
                  {file.type === 'image' ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className={styles.listImage}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className={styles.listDocument}>
                      <FileText size={32} />
                    </div>
                  )}
                </div>

                <div className={styles.listInfo}>
                  <p className={styles.listName} title={file.name}>{file.name}</p>
                  <p className={styles.listMeta}>
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className={styles.listActions}>
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className={styles.actionButton}
                    title="Ver"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className={styles.actionButton}
                    title="Copiar URL"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = file.url;
                      a.download = file.name;
                      a.click();
                    }}
                    className={styles.actionButton}
                    title="Descargar"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className={`${styles.actionButton} ${styles.deleteAction}`}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
