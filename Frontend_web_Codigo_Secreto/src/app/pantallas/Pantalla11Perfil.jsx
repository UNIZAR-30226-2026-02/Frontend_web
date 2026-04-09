import React, { useState, useEffect } from "react";
import { 
  Trophy, Target, Flame, Eye, Crown, Edit3, 
  Check, LogOut, ArrowLeft, X, Camera, AlertTriangle, Palette, TrendingUp, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";


// Componentes del sistema
import { 
  ScreenFrame, ManilaFolder, DarkCard, RedStamp, 
  FBISeal, SectionHeader, SubsectionLabel 
} from "../components/ScreenFrame";
import { IconoBala } from "../components/IconoBala";

// API
import { obtenerPerfil, actualizarPerfil } from "../api/apiJugador";

// Estilos
import "../components/Perfil.css";

// Assets
import Magia from '../../assets/1_magia.jpeg';
import Hist from '../../assets/2_historico.jpeg';
import Subm from "../../assets/3_vidasubmarina.jpeg";
import Cyber from "../../assets/4_cyberpunk.jpeg";
import Natur from "../../assets/5_naturaleza.jpeg";

const OPCIONES_AVATAR = [
  { id: 1, src: Magia, alt: "Agente 1" },
  { id: 2, src: Hist, alt: "Agente 2" },
  { id: 3, src: Subm, alt: "Agente 3" },
  { id: 4, src: Cyber, alt: "Agente 4" },
  { id: 5, src: Natur, alt: "Agente 5" },
];

const TEMAS_VISUALES = [
  { id: "gold", name: "Oro envejecido", color: "#d4af37", borderColor: "#b8941f", bgColor: "#2a2518" },
  { id: "sage", name: "Verde salvia", color: "#8a9a5b", borderColor: "#6d7a45", bgColor: "#1a2218" },
  { id: "terracotta", name: "Terracota cálida", color: "#c65d3b", borderColor: "#a04a2a", bgColor: "#2a1c18" },
  { id: "purple", name: "Púrpura real", color: "#8b5a8b", borderColor: "#6d456d", bgColor: "#221822" },
  { id: "rose", name: "Cuarzo rosa", color: "#c67b8a", borderColor: "#a05060", bgColor: "#2a1820" },
];

export function Pantalla11Perfil() {
  const navegar = useNavigate();
  
  // Estados del perfil
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de edición
  const [tagEditado, setTagEditado] = useState('');
  const [editandoTag, setEditandoTag] = useState(false);
  const [guardandoTag, setGuardandoTag] = useState(false);
  const [errorTag, setErrorTag] = useState('');

  // Estados de personalización
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(1);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [temaMarco, setTemaMarco] = useState('');
  const [temaTablero, setTemaTablero] = useState('');

  // Craga inicial
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerPerfil();
        setPerfil(data);
        setTagEditado(data.tag || '');
        if (data.foto_perfil) setAvatarSeleccionado(data.foto_perfil);
      } catch (err) {
        setError("No se pudo cargar el expediente del agente.");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Guardar cambios de tag
  const handleGuardarTag = async () => {
    const nuevoTag = tagEditado.trim();
    if (nuevoTag.length < 3) {
      setErrorTag("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    setGuardandoTag(true);
    setErrorTag('');
    try {
      const actualizado = await actualizarPerfil({ tag: nuevoTag });
      setPerfil(actualizado);
      setEditandoTag(false);
    } catch (err) {
      if (err.message?.includes('DUPLICADO')) {
        setErrorTag("Este nombre ya está en uso.");
      } else {
        setErrorTag("Error al conectar con la central.");
      }
    } finally {
      setGuardandoTag(false);
    }
  };

  // Pantalla de carga
  if (cargando) {
    return (
      <ScreenFrame title="ACCEDIENDO...">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#d4b878]" />
          <p className="fuente-courier text-[#d4b878] animate-pulse">DESENCRIPTANDO EXPEDIENTE...</p>
        </div>
      </ScreenFrame>
    );
  }

  // Desestructuración 
  const {
    tag = "Anónimo",
    foto_perfil,
    balas = 0,
    partidas_jugadas = 0,
    victorias = 0,
    num_aciertos = 0,
    num_fallos = 0,
  } = perfil || {};

  const derrotas = Math.max(0, partidas_jugadas - victorias);
  const avatarActual = OPCIONES_AVATAR.find(a => a.id === avatarSeleccionado) || OPCIONES_AVATAR[0];

  return (
    <ScreenFrame title="PERFIL DEL AGENTE">
      <div className="max-w-3xl mx-auto pt-8 sm:pt-4">
        
        {/* Botón de retorno */}
        <button 
          onClick={() => navegar("/home")} 
          className="flex items-center gap-2 text-[#8a7a60] hover:text-[#d4b878] transition-colors cursor-pointer mb-4 group fuente-courier"
          style={{ fontSize: 11 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>VOLVER AL ESCRITORIO</span>
        </button>

        <ManilaFolder>
          <div className="p-4 sm:p-6 lg:p-8">
            
            {/* Pestaña de la carpeta */}
            <div className="absolute -top-0 left-6 bg-[#b89055] px-4 py-1.5 rounded-b-sm border-x border-b border-[#a08040] shadow-sm z-10 fuente-courier">
              <span className="text-[#2a1a08]" style={{ fontSize: 9 }}>EXPEDIENTE</span>
            </div>

            <div className="flex items-start justify-between mb-5 flex-wrap gap-3 mt-2">
              <SectionHeader title="EXPEDIENTE CLASIFICADO" />
              <FBISeal size={50} />
            </div>

            {/* Información del Agente */}
            <div className="flex flex-col sm:flex-row gap-5 mb-6">
              
              {/* Polaroid interactiva */}
              <div className="flex-shrink-0 self-center sm:self-start relative">
                <button
                  onClick={() => setMostrarSelector(!mostrarSelector)}
                  className="cursor-pointer group relative"
                  title="Cambiar fotografía"
                >
                  <div className="polaroid-container">
                    <div className="polaroid-foto bg-[#1a1208] flex items-center justify-center overflow-hidden">
                      <img
                        src={foto_perfil || avatarActual.src}
                        alt={avatarActual.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="fuente-courier text-[#5a4a30] text-center mt-1.5" style={{ fontSize: 8 }}>
                      {tag.toUpperCase()}
                    </p>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-[#1a1208]/70 rounded-full p-2">
                      <Camera className="w-5 h-5 text-[#d4b878]" />
                    </div>
                  </div>
                </button>

                {/* Popover del selector de Avatar */}
                {mostrarSelector && (
                  <div className="selector-avatar-popover">
                    <div className="selector-flecha" />
                    <div className="selector-avatar-contenido">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMostrarSelector(false); }}
                        className="absolute top-2 right-2 text-[#8a7a60] hover:text-[#d4b878] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <p className="fuente-courier text-[#8a7a60] mb-3" style={{ fontSize: 9 }}>
                        SELECCIONAR FOTOGRAFÍA:
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2.5">
                        {OPCIONES_AVATAR.map((av) => (
                          <button
                            key={av.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAvatarSeleccionado(av.id);
                              setMostrarSelector(false);
                            }}
                            className={`cursor-pointer transition-all ${avatarSeleccionado === av.id ? "ring-2 ring-[#d4b878] scale-105" : "opacity-60 hover:opacity-100 hover:scale-105"}`}
                          >
                            <div className="bg-[#f0e8d4] p-1 pb-2.5 shadow-[1px_1px_5px_rgba(0,0,0,0.3)]">
                              <div className="w-full aspect-square bg-[#2a2418] flex items-center justify-center overflow-hidden">
                                <img src={av.src} alt={av.alt} className="w-full h-full object-cover" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detalles del nombre y rango */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {editandoTag ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tagEditado}
                          onChange={(e) => setTagEditado(e.target.value)}
                          onKeyDown={(e) => { 
                            if (e.key === 'Enter') handleGuardarTag(); 
                            if (e.key === 'Escape') { setEditandoTag(false); setTagEditado(tag); }
                          }}
                          className="bg-[#f5edd8] border-2 border-[#a08050]/50 rounded-sm px-3 py-1.5 fuente-elite text-[#3a2a10] outline-none w-full max-w-[200px]"
                          style={{ fontSize: 18 }}
                          maxLength={15}
                          autoFocus
                          disabled={guardandoTag}
                        />
                        <button onClick={handleGuardarTag} disabled={guardandoTag} className="bg-[#2a5a2a] text-white p-1.5 rounded-sm cursor-pointer disabled:opacity-50">
                          {guardandoTag ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => { setEditandoTag(false); setTagEditado(tag); setErrorTag(''); }} className="text-[#8a7a60] hover:text-[#cc3333] cursor-pointer p-1.5">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {errorTag && <p className="fuente-courier text-[#8b2020] text-[10px]">{errorTag}</p>}
                    </div>
                  ) : (
                    <>
                      <h2 className="fuente-elite text-[#3a2a10] tracking-[0.05em]" style={{ fontSize: 'clamp(18px, 3vw, 24px)' }}>
                        {tag}
                      </h2>
                      <button onClick={() => {setEditandoTag(true); setTagEditado(tag);} } className="text-[#8a7a60] hover:text-[#5a4a30] cursor-pointer p-1">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1.5 flex-wrap fuente-courier text-[#5a4a30]" style={{ fontSize: 12 }}>
                  <span className="flex items-center gap-1">
                    <IconoBala size={14} />
                    {balas.toLocaleString()} BALAS
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <div className="border-2 border-[#4a3a20] rounded-sm px-3 py-1">
                    <span className="fuente-elite text-[#4a3a20] tracking-[0.1em]" style={{ fontSize: 11 }}>AGENTE ACTIVO</span>
                  </div>
                  <RedStamp text="TOP SECRET" className="rotate-[-6deg]" />
                </div>
              </div>
            </div>

            {/* Estadísticas de Servicio */}
            <SubsectionLabel label="RESUMEN OPERATIVO" borderColor="#4a3a20" />
            <div className="grid grid-cols-2 gap-3 mb-8">
              <DarkCard className="p-4 border-l-4 border-emerald-700">
                <p className="fuente-courier text-[#d4b878] text-2xl sm:text-3xl">{victorias}</p>
                <p className="fuente-courier text-[#888] text-[10px] uppercase">Partidas Ganadas</p>
              </DarkCard>
              <DarkCard className="p-4 border-l-4 border-red-900">
                <p className="fuente-courier text-[#d4b878] text-2xl sm:text-3xl">{derrotas}</p>
                <p className="fuente-courier text-[#888] text-[10px] uppercase">Partidas Perdidas</p>
              </DarkCard>
              <DarkCard className="p-4 border-l-4 border-emerald-700">
                <p className="fuente-courier text-[#d4b878] text-2xl sm:text-3xl">{num_aciertos}</p>
                <p className="fuente-courier text-[#888] text-[10px] uppercase">Votos Acertados</p>
              </DarkCard>
              <DarkCard className="p-4 border-l-4 border-red-900">
                <p className="fuente-courier text-[#d4b878] text-2xl sm:text-3xl">{num_fallos}</p>
                <p className="fuente-courier text-[#888] text-[10px] uppercase">Votos Fallados</p>
              </DarkCard>
            </div>

            {/* SECCIÓN DE PERSONALIZACIÓN */}
            <SubsectionLabel label="CONFIGURACIÓN ESTÉTICA" borderColor="#4a3a20" />
            <DarkCard className="p-5 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-[#d4b878]" />
                <p className="fuente-elite text-[#e8dcc8] tracking-widest text-sm">PERSONALIZAR INTERFAZ</p>
              </div>

              <div className="mb-6">
                <p className="fuente-courier text-[#a09070] text-xs mb-3">ESTILO DE MARCO DE CARTAS:</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {TEMAS_VISUALES.map((tema) => (
                    <button
                      key={tema.id}
                      onClick={() => setTemaMarco(tema.id)}
                      className={`relative p-2 rounded-sm border-2 transition-all ${
                        temaMarco === tema.id ? "border-[#d4b878] bg-[#3a3228]" : "border-[#444] bg-[#1a1a1a]"
                      }`}
                    >
                      <div className="w-full h-8 rounded-xs mb-1" style={{ backgroundColor: tema.color, opacity: 0.5 }} />
                      <p className="fuente-courier text-[9px] text-[#e8dcc8] truncate">{tema.name}</p>
                      {temaMarco === tema.id && <Check className="absolute top-1 right-1 w-3 h-3 text-[#d4b878]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="fuente-courier text-[#a09070] text-xs mb-3">COLOR DE FONDO DEL TABLERO:</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {TEMAS_VISUALES.map((tema) => (
                    <button
                      key={tema.id}
                      onClick={() => setTemaTablero(tema.id)}
                      className={`relative p-2 rounded-sm border-2 transition-all ${
                        temaTablero === tema.id ? "border-[#d4b878] bg-[#3a3228]" : "border-[#444] bg-[#1a1a1a]"
                      }`}
                    >
                      <div className="w-full h-8 rounded-xs mb-1" style={{ backgroundColor: tema.color, opacity: 0.3 }} />
                      <p className="fuente-courier text-[9px] text-[#e8dcc8] truncate">{tema.name}</p>
                      {temaTablero === tema.id && <Check className="absolute top-1 right-1 w-3 h-3 text-[#d4b878]" />}
                    </button>
                  ))}
                </div>
              </div>
            </DarkCard>

            {/* Enlace a Logros */}
            <DarkCard 
              className="p-4 cursor-pointer hover:bg-[#333] transition-colors mb-6" 
              onClick={() => navegar("/logros")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-[#d4b878]" />
                  <div>
                    <p className="fuente-elite text-[#e8dcc8] tracking-[0.1em]" style={{ fontSize: 14 }}>LOGROS Y MEDALLAS</p>
                  </div>
                </div>
                <span className="fuente-courier text-[#d4b878]" style={{ fontSize: 14 }}>→</span>
              </div>
            </DarkCard>

            {/* Cerrar Sesión */}
            <button
              onClick={() => {
                sessionStorage.clear();
                navegar("/login");
              }}
              className="w-full bg-[#3a1a1a] hover:bg-[#4a2020] border border-[#5a2020]/50 text-white py-3 rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <LogOut className="w-4 h-4 text-[#e08080]" />
              <span className="fuente-elite text-[#e08080] tracking-[0.2em]" style={{ fontSize: 13 }}>CERRAR SESIÓN</span>
            </button>

            <div className="relative h-12 mt-4 flex items-center justify-between">
              <span className="fuente-courier text-[#8a7a60]/50" style={{ fontSize: 9 }}>DOC: FBI-EXPEDIENTE-1976</span>
              <RedStamp text="CLASIFICADO" className="rotate-[3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}