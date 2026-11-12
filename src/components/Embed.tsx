import { Outlet, useLocation } from "react-router";
import ErrorBoundary from "./ErrorBoundary";
import { useTheme } from "../hooks/useTheme";
import { useShortcuts } from "../hooks/useShortcuts";

// bare layout for iframe pages: no navbar, full screen
export default function Embed() {
  const { pathname } = useLocation();
  const { toggleTheme } = useTheme();

  useShortcuts({ "ctrl+j": toggleTheme });

  return (
    <div className="embed">
      <ErrorBoundary key={pathname}>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
}
