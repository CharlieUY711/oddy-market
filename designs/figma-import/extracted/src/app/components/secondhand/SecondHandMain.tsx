import { useState } from "react";
import { Store, User, Shield } from "lucide-react";
import { SecondHandMarketplace } from "./SecondHandMarketplace";
import { SecondHandSeller } from "./SecondHandSeller";
import { SecondHandAdmin } from "./SecondHandAdmin";

interface SecondHandMainProps {
  user?: any;
  session?: any;
  initialView?: "marketplace" | "seller" | "admin";
}

export function SecondHandMain({
  user,
  session,
  initialView = "marketplace",
}: SecondHandMainProps) {
  const [currentView, setCurrentView] = useState<
    "marketplace" | "seller" | "admin"
  >(initialView);

  const isAdmin = user?.user_metadata?.role === "admin";

  if (currentView === "seller" && !user) {
    setCurrentView("marketplace");
  }

  if (currentView === "admin" && !isAdmin) {
    setCurrentView("marketplace");
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800">
                🔄 Second Hand
              </h2>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView("marketplace")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  currentView === "marketplace"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Store className="w-4 h-4" />
                <span className="hidden md:inline">Marketplace</span>
              </button>

              {user && (
                <button
                  onClick={() => setCurrentView("seller")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    currentView === "seller"
                      ? "bg-cyan-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Mis Publicaciones</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setCurrentView("admin")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    currentView === "admin"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden md:inline">Moderación</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {currentView === "marketplace" && (
        <SecondHandMarketplace user={user} session={session} />
      )}

      {currentView === "seller" && user && (
        <SecondHandSeller
          user={user}
          session={session}
          onClose={() => setCurrentView("marketplace")}
        />
      )}

      {currentView === "admin" && isAdmin && (
        <SecondHandAdmin
          session={session}
          onClose={() => setCurrentView("marketplace")}
        />
      )}
    </div>
  );
}
