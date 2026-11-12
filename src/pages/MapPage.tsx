import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../css/map.css";
import Marker from "../map/Markers";
import Controls from "../map/Controls";
import { DEFAULT_VIEW, type Pin } from "../map/types";
import { usePlaces, type Place, type PlaceType } from "../hooks/usePlaces";
import { useTheme, isDarkTheme } from "../hooks/useTheme";
import { useFlyTo } from "../hooks/useFlyTo";

// tiles go through api/tiles.ts so the MapTiler key never reaches the browser
const tiles = (dark: boolean) => `/api/tiles?dark=${dark ? 1 : 0}&z={z}&x={x}&y={y}&r={r}`;

const LEGEND: { type: PlaceType; label: string }[] = [
  { type: "visited", label: "Visited" },
  { type: "planned", label: "Planned" },
  { type: "highlighted", label: "Highlighted" },
];

// sent by other pages: "Show on map" (focus) or the navbar search (search)
type MapState = { focus?: [number, number]; search?: Pin } | null;

type Start = { center: [number, number]; zoom: number; open?: string };

// clicking empty map drops a pin. Waits a moment first: a double-tap / pinch
// on phones also fires click, and dropping a pin mid-zoom made the map jump
function ClickPin({ onPin }: { onPin: (pin: Pin) => void }) {
  const timer = useRef(0);
  const lastZoom = useRef(0);
  const cancel = () => clearTimeout(timer.current);
  const zoomed = () => {
    cancel();
    lastZoom.current = Date.now();
  };

  useMapEvents({
    click: (e) => {
      cancel();
      if (Date.now() - lastZoom.current < 500) return; // tail of a pinch
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
      timer.current = window.setTimeout(() => onPin({ type: "clicked", name: "Pinned", coords }), 300);
    },
    dblclick: zoomed,
    zoomstart: zoomed,
    zoomend: zoomed,
    dragstart: cancel,
  });

  useEffect(() => cancel, []);
  return null;
}

// on arrival: shift the view down so the start place's popup fits, then open it
function AutoOpen({ start, onOpen }: { start: Start; onOpen: (key: string) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!start.open) return;
    const center = map.unproject(map.project(start.center, start.zoom).subtract([0, 160]), start.zoom);
    map.setView(center, start.zoom, { animate: false });
    onOpen(start.open);
  }, [map, start, onOpen]);

  return null;
}

// navbar searches made while the map is already open: fly there, then drop the pin
function SearchTo({ search, onPin }: { search?: Pin; onPin: (pin: Pin) => void }) {
  const map = useMap();
  const { flyTo } = useFlyTo();
  const handled = useRef(search); // the one on arrival is already the start view

  useEffect(() => {
    if (!search || search === handled.current) return;
    handled.current = search;
    flyTo(search.coords, { zoom: 13, duration: 2 });
    map.once("moveend", () => onPin(search));
  }, [search, map, flyTo, onPin]);

  return null;
}

// arrival view: a searched place, a place picked on the Places page, or a random place
const pickStart = (state: MapState, places: Place[]): Start => {
  if (state?.search) return { center: state.search.coords, zoom: 13 };
  if (state?.focus) return { center: state.focus, zoom: 11, open: state.focus.join() };
  const random = places[Math.floor(Math.random() * places.length)];
  if (random) return { center: random.coords, zoom: 5, open: random.coords.join() };
  return DEFAULT_VIEW;
};

function MapView({ places, embed }: { places: Place[]; embed?: boolean }) {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as MapState;

  // picked once per visit, so every load lands somewhere new
  const [start] = useState(() => pickStart(state, places));

  const [hidden, setHidden] = useState<PlaceType[]>([]);
  const [pins, setPins] = useState<Partial<Record<Pin["type"], Pin>>>(() =>
    state?.search ? { searched: state.search } : {},
  );
  const addPin = useCallback((pin: Pin) => setPins((prev) => ({ ...prev, [pin.type]: pin })), []);

  const [openKey, setOpenKey] = useState<string | null>(null);

  // forget the state once used, so a reload goes to a fresh random place
  useEffect(() => {
    if (state) navigate(location.pathname, { replace: true, state: null });
  }, [state, navigate, location.pathname]);

  const toggle = (type: PlaceType) =>
    setHidden((h) => (h.includes(type) ? h.filter((t) => t !== type) : [...h, type]));

  const shown = places.filter((p) => !hidden.includes(p.type));
  const dark = isDarkTheme(theme);

  return (
    <div className="map-page">
      <MapContainer
        center={start.center}
        zoom={start.zoom}
        minZoom={3}
        zoomSnap={0.5}
        zoomDelta={0.5}
        zoomControl={false}
        maxBounds={[
          [-90, -200],
          [90, 250],
        ]}
        className="map-container"
      >
        {/* key forces fresh tiles when switching between light and dark */}
        <TileLayer key={String(dark)} url={tiles(dark)} />
        <ClickPin onPin={addPin} />
        <AutoOpen start={start} onOpen={setOpenKey} />
        <SearchTo search={state?.search} onPin={addPin} />
        <Controls addPin={addPin} search={embed} />

        {shown.map((p) => (
          <Marker key={`${p.type}-${p.coords.join()}`} pin={p} autoOpen={p.coords.join() === openKey} still />
        ))}
        {Object.values(pins).map((p) => (
          // keyed by place too, so a new search re-opens its popup
          <Marker key={`${p.type}-${p.coords.join()}`} pin={p} autoOpen />
        ))}
      </MapContainer>

      <div className="map-legend">
        <span className="map-brand">Destinero</span>
        {LEGEND.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            className={`legend-item badge-${type} ${hidden.includes(type) ? "off" : ""}`}
            onClick={() => toggle(type)}
            title={`Show / hide ${label.toLowerCase()}`}
          >
            <span className="legend-dot" />
            {label}
            <b>{places.filter((p) => p.type === type).length}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

// waits for the places so the first view is already the random one (no jump)
export default function MapPage({ embed }: { embed?: boolean }) {
  const { places, loading } = usePlaces();
  if (loading) return <div className="map-page map-loading" />;
  return <MapView places={places} embed={embed} />;
}
