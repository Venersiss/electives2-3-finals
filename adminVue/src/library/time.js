export function isoWithOffset(offsetHours = 8) {
  const now = new Date();
  const offsetMs = offsetHours * 60 * 60 * 1000;
  const d = new Date(now.getTime() + offsetMs);

  // Use UTC getters on the shifted date so the result reflects the offset
  const YYYY = d.getUTCFullYear();
  const MM = String(d.getUTCMonth() + 1).padStart(2, '0');
  const DD = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');

  const sign = offsetHours >= 0 ? '+' : '-';
  const absOff = Math.abs(offsetHours);
  const offHH = String(Math.floor(absOff)).padStart(2, '0');
  const offMM = String(Math.round((absOff - Math.floor(absOff)) * 60)).padStart(2, '0');

  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}${sign}${offHH}:${offMM}`;
}
