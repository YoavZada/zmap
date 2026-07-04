import { useEffect, type FC, type ReactNode } from "react";
import {
  useLayerRegistry,
  useLayerVisibility,
} from "../../context/useLayerRegistry";

export type LayerProps = {
  /** Unique id, used as the checkbox key in the control. */
  id: string;
  /** Label shown in the LayerControl. */
  label: string;
  /** Palette token or CSS color for the control's swatch. */
  color?: string;
  /** Optional icon shown in the control (set once at registration). */
  icon?: ReactNode;
  /** Optional section heading to group the layer under in the control. */
  group?: string;
  /** Initial visibility for uncontrolled usage. Default true. */
  defaultVisible?: boolean;
  /** Controlled visibility — when set, the parent owns the state. */
  visible?: boolean;
  /** Fired when the LayerControl toggles a controlled layer — update `visible` here. */
  onVisibleChange?: (visible: boolean) => void;
  children?: ReactNode;
};

/**
 * Registers a named, toggleable overlay with the map's layer registry and shows
 * or hides its children based on visibility. Pair with <LayerControl>.
 */
const Layer: FC<LayerProps> = ({
  id,
  label,
  color,
  icon,
  group,
  defaultVisible = true,
  visible: controlled,
  onVisibleChange,
  children,
}) => {
  const { register, unregister, setVisible } = useLayerRegistry();

  // Register on mount, unregister on unmount.
  useEffect(() => {
    register({ id, label, color, icon, group, defaultVisible });
    return () => unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Keep metadata in sync without resetting visibility/order.
  useEffect(() => {
    register({ id, label, color, icon, group, defaultVisible });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, label, color, group]);

  // Controlled: mirror the prop into the registry so the checkbox reflects it.
  useEffect(() => {
    if (controlled !== undefined) setVisible(id, controlled);
  }, [id, controlled, setVisible]);

  const registryVisible = useLayerVisibility(id, controlled ?? defaultVisible);

  // Controlled feedback: when the control flips the registry, notify the parent.
  useEffect(() => {
    if (
      controlled !== undefined &&
      onVisibleChange &&
      registryVisible !== controlled
    ) {
      onVisibleChange(registryVisible);
    }
  }, [registryVisible, controlled, onVisibleChange]);

  const visible = controlled !== undefined ? controlled : registryVisible;
  return visible ? <>{children}</> : null;
};

export default Layer;
