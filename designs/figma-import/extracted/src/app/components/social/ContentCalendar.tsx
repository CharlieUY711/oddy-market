import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Facebook, Instagram, MessageCircle } from "lucide-react";

export function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Mock scheduled posts
  const scheduledPosts = {
    5: [
      { platform: "facebook", content: "Promoción especial" },
      { platform: "instagram", content: "Nueva colección" },
    ],
    12: [{ platform: "whatsapp", content: "Broadcast semanal" }],
    18: [
      { platform: "facebook", content: "Post de engagement" },
      { platform: "instagram", content: "Story del día" },
    ],
    25: [{ platform: "instagram", content: "Reel del producto" }],
  };

  function previousMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  }

  function getPlatformIcon(platform: string) {
    switch (platform) {
      case "facebook":
        return <Facebook className="w-3 h-3 text-[#1877F2]" />;
      case "instagram":
        return <Instagram className="w-3 h-3 text-[#E4405F]" />;
      case "whatsapp":
        return <MessageCircle className="w-3 h-3 text-[#25D366]" />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Calendario de Contenido</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold min-w-[150px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-sm text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const posts = scheduledPosts[day as keyof typeof scheduledPosts] || [];
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`aspect-square border border-border rounded-lg p-2 hover:bg-muted/30 transition-colors cursor-pointer ${
                  isToday ? "bg-primary/10 border-primary" : ""
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday ? "text-primary" : ""
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {posts.map((post, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-white p-1 rounded text-xs"
                      title={post.content}
                    >
                      {getPlatformIcon(post.platform)}
                      <span className="truncate flex-1">{post.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg border border-border">
        <h4 className="font-bold mb-3">Leyenda</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1877F2]/20 rounded" />
            <span className="text-sm">Facebook</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#E4405F]/20 rounded" />
            <span className="text-sm">Instagram</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#25D366]/20 rounded" />
            <span className="text-sm">WhatsApp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/20 rounded border-2 border-primary" />
            <span className="text-sm">Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
