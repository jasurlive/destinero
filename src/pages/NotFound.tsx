import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="page-container page-center">
      <p className="page-code">404</p>
      <h1 className="page-title">Page not found</h1>
      <p className="page-text">The page you're looking for doesn't exist.</p>
      <Link to="/" className="page-button">
        Back home
      </Link>
    </div>
  );
}
