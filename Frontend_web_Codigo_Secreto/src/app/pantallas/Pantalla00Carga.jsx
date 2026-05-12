/*
 * Pantalla de carga inicial (al iniciar la aplicación o refrescar la página).
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import woodTexture from "../../assets/wood.png"; 
import logo from "../../assets/logo.png"; 

export function Pantalla00Carga() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 1;

        if (newProgress >= 100) {
          clearInterval(timer);
          
          // Se redirige a la pantalla de login cuando la carga simulada llega al 100%.
          // Se utiliza 'replace: true' para que el usuario no pueda volver a esta pantalla, 
          // ya que se quiere mostrar solo al iniciar la aplicación.
          setTimeout(() => {
            navigate("/login", { replace: true }); 
          }, 400); 
          
          return 100;
        }
        
        return newProgress;
      });
    }, 30); // Se actualiza el progreso de la barra cada 30 ms.

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${woodTexture})`,
        backgroundColor: "#2a1204",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-sm px-8">
        <img 
          src={logo} 
          alt="Código Secreto" 
          className="w-48 sm:w-56 h-auto drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] "
        />

        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between items-end w-full px-1">
            <span className="font-['Courier_Prime',monospace] text-[#c4a060] text-[10px] tracking-widest">
              ESTABLECIENDO CONEXIÓN SEGURA...
            </span>
            <span className="font-['Courier_Prime',monospace] text-[#d4b878] text-xs">
              {progress}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-[#1a1208] border border-[#5a4a20]/40 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
            <div 
              className="h-full bg-[#8b2020] transition-all duration-75 ease-linear rounded-full"
              style={{ 
                width: `${progress}%`,
                boxShadow: "0 0 10px rgba(139, 32, 32, 0.8)" 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}