import { useCallback, useState, type ReactNode } from "react";
import { NavLink } from "react-router";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiSearch,
  FiList,
  FiHelpCircle,
} from "react-icons/fi";
import "../css/menu.css";
import { useTheme } from "../hooks/useTheme";
import { useShortcuts } from "../hooks/useShortcuts";
import { THEME_ICONS } from "./ThemeIcons";
import MenuSearch from "./MenuSearch";
import { THEME_LABELS } from "../lib/themes";

export type MenuItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  mobile?: boolean;
  id?: string;
  pressed?: boolean;
};

export default function Menu({
  items = [
    { label: "Map", icon: <FiMapPin />, href: "/", mobile: true },
    { label: "Places", icon: <FiList />, href: "/places", mobile: true },
    { label: "Help", icon: <FiHelpCircle />, href: "/help", mobile: true },
  ],
}: {
  items?: MenuItem[];
}) {
  const { nextTheme, toggleTheme } = useTheme();

  const [searching, setSearching] = useState(false);
  const closeSearch = useCallback(() => setSearching(false), []);

  useShortcuts({ "ctrl+j": toggleTheme, "ctrl+k": () => setSearching(true), "/": () => setSearching(true) });

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("menu-collapsed") !== "false";
    } catch {
      return true;
    }
  });

  const toggleMenu = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem("menu-collapsed", String(!value));
      } catch {}
      return !value;
    });
  };

  const menuItems: MenuItem[] = [
    // search sits in the middle of the navbar
    ...items.slice(0, Math.ceil(items.length / 2)),
    {
      label: "Search",
      icon: <FiSearch />,
      onClick: () => setSearching((v) => !v),
      mobile: true,
      id: "menu-search-button",
      pressed: searching,
    },
    ...items.slice(Math.ceil(items.length / 2)),
    {
      // shows the theme you'll switch to (ctrl+j cycles too)
      label: `${THEME_LABELS[nextTheme]} theme`,
      icon: THEME_ICONS[nextTheme],
      onClick: toggleTheme,
      mobile: true,
    },
  ];

  return (
    <>
    {searching && <MenuSearch onClose={closeSearch} />}
    <nav className={`menu ${collapsed ? "menu-collapsed" : ""}`}>
      <button
        type="button"
        className="menu-toggle"
        onClick={toggleMenu}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      {menuItems.map((item) => {
        const className = `menu-item ${
          item.mobile ? "menu-mobile-visible" : "menu-desktop-only"
        } ${item.pressed ? "is-pressed" : ""}`;

        const content = (
          <>
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </>
        );

        return item.onClick ? (
          <button
            key={item.id ?? item.label}
            id={item.id}
            type="button"
            className={className}
            aria-pressed={item.pressed}
            onClick={item.onClick}
            title={item.label}
          >
            {content}
          </button>
        ) : item.href ? (
          // NavLink adds .active on the current page; `end` so "/" isn't active everywhere
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/"}
            className={className}
            title={item.label}
          >
            {content}
          </NavLink>
        ) : null;
      })}
    </nav>
    </>
  );
}
