/* 
 * Fichero que contiene la estética de FBI para los componentes utilizados 
 * por las pantallas del juego. 
 */

import React from "react";

export function ScreenFrame({ title, subtitle, children }) {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-transparent">
      {children}
    </div>
  );
}

/* ====== Subcomponentes reutilizables de estética FBI ====== */

export function ManilaFolder({ children, className = "", showTab = true, showClip = false }) {
  return (
    <div className={`relative ${className} my-8`}>
      
      {/*Papeles que "asoman" por detrás */}
      <div className="absolute -top-3 left-10 w-[90%] h-full bg-[#fdfdfd] shadow-sm rotate-[-1deg] border border-black/5" />
      <div className="absolute -top-5 left-4 w-[85%] h-full bg-[#f4f1ea] shadow-sm rotate-[1.5deg] border border-black/5" />
      
      {/* Sombra proyectada en la mesa */}
      <div className="absolute inset-0 bg-black/40 blur-xl translate-x-4 translate-y-6 rounded-lg pointer-events-none" />

      {/*Carpeta Principal */}
      <div className="relative group">
        
        {/* Paper clip opcional */}
        {showClip && (
          <div className="absolute -top-10 left-7 w-4 h-15 border-2 border-[#a6a6a6] rounded-lg transform rotate-5 z-50 shadow-sm bg-rgba(200,200,200,0.1)" />
        )}
        
        {/* Pestaña de la carpeta - opcional */}
        {showTab && (
          <div className="absolute -top-6 left-0 h-8 w-40 bg-[#c4a060] rounded-t-xl shadow-[-2px_-2px_5px_rgba(0,0,0,0.1)] border-t border-x border-white/20 flex items-center px-4">
             <span className="font-['Courier'] text-[10px] text-[#3a2a10] opacity-70 uppercase tracking-tighter">Subject: Classified</span>
          </div>
        )}

        {/* Cuerpo de la carpeta */}
        <div
          className="relative min-h-[550px] shadow-[2px_0_15px_rgba(0,0,0,0.3)] border-l-[10px] border-black/10"
          style={{
            background: 'linear-gradient(to right, #b89055 0%, #c4a060 5%, #d4b070 15%, #c4a060 100%)',
            borderRadius: '2px 15px 15px 2px'
          }}
        >
          {/* TEXTURA DE PAPEL RUGOSO */}
          <div className="absolute inset-0 opacity-20 mix-blend-multiply" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`
          }} />

          {/* Manchas de humedad y uso */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5a3a10]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-black/5 rounded-full blur-3xl" />

          {/* línea de pliegue , el lomo */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/20 ml-2" />
          
          <div className="relative z-10 p-4 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DarkCard({ children, className = "", onClick }) {
  return (
    <div className={`bg-[#2a2a2a] rounded-md border border-[#3a3a3a] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.4)] ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function RedStamp({ text, className = "" }) {
  return (
    <div className={`inline-block border-[3px] border-[#8b2020] rounded-sm px-3 sm:px-4 py-1 opacity-75 ${className}`}>
      <span className="font-['Special_Elite',cursive] text-[#8b2020] tracking-[0.2em] uppercase" style={{ fontSize: 25}}>
        {text}
      </span>
    </div>
  );
}

export function FBISeal({ size = 64 }) {
  return (
    <div
      className="rounded-full border-2 border-[#5a4a30]/60 flex items-center justify-center opacity-50 flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle, #c4a060 0%, #a08040 50%, #8a6a30 100%)',
      }}
    >
      <div className="text-center">
        <span className="font-['Special_Elite',cursive] text-[#3a2a10] block" style={{ fontSize: size * 0.2 }}>FBI</span>
        <span className="font-['Courier_Prime',monospace] text-[#3a2a10] block" style={{ fontSize: size * 0.09 }}>CLASSIFIED</span>
      </div>
    </div>
  );
}

export function SectionHeader({ title, borderColor = "#4a3a20" }) {
  return (
    <div className="relative inline-block mb-2">
      <div className="absolute inset-0 bg-[#8b2020]/80 skew-y-[-0.3deg]" />
      <div className="relative py-1.5 px-4 sm:px-5">
        <h1 className="font-['Special_Elite',cursive] text-white tracking-[0.1em] sm:tracking-[0.15em]" style={{ fontSize: 'clamp(18px, 3vw, 26px)' }}>
          {title}
        </h1>
      </div>
    </div>
  );
}

export function SubsectionLabel({ icon, label, borderColor = "#4a3a20" }) {
  return (
    <div className="flex items-center gap-2 mb-3 border-l-4 pl-3" style={{ borderColor }}>
      {icon}
      <span className="font-['Special_Elite',cursive] text-[#3a2a10] tracking-[0.1em]" style={{ fontSize: 14 }}>
        {label}
      </span>
    </div>
  );
}

export function TapeStrip({ className = "" }) {
  return (
    <div className={`h-5 bg-[#d4c8a0]/40 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${className}`} style={{ width: 80 }} />
  );
}