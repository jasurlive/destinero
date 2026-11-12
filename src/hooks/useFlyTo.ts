import { useMap } from "react-leaflet";

type FlyOptions = { zoom?: number; duration?: number };

// flies to a point, aimed a bit lower so the popup above it fits on screen
export const useFlyTo = () => {
  const map = useMap();

  const flyTo = (coords: [number, number], options: FlyOptions = {}) => {
    const zoom = options.zoom ?? map.getZoom();
    const point = map.project(coords, zoom).subtract([0, 120]);
    map.flyTo(map.unproject(point, zoom), zoom, {
      duration: options.duration ?? 0.6,
    });
  };

  return { flyTo };
};
