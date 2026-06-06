import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  emptyLayerState,
  registerEntry,
  setEntryVisible,
  sortedEntries,
  unregisterEntry,
} from "./layerRegistry";

/** A registered overlay layer, as shown in the LayerControl panel. */
export interface LayerEntry {
  id: string;
  label: string;
  /** Palette token or CSS color for the swatch in the control. */
  color?: string;
  /** Optional icon shown in the control (set once at registration). */
  icon?: ReactNode;
  /** Optional section heading to group layers under. */
  group?: string;
  /** Stable registration order (for stable panel ordering). */
  order: number;
  visible: boolean;
}

export interface RegisterInput {
  id: string;
  label: string;
  color?: string;
  icon?: ReactNode;
  group?: string;
  defaultVisible?: boolean;
}

export interface LayerRegistryValue {
  /** Registered layers, sorted by registration order. */
  entries: LayerEntry[];
  register: (input: RegisterInput) => void;
  unregister: (id: string) => void;
  setVisible: (id: string, visible: boolean) => void;
  /** Current visibility, or undefined if the id isn't registered yet. */
  isVisible: (id: string) => boolean | undefined;
}

export const LayerRegistryContext = createContext<LayerRegistryValue | null>(
  null,
);

/**
 * Holds the set of registered overlay layers and their visibility. Rendered
 * automatically by <Map>, so <Layer> and <LayerControl> work without any extra
 * wrapping. Registration preserves a layer's visibility and order across
 * metadata updates.
 */
export function LayerRegistryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(emptyLayerState);

  const register = useCallback((input: RegisterInput) => {
    setState((s) => registerEntry(s, input));
  }, []);

  const unregister = useCallback((id: string) => {
    setState((s) => unregisterEntry(s, id));
  }, []);

  const setVisible = useCallback((id: string, visible: boolean) => {
    setState((s) => setEntryVisible(s, id, visible));
  }, []);

  const entries = useMemo(() => sortedEntries(state), [state]);

  const isVisible = useCallback(
    (id: string) => state.entries[id]?.visible,
    [state],
  );

  const value = useMemo<LayerRegistryValue>(
    () => ({ entries, register, unregister, setVisible, isVisible }),
    [entries, register, unregister, setVisible, isVisible],
  );

  return (
    <LayerRegistryContext.Provider value={value}>
      {children}
    </LayerRegistryContext.Provider>
  );
}
