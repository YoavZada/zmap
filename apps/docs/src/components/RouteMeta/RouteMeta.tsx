import { useEffect, type FC } from "react";
import { useLocation } from "react-router-dom";
import { navItems } from "../../nav";

const SITE_TITLE = "zmap — MUI maps built on MapLibre";
const SITE_DESCRIPTION =
  "MUI-native map components built on MapLibre GL — install zmapgl and drop a themed map into your React app.";

/**
 * Headless: keeps document.title and the meta description in sync with the
 * current route. The Introduction page keeps the full site title; other pages
 * get "Label · zmap".
 */
const RouteMeta: FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const item = navItems.find((n) => n.path === pathname);
    document.title =
      !item || item.path === "/" ? SITE_TITLE : `${item.label} · zmap`;

    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (meta) meta.content = item?.description ?? SITE_DESCRIPTION;
  }, [pathname]);

  return null;
};

export default RouteMeta;
