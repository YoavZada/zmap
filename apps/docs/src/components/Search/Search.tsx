import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import propsData from "../../generated/props.json";
import { navItems } from "../../nav";
import { blocks } from "../../blocks";
import { DEMO_ROUTE } from "../../apiRoutes";
import Styles from "./search.style";

type SearchItem = {
  label: string;
  category:
    | "Page"
    | "Block"
    | "Component"
    | "Hook"
    | "Provider"
    | "Utility"
    | "Type";
  to: string;
  description?: string;
};

type RawExport = {
  name: string;
  kind: "value" | "type";
  category: string;
  description: string;
};

const CATEGORY_OF: Record<string, SearchItem["category"]> = {
  hook: "Hook",
  provider: "Provider",
  util: "Utility",
};

const API_ANCHOR: Record<SearchItem["category"], string> = {
  Page: "",
  Block: "",
  Component: "/api#components",
  Hook: "/api#hooks",
  Provider: "/api#providers",
  Utility: "/api#utilities",
  Type: "/api#types",
};

/** Everything searchable: pages, blocks, then the whole generated API surface. */
function buildIndex(): SearchItem[] {
  const pages: SearchItem[] = navItems.map((item) => ({
    label: item.label,
    category: "Page",
    to: item.path,
  }));

  const blockItems: SearchItem[] = blocks.map((block) => ({
    label: block.title,
    category: "Block",
    to: `/blocks#${block.id}`,
    description: block.description,
  }));

  const components: SearchItem[] = Object.entries(
    propsData.components as Record<string, { description: string }>,
  ).map(([name, c]) => ({
    label: name,
    category: "Component",
    to: DEMO_ROUTE[name] ?? "/api#components",
    description: c.description.split("\n")[0],
  }));

  const rest: SearchItem[] = (propsData.exports as RawExport[])
    .filter((e) => e.category in CATEGORY_OF || e.kind === "type")
    .map((e) => {
      const category =
        e.kind === "type" ? ("Type" as const) : CATEGORY_OF[e.category];
      return {
        label: e.name,
        category,
        to: API_ANCHOR[category],
        description: e.description,
      };
    });

  return [...pages, ...blockItems, ...components, ...rest];
}

export type SearchProps = {
  /**
   * `"icon"` (default) renders a single search icon button. `"field"` renders a
   * slim inline field on desktop that collapses to the icon on mobile.
   */
  variant?: "icon" | "field";
};

// The command-palette glyph — a recognized, premium shorthand for the shortcut.
// The binding itself stays Ctrl-K / Cmd-K (handled in the keydown effect below).
const SHORTCUT = "⌘K";

/**
 * The docs search: an app-bar trigger plus a Ctrl/Cmd-K command palette over
 * every page and API symbol (from the generated props.json index).
 */
const Search: FC<SearchProps> = ({ variant = "icon" }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement | null>(null);

  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 10);
    const starts = index.filter((i) => i.label.toLowerCase().startsWith(q));
    const contains = index.filter(
      (i) =>
        !i.label.toLowerCase().startsWith(q) &&
        (i.label.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)),
    );
    return [...starts, ...contains].slice(0, 12);
  }, [index, query]);

  // Global shortcut: Ctrl/Cmd-K toggles the palette.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const go = (item: SearchItem) => {
    close();
    const [path, hash] = item.to.split("#");
    navigate(path || "/");
    if (hash) {
      // Let the target page render, then jump to its section anchor.
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ block: "start" });
      }, 60);
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  // Keep the active row in view while arrowing through results.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const iconTrigger = (mobileOnly = false) => (
    <Tooltip title={`Search docs (${SHORTCUT})`}>
      <IconButton
        color="inherit"
        onClick={() => setOpen(true)}
        aria-label="Search docs"
        sx={mobileOnly ? Styles.iconOnMobile : undefined}
      >
        <SearchIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <>
      {variant === "field" ? (
        <>
          <ButtonBase
            sx={Styles.field}
            onClick={() => setOpen(true)}
            aria-label="Search docs"
          >
            <SearchIcon fontSize="small" sx={Styles.fieldIcon} />
            <Box component="span" sx={Styles.fieldText}>
              Search…
            </Box>
            <Box component="kbd" sx={Styles.fieldKbd}>
              <Box component="span" sx={Styles.fieldKbdCmd}>
                ⌘
              </Box>
              <Box component="span" sx={Styles.fieldKbdKey}>
                K
              </Box>
            </Box>
          </ButtonBase>
          {iconTrigger(true)}
        </>
      ) : (
        iconTrigger()
      )}

      <Dialog open={open} onClose={close} sx={Styles.dialog}>
        <Box sx={Styles.input}>
          <InputBase
            autoFocus
            fullWidth
            placeholder="Search pages, components, hooks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            startAdornment={<SearchIcon color="disabled" sx={{ mr: 1 }} />}
            endAdornment={
              <Box component="kbd" sx={Styles.kbd}>
                esc
              </Box>
            }
          />
        </Box>
        {results.length > 0 ? (
          <List ref={listRef} sx={Styles.list} dense>
            {results.map((item, i) => (
              <ListItemButton
                key={`${item.category}:${item.label}`}
                data-index={i}
                selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
              >
                <ListItemText
                  primary={item.label}
                  secondary={item.description || undefined}
                  slotProps={{
                    primary: { fontWeight: 600, fontSize: 14 },
                    secondary: { noWrap: true, fontSize: 12 },
                  }}
                />
                <Chip
                  label={item.category}
                  size="small"
                  variant="outlined"
                  sx={Styles.category}
                />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" sx={Styles.empty}>
            No matches for “{query}”.
          </Typography>
        )}
      </Dialog>
    </>
  );
};

export default Search;
