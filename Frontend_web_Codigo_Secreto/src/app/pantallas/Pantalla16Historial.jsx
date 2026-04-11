/* Pantalla de historial de partidas: Muestra las últimas 30 partidas */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Trophy, Skull, Clock, Users, Loader2 } from "lucide-react";
import { ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader } from "../components/ScreenFrame";
import { IconoBala } from "../components/IconoBala";

import { obtenerHistorial } from "../api/apiJugador"; 

export function Pantalla16Historial() {
  const navigate = useNavigate();
  
  // Estados para guardar los datos, el estado de carga y posibles errores
  const [history, setHistory] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargamos los datos al montar el componente
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setCargando(true);
        const data = await obtenerHistorial();
        
        // Mapeamos los datos del backend (PartidaResumenDTO) al formato de la UI
        const partidasMapeadas = (data.partidas || []).map(p => ({
          id: p.id_partida,
          // Usamos el tag_creador para el nombre de la misión
          name: `Misión de ${p.tag_creador || p.nombre_tema || "Desconocido"}`,
          // Formateamos la fecha (viene como LocalDateTime, ej: "2026-04-06T10:30:00")
          date: new Date(p.fecha_fin).toLocaleDateString('es-ES'),
          result: p.victoria ? "Victoria" : "Derrota",
          role: p.rol_jugador?.toLowerCase() === "lider" ? "Jefe" : "Agente",
          team: p.equipo_jugador?.toLowerCase() === "rojo" ? "Rojo" : "Azul",
          // Reemplazamos la "duración" por los aciertos/fallos si es agente
          statsExtra: p.rol_jugador?.toLowerCase() === "agente" 
            ? `${p.num_aciertos}✔ ${p.num_fallos}✖` 
            : p.nombre_tema, // Si es Jefe, mostramos el tema
          // Lógica de recompensa: +20 si es victoria, +10 si es derrota
          reward: p.victoria ? 20 : 10 
        }));

        setHistory(partidasMapeadas);
      } catch (err) {
        console.error("Error al cargar historial:", err);
        setError("No se pudo acceder al archivo de la central.");
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, []); // Se ejecuta solo una vez, al cargar la página.
  
  // Cálculos dinámicos basados en el estado
  const wins = history.filter(h => h.result === "Victoria").length;
  const totalMissions = history.length;
  // Evitamos NaN si el historial está vacío
  const winRatio = totalMissions > 0 ? Math.round((wins / totalMissions) * 100) : 0;

  // Pantalla de carga mientras se obtienen los datos
  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#1a1a1a]">
        <Loader2 className="w-10 h-10 animate-spin text-[#d4b878]" />
        <p className="font-['Courier_Prime',monospace] text-[#d4b878] animate-pulse">
          EXTRAYENDO ARCHIVOS DE LA CENTRAL...
        </p>
      </div>
    );
  }

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
                    {error ? error : `Registro de las últimas 30 operaciones — ${wins}/${totalMissions} victorias`}
                  </p>
                </div>
                <FBISeal size={44} />
              </div>

              {/* Resumen de estadísticas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: "TOTAL", value: totalMissions.toString(), icon: <Clock className="w-4 h-4 text-[#5a4a30]" /> },
                  { label: "VICTORIAS", value: wins.toString(), icon: <Trophy className="w-4 h-4 text-[#2a5a2a]" /> },
                  { label: "DERROTAS", value: (totalMissions - wins).toString(), icon: <Skull className="w-4 h-4 text-[#5a2a2a]" /> },
                  //{ label: "RATIO", value: `${winRatio}%`, icon: <Users className="w-4 h-4 text-[#5a4a30]" /> },
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
                {history.length === 0 && !error && (
                  <p className="font-['Courier_Prime',monospace] text-center text-[#423D36] py-8" style={{ fontSize: 12 }}>
                    No hay registros operativos todavía.
                  </p>
                )}
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
                          {/* Subtítulo con información de la partida */}
                          <p className="font-['Courier_Prime',monospace] text-[#8a7a60] mt-0.5" style={{ fontSize: 9 }}>
                            {h.date} — {h.role} — Equipo {h.team} — {h.statsExtra}
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