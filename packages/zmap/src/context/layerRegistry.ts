import type { LayerEntry, RegisterInput } from "./LayerRegistryContext";

/** Pure state for the layer registry: entries keyed by id + an order counter. */
export interface LayerState {
  entries: Record<string, LayerEntry>;
  order: number;
}

export const emptyLayerState: LayerState = { entries: {}, order: 0 };

/** Add or update a layer, preserving its visibility and order if already present. */
export function registerEntry(
  state: LayerState,
  input: RegisterInput,
): LayerState {
  const existing = state.entries[input.id];
  const next: LayerEntry = {
    id: input.id,
    label: input.label,
    color: input.color,
    icon: input.icon,
    group: input.group,
    order: existing?.order ?? state.order,
    visible: existing ? existing.visible : (input.defaultVisible ?? true),
  };
  if (
    existing &&
    existing.label === next.label &&
    existing.color === next.color &&
    existing.group === next.group &&
    existing.visible === next.visible
  ) {
    return state; // unchanged — keep the same reference (icon is set-once)
  }
  return {
    entries: { ...state.entries, [input.id]: next },
    order: existing ? state.order : state.order + 1,
  };
}

export function unregisterEntry(state: LayerState, id: string): LayerState {
  if (!(id in state.entries)) return state;
  const entries = { ...state.entries };
  delete entries[id];
  return { ...state, entries };
}

export function setEntryVisible(
  state: LayerState,
  id: string,
  visible: boolean,
): LayerState {
  const e = state.entries[id];
  if (!e || e.visible === visible) return state;
  return { ...state, entries: { ...state.entries, [id]: { ...e, visible } } };
}

/** Entries sorted by registration order. */
export function sortedEntries(state: LayerState): LayerEntry[] {
  return Object.values(state.entries).sort((a, b) => a.order - b.order);
}
