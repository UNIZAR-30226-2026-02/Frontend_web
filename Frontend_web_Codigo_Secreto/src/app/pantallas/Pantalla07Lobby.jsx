import { ScreenFrame, ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader } from "../components/ScreenFrame";
import { Crown, User, Copy, ArrowLeft, Eye, Fingerprint } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

// TODO: Comunicarse con el backend para obtener los datos reales de la partida y jugadores.
// Datos de prueba.
const redTeam = [
  { name: "Agente_Shadow", role: "JEFE DE ESPIONAJE", isLeader: true },
  { name: "LoboÁrtico", role: "AGENTE", isLeader: false },
  { name: "NightFox_99", role: "AGENTE", isLeader: false },
  { name: "— Vacante —", role: "", isLeader: false },
];
const blueTeam = [
  { name: "CodigoSecreto", role: "JEFE DE ESPIONAJE", isLeader: true },
  { name: "PhantomX", role: "AGENTE", isLeader: false },
  { name: "SilentViper", role: "AGENTE", isLeader: false },
  { name: "— Vacante —", role: "", isLeader: false },
];

// Función que establece el color de cada componente de jugador de la lista, distinguiendo
// entre si es del equipo azul o rojo y si está vacante o no.
function PlayerSlot({ player, teamColor }) {
  const isEmpty = player.name.includes("Vacante");
  const colors = teamColor === "red"
    ? { bg: "#8b2020", text: "#e08080", border: "#a03030" }
    : { bg: "#2a3a5a", text: "#80a0d0", border: "#3a5a8a" };

  return (
    <div className={`p-2.5 sm:p-3 rounded-sm border transition-all ${isEmpty ? "border-dashed border-[#555] bg-[#1a1a1a]/50" : "border-[#444] bg-[#1a1a1a]"}`}>
      <div className="flex items-center gap-2 sm:gap-3">
        {!isEmpty && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.bg}30`, border: `1px solid ${colors.border}` }}>
            {player.isLeader ? <Crown className="w-3.5 h-3.5" style={{ color: "#d4b878" }} /> : <User className="w-3.5 h-3.5" style={{ color: colors.text }} />}
          </div>
        )}
        <div className="min-w-0">
          <p className={`font-['Courier_Prime',monospace] truncate ${isEmpty ? "text-[#555] italic" : "text-[#e8dcc8]"}`} style={{ fontSize: 12 }}>{player.name}</p>
          {player.role && (
            <p className="font-['Courier_Prime',monospace]" style={{ fontSize: 9, color: player.isLeader ? "#d4b878" : "#888" }}>{player.role}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Pantalla07Lobby() {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState("red");

  return (
    <ScreenFrame title="ASIGNACIÓN DE EQUIPOS">
      <div className="max-w-4xl mx-auto pt-8 sm:pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8a7a60] hover:text-[#d4b878] transition-colors cursor-pointer mb-4 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 11 }}>VOLVER AL RECLUTAMIENTO</span>
        </button>

      <ManilaFolder>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Folder tab */}
          <div className="absolute -top-0 left-6 bg-[#b89055] px-4 py-1.5 rounded-b-sm border-x border-b border-[#a08040] shadow-sm z-10">
            <span className="font-['Courier_Prime',monospace] text-[#2a1a08]" style={{ fontSize: 9 }}>EQUIPOS</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 mt-2">
            <div className="flex items-center gap-3">
              <SectionHeader title="ASIGNACIÓN DE EQUIPOS" />
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#f5edd8] border-2 border-[#a08050]/40 rounded-sm px-3 py-1.5 flex items-center gap-2">
                <div>
                  <span className="font-['Courier_Prime',monospace] text-[#8a7a60] block" style={{ fontSize: 8 }}>CÓDIGO:</span>
                  <span className="font-['Courier_Prime',monospace] text-[#3a2a10] tracking-[0.15em]" style={{ fontSize: 14 }}>XK7-DELTA</span>
                </div>
                <Copy className="w-4 h-4 text-[#8a7a60] cursor-pointer hover:text-[#5a4a30]" />
              </div>
              <FBISeal size={44} />
            </div>
          </div>

          {/* Team selection prompt */}
          <div className="bg-[#c4a060]/10 border border-[#c4a060]/30 rounded-sm px-4 py-2 mb-5">
            <p className="font-['Courier_Prime',monospace] text-[#403937]" style={{ fontSize: 11 }}>
              Selecciona tu equipo haciendo clic en la cabecera del equipo al que deseas unirte.
            </p>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 mb-6">
            {/* Red */}
            <DarkCard
              className={`p-4 sm:p-5 cursor-pointer transition-all ${selectedTeam === "red" ? "ring-2 ring-[#cc3333]" : ""}`}
              onClick={() => setSelectedTeam("red")}
            >
              <div className="text-center mb-3 pb-2 border-b border-[#8b2020]/30">
                <div className="w-4 h-4 bg-[#cc3333] rounded-full mx-auto mb-1.5 shadow-[0_0_8px_rgba(200,50,50,0.4)]" />
                <h3 className="font-['Special_Elite',cursive] text-[#e08080] tracking-[0.15em]" style={{ fontSize: 16 }}>EQUIPO ROJO</h3>
                {selectedTeam === "red" && (
                  <span className="font-['Courier_Prime',monospace] text-[#50a050]" style={{ fontSize: 9 }}>✓ TU EQUIPO</span>
                )}
              </div>
              <div className="space-y-2">
                {/* Bucle que recorre la lista de jugadores del equipo rojo y 
                    aplicar la función 'PlayerSlot' a cada uno de ellos. */}
                {redTeam.map((p, i) => <PlayerSlot key={i} player={p} teamColor="red" />)}
              </div>
            </DarkCard>

            {/* VS */}
            <div className="flex lg:flex-col items-center justify-center gap-2 py-2 lg:py-0">
              <div className="hidden lg:block w-px h-12 bg-[#8a7a60]/30" />
              <div className="w-12 h-12 rounded-full bg-[#f5edd8] border-2 border-[#a08050]/40 flex items-center justify-center shadow-md flex-shrink-0">
                <span className="font-['Special_Elite',cursive] text-[#4a3a20]" style={{ fontSize: 14 }}>VS</span>
              </div>
              <div className="hidden lg:block w-px h-12 bg-[#8a7a60]/30" />
            </div>

            {/* Blue */}
            <DarkCard
              className={`p-4 sm:p-5 cursor-pointer transition-all ${selectedTeam === "blue" ? "ring-2 ring-[#3366cc]" : ""}`}
              onClick={() => setSelectedTeam("blue")}
            >
              <div className="text-center mb-3 pb-2 border-b border-[#2a3a5a]/30">
                <div className="w-4 h-4 bg-[#3366cc] rounded-full mx-auto mb-1.5 shadow-[0_0_8px_rgba(50,100,200,0.4)]" />
                <h3 className="font-['Special_Elite',cursive] text-[#80a0d0] tracking-[0.15em]" style={{ fontSize: 16 }}>EQUIPO AZUL</h3>
                {selectedTeam === "blue" && (
                  <span className="font-['Courier_Prime',monospace] text-[#50a050]" style={{ fontSize: 9 }}>✓ TU EQUIPO</span>
                )}
              </div>
              <div className="space-y-2">
                {blueTeam.map((p, i) => <PlayerSlot key={i} player={p} teamColor="blue" />)}
              </div>
            </DarkCard>
          </div>

          {/* Config summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Datos de prueba. TODO: comunicarse con el backend. */}
            {[
              { label: "TIPO", value: "Privada" },
              { label: "TURNO", value: "60 segundos" },
              { label: "TEMA", value: "Cyberpunk" },
            ].map((c) => (
              <div key={c.label} className="bg-[#f5edd8] border border-[#a08050]/30 rounded-sm px-3 sm:px-4 py-2">
                <span className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 9 }}>{c.label}</span>
                <p className="font-['Courier_Prime',monospace] text-[#3a2a10]" style={{ fontSize: 12 }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Start buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
            <button onClick={() => navigate("/agent")} className="bg-[#2a5a2a] hover:bg-[#3a6a3a] text-white py-4 rounded-sm shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-colors flex items-center justify-center gap-3 cursor-pointer">
              <Fingerprint className="w-5 h-5 text-[#80c090]" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#50ff50] rounded-full animate-pulse shadow-[0_0_8px_rgba(80,255,80,0.5)]" />
                <span className="font-['Special_Elite',cursive] tracking-[0.15em] sm:tracking-[0.2em]" style={{ fontSize: 'clamp(12px, 2vw, 16px)' }}>ENTRAR A LA PARTIDA</span>
              </div>
            </button>
          </div>

          <div className="mt-5 flex justify-end">
            <RedStamp text="CONFIDENTIAL" className="rotate-[-3deg]" />
          </div>
        </div>
      </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}