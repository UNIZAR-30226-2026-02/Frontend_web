const limpiarNombreTema = (nombre) => {
  if (!nombre) return '';
  let base = nombre.split('_')[0]; // 'gold', 'sag', etc.
  if (base === 'sag') return 'SAGE';
  return base.charAt(0).toUpperCase() + base.slice(1); // 'Gold', 'Terracotta', etc.
};