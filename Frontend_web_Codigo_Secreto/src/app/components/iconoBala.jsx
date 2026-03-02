/*Fichero que contiene el icono de bala */
import React from "react";

export function IconoBala({ className = "", size = 24 }) {
  const gradientId = "bullet-gradient";
  const tipGradientId = "tip-gradient";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradiente para el cuerpo (latón) */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a6a30" />
          <stop offset="50%" stopColor="#c4a060" />
          <stop offset="100%" stopColor="#8a6a30" />
        </linearGradient>
        
        {/* Gradiente para la punta (plomo/cobre) */}
        <linearGradient id={tipGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a08040" />
          <stop offset="50%" stopColor="#d4b878" />
          <stop offset="100%" stopColor="#a08040" />
        </linearGradient>
      </defs>

      {/* Sombra base para dar profundidad */}
      <ellipse cx="12" cy="22" rx="5" ry="1.5" fill="black" fillOpacity="0.2" />

      {/* Cuerpo del proyectil (Vaina) */}
      <path 
        d="M8 10 H16 V20 C16 21.1 15.1 22 14 22 H10 C8.9 22 8 21.1 8 20 V10 Z" 
        fill={`url(#${gradientId})`} 
        stroke="#5a4a20" 
        strokeWidth="0.5" 
      />

      {/* Ranura de extracción (típica en balas reales) */}
      <rect x="7.5" y="18" width="9" height="1.5" fill="#5a4a20" fillOpacity="0.3" />

      {/* Proyectil / Ojiva (La punta) */}
      <path 
        d="M8 10 C8 4 12 2 12 2 C12 2 16 4 16 10 Z" 
        fill={`url(#${tipGradientId})`} 
        stroke="#8a6a30" 
        strokeWidth="0.5" 
      />

      {/* Brillo de luz para realismo */}
      <line x1="10.5" y1="4" x2="10.5" y2="18" stroke="white" strokeOpacity="0.3" strokeWidth="0.8" />
      
      {/* Base / Fulminante */}
      <line x1="8" y1="20" x2="16" y2="20" stroke="#5a4a20" strokeWidth="0.8" />
    </svg>
  );
}