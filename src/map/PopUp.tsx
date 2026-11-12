import { useEffect, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import Flag from "react-flagkit";
import type { Pin } from "./types";

const DYNAMIC_TITLES: Partial<Record<Pin["type"], string>> = {
  clicked: "Clicked location",
  searched: "Searched location",
  live: "You are here",
};

const LABELS: Record<Pin["type"], string> = {
  visited: "Visited",
  planned: "Planned",
  highlighted: "Highlighted",
  clicked: "Pinned",
  searched: "Search",
  live: "Live",
};

type Address = { key: string; info: string; country?: string };

// reverse-geocode pins that don't come from the CSV
const useAddress = (pin: Pin) => {
  const [address, setAddress] = useState<Address | null>(null);
  const dynamic = pin.type in DYNAMIC_TITLES;
  const [lat, lon] = pin.coords;
  const key = `${lat},${lon}`;

  useEffect(() => {
    if (!dynamic) return;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then(({ address: a = {} }) =>
        setAddress({
          key,
          info: [a.road, a.neighbourhood, a.city, a.state, a.country].filter(Boolean).join(", "),
          country: a.country_code?.toUpperCase(),
        }),
      )
      .catch(() => setAddress({ key, info: "Address not found" }));
  }, [dynamic, lat, lon, key]);

  // ignore a stale address from the previous coords
  return { dynamic, address: address?.key === key ? address : null };
};

export default function PopUp({ pin }: { pin: Pin }) {
  const { dynamic, address } = useAddress(pin);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const coords = pin.coords.map((c) => c.toFixed(5)).join(", ");

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="popup">
      <span className={`popup-badge badge-${pin.type}`}>{LABELS[pin.type]}</span>
      <h2 className="popup-title">{dynamic ? DYNAMIC_TITLES[pin.type] : pin.name}</h2>

      {dynamic &&
        (address ? (
          <p className="popup-text">
            {address.country && <Flag className="popup-flag" country={address.country} size={20} />}
            {address.info}
          </p>
        ) : (
          <ImSpinner2 className="spin popup-spinner" />
        ))}

      {pin.image && (
        <div className="popup-image">
          {!imageLoaded && <ImSpinner2 className="spin popup-spinner" />}
          <img
            src={pin.image}
            alt={pin.name}
            className={imageLoaded ? "loaded" : ""}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      )}

      <div className="popup-coords">
        <code>{coords}</code>
        <button type="button" className={`popup-copy ${copied ? "copied" : ""}`} onClick={copy} title="Copy coordinates">
          {copied ? <FiCheck /> : <FiCopy />}
        </button>
      </div>
    </div>
  );
}
