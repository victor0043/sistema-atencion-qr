export const cleanRut = (rut) => {
  if (!rut && rut !== 0) return '';
  return String(rut).replace(/[\.\-\s]/g, '').toUpperCase();
};

export const formatRut = (rut) => {
  const clean = cleanRut(rut);
  if (!clean) return '';
  if (clean.length <= 1) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const reversed = body.split('').reverse();

  const parts = [];
  for (let i = 0; i < reversed.length; i += 3) {
    parts.push(reversed.slice(i, i + 3).reverse().join(''));
  }

  return parts.reverse().join('.') + '-' + dv;
};
