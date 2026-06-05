import { useState, type FC } from "react";
import { Highlight, themes } from "prism-react-renderer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Check from "@mui/icons-material/Check";
import { useColorMode } from "../theme";
import Styles from "./codeBlock.style";

export type CodeBlockProps = {
  code: string;
  language?: string;
};

const CodeBlock: FC<CodeBlockProps> = ({ code, language = "tsx" }) => {
  const { mode } = useColorMode();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box sx={Styles.container}>
      <Tooltip title={copied ? "Copied" : "Copy"}>
        <IconButton size="small" onClick={copy} sx={Styles.copyButton}>
          {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
        </IconButton>
      </Tooltip>
      <Highlight
        code={code.trim()}
        language={language}
        theme={mode === "dark" ? themes.vsDark : themes.vsLight}
      >
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <Box component="pre" sx={Styles.pre(style)}>
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
    </Box>
  );
};

export default CodeBlock;
