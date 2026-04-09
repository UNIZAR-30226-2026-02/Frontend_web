/*
 * Pantalla del apartado social (clasificación y amigos).
 */

import { ScreenFrame, ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader } from "../components/ScreenFrame";
import { Search, UserPlus, Trophy, TrendingUp, Flame, ArrowLeft, X, Users, UserCheck, UserX, Clock, User } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

// Importamos la API y el Hook de WebSockets
import { obtenerAmigos, obtenerLeaderboardAmigos, obtenerLeaderboardGlobal } from "../api/apiSocial";
import { useSocialWebSockets } from "../hooks/hooksSocial"; 

// Datos de prueba (Comentados porque se conecta con el backend)
/*
const friends = [
  { name: "LoboÁrtico", rank: "Capitán", online: true, wins: 34 },
  { name: "PhantomX", rank: "Teniente", online: true, wins: 28 },
  { name: "NightFox_99", rank: "Comandante", online: false, wins: 52 },
  { name: "SilentViper", rank: "Sargento", online: false, wins: 19 },
  { name: "CodigoSecreto", rank: "General", online: true, wins: 87 },
  { name: "EspíaMaestro", rank: "Coronel", online: false, wins: 298 },
];
*/

/*
const leaderboard = [
  { pos: 1, name: "ProAgente99", wins: 342, rate: "78%", streak: 12, badge: "🏆" },
  { pos: 2, name: "EspíaMaestro", wins: 298, rate: "72%", streak: 8, badge: "🥈" },
  { pos: 3, name: "CodigoSecreto", wins: 276, rate: "69%", streak: 6, badge: "🥉" },
  { pos: 4, name: "Agente_Shadow", wins: 47, rate: "68%", streak: 5, badge: "" },
  { pos: 5, name: "LoboÁrtico", wins: 34, rate: "61%", streak: 3, badge: "" },
  { pos: 6, name: "NightFox_99", wins: 52, rate: "58%", streak: 2, badge: "" },
  { pos: 7, name: "PhantomX", wins: 28, rate: "55%", streak: 1, badge: "" },
  { pos: 8, name: "SilentViper", wins: 19, rate: "52%", streak: 0, badge: "" },
  { pos: 9, name: "Agente_K", wins: 87, rate: "48%", streak: 0, badge: "" },
  { pos: 10, name: "Agente_Sombra", wins: 72, rate: "45%", streak: 0, badge: "" }
];

const friendsLeaderboard = [
  { pos: 1, name: "CodigoSecreto", wins: 87, rate: "69%", streak: 6, badge: "🏆" },
  { pos: 2, name: "NightFox_99", wins: 52, rate: "58%", streak: 2, badge: "🥈" },
  { pos: 3, name: "LoboÁrtico", wins: 34, rate: "61%", streak: 3, badge: "🥉" },
  { pos: 4, name: "PhantomX", wins: 28, rate: "55%", streak: 1, badge: "" },
  { pos: 5, name: "SilentViper", wins: 19, rate: "50%", streak: 1, badge: "" },
];
*/

// Datos iniciales de solicitudes
const initialFriendRequests = [
  { name: "RedWolf_87", rank: "Teniente", wins: 42, timeAgo: "Hace 2 horas" },
  { name: "GhostRider", rank: "Capitán", wins: 67, timeAgo: "Hace 5 horas" },
  { name: "IronEagle_01", rank: "Sargento", wins: 23, timeAgo: "Hace 1 día" },
  { name: "StealthOps", rank: "Comandante", wins: 91, timeAgo: "Hace 2 días" },
];

