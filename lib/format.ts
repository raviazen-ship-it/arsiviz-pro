import { Language } from '@/types/project';

export function formatIDR(amount: number, lang: Language = 'id'): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  const formatted = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(Math.abs(safe));
  const prefix = safe < 0 ? '-Rp ' : 'Rp ';
  return `${prefix}${formatted}`;
}

export function formatCompactIDR(amount: number, lang: Language = 'id'): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(safe);
  const sign = safe < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toFixed(2).replace(/\.00$/, '');
    const formattedVal = lang === 'id' ? val.replace('.', ',') : val;
    return `${sign}Rp ${formattedVal} ${lang === 'id' ? 'M' : 'B'}`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(1).replace(/\.0$/, '');
    const formattedVal = lang === 'id' ? val.replace('.', ',') : val;
    return `${sign}Rp ${formattedVal} ${lang === 'id' ? 'Jt' : 'M'}`;
  }
  return formatIDR(safe, lang);
}

export function formatArea(m2: number, lang: Language = 'id'): string {
  const rounded = Math.round(m2 * 10) / 10;
  const text = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    maximumFractionDigits: 1,
  }).format(rounded);
  return `${text} m²`;
}

export function formatMeters(meters: number, lang: Language = 'id'): string {
  const rounded = Math.round(meters * 10) / 10;
  const text = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    maximumFractionDigits: 1,
  }).format(rounded);
  return `${text} m`;
}

export function formatSunTime(sunHour: number): string {
  const clamped = Math.min(21, Math.max(6, sunHour));
  const hours = Math.floor(clamped);
  const minutes = Math.round((clamped - hours) * 60);
  const hh = String(hours === 24 ? 0 : hours).padStart(2, '0');
  const mm = String(minutes === 60 ? 0 : minutes).padStart(2, '0');
  const adjustedH = minutes === 60 ? String(hours + 1).padStart(2, '0') : hh;
  return `${adjustedH}:${mm}`;
}

export function formatDateTime(isoString: string, lang: Language = 'id'): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
