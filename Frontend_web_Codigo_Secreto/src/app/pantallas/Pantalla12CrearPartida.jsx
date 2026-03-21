import { ScreenFrame, ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader, SubsectionLabel } from "../components/ScreenFrame";
import { Globe, Lock, Clock, Palette, Check, Copy, ArrowLeft, Users } from "lucide-react"; 
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";

// Importamos las llamadas a la API y el contexto del usuario.
import { UserContext } from "../components/UserContext";
import { obtenerTemasJugador, crearPartida } from "../api/apiPartidas";

export function Pantalla12CrearPartida() {
  const [matchType, setMatchType] = useState("public");
  const [timer, setTimer] = useState("60"); 
  const [theme, setTheme] = useState(""); // Ahora almacenará el id_tema
  const [maxPlayers, setMaxPlayers] = useState(8);
  
  // Estados para los temas traídos del backend
  const [temasJugador, setTemasJugador] = useState([]);
  const [isLoadingTemas, setIsLoadingTemas] = useState(true);

  // Obtenemos al usuario logueado para sacar su 'tag' al crear la partida
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Cargar los temas del jugador al inicializar la pantalla
  useEffect(() => {
    const fetchTemas = async () => {
      try {
        // Se llama a la función de 'apiPartidas.js' para pedir los temas del usuario al backend.
        const temas = await obtenerTemasJugador();
        setTemasJugador(temas);
        // Seleccionar por defecto el primer tema que devuelva la API
        if (temas && temas.length > 0) {
          setTheme(temas[0].id_tema);
        }
      } catch (err) {
        console.error("Error al obtener los temas del jugador:", err);
      } finally {
        setIsLoadingTemas(false);
      }
    };
    fetchTemas();
  }, []);

  const decrementarJugadores = () => setMaxPlayers(prev => Math.max(4, prev - 1));
  const incrementarJugadores = () => setMaxPlayers(prev => Math.min(16, prev + 1));

  // Función para enviar el formulario de creación al backend
  const handleCrearPartida = async () => {
    try {
      // Formamos el payload exactamente como lo pide la especificación del backend
      const payload = {
        es_publica: matchType === "public",
        tag: user?.tag || "Desconocido", 
        tiempo_espera: parseInt(timer, 10),
        id_tema: parseInt(theme, 10),
        max_jugadores: maxPlayers
      };

        // Se llama a la función de 'apiPartidas.js' para crear la partida.
      const respuesta = await crearPartida(payload);

      // Si todo va bien, el backend nos devuelve datos (incluido el posible ID). 
      // TODO: revisar ruta, debería tener {id_partida}.
      navigate("/lobby");
      
    } catch (error) {
      console.error("Fallo de conexión al crear la operación:", error);
      alert("Error al contactar con la central. No se pudo crear la misión.");
    }
  };

  return (
    <ScreenFrame title="SALA DE RECLUTAMIENTO">
      <div className="max-w-3xl mx-auto pt-8 sm:pt-4">
        <button
          onClick={() => navigate("/home")}
          className="back-btn group"
        >
          <ArrowLeft className="back-btn-icon" />
          <span className="back-btn-text">VOLVER AL ESCRITORIO</span>
        </button>

        <ManilaFolder>
          <div className="folder-content">

            <div className="flex items-start justify-between mb-5 flex-wrap gap-3 mt-2">
              <div>
                <SectionHeader title="SALA DE RECLUTAMIENTO" />
                <p className="settings-subtitle">Configure los parámetros de la operación</p>
              </div>
              <FBISeal size={50} />
            </div>

            <div className="space-y-6">
              
              {/* ARRIBA: Tipo de operación */}
              <div>
                <SubsectionLabel label="TIPO DE OPERACIÓN" borderColor="#2a3a5a" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {[
                    { key: "public", icon: Globe, label: "PÚBLICA", sub: "Cualquier agente" },
                    { key: "private", icon: Lock, label: "PRIVADA", sub: "Solo invitados" },
                  ].map((opt) => (
                    <DarkCard
                      key={opt.key}
                      className={`p-3 sm:p-4 flex items-center gap-4 cursor-pointer transition-all ${
                        matchType === opt.key ? "selected-card shadow-[0_0_10px_rgba(50,100,200,0.2)] border-[#5a7a9a]" : ""
                      }`}
                      onClick={() => setMatchType(opt.key)}
                    >
                      <div className={`p-2 rounded-sm ${matchType === opt.key ? "bg-[#2a3a5a]" : "bg-[#1a1a1a]"}`}>
                        <opt.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${
                          matchType === opt.key ? "icon-selected" : "icon-muted"
                        }`} />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <p className="card-title m-0 leading-tight">{opt.label}</p>
                        <p className="card-subtitle m-0">{opt.sub}</p>
                      </div>

                      {matchType === opt.key && (
                        <div className="flex flex-col items-center justify-center">
                          <Check className="w-5 h-5 text-[#50a050]" />
                        </div>
                      )}
                    </DarkCard>
                  ))}
                </div>
              </div>

              {/* LÍNEA DIVISORIA */}
              <div className="w-full h-px bg-[#8a7a60]/20 my-2"></div>

              {/* ABAJO: Ajustes (3 Columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Número de Jugadores */}
                <div>
                  <SubsectionLabel label="MÁX. JUGADORES" borderColor="#4a5a2a" />
                  <DarkCard className="p-3 h-[88px] flex flex-col items-center justify-center relative">
                    <div className="flex items-center justify-between w-full px-2">
                      <button 
                        onClick={decrementarJugadores} 
                        className={`text-2xl font-bold px-3 transition-colors ${maxPlayers <= 4 ? "text-[#555] cursor-not-allowed" : "text-[#8a7a60] hover:text-[#d4b878] cursor-pointer"}`}
                        disabled={maxPlayers <= 4}
                      >
                        -
                      </button>
                      
                      <div className="flex flex-col items-center">
                        <Users className="w-4 h-4 text-[#8a7a60] mb-1" />
                        <span className="font-['Courier_Prime',monospace] text-xl text-[#d4b878] leading-none">{maxPlayers}</span>
                      </div>
                      
                      <button 
                        onClick={incrementarJugadores} 
                        className={`text-2xl font-bold px-3 transition-colors ${maxPlayers >= 16 ? "text-[#555] cursor-not-allowed" : "text-[#8a7a60] hover:text-[#d4b878] cursor-pointer"}`}
                        disabled={maxPlayers >= 16}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-['Courier_Prime',monospace] text-[9px] text-[#8a7a60] absolute bottom-1.5">(Límites: 4 - 16)</span>
                  </DarkCard>
                </div>

                {/* Tiempo por turno */}
                <div>
                  <SubsectionLabel label="TIEMPO POR TURNO" borderColor="#5a4a20" />

                  {/* Select de Tiempo (Mantiene el mismo aspecto pero ya prepara el int para la API) */}
                  <div className="bg-[#f5edd8] border border-[#a08050]/30 rounded-sm px-3 sm:px-4 py-2 flex flex-col justify-center h-[88px]">
                    <label htmlFor="select-turno" className="font-['Courier_Prime',monospace] text-[#8a7a60] mb-1" style={{ fontSize: 9 }}>SELECCIONAR TIEMPO</label>
                    <select 
                      id="select-turno"
                      value={timer}
                      onChange={(e) => setTimer(e.target.value)}
                      className="font-['Courier_Prime',monospace] text-[#3a2a10] bg-transparent outline-none cursor-pointer p-0 m-0 w-full" 
                      style={{ fontSize: 13 }}
                    >
                      <option value="30">30 segundos</option>
                      <option value="60">60 segundos</option>
                      <option value="90">90 segundos</option>
                      <option value="120">120 segundos</option>
                    </select>
                  </div>
                </div>

                {/* 3. Tema */}
                <div>
                  <SubsectionLabel label="TEMA DE CARTAS" borderColor="#8b2020" />

                  {/* Desplegable temas de prueba
                  <div className="bg-[#f5edd8] border border-[#a08050]/30 rounded-sm px-3 sm:px-4 py-2 flex flex-col justify-center h-[88px]">
                    <label htmlFor="select-tema" className="font-['Courier_Prime',monospace] text-[#8a7a60] mb-1" style={{ fontSize: 9 }}>SELECCIONAR TEMA</label>
                    <select 
                      id="select-tema"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="font-['Courier_Prime',monospace] text-[#3a2a10] bg-transparent outline-none cursor-pointer p-0 m-0 w-full" 
                      style={{ fontSize: 13 }}
                    >
                      <option value="Original">Original 🕵️</option>
                      <option value="Cyberpunk">Cyberpunk 🌃</option>
                      <option value="Naturaleza">Naturaleza 🌿</option>
                      <option value="Espacio">Espacio 🚀</option>
                    </select>
                  </div>
                  */}

                  {/* NUEVO: Select de Tema Dinámico basado en el endpoint */}
                  <div className="bg-[#f5edd8] border border-[#a08050]/30 rounded-sm px-3 sm:px-4 py-2 flex flex-col justify-center h-[88px]">
                    <label htmlFor="select-tema-dinamico" className="font-['Courier_Prime',monospace] text-[#8a7a60] mb-1" style={{ fontSize: 9 }}>SELECCIONAR TEMA</label>
                    <select 
                      id="select-tema-dinamico"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="font-['Courier_Prime',monospace] text-[#3a2a10] bg-transparent outline-none cursor-pointer p-0 m-0 w-full" 
                      style={{ fontSize: 13 }}
                      disabled={isLoadingTemas}
                    >
                      {isLoadingTemas ? (
                        <option value="">Cargando...</option>
                      ) : (
                        temasJugador.map((t) => (
                          <option key={t.id_tema} value={t.id_tema}>
                            {t.nombre}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Espaciado extra añadido antes del botón para separar el bloque */}
            <div className="mt-10 pt-4 border-t border-[#8a7a60]/10">
              {/* Botón integrado a la llamada API de crear la partida. */}
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                <button 
                  onClick={handleCrearPartida} 
                  className="bg-[#2a5a2a] hover:bg-[#3a6a3a] text-white py-4 rounded-sm shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-colors flex items-center justify-center gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-['Special_Elite',cursive] tracking-[0.15em] sm:tracking-[0.2em]" style={{ fontSize: 'clamp(12px, 2vw, 16px)' }}>CREAR MISIÓN</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="footer-stamp">
              <RedStamp text="TOP SECRET" className="rotate-[-3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}