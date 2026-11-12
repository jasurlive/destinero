import { useEffect, useState } from "react";

export type PlaceType = "visited" | "planned" | "highlighted";

export type Place = {
  type: PlaceType;
  name: string;
  coords: [number, number];
  image: string;
};

// tiny CSV parser: handles quoted fields ("a, b") and "" escapes
const parseCSV = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const endCell = () => {
    row.push(cell);
    cell = "";
  };
  const endRow = () => {
    endCell();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") endCell();
    else if (c === "\n") endRow();
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) endRow();
  return rows;
};

const toPlaces = (text: string): Place[] => {
  const [header, ...rows] = parseCSV(text.trim());
  return rows.map((cells) => {
    const r = Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""]));
    return {
      type: r.type as PlaceType,
      name: r.name,
      coords: [Number(r.lat), Number(r.lng)],
      image: r.image,
    };
  });
};

// fetched once and shared by every page
let request: Promise<Place[]> | null = null;
const loadPlaces = () =>
  (request ??= fetch("/data/places.csv")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(toPlaces)
    .catch((err) => {
      request = null; // allow retry
      throw err;
    }));

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlaces()
      .then(setPlaces)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { places, loading, error };
}
