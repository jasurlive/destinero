import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FiMapPin, FiSearch } from "react-icons/fi";
import "../css/places.css";
import { usePlaces, type Place, type PlaceType } from "../hooks/usePlaces";

// Fisher-Yates on a copy: a fresh order on every visit
const shuffle = (list: Place[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const TABS: { type: PlaceType | "all"; label: string }[] = [
  { type: "all", label: "All" },
  { type: "visited", label: "Visited" },
  { type: "planned", label: "Planned" },
  { type: "highlighted", label: "Highlighted" },
];

// embed: no navbar version for iframes (/iblogs), opens places on /itravelmap
export default function Places({ embed = false }: { embed?: boolean }) {
  const { places, loading, error } = usePlaces();
  const navigate = useNavigate();
  const [tab, setTab] = useState<PlaceType | "all">(embed ? "visited" : "all");
  const [query, setQuery] = useState("");

  const count = (type: PlaceType | "all") =>
    type === "all" ? places.length : places.filter((p) => p.type === type).length;

  // shuffled once when the places arrive, so filtering / tabs don't reshuffle
  const shuffled = useMemo(() => shuffle(places), [places]);

  const shown = shuffled.filter(
    (p) => (tab === "all" || p.type === tab) && p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="places-container">
      <header className="places-header">
        <div>
          <h1 className="page-title">{embed ? "Travel blog" : "Places"}</h1>
          <p className="page-text">
            {count("visited")} visited · {count("planned")} planned
          </p>
        </div>

        <label className="places-search">
          <FiSearch />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter places…" />
        </label>
      </header>

      <div className="places-tabs" role="tablist">
        {TABS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={tab === type}
            className={`places-tab ${tab === type ? "active" : ""}`}
            onClick={() => setTab(type)}
          >
            {label} <span>{count(type)}</span>
          </button>
        ))}
      </div>

      {loading && <p className="page-text">Loading places…</p>}
      {error && <p className="places-error">Couldn't load places.csv: {error}</p>}
      {!loading && !error && !shown.length && <p className="page-text">No places match.</p>}

      <ul className="places-grid">
        {shown.map((p) => (
          <li key={`${p.type}-${p.coords.join()}`} className="place-card">
            <div className="place-image">
              <FiMapPin />
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  onError={(e) => e.currentTarget.remove()} // keep the pin icon on broken links
                />
              )}
              <span className={`place-badge badge-${p.type}`}>{p.type}</span>
            </div>
            <div className="place-body">
              <h2 className="place-name">{p.name}</h2>
              <code className="place-coords">{p.coords.map((c) => c.toFixed(3)).join(", ")}</code>
            </div>
            <button
              type="button"
              className="page-button place-go"
              onClick={() => navigate(embed ? "/itravelmap" : "/", { state: { focus: p.coords } })}
            >
              <FiMapPin /> Show on map
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
