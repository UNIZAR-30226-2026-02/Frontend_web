/*
 * Pantalla de inicio (Home).
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Escritorio.css"; 
import { unirsePartidaPrivada, abandonarPartida, obtenerEstadoPartida } from "../api/apiPartidas";
import { obtenerPerfil } from "../api/apiJugador";
import { useToast } from "../context/ToastContext";

import { ManilaFolder, RedStamp, FBISeal } from "../components/ScreenFrame";
import { Crosshair, ShoppingBag, MessageSquare, Trophy, Archive, ArrowRight, LogIn, Lock, Globe, Search} from "lucide-react";

export function Pantalla02Home() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [joinOpen, setJoinOpen] = useState(false);
  const [privateCode, setPrivateCode] = useState("");

  // Variables para gestionar la redirección a una partida activa, si existe.
  const [partidaActivaId, setPartidaActivaId] = useState(null);
  const dialogShownRef = useRef(false);

  useEffect(() => {
    const cargarYVerificarPartida = async () => {
      try {
        // Pequeño retardo para que el backend tenga tiempo de actualizar el estado
        await new Promise(resolve => setTimeout(resolve, 1500));

        const perfil = await obtenerPerfil(navigate, showToast);
        const idPartida = perfil?.partida_activa_id || null;
        setPartidaActivaId(idPartida);
        
        // Si hay partida activa y aún no se ha mostrado el diálogo, lo mostramos una sola vez
        if (idPartida && !dialogShownRef.current) {
          dialogShownRef.current = true;
          const confirmar = window.confirm(
            "Tiene una partida en curso. ¿Desea volver a ella? (Aceptar = Sí, Cancelar = Abortar misión)"
          );
          if (confirmar) {
            // Obtener el estado actual de la partida
            const estadoPartida = await obtenerEstadoPartida(idPartida, navigate, showToast);
            // En función del estado se redirige al lobby, partida o al home.
            if (estadoPartida === "esperando") {
              navigate(`/lobby/${idPartida}`);
            } else if (estadoPartida === "en_curso") {
              navigate(`/partida/${idPartida}`);
            } else {
              // Si es finalizada se va al home
              console.warn("Estado inesperado de partida:", estadoPartida);
              navigate("/home");
            }
          } else {
            // Abortar misión
            await abandonarPartida(idPartida, navigate, showToast);
            // Limpiar localStorage del orden de cartas
            localStorage.removeItem(`card_order_${idPartida}`);
            // Actualizar perfil para limpiar 'partida_activa_id'.
            const nuevoPerfil = await obtenerPerfil(navigate, showToast);
            setPartidaActivaId(nuevoPerfil?.partida_activa_id || null);
          }
        }
      } catch (err) {
        console.error("Error al cargar perfil o verificar partida activa:", err);
      }
    };
  
    cargarYVerificarPartida();
  }, [navigate, showToast]);

  const handleJoinMission = async () => {
    if (!privateCode.trim()) return;
    try {
      const data = await unirsePartidaPrivada(privateCode.trim(), navigate, showToast);
      navigate(`/lobby/${data.id_partida}`);
    } catch (err) {
      // Error ya manejado por showToast en API
    }
  };

  return (
    <div className="dashboard-container relative">
      {/* MESA DE TRABAJO*/}
      <div className="desk-layout max-w-6xl mx-auto relative">
        
        
        {/* Mancha de café 1 */}
        <div className="coffee-stain top-[-5%] left-[-8%] opacity-80" />
        
        {/* Segunda mancha de café 2 */}
        <div className="coffee-stain bottom-[10%] right-[-12%] opacity-40 scale-75 rotate-[-20deg]" />

        <div className="operations-grid grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 relative z-10">
          
          {/* COLUMNA IZQUIERDA: CARPETA PRINCIPAL */}
          <div className="manila-wrapper relative">
            {/* Clip metálico que sujeta la carpeta */}
            <div className="paper-clip" />
            
            <ManilaFolder>
              <div className="folder-content">
                <div className="folder-tab">CUARTEL GENERAL</div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="header-title-box">
                      <h1>CENTRO DE OPERACIONES</h1>
                    </div>
                    <p className="courier-text-gold">Bienvenido, Agente. Seleccione su operación.</p>
                  </div>
                  <FBISeal size={60} />
                </div>

                <div className="space-y-4">
                  {/* Crear Misión */}
                  <div className="mission-card" onClick={() => navigate("/crear-mision")}>
                    <Crosshair className="icon-red" size={32} />
                    <div className="flex-1">
                      <p className="title-special">Crear Misión</p>
                      <p className="subtitle-courier">Organiza una nueva operación</p>
                    </div>
                    <span className="action-text">INICIAR →</span>
                  </div>

                  {/* Unirse a Misión */}
                  <div 
                    className={`mission-card ${joinOpen ? 'join-active' : ''}`} 
                    onClick={() => setJoinOpen(!joinOpen)}
                  >
                    <LogIn className="icon-green" size={32} />
                    <div className="flex-1">
                      <p className={`title-special ${joinOpen ? 'text-[#3a2a10]' : ''}`}>Unirse a Misión</p>
                      <p className="subtitle-courier">Privada o Pública</p>
                    </div>
                    <ArrowRight className={`transition-transform ${joinOpen ? "rotate-90" : ""}`} size={20} />
                  </div>

                  {/* Panel Desplegable de Unirse*/}
                 {joinOpen && (
                    <div className="join-grid-container">
            
                      <div className="join-sub-card private">
                        <div className="join-label-box">
                          <Lock size={14} className="icon-red" />
                          <span className="join-label-text" style={{ color: '#e8dcc8' }}>MISIÓN PRIVADA</span>
                        </div>
                        <p className="join-desc-text">Introduce credenciales de acceso:</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            className="code-input"
                            placeholder="FBI-XXXX"
                            value={privateCode}
                            onChange={(e) => setPrivateCode(e.target.value.toUpperCase())}
                            maxLength={8}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.stopPropagation();
                                handleJoinMission();
                              }
                            }}
                          />
                          <button className="btn-validate" onClick={(e) => { e.stopPropagation(); handleJoinMission(); }}>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                                        
                      {/* tarjeta Pública */}
                      <div className="join-sub-card public" onClick={(e) => { e.stopPropagation(); navigate("/misiones-publicas"); }}>
                        <div>
                          <div className="join-label-box">
                            <Globe size={14} className="icon-green" />
                            <span className="join-label-text" style={{ color: '#3a2a10' }}>MISIÓN PÚBLICA</span>
                          </div>
                          <p className="join-desc-text">Explora operaciones activas en la red:</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <Search size={14} className="icon-green" />
                          <span className="subtitle-courier" style={{ fontSize: '10px', color: '#2a5a3a' }}>BUSCAR TERMINALES →</span>
                        </div>
                      </div>  

                    </div>
                  )}
                </div>

                {/* Sello de Confidencial */}
                <RedStamp text="CONFIDENTIAL" className="stamp-folder" />
              </div>
            </ManilaFolder>
          </div>

          {/* NOTAS LATERALES */}
          <div className="sidebar-docs flex flex-col gap-6 pt-8">
            {/* Nota Mercado negro */}
            <div className="doc-paper doc-black-market" onClick={() => navigate("/tienda")}>
                <ShoppingBag size={28} className="mb-2 text-[#4a3018]" />
                <p className="title-special-small" style={{fontSize: '18px'}}>Mercado Negro</p>
                <p className="subtitle-courier" style={{fontSize: '11px', color: '#8b6a40'}}>SUMINISTROS ILEGALES</p>
            </div>

            <div className="post-it">
                <span>ENTREGA PENDIENTE: MUELLE 4</span>
            </div>

            {/* Nota Comunicaciones*/}
            <div className="doc-paper doc-comms" onClick={() => navigate("/social")}>
                <MessageSquare size={28} className="mb-2 text-[#2a3a4a]" />
                <p className="title-special-small" style={{fontSize: '18px'}}>Comunicaciones</p>
                <p className="subtitle-courier" style={{fontSize: '11px', color: '#5a7a9a'}}>PRIORIDAD: ALTA</p>
            </div>

            {/* Nota logros*/}
            <div className="doc-paper doc-achievements" onClick={() => navigate("/logros")}>
                <Trophy size={28} className="mb-2 text-[#8b2020]" />
                <p className="title-special-small" style={{fontSize: '18px'}}>Hoja de Servicio</p>
                <p className="subtitle-courier" style={{fontSize: '11px', color: '#a04040'}}>LOGROS DEL AGENTE</p>
            </div>

            {/* Nota Historial*/}
            <div className="doc-paper doc-historial" onClick={() => navigate("/historial")}>
                <Archive size={28} className="mb-2 text-[#ffffff]" />
                <p className="title-special-small" style={{fontSize: '18px', color: '#ffffff'}}>Historial</p>
                <p className="subtitle-courier" style={{fontSize: '11px', color: '#b7b7b7'}}>REGISTRO DE MISIONES ANTERIORES</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}