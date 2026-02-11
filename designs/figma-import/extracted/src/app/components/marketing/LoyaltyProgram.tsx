import { useState } from "react";
import { Trophy, Gift, Star, Users, Award, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function LoyaltyProgram() {
  const [pointsPerDollar, setPointsPerDollar] = useState(10);
  const [redemptionRate, setRedemptionRate] = useState(100);

  const tierData = [
    { tier: "Bronce", members: 450, color: "#CD7F32" },
    { tier: "Plata", members: 320, color: "#C0C0C0" },
    { tier: "Oro", members: 180, color: "#FFD700" },
    { tier: "Platino", members: 90, color: "#E5E4E2" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-8 h-8 text-purple-600" />
          Programa de Fidelización
        </h2>
        <p className="text-muted-foreground">Recompensa a tus clientes más leales</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-lg">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-2xl font-bold">1,240</p>
          <p className="text-sm opacity-90">Miembros activos</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <Award className="w-8 h-8 text-yellow-600 mb-3" />
          <p className="text-2xl font-bold">124,500</p>
          <p className="text-sm text-muted-foreground">Puntos canjeados</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <Gift className="w-8 h-8 text-green-600 mb-3" />
          <p className="text-2xl font-bold">$8,450</p>
          <p className="text-sm text-muted-foreground">Valor recompensas</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
          <p className="text-2xl font-bold">+45%</p>
          <p className="text-sm text-muted-foreground">Retención clientes</p>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-border space-y-4">
          <h3 className="font-bold">Configuración de Puntos</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Puntos por dólar gastado: {pointsPerDollar}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={pointsPerDollar}
              onChange={(e) => setPointsPerDollar(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Puntos por {redemptionRate} = $1 de descuento
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={redemptionRate}
              onChange={(e) => setRedemptionRate(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-purple-900 mb-2">Ejemplo:</p>
            <p className="text-sm text-purple-800">
              Un cliente que compra por $100 recibirá {pointsPerDollar * 100} puntos.
              Al juntar {redemptionRate} puntos podrá canjearlos por $1 de descuento.
            </p>
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h3 className="font-bold mb-4">Distribución por Niveles</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tierData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tier" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="members" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tiers */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h3 className="font-bold mb-4">Niveles de Membresía</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: "Bronce", min: 0, color: "from-orange-400 to-orange-600", benefits: ["5% descuento", "Puntos x1"] },
            { name: "Plata", min: 500, color: "from-gray-300 to-gray-500", benefits: ["10% descuento", "Puntos x1.5", "Envío gratis"] },
            { name: "Oro", min: 2000, color: "from-yellow-400 to-yellow-600", benefits: ["15% descuento", "Puntos x2", "Acceso anticipado"] },
            { name: "Platino", min: 5000, color: "from-purple-400 to-purple-600", benefits: ["20% descuento", "Puntos x3", "Soporte VIP"] },
          ].map((tier) => (
            <div key={tier.name} className={`bg-gradient-to-br ${tier.color} text-white p-6 rounded-lg`}>
              <Star className="w-8 h-8 mb-3 opacity-80" />
              <h4 className="text-xl font-bold mb-2">{tier.name}</h4>
              <p className="text-sm opacity-90 mb-3">Desde {tier.min} puntos</p>
              <ul className="text-sm space-y-1">
                {tier.benefits.map((benefit, i) => (
                  <li key={i}>• {benefit}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
