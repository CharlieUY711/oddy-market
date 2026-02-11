import { useState, useEffect } from "react";
import {
  Facebook,
  Plus,
  Send,
  Image,
  Video,
  Calendar,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface FacebookPost {
  id: string;
  content: string;
  type: "text" | "image" | "video" | "link";
  mediaUrl?: string;
  status: "draft" | "scheduled" | "published";
  scheduledFor?: string;
  publishedAt?: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
}

interface FacebookMessage {
  id: string;
  from: string;
  fromId: string;
  message: string;
  timestamp: string;
  read: boolean;
  replied: boolean;
}

export function FacebookManagement() {
  const [activeView, setActiveView] = useState<"posts" | "messages">("posts");
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [messages, setMessages] = useState<FacebookMessage[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(false);

  const [postForm, setPostForm] = useState({
    content: "",
    type: "text" as FacebookPost["type"],
    mediaUrl: "",
    scheduledFor: "",
  });

  useEffect(() => {
    loadPosts();
    loadMessages();
  }, []);

  async function loadPosts() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/social/facebook/posts`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error loading Facebook posts:", error);
    }
  }

  async function loadMessages() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/social/facebook/messages`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading Facebook messages:", error);
    }
  }

  async function createPost() {
    if (!postForm.content) {
      toast.error("El contenido es requerido");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/social/facebook/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(postForm),
        }
      );

      if (response.ok) {
        toast.success("Publicación creada");
        loadPosts();
        closeNewPost();
      } else {
        toast.error("Error al crear publicación");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Error al crear publicación");
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta publicación?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/social/facebook/posts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Publicación eliminada");
        loadPosts();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error al eliminar publicación");
    }
  }

  function closeNewPost() {
    setShowNewPost(false);
    setPostForm({
      content: "",
      type: "text",
      mediaUrl: "",
      scheduledFor: "",
    });
  }

  const stats = {
    totalPosts: posts.length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    totalLikes: posts.reduce((sum, p) => sum + p.stats.likes, 0),
    totalReach: posts.reduce((sum, p) => sum + p.stats.reach, 0),
    unreadMessages: messages.filter((m) => !m.read).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-[#1877F2]/10 to-[#1877F2]/5 p-4 rounded-lg border border-[#1877F2]/20">
          <div className="flex items-center gap-2 mb-2">
            <Facebook className="w-5 h-5 text-[#1877F2]" />
            <span className="text-sm font-medium">18.5K</span>
          </div>
          <div className="text-xs text-muted-foreground">Seguidores</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">{stats.totalLikes}</span>
          </div>
          <div className="text-xs text-muted-foreground">Total Likes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">
              {(stats.totalReach / 1000).toFixed(1)}K
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Alcance</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium">{stats.scheduled}</span>
          </div>
          <div className="text-xs text-muted-foreground">Programadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">{stats.unreadMessages}</span>
          </div>
          <div className="text-xs text-muted-foreground">Sin leer</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView("posts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeView === "posts"
              ? "bg-primary text-white"
              : "bg-white border border-border hover:bg-muted"
          }`}
        >
          <Image className="w-5 h-5" />
          Publicaciones
        </button>
        <button
          onClick={() => setActiveView("messages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeView === "messages"
              ? "bg-primary text-white"
              : "bg-white border border-border hover:bg-muted"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          Mensajes
          {stats.unreadMessages > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {stats.unreadMessages}
            </span>
          )}
        </button>
      </div>

      {activeView === "posts" ? (
        <>
          {/* New Post Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-lg hover:bg-[#1877F2]/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Publicación
            </button>
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-lg border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          post.status === "published"
                            ? "bg-green-100 text-green-700"
                            : post.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {post.status === "published"
                          ? "Publicado"
                          : post.status === "scheduled"
                          ? "Programado"
                          : "Borrador"}
                      </span>
                      {post.type !== "text" && (
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">
                          {post.type === "image"
                            ? "Imagen"
                            : post.type === "video"
                            ? "Video"
                            : "Link"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{post.content}</p>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {post.scheduledFor && post.status === "scheduled" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    Programado para:{" "}
                    {new Date(post.scheduledFor).toLocaleString()}
                  </div>
                )}

                {post.status === "published" && (
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-red-600">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-bold">
                          {post.stats.likes}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-bold">
                          {post.stats.comments}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Comentarios
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-bold">
                          {post.stats.shares}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Compartidos
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-600">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-bold">
                          {(post.stats.reach / 1000).toFixed(1)}K
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Alcance</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No hay publicaciones
            </div>
          )}
        </>
      ) : (
        <>
          {/* Messages List */}
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer ${
                  !message.read ? "bg-blue-50/50" : "bg-white"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#1877F2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{message.from}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {message.message}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {!message.replied && (
                      <button
                        onClick={() => toast.info("Responder mensaje")}
                        className="text-xs text-primary hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors"
                      >
                        Responder
                      </button>
                    )}
                    {message.replied && (
                      <span className="text-xs text-green-600">
                        ✓ Respondido
                      </span>
                    )}
                  </div>
                </div>
                {!message.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>

          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No hay mensajes
            </div>
          )}
        </>
      )}

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeNewPost}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Facebook className="w-6 h-6 text-[#1877F2]" />
                  Nueva Publicación en Facebook
                </h2>
                <button
                  onClick={closeNewPost}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Publicación
                  </label>
                  <div className="flex gap-2">
                    {(["text", "image", "video", "link"] as const).map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() =>
                            setPostForm({ ...postForm, type })
                          }
                          className={`flex-1 py-2 rounded-lg border transition-colors ${
                            postForm.type === type
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {type === "text"
                            ? "Texto"
                            : type === "image"
                            ? "Imagen"
                            : type === "video"
                            ? "Video"
                            : "Link"}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contenido *
                  </label>
                  <textarea
                    value={postForm.content}
                    onChange={(e) =>
                      setPostForm({ ...postForm, content: e.target.value })
                    }
                    rows={4}
                    placeholder="¿Qué quieres compartir?"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {postForm.type !== "text" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL del {postForm.type === "image" ? "Imagen" : postForm.type === "video" ? "Video" : "Link"}
                    </label>
                    <input
                      type="url"
                      value={postForm.mediaUrl}
                      onChange={(e) =>
                        setPostForm({ ...postForm, mediaUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Programar Publicación (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={postForm.scheduledFor}
                    onChange={(e) =>
                      setPostForm({
                        ...postForm,
                        scheduledFor: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createPost}
                    disabled={loading}
                    className="flex-1 bg-[#1877F2] text-white py-3 rounded-lg hover:bg-[#1877F2]/90 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading
                      ? "Publicando..."
                      : postForm.scheduledFor
                      ? "Programar"
                      : "Publicar Ahora"}
                  </button>
                  <button
                    onClick={closeNewPost}
                    className="flex-1 border border-border py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
