// Shared game board data — 4x5 grid (RF-13: 20 cards)

export const boardWords = [
  ["MANZANA", "PUENTE", "ESTRELLA", "DRAGÓN", "NOCHE"],
  ["CORONA", "ESPEJO", "SOMBRA", "FUEGO", "RELOJ"],
  ["HIERRO", "LUNA", "TORRE", "BOSQUE", "PIEDRA"],
  ["SANGRE", "CIELO", "ESPADA", "BRUMA", "LOBO"],
];

// Color identities (only Spymaster sees these)
// R = Red agent, B = Blue agent, C = Civilian, A = Assassin
export const colorMap = [
  ["R", "B", "C", "R", "B"],
  ["B", "R", "A", "C", "R"],
  ["C", "B", "R", "B", "C"],
  ["R", "C", "B", "R", "B"],
];

export const colorStyles: Record<string, { border: string; bg: string; text: string; label: string }> = {
  R: { border: "border-[#cc3333]", bg: "bg-[#8b2020]/30", text: "text-[#e08080]", label: "ROJO" },
  B: { border: "border-[#3366cc]", bg: "bg-[#2a3a5a]/30", text: "text-[#80a0d0]", label: "AZUL" },
  C: { border: "border-[#777]", bg: "bg-[#444]/20", text: "text-[#999]", label: "CIVIL" },
  A: { border: "border-[#222]", bg: "bg-[#000]/40", text: "text-[#cc3333]", label: "ASESINO" },
};

export const colorBg: Record<string, string> = {
  R: "bg-[#8b2020]/40 border-[#cc3333]",
  B: "bg-[#2a3a5a]/40 border-[#3366cc]",
  C: "bg-[#555]/15 border-[#777]/30",
  A: "bg-[#000]/50 border-[#333]",
};