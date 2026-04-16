import * as Localization from 'expo-localization';

type Messages = Record<string, any>;

import esMessages from '../../messages/es.json';
import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';
import itMessages from '../../messages/it.json';
import ptMessages from '../../messages/pt.json';

// Reutilizamos los mismos diccionarios del software web (Next-intl).
// Ruta desde DelfinCheckInApp/lib → raíz/messages
const messages = {
  es: esMessages as Messages,
  en: enMessages as Messages,
  fr: frMessages as Messages,
  it: itMessages as Messages,
  pt: ptMessages as Messages,
} as const;

export type SupportedLocale = keyof typeof messages;

function resolveLocale(): SupportedLocale {
  const locales = Localization.getLocales?.() || [];
  const lang = locales[0]?.languageCode?.toLowerCase();
  if (lang && (lang in messages)) return lang as SupportedLocale;
  return 'es';
}

export function getLocale(): SupportedLocale {
  return resolveLocale();
}

export function getLocaleTag(): string {
  const locales = Localization.getLocales?.() || [];
  const tag = locales[0]?.languageTag;
  return tag || `${resolveLocale()}-ES`;
}

function getPath(obj: any, path: string): unknown {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object' || !(p in cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : `{${k}}`
  );
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const locale = resolveLocale();
  const dict = messages[locale];
  const fallback = messages.es;

  const raw = getPath(dict, key) ?? getPath(fallback, key);
  if (typeof raw === 'string') return interpolate(raw, vars);
  return key;
}

