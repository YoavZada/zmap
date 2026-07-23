import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { type FC, useMemo, useState } from "react";
import { useMapContext } from "../../context/useMap";
import { DEFAULT_MIN_QUERY_LENGTH, useGeocoder } from "../../hooks/useGeocoder";
import { resolveGeocoder } from "../../providers/geocoding";
import type { GeocodeResult, GeocoderInput } from "../../providers/geocoding";
import type { LngLatTuple } from "../../utils/geojson";
import type { ControlPosition } from "../MapControls";
import Marker from "../Marker";
import Styles from "./geocoderControl.style";

/** Props for `<GeocoderControl>`, a themed place-search box over a pluggable geocoding provider. */
export type GeocoderControlProps = {
  /** Corner of the map for the search box. Default "top-left". */
  position?: ControlPosition;
  /** Built-in provider id or a custom GeocodingProvider. Default "photon". */
  provider?: GeocoderInput;
  /** Input placeholder, also used as the accessible label. Default "Search places…". */
  placeholder?: string;
  /** Fly the camera to a picked result. Default true. */
  flyTo?: boolean;
  /** Target zoom when a picked result has no bounding box. Default 14. */
  zoom?: number;
  /** Drop a marker at the picked result. Default true. */
  marker?: boolean;
  /** Maximum number of results. Default 5. */
  limit?: number;
  /** Preferred result language, passed through to the provider. */
  language?: string;
  /** Bias results toward a point. Default "map-center". */
  proximity?: "map-center" | LngLatTuple | false;
  /** Fires when the user picks a result. */
  onSelect?: (result: GeocodeResult) => void;
  /** Fires when the input is cleared. */
  onClear?: () => void;
  /** Empty-state text, also shown when the provider errors. Default "No places found". */
  noOptionsText?: string;
};

/**
 * A themed place-search box for the map: MUI Autocomplete over a pluggable
 * geocoding provider. Picking a result flies the camera there (fitBounds
 * when the result has a bounding box) and drops a marker; both behaviors
 * can be turned off.
 */
const GeocoderControl: FC<GeocoderControlProps> = ({
  position = "top-left",
  provider = "photon",
  placeholder = "Search places…",
  flyTo = true,
  zoom = 14,
  marker = true,
  limit = 5,
  language,
  proximity = "map-center",
  onSelect,
  onClear,
  noOptionsText = "No places found",
}) => {
  const { map } = useMapContext();
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const [inputText, setInputText] = useState("");
  const [focused, setFocused] = useState(false);
  // True only while the user is actively typing a new query; selecting or
  // clearing resets it so the listbox closes.
  const [dirty, setDirty] = useState(false);

  const resolvedProvider = useMemo(() => resolveGeocoder(provider), [provider]);

  const proximityGetter = useMemo(() => {
    if (proximity === false) return undefined;
    if (proximity === "map-center") {
      return () => {
        const center = map?.getCenter();
        return center ? ([center.lng, center.lat] as LngLatTuple) : undefined;
      };
    }
    return proximity;
  }, [map, proximity]);

  const { setQuery, results, loading, clear } = useGeocoder(resolvedProvider, {
    limit,
    language,
    proximity: proximityGetter,
  });

  const minLength = resolvedProvider.minQueryLength ?? DEFAULT_MIN_QUERY_LENGTH;
  const open = focused && dirty && inputText.trim().length >= minLength;

  const handleChange = (result: GeocodeResult | null) => {
    setDirty(false);
    setSelected(result);
    if (!result) {
      clear();
      onClear?.();
      return;
    }
    if (flyTo && map) {
      if (result.bbox) {
        const [west, south, east, north] = result.bbox;
        map.fitBounds(
          [
            [west, south],
            [east, north],
          ],
          { padding: 40 },
        );
      } else {
        map.flyTo({ center: result.center, zoom });
      }
    }
    onSelect?.(result);
  };

  return (
    <>
      <Paper elevation={3} sx={Styles.root(position)}>
        <Autocomplete
          size="small"
          options={results}
          value={selected}
          onChange={(_event, value) => handleChange(value)}
          onInputChange={(_event, value, reason) => {
            setInputText(value);
            if (reason === "input") {
              setDirty(true);
              setQuery(value);
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          open={open}
          onClose={() => setDirty(false)}
          loading={loading}
          filterOptions={(options) => options}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          noOptionsText={noOptionsText}
          popupIcon={null}
          renderOption={(liProps, option) => {
            const { key: _key, ...rest } = liProps as {
              key?: unknown;
            } & typeof liProps;
            return (
              <li key={option.id} {...rest}>
                <ListItemText
                  primary={option.name}
                  secondary={option.address}
                />
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder}
              inputProps={{
                ...params.inputProps,
                "aria-label": placeholder,
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Paper>
      {marker && selected ? (
        <Marker longitude={selected.center[0]} latitude={selected.center[1]} />
      ) : null}
    </>
  );
};

export default GeocoderControl;
