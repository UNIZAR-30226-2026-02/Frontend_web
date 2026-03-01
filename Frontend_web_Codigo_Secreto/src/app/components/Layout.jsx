/* 
 * Fichero con la estética de la estructura principal de todas las pantallas de la aplicación. 
 */

import { Outlet, useLocation, useNavigate } from "react-router";
import { BookOpen } from "lucide-react";
import woodTexture from '../../assets/wood.png';
// Pantallas en las que no se van a mostrar los iconos persistentes de las esquinas (foto de agente, 
// manual operativo y contador de balas).
const hideOverlay = ["/","/login"];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideIcons = hideOverlay.some(r => location.pathname === r);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
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
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

      {/* Sombreado perimetral (Vignette) para dar profundidad */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* ====== Iconos persistentes en las esquinas ====== */}
      {!hideIcons && (
        <>
          {/* Agent photo — top left → Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 group cursor-pointer"
            title="Expediente del Agente"
          >
            <div className="relative">
              {/* Polaroid frame */}
              <div className="bg-[#f0e8d4] p-[3px] pb-[10px] shadow-[2px_3px_10px_rgba(0,0,0,0.6)] rotate-[-4deg] group-hover:rotate-[-1deg] transition-transform">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#3a2a18] overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4a3a28] to-[#2a1c10]">
                    <span className="font-['Special_Elite',cursive] text-[#c4a060]" style={{ fontSize: 10 }}>AG</span>
                  </div>
                </div>
              </div>
              {/* Red dot */}
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#cc3333] rounded-full border border-[#8b2020] shadow-[0_0_6px_rgba(200,50,50,0.5)]" />
            </div>
          </button>

          {/* Manual Operativo — top right → Settings */}
          <button
            onClick={() => navigate("/settings")}
            className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 group cursor-pointer"
            title="Manual Operativo"
          >
            <div className="bg-[#2a2218]/90 border border-[#5a4a30]/40 rounded-sm p-1.5 sm:p-2 shadow-[2px_3px_10px_rgba(0,0,0,0.5)] group-hover:bg-[#3a3020]/90 transition-colors">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#c4a060] group-hover:text-[#d4b878] transition-colors" />
            </div>
          </button>

          {/* Bullet count — top right, below manual */}
          <div className="fixed top-14 right-3 sm:top-16 sm:right-4 z-50">
            <div className="flex items-center gap-1.5 bg-[#1a1208]/90 border border-[#5a4a20]/30 rounded-sm px-2 py-1 shadow-[1px_2px_6px_rgba(0,0,0,0.4)]">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <rect x="8" y="12" width="8" height="10" rx="1" fill="#c4a060" stroke="#8a6a30" strokeWidth="0.8" />
                <path d="M9 12 L12 2 L15 12 Z" fill="#d4b878" stroke="#a08040" strokeWidth="0.6" />
                <circle cx="12" cy="20" r="1.5" fill="#8a6a30" />
              </svg>
              <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 11 }}>500</span>
            </div>
          </div>
        </>
      )}

      {/* ====== CONTENIDO PRINCIPAL ====== */}
      <main className="flex-1 relative z-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}