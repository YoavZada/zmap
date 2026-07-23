import type { ReactNode } from "react";
import "zmapgl/styles.css";

export const metadata = { title: "zmapgl next-smoke" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
