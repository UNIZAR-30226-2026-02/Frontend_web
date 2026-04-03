/* 
 * Fichero con la estética de la estructura principal de todas las pantallas de la aplicación. 
 * MODIFICADO: Se ha añadido soporte para música de fondo y efectos de sonido globales.
 */

import { Outlet, useLocation, useNavigate } from "react-router";
import { BookOpen } from "lucide-react";
import woodTexture from '../../assets/wood.png';
import { IconoBala } from "../components/iconoBala";
import { UserContext } from "./UserContext";
import { useContext } from "react";

import avatar from '../../assets/1_magia.jpeg';

// Importaciones para el sistema de sonido
import { SoundProvider } from '../context/SoundContext';
import { BackgroundMusic } from '../context/MusicaFondo';
import { GlobalSoundEffects } from '../context/GlobalSoundEffects';

// Pantallas en las que NO se van a mostrar los iconos persistentes de las esquinas 
// (foto de agente ni contador de balas).
const hideProfileRoutes = ["/","/login", "/partida","/manual", "/nombre-usuario-nuevo"];
const hideBulletsRoutes = ["/","/login", "/partida","/manual", "/nombre-usuario-nuevo", "/tienda"];
// Pantallas en las que NO se quiere mostrar el icono del manual.
const hideManualRoutes = ["/","/login","/manual", "/nombre-usuario-nuevo"];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideProfile = hideProfileRoutes.some(r => location.pathname === r || location.pathname.startsWith(`${r}/`));
  const hideBullets = hideBulletsRoutes.some(r => location.pathname === r || location.pathname.startsWith(`${r}/`));
  const hideManual = hideManualRoutes.some(r => location.pathname === r || location.pathname.startsWith(`${r}/`));

  /* DESCOMENTAR PARA CONEXIÓN CON BACKEND.
  const { user, isLoading } = useContext(UserContext);

  // PANTALLA DE CARGA (Mientras el backend valida la cookie)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2a1204]">
        <span className="font-['Courier_Prime',monospace] text-[#c4a060]">
          VERIFICANDO CREDENCIALES...
        </span>
      </div>
    );
  }

  // LÓGICA PARA INICIALES Y BALAS (Con fallback por si user es null)
  //const initials = user?.alias ? user.alias.substring(0, 2).toUpperCase() : "??";
  const balas = user?.balas ?? 0;*/
  

  return (
    // NEnvolvemos toda la aplicación con SoundProvider para que los componentes hijos
    // puedan acceder al contexto de sonido (volumen, funciones de reproducción).
    <SoundProvider>
      {/* Componente que gestiona la música de fondo (inicio automático tras primera interacción) */}
      <BackgroundMusic />
      
      {/* Componente que escucha eventos globales (click, tecleo) y reproduce efectos de sonido */}
      <GlobalSoundEffects />

      {/* Contenedor principal con el estilo de fondo de madera (sin cambios) */}
      <div
        className="min-h-screen flex flex-col relative"
        style={{
          // Imagen de fondo de madera.
          backgroundImage: `url(${woodTexture})`,
          backgroundColor: '#2a1204', // Color de respaldo oscuro
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed' // Mantiene la madera fija al hacer scroll
        }}
      >
        {/* CAPA DE SOMBRA PERIMETRAL (Vignette) 
            Esto oscurece los bordes para que parezca una mesa bajo una lámpara */}
        <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

        {/* ====== Iconos persistentes en las esquinas ====== */}
        {!hideProfile /*&& user*/ && (  // Solo se muestra si hay sesión.
          <>
            {/* Agent photo — top left → Profile */}
            <button
              onClick={() => navigate("/perfil")}
              className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 group cursor-pointer"
              title="Expediente del Agente"
            >
              <div className="relative">
                {/* Polaroid frame */}
                <div className="bg-[#f0e8d4] p-[3px] pb-[10px] shadow-[2px_3px_10px_rgba(0,0,0,0.6)] rotate-[-4deg] group-hover:rotate-[-1deg] transition-transform">
                    <img src={avatar} alt="Avatar" className="w-8 h-8 sm:w-12 sm:h-12 object-cover"  />
                </div>
                {/* Red dot */}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#cc3333] rounded-full border border-[#8b2020] shadow-[0_0_6px_rgba(200,50,50,0.5)]" />
              </div>
            </button>
          </>
        )}

        {!hideBullets && (
          <>
            {/* Bullet count — top right, below manual */}
            <div className="fixed top-14 right-3 sm:top-16 sm:right-4 z-50">
              <div className="flex items-center gap-1.5 bg-[#1a1208]/90 border border-[#5a4a20]/30 rounded-sm px-2 py-1 shadow-[1px_2px_6px_rgba(0,0,0,0.4)]">
                <IconoBala size={15} />
                {/* Balas de prueba */}
                <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 13 }}>500</span>
                {/* TODO: descomentar para conectar con backend.
                    BALAS DINÁMICAS            
                <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 11 }}>
                  {balas}
                </span>
                */} 
                
                
              </div>
            </div>
          </>
        )}

        {!hideManual && (
          <>
            {/* Manual Operativo — top right → Settings */}
            <button
              onClick={() => navigate("/manual")}
              className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 group cursor-pointer"
              title="Manual Operativo"
            >
              <div className="bg-[#2a2218]/90 border border-[#5a4a30]/40 rounded-sm p-1.5 sm:p-2 shadow-[2px_3px_10px_rgba(0,0,0,0.5)] group-hover:bg-[#3a3020]/90 transition-colors">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#c4a060] group-hover:text-[#d4b878] transition-colors" />
              </div>
            </button>
          </>
        )}

        {/* ====== CONTENIDO PRINCIPAL ====== */}
        <main className="flex-1 relative z-10 bg-transparent">
          <Outlet />
        </main>
      </div>
    </SoundProvider>
  );
}