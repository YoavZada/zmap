import { createContext } from "react";
import { enUS } from "../locales/enUS";
import type { ZmapLocaleText } from "../locales/types";

/** The value provided by `<Map>` through `LocaleContext`. */
export interface LocaleContextValue {
  /** The merged UI strings: `enUS` overridden by `<Map localeText>`. */
  text: ZmapLocaleText;
  /** The BCP-47 tag from `<Map localeTag>`, if one was set. */
  locale?: string;
}

/**
 * UI-string overrides for the nearest `<Map>`. Defaults to `{ text: enUS }`
 * so components read sensible English strings even outside a `<Map>` (e.g.
 * in isolation, in tests).
 */
export const LocaleContext = createContext<LocaleContextValue>({
  text: enUS,
});
