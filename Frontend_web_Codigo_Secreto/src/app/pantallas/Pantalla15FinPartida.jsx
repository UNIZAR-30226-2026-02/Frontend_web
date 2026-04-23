import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ManilaFolder, SectionHeader, RedStamp, FBISeal } from "../components/ScreenFrame"; 
import { Award, ArrowLeft } from "lucide-react";
import { useSound } from "../hooks/useSound";

const API_BASE = import.meta.env.VITE_API_URL;

export function Pantalla15FinPartida() {
  const navigate = useNavigate();
  const { id_partida } = useParams();

  // Estados
  const [miEquipo, setMiEquipo] = useState(null);
  const [datosFinales, setDatosFinales] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Llamadas a la API
  useEffect(() => {

    let intentos = 0;
    const maxIntentos = 5;
    const esperaInicial = 500; // ms

    const fetchResultados = async (reintentar = true) => {
      try {
        // 1. Obtener estadísticas finales de la partida
        const resFin = await fetch(`${API_BASE}/partida/${id_partida}/fin`, { credentials: "include" });
        
        // Por si aún no se ha finalizado la transacción en la base de datos, se espera a que 
        // cargue.
        if (resFin.status === 409 && reintentar && intentos < maxIntentos) {
          // La partida aún no ha finalizado → esperamos y reintentamos
          intentos++;
          console.log(`Intento ${intentos} de ${maxIntentos}: partida no finalizada, esperando...`);
          await new Promise(resolve => setTimeout(resolve, esperaInicial * intentos)); // backoff exponencial
          return fetchResultados(true);
        }
        
        if (!resFin.ok) throw new Error("No se ha podido recuperar el informe de la misión.");
        const dataFin = await resFin.json();
        setDatosFinales(dataFin);

        // 2. Obtener de qué equipo soy yo
        const resRol = await fetch(`${API_BASE}/partidas/${id_partida}/participantes/rol`, { credentials: "include" });
        if (resRol.ok) {
          const dataRol = await resRol.json();
          setMiEquipo(dataRol.equipo); // Guardamos "rojo" o "azul"
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    if (id_partida) fetchResultados();
  }, [id_partida]);

  // Variables calculadas
  const { playAplauso, playFiasco } = useSound();
  const sonidoReproducidoRef = useRef(false);

  const equipo_ganador = datosFinales?.equipo_ganador || 'Rojo'; 
  const aciertos_rojo = datosFinales?.aciertos_rojo || 0;
  const aciertos_azul = datosFinales?.aciertos_azul || 0;
  
  // Lógica para saber quién ha ganado y mi estado
  const esRojoGanador = equipo_ganador.toLowerCase() === 'rojo';
  const soyRojo = miEquipo && miEquipo.toLowerCase() === 'rojo';
  const heGanado = miEquipo && miEquipo.toLowerCase() === equipo_ganador.toLowerCase();

  useEffect(() => {
    if (!cargando && datosFinales && miEquipo && !sonidoReproducidoRef.current) {
      if (heGanado) {
        playAplauso();
      } else {
        playFiasco();
      }
      sonidoReproducidoRef.current = true;
    }
  }, [cargando, datosFinales, miEquipo, heGanado, playAplauso, playFiasco]);

  // NUEVO: El color de la bandera AHORA SIEMPRE ES EL DE TU EQUIPO
  const bgBandera = soyRojo ? "bg-[#8b2020]/90" : "bg-[#80a0d0]/90"; 
  const colorTextoSecundario = soyRojo ? "text-[#8B2020]" : "text-[#80a0d0]";

  // Vistas de Carga y Error
  if (cargando) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-['Courier_Prime',monospace]">
        <p className="text-[#c4a060] tracking-widest uppercase">RECUPERANDO INFORME CLASIFICADO...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center font-['Courier_Prime',monospace] p-4 text-center">
        <p className="text-[#cc3333] mb-4">ERROR AL DESENCRIPTAR INFORME: {error}</p>
        <button onClick={() => navigate("/home")} className="text-[#c4a060] border border-[#c4a060] px-4 py-2 hover:bg-[#c4a060]/10">VOLVER AL ESCRITORIO</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 lg:p-12 pt-16 sm:pt-12 font-['Courier_Prime',monospace]">
      <div className="max-w-4xl mx-auto relative">

        <button
            onClick={() => navigate("/home")}
            className="back-btn group"
        >
            <ArrowLeft className="back-btn-icon" />
            <span className="back-btn-text">VOLVER AL ESCRITORIO</span>
        </button>

        <ManilaFolder showTab={false} showClip={true}>
          <div className="p-5 sm:p-8 lg:p-10 relative">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <FBISeal size={400} />
            </div>

            <div className="flex items-start justify-between mb-8 border-b-2 border-black/10 pb-4 flex-wrap gap-4 relative z-10">
              <div className="flex-1 min-w-[280px]">
                <SectionHeader title="INFORME DE CLASIFICACIÓN FINAL" />
                <p className="text-[#5a4a30] text-xs mt-1 uppercase tracking-wider">
                  Estado de la Misión: <span className="font-bold">FINALIZADA</span>
                </p>
              </div>
            </div>

            {/* ─── SECCIÓN CENTRAL: ANUNCIO DE VICTORIA / DERROTA ─── */}
            <div className="relative mb-12 mt-6 z-10">
              <div className="absolute -top-10 -right-4 opacity-10 rotate-[15deg] pointer-events-none">
                <RedStamp text="CLASSIFIED" size="large" />
              </div>

              <div className="text-center flex flex-col items-center justify-center p-6 bg-white/30 border border-black/5 rounded-sm shadow-inner relative">
                <p className="text-sm text-[#5a4a30] uppercase tracking-widest mb-2 font-bold">La red de espionaje confirma:</p>
                
                {/* Cartel dinámico: Color de tu equipo SIEMPRE */}
                <div className={`${bgBandera} text-white px-8 py-4 rounded-sm shadow-lg rotate-[-1deg] inline-block my-2 border-2 border-black/20`}>
                  <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                    {heGanado ? "¡Enhorabuena agente!" : "¡Misión fallida!"}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight [text-shadow:2px_2px_0px_rgba(0,0,0,0.2)]">
                    {heGanado ? "HAS GANADO" : "HAS PERDIDO"}
                  </h1>
                  <p className="text-sm font-bold opacity-90 mt-2 uppercase text-center">
                    {heGanado 
                      ? "(Tu equipo ha desmantelado la red rival)" 
                      : `(Victoria para el Equipo ${equipo_ganador})`}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4 text-[#5a4a30]">
                  <Award className={`w-5 h-5 ${colorTextoSecundario}`} />
                  <p className="text-sm">
                    {heGanado ? "Excelente trabajo en el campo." : "Debemos reagruparnos y mejorar nuestra estrategia."}
                  </p>
                </div>
              </div>
            </div>

            {/* ─── SECCIÓN INFERIOR: MARCADORES ESTÁTICOS POR COLOR ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 relative z-10">
              
              {/* Tarjeta Marcador ROJO (Siempre con bordes rojos) */}
              <div className={`p-6 rounded-sm shadow-md border-t-4 border-[#8b2020] relative overflow-hidden flex items-center justify-between gap-4 ${esRojoGanador ? 'bg-[#f8f0e0]' : 'bg-[#efe6d5]'}`}>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 bg-[#8b2020]/80 shadow-[0_0_5px_rgba(233,60,60,0.5)]`} />
                    <h3 className="text-lg font-bold text-[#3a2a10] uppercase tracking-tight">Agentes Rojos</h3>
                  </div>
                  <p className="text-xs text-[#5a4a30] leading-tight">Identidades operativas<br/>descubiertas con éxito</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-6xl font-bold tracking-tight text-[#8b2020]/80 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]`}>
                    {aciertos_rojo}
                  </span>
                </div>
              </div>

              {/* Tarjeta Marcador AZUL (Siempre con bordes azules) */}
              <div className={`p-6 rounded-sm shadow-md border-t-4 border-[#80a0d0] relative overflow-hidden flex items-center justify-between gap-4 ${!esRojoGanador ? 'bg-[#f8f0e0]' : 'bg-[#efe6d5]'}`}>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 bg-[#80a0d0] shadow-[0_0_5px_rgba(46,132,215,0.5)]`} />
                    <h3 className="text-lg font-bold text-[#3a2a10] uppercase tracking-tight">Agentes Azules</h3>
                  </div>
                  <p className="text-xs text-[#5a4a30] leading-tight">Identidades operativas<br/>descubiertas con éxito</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-6xl font-bold tracking-tight text-[#80a0d0] [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]`}>
                    {aciertos_azul}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </ManilaFolder>

        <div className="absolute bottom-7.5 left-8 z-20 rotate-[-10deg] opacity-90">
          <RedStamp text="MISION CUMPLIDA" size="medium" />
        </div>
      </div>
    </div>
  );
}