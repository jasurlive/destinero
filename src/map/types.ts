import type { Place } from "../hooks/usePlaces";

// places from the CSV + pins the user creates on the map
export type PinType = Place["type"] | "searched" | "live" | "clicked";

export type Pin = {
  type: PinType;
  name: string;
  coords: [number, number];
  image?: string;
};

export const DEFAULT_VIEW = { center: [40, 62] as [number, number], zoom: 4 };
