# Destinero

Personal travel map built with React, TypeScript, Vite and Leaflet. The frontend follows the
[django-react](https://github.com/jasurlive/django-react) template: collapsible sidebar (bottom bar on
mobile), theme tokens, and light / dark themes.

<img width="60%" alt="image" src="https://github.com/user-attachments/assets/147ab48b-8b9a-4497-8a97-508355e0e753" />
<img width="30%" alt="image" src="https://github.com/user-attachments/assets/2de60152-422b-46b0-852f-6d9051437ec1" />

## Features

- **Map**: visited, planned and highlighted pins with photo popups; a legend that shows or hides each group
- **Search** any place, jump to **your location**, **click** the map to drop a pin (with address and flag)
- **Places**: a card grid with tabs and a filter; "Show on map" flies to the place
- **Light / dark theme**: menu button or <kbd>Ctrl</kbd>+<kbd>J</kbd>. The map tiles switch too, and the choice is remembered
- Data lives in one plain **CSV** file

## Run

```bash
npm install
cp .env.example .env     # optional: MAPKEY=<MapTiler key> (kept server-side via api/tiles.ts), otherwise free CARTO tiles are used
npm run dev              # http://localhost:2020
```

`npm run build` · `npm run lint` · `npm run typecheck`

## Embed pages (no navbar)

Two full-screen pages for iframes on another site. They aren't linked anywhere in the app.

| Path          | What                                                     |
| ------------- | -------------------------------------------------------- |
| `/itravelmap` | the map only                                             |
| `/iblogs`     | place cards (opens on Visited); "Show on map" goes to `/itravelmap` |

Add `?theme=dark` or `?theme=light` to match your site, otherwise the visitor's system theme is used.
<kbd>Ctrl</kbd>+<kbd>J</kbd> still toggles it.

```html
<iframe src="https://destinero.vercel.app/itravelmap?theme=dark"
        style="width:100%;height:80vh;border:0" allow="geolocation"></iframe>
```

## Data

`public/data/places.csv`:

```csv
type,name,lat,lng,image
visited,"Eiffel Tower, Paris",48.85826,2.294501,https://...
planned,"Tokyo, Japan",35.682194,139.762221,https://...
```

`type` is `visited`, `planned` or `highlighted`. Edit it in any spreadsheet app, or use the helper
(Python standard library only, nothing to install):

```bash
python scripts/places.py add "Tokyo, Japan" 35.68,139.76 --type planned --image https://...
python scripts/places.py list --type visited
```

## Structure

```
public/data/places.csv     all places
scripts/places.py           add / list helper
src/app/                   App (routes), main, env types
src/components/            Layout (with navbar), Embed (without), ErrorBoundary
src/shared/                Menu (sidebar / bottom bar), MenuSearch, ThemeIcons
src/pages/                 MapPage, Places, Help, NotFound
src/map/                   Markers, PopUp, Controls, geocode
src/hooks/                 usePlaces (CSV), useTheme, useShortcuts, useFlyTo
src/lib/                   themes (theme list + labels)
src/css/                   theme tokens, reset, menu, page, map, places
api/tiles.ts               map tile proxy (keeps MAPKEY server-side, Vercel function)
```

Add a page: create it in `src/pages`, add a `<Route>` in `src/app/App.tsx` and an item in `Menu.tsx`.
