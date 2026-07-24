/**
 * Date parsing shared across templates + sections. Invitation content stores
 * `event.date` as Indonesian free-form text (e.g. "Sabtu, 28 Agustus 2027"),
 * which `new Date()` rejects (→ Invalid Date / NaN), silently breaking
 * countdowns and date displays. This parser accepts ISO, English, Indonesian,
 * and DD/MM/YYYY. Returns null if unparseable.
 */
const ID_MONTHS: Record<string, number> = {
  januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5, juli: 6,
  agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6,
  agu: 7, agt: 7, ags: 7, sep: 8, okt: 9, nov: 10, des: 11,
};

export function parseFlexibleDate(input?: string | null): Date | null {
  if (!input) return null;
  const str = String(input).trim();
  const native = new Date(str);
  if (!isNaN(native.getTime())) return native;
  const m = str.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/);
  if (m) {
    const mon = ID_MONTHS[m[2].toLowerCase()];
    if (mon !== undefined) {
      const d = new Date(Number(m[3]), mon, Number(m[1]));
      if (!isNaN(d.getTime())) return d;
    }
  }
  const n = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (n) {
    const d = new Date(Number(n[3]), Number(n[2]) - 1, Number(n[1]));
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}
