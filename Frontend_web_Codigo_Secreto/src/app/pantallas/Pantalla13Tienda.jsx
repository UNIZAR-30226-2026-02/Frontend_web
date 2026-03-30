import { ScreenFrame, ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader, SubsectionLabel } from "../components/ScreenFrame";
import { IconoBala } from "../components/IconoBala";
import { Package, Palette, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

// TODO: integrar con backend
// Se usan de momento datos de prueba.
// DATOS SINCRONIZADOS EXACTAMENTE CON EL ARRAY TEMAS_VISUALES PERFIL
const PALETAS_TIENDA = [
  { id: "gold", name: "Oro envejecido", color: "#d4af37", price: "0", unlocked: true },
  { id: "sage", name: "Verde salvia", color: "#8a9a5b", price: "500", unlocked: false },
  { id: "terracotta", name: "Terracota cálida", color: "#c65d3b", price: "500", unlocked: false },
  { id: "purple", name: "Púrpura real", color: "#8b5a8b", price: "750", unlocked: false },
  { id: "rose", name: "Cuarzo rosa", color: "#c67b8a", price: "750", unlocked: false },
];
const packs = [
  { name: "Animales Exóticos", count: "50 imágenes", price: "300", emoji: "🦁" },
  { name: "Ciudades del Mundo", count: "50 imágenes", price: "300", emoji: "🏙️" },
  { name: "Comida Gourmet", count: "50 imágenes", price: "300", emoji: "🍣" },
  { name: "Deportes Extremos", count: "50 imágenes", price: "400", emoji: "🏄" },
];

export function Pantalla13Tienda() {
  const navigate = useNavigate();

  return (
    <ScreenFrame title="MERCADO NEGRO">
      <div className="max-w-4xl mx-auto pt-8 sm:pt-4">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-[#8a7a60] hover:text-[#d4b878] transition-colors cursor-pointer mb-4 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 11 }}>VOLVER AL ESCRITORIO</span>
        </button>

        {/* Balance badge */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 bg-[#1a1208]/80 border border-[#5a4a20]/30 rounded-sm px-4 py-2 shadow-[2px_3px_10px_rgba(0,0,0,0.4)]">
            <IconoBala size={16} />
            <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 16 }}>500</span>
            <span className="font-['Courier_Prime',monospace] text-[#a08060]" style={{ fontSize: 10 }}>BALAS</span>
          </div>
        </div>

        <ManilaFolder>
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Folder tab */}
            <div className="absolute -top-0 left-6 bg-[#b89055] px-4 py-1.5 rounded-b-sm border-x border-b border-[#a08040] shadow-sm z-10">
              <span className="font-['Courier_Prime',monospace] text-[#2a1a08]" style={{ fontSize: 9 }}>MERCADO NEGRO</span>
            </div>

            <div className="flex items-start justify-between mb-5 flex-wrap gap-3 mt-2">
              <div>
                <SectionHeader title="MERCADO NEGRO" />
                <p className="font-['Courier_Prime',monospace] text-[#6a5a40] mt-1" style={{ fontSize: 11 }}>
                  Suministros tácticos y equipamiento clasificado
                </p>
              </div>
              <FBISeal size={50} />
            </div>

            {/* Board Themes */}
            {/* SECCIÓN: PALETAS DE COLORES (Sincronizadas con Perfil) */}
            <SubsectionLabel 
              icon={<Palette className="w-4 h-4 text-[#5a4a30]" />} 
              label="TEMAS DE INTERFAZ" 
              borderColor="#d4af37" 
            />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
              {PALETAS_TIENDA.map((tema) => (
                <DarkCard key={tema.id} className="p-4 text-center">
                  <div 
                    className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-[#5a4a20]/30 shadow-inner" 
                    style={{ backgroundColor: tema.color }}
                  />
                  <p className="fuente-elite text-[#e8dcc8] tracking-tight" style={{ fontSize: 10 }}>{tema.name.toUpperCase()}</p>
                  
                  {tema.unlocked ? (
                    <div className="mt-2 flex items-center justify-center gap-1 text-[#50a060]">
                      <Check className="w-3 h-3" />
                      <span className="fuente-courier" style={{ fontSize: 9 }}>ADQUIRIDO</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <IconoBala size={11} />
                        <span className="fuente-courier text-[#d4b878]" style={{ fontSize: 12 }}>{tema.price}</span>
                      </div>
                      <button className="mt-2 w-full bg-[#8b2020]/80 hover:bg-[#8b2020] text-white py-1 rounded-sm transition-colors cursor-pointer">
                        <span className="fuente-elite tracking-tighter" style={{ fontSize: 9 }}>COMPRAR</span>
                      </button>
                    </>
                  )}
                </DarkCard>
              ))}
            </div>

            {/* Card Packs */}
            <SubsectionLabel icon={<Package className="w-4 h-4 text-[#5a4a30]" />} label="PAQUETES DE CARTAS" borderColor="#8b2020" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {packs.map((p) => (
                <DarkCard key={p.name} className="p-4 text-center">
                  <div className="text-3xl sm:text-4xl mb-2">{p.emoji}</div>
                  <p className="font-['Special_Elite',cursive] text-[#e8dcc8]" style={{ fontSize: 12 }}>{p.name}</p>
                  <p className="font-['Courier_Prime',monospace] text-[#888] mt-1" style={{ fontSize: 9 }}>{p.count}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <IconoBala size={13} />
                    <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 13 }}>{p.price}</span>
                  </div>
                  <button className="mt-2 w-full bg-[#5a4a20]/80 hover:bg-[#5a4a20] text-[#e8dcc8] py-1.5 rounded-sm transition-colors cursor-pointer">
                    <span className="font-['Special_Elite',cursive] tracking-[0.1em]" style={{ fontSize: 10 }}>ADQUIRIR</span>
                  </button>
                </DarkCard>
              ))}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-['Courier_Prime',monospace] text-[#8a7a60]/50" style={{ fontSize: 9 }}>REF: FBI-STORE-4472</span>
              <RedStamp text="CLASSIFIED" className="rotate-[-3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}
