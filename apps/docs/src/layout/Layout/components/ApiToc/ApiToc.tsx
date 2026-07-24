import { useEffect, useState, type FC } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { apiSections } from "../../../../apiSections";
import Styles from "./apiToc.style";

/**
 * The contextual left rail on the API Reference route: an "On this page" TOC
 * over the shared `apiSections`. Scroll-spy highlights the section nearest the
 * top of the viewport as you scroll.
 */
const ApiToc: FC = () => {
  const [active, setActive] = useState(apiSections[0].id);

  useEffect(() => {
    const targets = apiSections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-80px 0px -55% 0px", threshold: 0 },
    );
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const go = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <Box sx={Styles.root}>
      <Typography variant="overline" color="text.secondary" sx={Styles.heading}>
        On this page
      </Typography>
      <List sx={Styles.list}>
        {apiSections.map((s) => (
          <ListItem key={s.id} disablePadding>
            <ListItemButton
              selected={active === s.id}
              onClick={() => go(s.id)}
              sx={Styles.item}
            >
              <ListItemText
                primary={s.label}
                slotProps={{ primary: { fontSize: 14, fontWeight: 500 } }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ApiToc;
