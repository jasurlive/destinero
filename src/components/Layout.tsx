import { Outlet, useLocation } from "react-router";
import Menu from "../shared/Menu";
import ErrorBoundary from "./ErrorBoundary";

// every route renders inside this: navbar + page area
export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="with-menu">
      <Menu />

      {/* .menu-page = everything right of (desktop) / above (mobile) the navbar */}
      <div className="menu-page">
        {/* key resets the error when you navigate to another page */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
}
