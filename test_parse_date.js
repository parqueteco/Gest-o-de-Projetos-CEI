const parseDateBR = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.trim();
  
  const partsBR = cleanStr.split('/');
  if (partsBR.length === 3) {
    return new Date(parseInt(partsBR[2], 10), parseInt(partsBR[1], 10) - 1, parseInt(partsBR[0], 10));
  }
  
  const partsISO = cleanStr.split('-');
  if (partsISO.length === 3) {
    return new Date(parseInt(partsISO[0], 10), parseInt(partsISO[1], 10) - 1, parseInt(partsISO[2], 10));
  }
  
  return null;
};
console.log(parseDateBR("2024-10-15"));
console.log(parseDateBR("15/10/2024"));
