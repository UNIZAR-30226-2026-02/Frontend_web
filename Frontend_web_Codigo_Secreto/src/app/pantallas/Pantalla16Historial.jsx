/* Pantalla de historial de partidas */
import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Trophy, Skull, Clock, Users } from "lucide-react";
import { ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader } from "../components/ScreenFrame";
import { IconoBala } from "../components/IconoBala";

// Datos de ejemplo
const history = [
  { id: 1, name: "Misión de Béjar", date: "24/02/2026", result: "Victoria", role: "Agente", team: "Rojo", duration: "12:34", reward: 20 },
  { id: 2, name: "Misión de Adriana", date: "23/02/2026", result: "Derrota", role: "Jefe", team: "Azul", duration: "08:45", reward: 10 },
  { id: 3, name: "Misión de Berta", date: "23/02/2026", result: "Victoria", role: "Agente", team: "Rojo", duration: "15:02", reward: 20 },
  { id: 4, name: "Misión de Lidia", date: "22/02/2026", result: "Victoria", role: "Jefe", team: "Rojo", duration: "10:18", reward: 20 },
  { id: 5, name:"Misión de Imad", date: "22/02/2026", result: "Derrota", role: "Agente", team: "Azul", duration: "06:30", reward: 10 },
  { id: 6, name: "Misión de Rocío", date: "21/02/2026", result: "Victoria", role: "Agente", team: "Rojo", duration: "11:55", reward: 20 },
  { id: 7, name: "Misión de Bellido", date: "21/02/2026", result: "Derrota", role: "Jefe", team: "Azul", duration: "09:12", reward: 10 },
  { id: 8, name: "Misión de Blasco", date: "20/02/2026", result: "Victoria", role: "Agente", team: "Azul", duration: "14:08", reward: 20 },
  { id: 9, name: "Misión de Jordi", date: "20/02/2026", result: "Derrota", role: "Agente", team: "Rojo", duration: "07:33", reward: 10 },
  { id: 10, name: "Misión de Zarazaga", date: "19/02/2026", result: "Victoria", role: "Jefe", team: "Rojo", duration: "13:20", reward: 20 },
];

export function Pantalla16Historial() {
  const navigate = useNavigate();
  
  // Cálculo de victorias
  const wins = history.filter(h => h.result === "Victoria").length;
  const totalMissions = history.length;
  const winRatio = Math.round((wins / totalMissions) * 100);

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-12 pt-16 sm:pt-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Botón Volver */}
        <button 
          onClick={() => navigate("/home")} 
          className="flex items-center gap-2 text-[#8a7a60] hover:text-[#d4b878] transition-colors cursor-pointer mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 11 }}>
            VOLVER AL ESCRITORIO
          </span>
        </button>

        {/* Stack de papeles  */}
        <div className="relative">
          <div className="absolute -bottom-1 -right-1 w-full h-full bg-[#d8c8a0]/30 rounded-sm rotate-[0.5deg] hidden sm:block" />
          <div className="absolute -bottom-2 -right-2 w-full h-full bg-[#c8b890]/20 rounded-sm rotate-[1deg] hidden sm:block" />

          <div className="relative bg-[#e8dcc0] border border-[#b8a070]/40 rounded-sm shadow-[4px_6px_20px_rgba(0,0,0,0.5)] overflow-hidden">
            
            {/* Pestaña del archivo */}
            <div className="absolute -top-0 right-8 bg-[#c4a060] px-4 py-1.5 rounded-b-sm border-x border-b border-[#a08040] shadow-sm z-10">
              <span className="font-['Courier_Prime',monospace] text-[#2a1a08]" style={{ fontSize: 9 }}>
                HISTORIAL
              </span>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                <div>
                  <SectionHeader title="HISTORIAL DE MISIONES" />
                  <p className="font-['Courier_Prime',monospace] text-[#6a5a40] mt-1" style={{ fontSize: 11 }}>
                    Registro de las últimas 30 operaciones — {wins}/{totalMissions} victorias
                  </p>
                </div>
                <FBISeal size={44} />
              </div>

              {/* Resumen de estadísticas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "TOTAL", value: totalMissions.toString(), icon: <Clock className="w-4 h-4 text-[#5a4a30]" /> },
                  { label: "VICTORIAS", value: wins.toString(), icon: <Trophy className="w-4 h-4 text-[#2a5a2a]" /> },
                  { label: "DERROTAS", value: (totalMissions - wins).toString(), icon: <Skull className="w-4 h-4 text-[#5a2a2a]" /> },
                  { label: "RATIO", value: `${winRatio}%`, icon: <Users className="w-4 h-4 text-[#5a4a30]" /> },
                ].map((s) => (
                  <div key={s.label} className="bg-[#f5edd0]/70 border border-[#c4a060]/25 rounded-sm p-3 text-center">
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <p className="font-['Courier_Prime',monospace] text-[#3a2a10]" style={{ fontSize: 18 }}>{s.value}</p>
                    <p className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 8 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Listado de misiones */}
              <div className="space-y-2">
                {history.map((h) => {
                  const isWin = h.result === "Victoria";
                  return (
                    <div key={h.id} className="bg-[#f0e4c8]/50 border border-[#c4a060]/20 rounded-sm p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-2 h-8 rounded-full flex-shrink-0 ${isWin ? "bg-[#2a5a2a]" : "bg-[#5a2a2a]"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-['Courier_Prime',monospace] text-[#3a2a10] truncate" style={{ fontSize: 12 }}>{h.name}</p>
                            <span className={`font-['Courier_Prime',monospace] px-1.5 py-0.5 rounded-sm ${
                              isWin ? "bg-[#2a5a2a]/15 text-[#2a5a2a]" : "bg-[#5a2a2a]/15 text-[#5a2a2a]"
                            }`} style={{ fontSize: 8 }}>{h.result}</span>
                          </div>
                          <p className="font-['Courier_Prime',monospace] text-[#8a7a60] mt-0.5" style={{ fontSize: 9 }}>
                            {h.date} — {h.role} — Equipo {h.team} — {h.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <IconoBala size={12} />
                        <span className="font-['Courier_Prime',monospace] text-[#5a4a30]" style={{ fontSize: 11 }}>
                          +{h.reward}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pie de página */}
              <div className="mt-6 flex items-center justify-between flex-wrap gap-2">
                <span className="font-['Courier_Prime',monospace] text-[#8a7a60]/50" style={{ fontSize: 8 }}>
                  DOC: FBI-HISTORIAL-1976
                </span>
                <RedStamp text="CLASSIFIED" className="rotate-[3deg]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}