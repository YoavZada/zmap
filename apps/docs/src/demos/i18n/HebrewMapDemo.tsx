import type { FC } from "react";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { Map, MapControls, heIL } from "zmapgl";

/**
 * A live example of the three pieces an RTL setup needs together: a
 * `dir="rtl"` ancestor (zmap's controls use logical insetInlineStart/End, so
 * they mirror off the element's computed CSS direction), an RTL-directioned
 * theme (so the rtlTextPlugin default flips on), and `localeText`/
 * `numberLocale` to translate the UI strings and number formatting.
 */
const HebrewMapDemo: FC = () => {
  const outerTheme = useTheme();
  const rtlTheme = createTheme(outerTheme, { direction: "rtl" });

  return (
    <ThemeProvider theme={rtlTheme}>
      <Box dir="rtl">
        <Map
          center={[34.7818, 32.0853]}
          zoom={11}
          localeText={heIL}
          numberLocale="he-IL"
          sx={{ height: 420, borderRadius: 2 }}
        >
          <MapControls position="top-right" />
        </Map>
      </Box>
    </ThemeProvider>
  );
};

export default HebrewMapDemo;
