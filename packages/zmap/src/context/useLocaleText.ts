import { useContext } from "react";
import { LocaleContext } from "./LocaleContext";
import type { ZmapLocaleText } from "../locales/types";

/** The merged UI strings for the nearest `<Map>` (falls back to `enUS` outside one). */
export function useLocaleText(): ZmapLocaleText {
  return useContext(LocaleContext).text;
}

/** The BCP-47 locale for number formatting, if `<Map numberLocale>` set one. */
export function useLocale(): string | undefined {
  return useContext(LocaleContext).locale;
}
