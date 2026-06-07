import type { FC } from "react";
import SvgIcon from "@mui/material/SvgIcon";
import NpmSvg from "./svgs/npm-com.svg?react";

const NpmIcon: FC = () => <SvgIcon component={NpmSvg} inheritViewBox />;

export default NpmIcon;
