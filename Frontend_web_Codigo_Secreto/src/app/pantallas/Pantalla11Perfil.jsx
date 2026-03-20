/*
 * Pantalla de perfil del agente: Aquí se muestra la información personal del jugador y se permite su edición.
 */
import React, { useState } from "react";
import { 
  Trophy, Target, Flame, Eye, Crown, Edit3, 
  Check, LogOut, ArrowLeft, X, Camera, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router";

// Componentes del sistema
import { 
  ScreenFrame, ManilaFolder, DarkCard, RedStamp, 
  FBISeal, SectionHeader, SubsectionLabel 
} from "../components/ScreenFrame";
import { IconoBala } from "../components/iconoBala";

// Estilos
import "../components/Perfil.css";

/* MEJOR FOTOS ESTO PLACEHOLDER PARA AVATAR */
const OPCIONES_AVATAR = [
  { id: 1, iniciales: "AG", bg: "from-[#4a3a28] to-[#2a1c10]" },
  { id: 2, iniciales: "SP", bg: "from-[#2a3a5a] to-[#1a2a40]" },
  { id: 3, iniciales: "MK", bg: "from-[#5a2a2a] to-[#3a1a1a]" },
  { id: 4, iniciales: "VX", bg: "from-[#2a4a2a] to-[#1a3a1a]" },
  { id: 5, iniciales: "NK", bg: "from-[#4a4a20] to-[#2a2a10]" },
  { id: 6, iniciales: "RX", bg: "from-[#4a2a4a] to-[#2a1a2a]" },
];

/**
 * Gradiente de avatar : SE QUITARÁ PORQUE SERÁ FOTO MAYBE
 */
function obtenerGradienteAvatar(id) {
  const av = OPCIONES_AVATAR.find(a => a.id === id);
  if (!av) return 'linear-gradient(135deg, #4a3a28, #2a1c10)';
  
  const colores = av.bg
    .replace(/from-\[/g, '')
    .replace(/\] to-\[/g, ', ')
    .replace(/\]/g, '');
  
  return `linear-gradient(135deg, ${colores})`;
}

export function Pantalla11Perfil() {
  const navegar = useNavigate();
  
  // Estados del perfil
  const [nombreAgente, setNombreAgente] = useState("Agente_Shadow");
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(1);
  const [mostrarSelector, setMostrarSelector] = useState(false);

  // Estado para controlar la visibilidad del popup de desactivación.
  const [mostrarPopupDesactivar, setMostrarPopupDesactivar] = useState(false);

  const avatarActual = OPCIONES_AVATAR.find(a => a.id === avatarSeleccionado);

  // TODO: lógica de desactivación de cuenta
  /*const manejarDesactivacionCuenta = async () => {
    await apiDesactivarCuenta()
    console.log("Desactivando cuenta del agente...");
    setMostrarPopupDesactivar(false);
    
    // Limpiar sesión y volver al login
    sessionStorage.removeItem('jwt_token');
    navegar("/");
  };*/

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
                    <div
                      className="polaroid-foto"
                      style={{ backgroundImage: obtenerGradienteAvatar(avatarSeleccionado) }}
                    >
                      <span className="fuente-elite text-[#c4a060]" style={{ fontSize: 28 }}>
                          {avatarActual.iniciales}
                      </span>
                    </div>
                    <p className="fuente-courier text-[#5a4a30] text-center mt-1.5" style={{ fontSize: 8 }}>
                      {nombreAgente.toUpperCase()}
                    </p>
                  </div>
                  
                  {/* Overlay de cámara al pasar el ratón */}
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
                              <div className={`w-full aspect-square bg-gradient-to-br ${av.bg} flex items-center justify-center`}>
                                <span className="fuente-elite text-[#c4a060]" style={{ fontSize: 16 }}>{av.iniciales}</span>
                              </div>
                            </div>
                            {avatarSeleccionado === av.id && <Check className="w-3 h-3 text-[#50a050] mx-auto mt-0.5" />}
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
                  {editandoNombre ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nombreAgente}
                        onChange={(e) => setNombreAgente(e.target.value)}
                        className="bg-[#f5edd8] border-2 border-[#a08050]/50 rounded-sm px-3 py-1.5 fuente-elite text-[#3a2a10] outline-none"
                        style={{ fontSize: 'clamp(16px, 3vw, 22px)' }}
                        autoFocus
                      />
                      <button onClick={() => setEditandoNombre(false)} className="bg-[#2a5a2a] text-white p-1.5 rounded-sm cursor-pointer">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="fuente-elite text-[#3a2a10] tracking-[0.05em]" style={{ fontSize: 'clamp(18px, 3vw, 24px)' }}>
                        {nombreAgente}
                      </h2>
                      <button onClick={() => setEditandoNombre(true)} className="text-[#8a7a60] hover:text-[#5a4a30] cursor-pointer p-1">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap fuente-courier text-[#5a4a30]" style={{ fontSize: 12 }}>
                  <span className="flex items-center gap-1"><IconoBala size={14} /> 500 BALAS</span>
                </div>
                
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <div className="border-2 border-[#4a3a20] rounded-sm px-3 py-1">
                    <span className="fuente-elite text-[#4a3a20] tracking-[0.1em]" style={{ fontSize: 11 }}>NIVEL DE ACCESO: ALTO</span>
                  </div>
                  <RedStamp text="TOP SECRET" className="rotate-[-6deg]" />
                </div>
              </div>
            </div>

            {/* Estadísticas de Servicio */}
            <SubsectionLabel label="ESTADÍSTICAS DE SERVICIO" borderColor="#4a3a20" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <TarjetaEstadistica 
                icono={Eye} titulo="MISIONES TOTALES" valor="137" 
                subtexto="79 victorias" colorBarra="#5090c0" porcentaje="58%" iconoColor="#80a0d0" 
              />
              <TarjetaEstadistica 
                icono={Target} titulo="TASA DE ÉXITO" valor="65.5%" 
                subtexto="Efectividad operativa" colorBarra="#50a060" porcentaje="65%" iconoColor="#80c090" 
              />
              
              <DarkCard className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-5 h-5 text-[#d0a060]" />
                  <span className="fuente-courier text-[#d4b878]" style={{ fontSize: 24 }}>5</span>
                </div>
                <p className="fuente-elite text-[#e8dcc8] tracking-[0.1em]" style={{ fontSize: 13 }}>RACHA ACTUAL</p>
                <p className="fuente-courier text-[#888] mt-1" style={{ fontSize: 10 }}>Mejor: 13</p>
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-1 flex-1 bg-[#d4b878] rounded-full" />)}
                  {[6,7,8].map(i => <div key={i} className="h-1 flex-1 bg-[#444] rounded-full" />)}
                </div>
              </DarkCard>
            </div>

            {/* Desglose Detallado */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { etiqueta: "Pistas dadas", valor: "342", color: "#8b2020" },
                { etiqueta: "Aciertos totales", valor: "789", color: "#2a5a3a" },
                { etiqueta: "Como Jefe", valor: "45", color: "#2a3a5a" },
                { etiqueta: "Como Agente", valor: "82", color: "#5a4a20" },
              ].map((item) => (
                <DarkCard key={item.etiqueta} className="p-3 sm:p-4">
                  <div className="h-1 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                  <p className="fuente-courier text-[#d4b878]" style={{ fontSize: 20 }}>{item.valor}</p>
                  <p className="fuente-courier text-[#888] mt-1" style={{ fontSize: 10 }}>{item.etiqueta}</p>
                </DarkCard>
              ))}
            </div>

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
                    <p className="fuente-courier text-[#888]" style={{ fontSize: 10 }}>6/11 desbloqueados</p>
                  </div>
                </div>
                <span className="fuente-courier text-[#d4b878]" style={{ fontSize: 14 }}>→</span>
              </div>
            </DarkCard>

            {/* Cerrar Sesión */}
            <button
              onClick={() => navegar("/login")}
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

// Subcomponente para las tarjetas de estadísticas individuales: REUTILIZAR LOGROS?

function TarjetaEstadistica({ icono: Icono, titulo, valor, subtexto, colorBarra, porcentaje, iconoColor }) {
  return (
    <DarkCard className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <Icono className="w-5 h-5" style={{ color: iconoColor }} />
        <div className="bg-[#8b2020] rounded-full px-3 py-1 flex items-center justify-center border-2 border-[#a03030]">
          <span className="fuente-courier text-white font-bold" style={{ fontSize: 13 }}>{valor}</span>
        </div>
      </div>
      <p className="fuente-elite text-[#e8dcc8] tracking-[0.1em]" style={{ fontSize: 13 }}>{titulo}</p>
      <p className="fuente-courier text-[#888] mt-1" style={{ fontSize: 10 }}>{subtexto}</p>
      <div className="mt-2 h-1 bg-[#444] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: porcentaje, backgroundColor: colorBarra }} />
      </div>
    </DarkCard>
  );
}