import { useEffect, useRef } from "react";
import { Marker as LeafletMarker, Popup } from "react-leaflet";
import { DivIcon, type Marker as LMarker } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { PiFlagPennantFill, PiHeartbeatFill } from "react-icons/pi";
import { FaHiking } from "react-icons/fa";
import { BiSolidPlaneAlt } from "react-icons/bi";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { IoLocationSharp } from "react-icons/io5";
import PopUp from "./PopUp";
import type { Pin, PinType } from "./types";

const ICONS: Record<PinType, React.ReactElement> = {
  visited: <PiFlagPennantFill />,
  planned: <BiSolidPlaneAlt />,
  highlighted: <PiHeartbeatFill />,
  searched: <HiMiniViewfinderCircle />,
  live: <FaHiking />,
  clicked: <IoLocationSharp />,
};

// built once per type, not on every render
const DIV_ICONS = Object.fromEntries(
  Object.entries(ICONS).map(([type, icon]) => [
    type,
    new DivIcon({
      html: renderToStaticMarkup(icon),
      className: `pin pin-${type}`,
      iconSize: [32, 32],
      iconAnchor: [16, 28],
      popupAnchor: [0, -24],
    }),
  ]),
) as Record<PinType, DivIcon>;

type MarkerProps = {
  pin: Pin;
  autoOpen?: boolean;
  // auto-opened without the visitor asking: never move the map for it
  still?: boolean;
};

export default function Marker({ pin, autoOpen, still }: MarkerProps) {
  const ref = useRef<LMarker>(null);

  useEffect(() => {
    const marker = ref.current;
    const popup = marker?.getPopup();
    if (!autoOpen || !marker || !popup) return;

    // Leaflet re-pans on every content update (image / address loaded),
    // so keep autoPan off until this popup is closed
    if (still) {
      popup.options.autoPan = false;
      popup.once("remove", () => (popup.options.autoPan = true));
    }
    marker.openPopup();
  }, [autoOpen, still]);

  return (
    <LeafletMarker
      ref={ref}
      position={pin.coords}
      icon={DIV_ICONS[pin.type]}
    >
      {/* one smooth autoPan, kept clear of the legend / search bar */}
      <Popup autoPanPaddingTopLeft={[20, 80]} autoPanPaddingBottomRight={[80, 20]}>
        <PopUp pin={pin} />
      </Popup>
    </LeafletMarker>
  );
}
