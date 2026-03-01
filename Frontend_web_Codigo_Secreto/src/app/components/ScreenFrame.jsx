/* 
 * Fichero que contiene la estética de FBI para los componentes utilizados 
 * por las pantallas del juego. 
 */

import React from "react";

export function ScreenFrame({ title, subtitle, children }) {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}

/* ====== Subcomponentes reutilizables de estética FBI ====== */

export function ManilaFolder({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Paper shadow layers */}
      <div className="absolute -bottom-1 -right-1 w-full h-full bg-[#b89860]/30 rounded-sm rotate-[0.5deg] hidden sm:block" />
      <div className="absolute -bottom-2 -right-2 w-full h-full bg-[#a08050]/20 rounded-sm rotate-[1deg] hidden sm:block" />
      {/* Main folder */}
      <div
        className="relative rounded-sm overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #c9a96e 0%, #b89055 30%, #c4a060 60%, #d4b070 100%)',
        }}
      >
        {/* Paper grain */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />
        {/* Subtle stains */}
        <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-[#8a6030]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[15%] right-[20%] w-40 h-40 bg-[#7a5020]/8 rounded-full blur-3xl" />
        <div className="relative z-10">{children}</div>
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
      <span className="font-['Special_Elite',cursive] text-[#8b2020] tracking-[0.2em] uppercase" style={{ fontSize: 14 }}>
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