import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { Map, type MapLoaderProps } from "zmapgl";

type Variant = NonNullable<MapLoaderProps["variant"]>;

// The loader is off by default — opt in with `loader` and shape the built-in
// one with `loaderProps` (or pass a ReactNode to `loader` for a custom one). A
// real map loads in a blink, so this demo remounts it via a changing `key` to
// replay the loading state on demand.
const LoaderDemo: FC = () => {
  const [variant, setVariant] = useState<Variant>("overlay");
  const [runId, setRunId] = useState(0);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            variant
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={variant}
            onChange={(_, v) => v && setVariant(v)}
          >
            <ToggleButton value="overlay">overlay</ToggleButton>
            <ToggleButton value="spinner">spinner</ToggleButton>
            <ToggleButton value="bar">bar</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setRunId((n) => n + 1)}
          >
            Replay loading
          </Button>
        </Stack>
      </Stack>

      <Map
        key={runId}
        center={[2.2, 41]}
        zoom={3.5}
        loader
        loaderProps={{ variant, label: "Loading map…" }}
        sx={{ height: 420, borderRadius: 2 }}
      />
    </Box>
  );
};

export default LoaderDemo;
