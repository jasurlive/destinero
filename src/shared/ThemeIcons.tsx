import type { ReactNode } from "react";
import { FiSun, FiMoon, FiFeather, FiDroplet, FiCloud, FiAperture, FiFileText } from "react-icons/fi";
import type { Theme } from "../lib/themes";

export const THEME_ICONS: Record<Theme, ReactNode> = {
  light: <FiSun />,
  dark: <FiMoon />,
  linen: <FiFeather />,
  fjord: <FiDroplet />,
  matte: <FiCloud />,
  charcoal: <FiAperture />,
  paper: <FiFileText />,
};