export function Pantalla08Social() {
  const [tab, setTab] = useState("friends");
  const navigate = useNavigate();

  const [mostrarAgnadir, setMostrarAgnadir] = useState(false);
  const [nombreAmigo, setNombreAmigo] = useState("");
  const [mostrarRankingAmigos, setMostrarRankingAmigos] = useState(false);
  
  // ESTADO DE SOLICITUDES
  const [requests, setRequests] = useState(initialFriendRequests);

  // ESTADOS DE AMIGOS
  const [amigos, setAmigos] = useState([]);
  
  // ESTADOS DE LEADERBOARDS (global y amigos)
  const [leaderboardGlobal, setLeaderboardGlobal] = useState([]);
  const [leaderboardAmigos, setLeaderboardAmigos] = useState([]);
  
  const tokenActual = sessionStorage.getItem('jwt_token');

  // Cargar lista de amigos iniciales usando 'apiSocial.js' al entrar a la pantalla
  useEffect(() => {
    const cargarAmigos = async () => {
      try {
        const datosAmigos = await obtenerAmigos();
        setAmigos(datosAmigos);
      } catch (error) {
        console.error("Error al obtener la lista de amigos:", error);
      }
    };

    const cargarLeaderboardAmigos = async () => {
      try {
        const datosLeaderboardAmigos = await obtenerLeaderboardAmigos();
        setLeaderboardAmigos(datosLeaderboardAmigos);
      } catch (error) {
        console.error("Error al obtener el leaderboard de amigos:", error);
      }
    }
      
    const cargarLeaderboardGlobal = async () => {
      try {
        const datosLeaderboardGlobal = await obtenerLeaderboardGlobal();
        setLeaderboardGlobal(datosLeaderboardGlobal);
      } catch (error) {
        console.error("Error al obtener el leaderboard global:", error);
      }
    }

    cargarAmigos();
    cargarLeaderboardAmigos();
    cargarLeaderboardGlobal();
  }, []);

  // Escuchar actualizaciones en tiempo real (WebSockets)
  const onAmigosActualizados = useCallback((data) => {
    setAmigos(data);
  }, []);

  // Callback para actualizaciones del leaderboard global
  const onGlobalLeaderboardActualizado = useCallback((data) => {
    setLeaderboardGlobal(data);
  }, []);

  // Callback para actualizaciones del leaderboard de amigos
  const onAmigosLeaderboardActualizado = useCallback((data) => {
    setLeaderboardAmigos(data);
  }, []);

  const onWsError = useCallback((errorMsg) => {
    console.error("WS Error:", errorMsg);
  }, []);

  // Se invoca 'hooksSocial.js' para recibir actualizaciones en tiempo real de la lista de amigos
  // y de los leaderboards.
  useSocialWebSockets(onAmigosActualizados, onGlobalLeaderboardActualizado, 
    onAmigosLeaderboardActualizado, onWsError, tokenActual);

  const handleAgnadir = () => {
    if (nombreAmigo.trim()) {
      console.log("Añadiendo agente:", nombreAmigo);
      setNombreAmigo("");
      setMostrarAgnadir(false);
    }
  };

  // FUNCIÓN PARA GESTIONAR ACCIONES DE SOLICITUD
  const handleActionRequest = (name, action) => {
    console.log(`${action === 'accept' ? 'Aceptando' : 'Rechazando'} a:`, name);
    setRequests(prev => prev.filter(r => r.name !== name));
  };

  return (
    <ScreenFrame title="RED DE CONTACTOS">
      <div className="max-w-4xl mx-auto pt-8 sm:pt-4">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-[#8a7a60] hover:text-[#d4b878] transition-colors cursor-pointer mb-4 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 11 }}>VOLVER AL ESCRITORIO</span>
        </button>

        <ManilaFolder>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="absolute -top-0 left-6 bg-[#b89055] px-4 py-1.5 rounded-b-sm border-x border-b border-[#a08040] shadow-sm z-10">
              <span className="font-['Courier_Prime',monospace] text-[#2a1a08]" style={{ fontSize: 9 }}>COMUNICACIONES</span>
            </div>

            <div className="flex items-start justify-between mb-5 flex-wrap gap-3 mt-2">
              <SectionHeader title="RED DE CONTACTOS" />
              <FBISeal size={50} />
            </div>

            {/* Tabs Principales actualizados con contador */}
            <div className="flex gap-2 sm:gap-3 mb-5 flex-wrap">
              {[
                { key: "friends", label: "AMIGOS" },
                { key: "leaderboard", label: "CLASIFICACIÓN" },
                { key: "requests", label: `SOLICITUDES (${requests.length})` },
              ].map((t) => (
                <button 
                  key={t.key} 
                  onClick={() => setTab(t.key)} 
                  className={`px-4 py-2 rounded-sm transition-all font-['Special_Elite',cursive] tracking-[0.1em] cursor-pointer ${tab === t.key ? "bg-[#f5edd8] text-[#5a4a30] border border-[#a08050]/30 shadow-md" : "bg-[#2a2a2a] text-[#e8dcc8]"}`} 
                  style={{ fontSize: 12 }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Buscador: Solo visible en Amigos y Solicitudes */}
            {(tab === "friends" || tab === "requests") && (
              <div className="relative mb-5">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a7a60]" />
                <input type="text" placeholder="Buscar agente por nombre clave..." className="w-full bg-[#f5edd8] border-2 border-[#a08050]/40 rounded-sm pl-10 sm:pl-12 pr-12 py-2.5 font-['Courier_Prime',monospace] text-[#3a2a10] placeholder:text-[#a09070] outline-none" style={{ fontSize: 12 }} />
                <button 
                  onClick={() => setMostrarAgnadir(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2a2a2a] p-1.5 rounded-sm cursor-pointer hover:bg-[#3a3a3a] transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-[#d4b878]" />
                </button>
              </div>
            )}

            {/* CONTENIDO DE TABS */}
            {tab === "friends" && (
              <div className="grid grid-cols-1 gap-3">
                {amigos.length > 0 ? (
                  amigos.map((f, index) => (
                    <DarkCard key={index} className="p-3 sm:p-4 flex items-center justify-between gap-3 animate-in fade-in">
                      
                      {/* Contenedor con icono y tag del usuario amigo */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {/* Icono de usuario */}
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(232, 220, 200, 0.1)", border: "1px solid rgba(232, 220, 200, 0.3)" }}
                        >
                          <User className="w-3.5 h-3.5 text-[#e8dcc8]" />
                        </div>

                        {/* TODO: se podría añadir el dato 'foto_perfil' en vez de icono de user. */}
                        
                        {/* Nombre alineado a la izquierda */}
                        <p className="font-['Courier_Prime',monospace] text-[#e8dcc8] truncate" style={{ fontSize: 14 }}>
                          {f.tag}
                        </p>
                      </div>

                      {/* Victorias alineadas a la derecha */}
                      <p className="font-['Courier_Prime',monospace] text-[#888] flex-shrink-0" style={{ fontSize: 11 }}>
                        {f.victorias} victorias
                      </p>
                    </DarkCard>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="font-['Courier_Prime',monospace] text-[#423D36]" style={{ fontSize: 12 }}>
                      No hay contactos consolidados en tu red.
                    </p>
                  </div>
                )}
              </div>
            )}

            {tab === "leaderboard" && (
              <div>
                <div className="flex justify-center mb-10">
                  <div className="inline-flex bg-[#2a2218] border border-[#5a4a30]/50 rounded-sm p-1 gap-1">
                    <button
                      onClick={() => setMostrarRankingAmigos(false)}
                      className={`px-4 py-2 rounded-sm transition-all font-['Courier_Prime',monospace] cursor-pointer ${!mostrarRankingAmigos ? "bg-[#f5edd8] text-[#5a4a30] shadow-sm" : "text-[#8a7a60] hover:text-[#d4b878]"}`}
                      style={{ fontSize: 11 }}
                    >
                      <Trophy className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> GLOBAL
                    </button>
                    <button
                      onClick={() => setMostrarRankingAmigos(true)}
                      className={`px-4 py-2 rounded-sm transition-all font-['Courier_Prime',monospace] cursor-pointer ${mostrarRankingAmigos ? "bg-[#f5edd8] text-[#5a4a30] shadow-sm" : "text-[#8a7a60] hover:text-[#d4b878]"}`}
                      style={{ fontSize: 11 }}
                    >
                      <Users className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> AMIGOS
                    </button>
                  </div>
                </div>

                {/* Contenedor del podio con mt-6 para dejar espacio al 1º puesto */}
                <div className="flex items-end justify-center gap-3 sm:gap-4 mb-5 mt-12">
                  {/* Usamos los estados y 'p &&' por si el array está vacío inicialmente */}
                  {(mostrarRankingAmigos ? [leaderboardAmigos[1], leaderboardAmigos[0], leaderboardAmigos[2]] : [leaderboardGlobal[1], leaderboardGlobal[0], leaderboardGlobal[2]])
                    .map((p, i) => (
                      p && (
                        <DarkCard 
                          key={p.tag} 
                          className={`p-3 sm:p-4 text-center transition-transform ${i === 1 ? "w-[140px] sm:w-[180px] -translate-y-6 border-[#d4b878]/30 shadow-[0_8px_20px_rgba(212,184,120,0.15)] z-10" : "w-[110px] sm:w-[150px]"}`}
                        >
                          <span className="text-2xl sm:text-3xl">{p.badge}</span>
                          <p className="font-['Courier_Prime',monospace] text-[#e8dcc8] mt-1 truncate" style={{ fontSize: 11 }}>{p.name}</p>
                          <p className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 18 }}>{p.wins}</p>
                          <p className="font-['Courier_Prime',monospace] text-[#888]" style={{ fontSize: 9 }}>victorias</p>
                        </DarkCard>
                      )
                    ))}
                </div>

                <div className="space-y-2">
                  {/* Usamos los estados correspondientes */}
                  {(mostrarRankingAmigos ? leaderboardAmigos.slice(3) : leaderboardGlobal.slice(3)).map((p) => (
                    <DarkCard key={p.tag} className="px-4 sm:px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <span className="font-['Courier_Prime',monospace] text-[#888] w-6 sm:w-8 flex-shrink-0" style={{ fontSize: 14 }}>#{p.pos}</span>
                        <div className="min-w-0">
                          <p className="font-['Courier_Prime',monospace] text-[#e8dcc8] truncate" style={{ fontSize: 12 }}>{p.name}</p>
                          <p className="font-['Courier_Prime',monospace] text-[#888] hidden sm:block" style={{ fontSize: 9 }}>
                            <Trophy className="w-3 h-3 inline" /> {p.wins} — <TrendingUp className="w-3 h-3 inline ml-1" /> {p.rate} — <Flame className="w-3 h-3 inline ml-1" /> {p.streak} racha
                          </p>
                        </div>
                      </div>
                    </DarkCard>
                  ))}
                </div>

                {/* Contenedor del podio con mt-6 para dejar espacio al 1º puesto */}
                <div className="flex items-end justify-center gap-3 sm:gap-4 mb-5 mt-12">
                  {/* Usamos los estados y comprobamos que el objeto exista antes de renderizarlo */}
                  {(mostrarRankingAmigos ? [leaderboardAmigos[1], leaderboardAmigos[0], leaderboardAmigos[2]] : [leaderboardGlobal[1], leaderboardGlobal[0], leaderboardGlobal[2]])
                    .map((p, i) => {
                      if (!p) return null; // Evita errores si el array no tiene al menos 3 elementos aún

                      // Asignamos medallas según el índice en este array específico:
                      // El índice 1 es el primer lugar, el 0 es el segundo, el 2 es el tercero.
                      const medalla = i === 1 ? "🏆" : i === 0 ? "🥈" : "🥉";

                      return (
                        <DarkCard 
                          key={p.tag} 
                          className={`p-3 sm:p-4 text-center transition-transform ${i === 1 ? "w-[140px] sm:w-[180px] -translate-y-6 border-[#d4b878]/30 shadow-[0_8px_20px_rgba(212,184,120,0.15)] z-10" : "w-[110px] sm:w-[150px]"}`}
                        >
                          {/* TODO: se puede añadir p.foto_perfil, con un <img src={p.foto_perfil}/>
                           aquí, aunque igual no es necesario.*/}
                          <span className="text-2xl sm:text-3xl">{medalla}</span>
                          <p className="font-['Courier_Prime',monospace] text-[#e8dcc8] mt-1 truncate" style={{ fontSize: 11 }}>{p.tag}</p>
                          <p className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 18 }}>{p.victorias}</p>
                          <p className="font-['Courier_Prime',monospace] text-[#888]" style={{ fontSize: 9 }}>victorias</p>
                        </DarkCard>
                      );
                    })}
                </div>

                <div className="space-y-2">
                  {/* Usamos los estados correspondientes
                      Parámetro 'index' en el map para calcular la posición */}
                  {(mostrarRankingAmigos ? leaderboardAmigos.slice(3) : leaderboardGlobal.slice(3)).map((p, index) => (
                    <DarkCard key={p.tag} className="px-4 sm:px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Calculamos la posición: el índice 0 de este slice es el 4º lugar */}
                        <span className="font-['Courier_Prime',monospace] text-[#888] w-6 sm:w-8 flex-shrink-0" style={{ fontSize: 14 }}>#{index + 4}</span>
                        <div className="min-w-0">
                          <p className="font-['Courier_Prime',monospace] text-[#e8dcc8] truncate" style={{ fontSize: 12 }}>{p.tag}</p>
                          <p className="font-['Courier_Prime',monospace] text-[#888] hidden sm:block" style={{ fontSize: 9 }}>
                            <Trophy className="w-3 h-3 inline" /> {p.victorias} — <TrendingUp className="w-3 h-3 inline ml-1" /> {p.num_aciertos} aciertos
                          </p>
                        </div>
                      </div>
                    </DarkCard>
                  ))}
                </div>
              </div>
            )}

            {/* VISTA DE SOLICITUDES */}
            {tab === "requests" && (
              <div className="space-y-3">
                {requests.length > 0 ? (
                  requests.map((r) => (
                    <DarkCard key={r.name} className="p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="bg-[#3a2a10] p-2 rounded-sm">
                          <Clock className="w-5 h-5 text-[#d4b878]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-['Courier_Prime',monospace] text-[#e8dcc8] truncate" style={{ fontSize: 14 }}>{r.name}</p>
                          <p className="font-['Courier_Prime',monospace] text-[#888]" style={{ fontSize: 10 }}>
                            {r.wins} victorias • <span className="italic text-[#b89055]">{r.timeAgo}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleActionRequest(r.name, 'accept')}
                          className="bg-[#2a5a2a] hover:bg-[#3a6a3a] text-white p-2 rounded-sm cursor-pointer transition-colors"
                          title="Aceptar"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleActionRequest(r.name, 'reject')}
                          className="bg-[#8b2020] hover:bg-[#a03030] text-white p-2 rounded-sm cursor-pointer transition-colors"
                          title="Rechazar"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      </div>
                    </DarkCard>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="font-['Courier_Prime',monospace] text-[#8a7a60]">No hay solicitudes pendientes en el archivo.</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <RedStamp text="CONFIDENTIAL" className="rotate-[-3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>

      {/* Modal Añadir Amigo */}
      {mostrarAgnadir && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setMostrarAgnadir(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
            <div className="bg-[#2a2218] border-2 border-[#5a4a30] rounded-sm shadow-[6px_8px_24px_rgba(0,0,0,0.7)] p-5 sm:p-6">
              <button onClick={() => setMostrarAgnadir(false)} className="absolute top-3 right-3 text-[#8a7a60] hover:text-[#d4b878] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-['Special_Elite',cursive] text-[#e8dcc8] tracking-[0.1em] mb-1" style={{ fontSize: 16 }}>AÑADIR AGENTE</h3>
              <p className="font-['Courier_Prime',monospace] text-[#8a7a60] mb-4" style={{ fontSize: 10 }}>Introduce el nombre clave</p>
              <input
                type="text"
                value={nombreAmigo}
                onChange={(e) => setNombreAmigo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAgnadir()}
                placeholder="Nombre_Agente_007"
                className="w-full bg-[#f5edd8] border-2 border-[#a08050]/50 rounded-sm px-4 py-2.5 font-['Courier_Prime',monospace] text-[#3a2a10] outline-none mb-4"
                style={{ fontSize: 13 }}
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setMostrarAgnadir(false)} className="flex-1 bg-[#3a2a2a] text-[#a09070] py-2.5 rounded-sm cursor-pointer">CANCELAR</button>
                <button 
                  onClick={handleAgnadir} 
                  disabled={!nombreAmigo.trim()}
                  className="flex-1 bg-[#2a5a2a] disabled:bg-[#2a2a2a] text-white py-2.5 rounded-sm cursor-pointer"
                >AÑADIR</button>
              </div>
            </div>
          </div>
        </>
      )}
    </ScreenFrame>
  );
}