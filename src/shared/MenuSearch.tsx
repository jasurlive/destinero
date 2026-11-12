import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FiSearch, FiX } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import { geocode } from "../map/geocode";

// floating search bar opened from the navbar: finds a place and shows it on the map
export default function MenuSearch({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // desktop: line the bar up with the navbar's Search button, wherever it sits
  const [top] = useState(() => {
    const rect = document.getElementById("menu-search-button")?.getBoundingClientRect();
    return rect ? rect.top + (rect.height - 48) / 2 : 60;
  });

  // close on Escape or on a tap anywhere else (except the navbar search button)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: PointerEvent) => {
      const el = e.target as Element;
      if (!ref.current?.contains(el) && !el.closest?.("#menu-search-button")) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [onClose]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || busy) return;
    setBusy(true);
    setNotFound(false);
    try {
      const pin = await geocode(query.trim());
      if (!pin) return setNotFound(true);
      // the map page picks this up (works from any page)
      navigate("/", { state: { search: pin } });
      onClose();
    } catch {
      setNotFound(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      ref={ref}
      className={`menu-search ${notFound ? "not-found" : ""}`}
      onSubmit={search}
      role="search"
      style={{ "--search-top": `${top}px` } as React.CSSProperties}
    >
      {busy ? <ImSpinner2 className="spin" /> : <FiSearch />}
      <input
        autoFocus
        value={query}
        onChange={(e) => (setQuery(e.target.value), setNotFound(false))}
        placeholder={notFound ? "Nothing found, try again" : "Search any place…"}
        aria-label="Search place"
        enterKeyHint="search"
      />
      <button type="button" onClick={onClose} aria-label="Close search">
        <FiX />
      </button>
    </form>
  );
}
