import { useState, type FC, type ReactNode } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Check from "@mui/icons-material/Check";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Styles from "./codeBlock.style";

export type CodeBlockProps = {
  code: string;
  language?: string;
  /** When set, renders the windowed "editor" chrome with a filename header. */
  filename?: string;
  /** Optional footnote shown in a bar beneath the code (windowed variant). */
  note?: ReactNode;
};

const DOTS: [string, string][] = [
  ["#ff5f56", "red"],
  ["#ffbd2e", "yellow"],
  ["#27c93f", "green"],
];

const CodeBlock: FC<CodeBlockProps> = ({
  code,
  language = "tsx",
  filename,
  note,
}) => {
  const [copied, setCopied] = useState(false);
  const { palette } = useTheme();
  // Follow the page mode — the always-dark block was the one place the
  // light theme broke; tokens.codeBg tracks each theme's plain background.
  const prismTheme =
    palette.mode === "light" ? themes.nightOwlLight : themes.nightOwl;

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const highlight = (flush: boolean) => (
    <Highlight code={code.trim()} language={language} theme={prismTheme}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <Box
          component="pre"
          sx={flush ? Styles.preFlush(style) : Styles.pre(style)}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </Box>
      )}
    </Highlight>
  );

  // Windowed variant — the "Demo & Preview Card" chrome.
  if (filename) {
    return (
      <Box sx={Styles.windowBox}>
        <Box sx={Styles.header}>
          <Box sx={Styles.dots}>
            {DOTS.map(([color, key]) => (
              <Box key={key} sx={Styles.dot(color)} />
            ))}
          </Box>
          <Box component="span" sx={Styles.filename}>
            {filename}
          </Box>
          <Box sx={Styles.headerSpacer} />
          <Button
            size="small"
            color="inherit"
            startIcon={
              copied ? (
                <Check fontSize="small" />
              ) : (
                <ContentCopy fontSize="small" />
              )
            }
            onClick={copy}
            sx={Styles.copyInline}
          >
            {copied ? "Copied" : "Copy code"}
          </Button>
        </Box>
        {highlight(true)}
        {note && (
          <Box sx={Styles.note}>
            <InfoOutlined fontSize="small" />
            <span>{note}</span>
          </Box>
        )}
      </Box>
    );
  }

  // Plain variant — floating copy button, used inside the Code tab.
  return (
    <Box sx={Styles.container}>
      <Tooltip title={copied ? "Copied" : "Copy"}>
        <IconButton size="small" onClick={copy} sx={Styles.copyButton}>
          {copied ? (
            <Check fontSize="small" />
          ) : (
            <ContentCopy fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      {highlight(false)}
    </Box>
  );
};

export default CodeBlock;
