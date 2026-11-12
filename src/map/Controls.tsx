import { useEffect, useRef, useState } from "react";
import { DomEvent } from "leaflet";
import { FiSearch, FiNavigation, FiMaximize } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import { useMap } from "react-leaflet";
import { useFlyTo } from "../hooks/useFlyTo";
import { DEFAULT_VIEW, type Pin } from "./types";
import { geocode } from "./geocode";

type Busy = "search" | "locate" | null;

// map buttons (bottom right) + a floating search box when there's no navbar (embed)
export default function Controls({ addPin, search: withSearch }: { addPin: (pin: Pin) => void; search?: boolean }) {
  const map = useMap();
  const { flyTo } = useFlyTo();
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [notFound, setNotFound] = useState(false);

  // clicks / scrolls on the controls shouldn't reach the map
  useEffect(() => {
    if (!ref.current) return;
    DomEvent.disableClickPropagation(ref.current);
    DomEvent.disableScrollPropagation(ref.current);
  }, []);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy("search");
    setNotFound(false);
    try {
      const pin = await geocode(query.trim());
      if (!pin) return setNotFound(true);
      flyTo(pin.coords, { zoom: 13, duration: 2 });
      map.once("moveend", () => addPin(pin));
      setQuery("");
    } catch {
      setNotFound(true);
    } finally {
      setBusy(null);
    }
  };

  const locate = () => {
    setBusy("locate");
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        const coords: [number, number] = [c.latitude, c.longitude];
        flyTo(coords, { zoom: 15, duration: 2 });
        map.once("moveend", () => addPin({ type: "live", name: "Current location", coords }));
        setBusy(null);
      },
      () => setBusy(null),
    );
  };

  return (
    <div ref={ref} className="map-controls">
      {withSearch && (
      <form className={`map-search ${notFound ? "not-found" : ""}`} onSubmit={search}>
        {busy === "search" ? <ImSpinner2 className="spin" /> : <FiSearch />}
        <input
          value={query}
          onChange={(e) => (setQuery(e.target.value), setNotFound(false))}
          placeholder={notFound ? "Nothing found, try again" : "Search any place…"}
          aria-label="Search place"
        />
      </form>
      )}

      <div className="map-buttons">
        <button type="button" onClick={locate} title="My location">
          {busy === "locate" ? <ImSpinner2 className="spin" /> : <FiNavigation />}
        </button>
        <button
          type="button"
          onClick={() => map.flyTo(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom, { duration: 2 })}
          title="Reset view"
        >
          <FiMaximize />
        </button>
      </div>
    </div>
  );
}
