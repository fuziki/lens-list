# Lens List

A web app that visualizes lens lineups (Nikon Z, Sony E, Canon RF mounts) along a focal length axis.

## Features

- **Focal length map**: Displays prime lenses (●) and zoom lenses (bars) positioned on a focal length axis
- **Section grouping**: Prime / Compact Prime / Zoom lenses
- **Display attributes**: Toggle weight, price, and rental availability per lens
- **Filters**: Filter by focal length, max aperture, price, rental availability, and format (FX/DX)

## Tech Stack

- React 19 + TypeScript
- Vite
- Data-driven design — all UI constants and lens data are managed via JSON files

## Customizing Data

Each mount has its own data directory: `public/data/<mount>/` (`z`, `e`, `rf`). Edit the JSON files there to update lens data or display settings without touching the code.

- `lenses.json` — lens data (sections, rows, per-lens attributes)
- `config.json` — display settings (colors, fonts, filter definitions, etc.)

## Development

```bash
npm install
npm run dev
```
