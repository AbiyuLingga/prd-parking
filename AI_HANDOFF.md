# AI Handoff - Smart Parking Dashboard

Last updated: 2026-05-11
Project path: `/home/abiyulinx/computing/parking_prd`

## Project Summary

This is a Vite + React smart parking dashboard prototype. The current product direction is a polished 2D parking UI with a dark glass dashboard aesthetic, a real building photo background, randomized occupied slots on refresh, recommendation highlighting, and a simple "park car / find route / leave parking" flow.

The user iterates visually and expects exact UI changes to be implemented, not just proposed. They have Supabase already connected to hardware outside this app, so hardware integration does not need to be considered in this repo unless explicitly requested later.

## Current Stack

- React 19
- Vite 7
- Tailwind CSS v4 through `@tailwindcss/vite`
- `lucide-react` icons
- No backend in this project
- No test framework currently configured

Useful commands:

```bash
npm run dev
npm run build
npm run preview
```

The dev script binds to LAN:

```bash
vite --host 0.0.0.0
```

Recent validation:

```bash
npm run build
```

Build succeeded after the latest UI/theme/modal changes.

## Current File Map

Main files:

- `src/App.jsx`
  - App shell, top navigation, background layers, main dashboard grid.
  - Owns `pendingLot` state and opens `ConfirmModal` when an empty parking slot is clicked.

- `src/context/ParkingContext.jsx`
  - Central reducer state for parking lots, selected floor, selected lot, parked car, and view mode.
  - Exposes `parkCar`, `leaveParking`, `setViewMode`, `setFloor`, and `selectLot`.

- `src/data/parkingData.js`
  - Generates parking lots on app load.
  - Randomizes occupied slots on every refresh.
  - Defines lobby distance logic.

- `src/utils/algorithm.js`
  - Scores available lots and returns the top 3 recommendations.

- `src/components/ParkingMap.jsx`
  - Main 2D parking map.
  - Contains metric cards, floor label, map/rute toggle, legend, left/right slots, road, and right-side lobby.

- `src/components/ParkingSlot.jsx`
  - Slot button visual states: recommended, occupied, selected, available.
  - Recommended slots stay green but use a yellow glow behind them.

- `src/components/ConfirmModal.jsx`
  - Popup shown only when an empty slot is clicked and no car is already parked.
  - Current copy: "Konfirmasi Slot Kosong".

- `src/components/Sidebar.jsx`
  - Right panel with parking profile, floor selector, recommendation list, and parked car actions.

- `src/components/PedestrianRoute.jsx`
  - Draws the orange route overlay from lobby to the parked slot.

- `src/index.css`
  - Global CSS, background photo class, modal animation, scrollbar style.

Assets:

- `public/gedung_itb2.jpg`
  - Current page background.
  - Also present in `dist/gedung_itb2.jpg` after build.

Generated build output:

- `dist/`
  - Contains built assets. It is currently modified because builds were run during UI work.

## Current UX Behavior

### Parking Data

- There are 24 total lots:
  - 2 floors
  - Rows `A` and `B`
  - 6 slots per row per floor
- IDs look like `L1-A1`, `L1-B4`, `L2-A6`.
- Occupied slots are randomized on each app load/refresh.
- Random occupied count is between 20% and 75% of total lots.

### Lobby and Distance

- The lobby is on the right side of the parking map.
- Row `B` is closer to the lobby.
- Row `A` gets a crossing penalty because it is across the road.
- Floor 2 gets an additional floor penalty.
- Distance logic is in `distanceFromRightLobby()` in `src/data/parkingData.js`.

Current formula:

```js
const sameSideDistance = 5 + columnIndex * 7;
const crossingPenalty = rowLabel === "A" ? 22 : 0;
const floorPenalty = floor === 2 ? 14 : 0;
```

This fixed a previous bug where right-side slots could be scored farther than left-side slots even though the lobby is on the right.

### Recommendations

- Recommendations are top 3 available lots from `getRecommendations()`.
- Score considers:
  - distance to lobby
  - floor penalty
  - predicted density
- Recommendations disappear after the user parks.
- Recommended slots are green, with a yellow glow behind/around the slot. Do not make the slot itself yellow.

### Parking Flow

1. User clicks a green empty slot.
2. `ParkingMap` calls `selectLot(lot.id)`.
3. If slot is empty and no car is parked, `onRequestPark(lot)` opens `ConfirmModal`.
4. Confirming calls `parkCar(pendingLot.id)`.
5. The parked slot becomes occupied.
6. Recommendations are cleared because `state.parkedCarId` exists.
7. Sidebar changes from recommendation list to "Mobil Terparkir".
8. User can click "Cari Mobil Saya" to show route mode.
9. User can click "Keluar Parkir" to free the parked slot again.

Occupied slots can be selected visually, but they should not open the parking confirmation popup.

## Current Visual Direction

The user asked to match this screenshot style:

`/home/abiyulinx/Pictures/Screenshots/Screenshot from 2026-05-11 17-46-09.png`

The implemented direction is:

- Dark glassmorphism dashboard
- Real photo background from `gedung_itb2.jpg`
- Warm orange/amber accent theme
- No old blue/cyan theme colors
- Compact card dashboard, not a landing page
- 2D parking layout, not 2.5D
- Road between left and right parking rows
- Lobby on the right side, small, about one car-slot size

Important visual constraints from the user:

- Do not bring back VIP.
- Do not show "terisi" metric/info.
- Do not show "Availability" or "Parking Density".
- Do not show old fake browser bar.
- Do not show `+ Add`.
- Do not show previous `My cabinet`, `Parking map`, `Statistics` buttons.
- Keep only mode buttons: `Map` and `Rute`.
- Keep "Kosong" / empty count as a single ratio such as `20/24`.
- Keep recommendation slots visibly highlighted.
- Use `gedung_itb2.jpg` as background.
- Theme colors should match the current warm floor/orange theme.

## Current Theme Notes

Primary warm accent:

- `#ff6845`

Secondary warm accent:

- `#ffb547`

Base dark colors:

- `#1f201c`
- `#24231d`
- `#252720`

Do not reintroduce old `cyan`, `blue`, `sky`, or `indigo` classes unless the user explicitly asks for a new color direction. A recent search showed no `cyan|blue|sky|indigo` strings under `src`.

## Known Current UI Details

### Top Navigation

Defined in `TopNavigation()` inside `src/App.jsx`.

Contains:

- Home icon button
- Text links:
  - `Parking list`
  - `Analytics`
  - `What is Smart Parking?`
  - `Tools&Calculators`
- Search-like pill with text `Lantai aktif, slot, atau lobby`
- Notification button
- Profile label `Parking Admin`

### Main Dashboard Card

Defined in `ParkingDashboard()` inside `src/App.jsx`.

Current layout:

```jsx
lg:grid-cols-[minmax(0,1fr)_340px]
```

Left side is `ParkingMap`, right side is `Sidebar`.

### Map Controls

Defined in `ParkingMap.jsx`.

Only two top-right mode buttons should remain:

- `Map`
- `Rute`

`Rute` only shows the route overlay when a car is already parked.

### Floor Selector

Defined as `SegmentedControl()` in `Sidebar.jsx`.

Active floor uses `#ff6845`.

### Confirm Popup

Defined in `ConfirmModal.jsx`.

It appears after clicking an empty slot. It uses warm dark/orange styling and shows:

- Slot ID
- Status `Kosong`
- Floor
- Distance
- Density prediction
- Buttons:
  - `Batal`
  - `Ya, Parkir`

If the user asks to remove density from the popup too, edit the `Padat` column in `ConfirmModal.jsx`.

## Performance Decisions Already Made

The user reported the web felt heavy. Optimizations already applied:

- Removed infinite animations.
- Reduced heavy visual effects where possible.
- Kept the map as simple DOM/CSS, not WebGL/Three.js.
- Kept background as a static image.

Do not add heavy animated backgrounds, continuous loops, or expensive canvas/WebGL effects unless the user explicitly requests them.

## Hardware / Supabase Context

The user said they already have Supabase connected to hardware. For this repo:

- Do not design hardware integration unless asked.
- Do not assume a new database schema is needed.
- Keep demo state local unless user asks to connect to Supabase.
- If Supabase is requested later, first ask whether to use their existing tables/API or inspect provided env/config.

## Git / Worktree Notes

Current worktree has modified source files and generated `dist` changes from previous work. Do not revert user or prior-agent changes.

At the time this handoff was written, `git status --short` showed source modifications in:

- `src/App.jsx`
- `src/components/ConfirmModal.jsx`
- `src/components/ParkingMap.jsx`
- `src/components/ParkingSlot.jsx`
- `src/components/PedestrianRoute.jsx`
- `src/components/Sidebar.jsx`
- `src/context/ParkingContext.jsx`
- `src/data/parkingData.js`
- `src/index.css`

It also showed generated `dist` asset changes and `public/` as untracked.

Before future edits, run:

```bash
git status --short
```

Do not use destructive commands such as `git reset --hard` or `git checkout --` unless the user explicitly asks.

## Validation Checklist For Future Agents

After UI edits:

```bash
npm run build
```

Then check for old color/theme regressions if relevant:

```bash
rg -n "cyan|blue|sky|indigo|#0a0e1a|#b9d8ff|#d8e2f0" src
```

Expected result after the latest theme cleanup: no matches.

If validating in browser:

- Start dev server with `npm run dev` if it is not already running.
- Previous working local URL was `http://127.0.0.1:5174/` because port 5173 was occupied earlier.
- Confirm:
  - Background image renders.
  - Floor buttons are orange, not blue.
  - Empty slot click opens popup.
  - Occupied slot click does not open popup.
  - Confirming a slot removes recommendations.
  - `Cari Mobil Saya` shows orange route overlay.
  - `Keluar Parkir` frees the parked slot.

## Suggested Next Improvements

Only do these if requested:

- Make the map fit better above the fold on laptop screens.
- Replace English labels with Indonesian consistently.
- Connect live data to existing Supabase tables.
- Add deterministic seeded random occupancy for demos.
- Add a simple test suite for reducer and recommendation logic.
- Add a screenshot-based visual regression check if the user keeps asking for pixel-level fidelity.

## Collaboration Preferences For This Project

The user gives short direct Indonesian instructions and often corrects details literally. Best working style:

- Implement the requested UI change directly.
- Keep changes surgical unless they ask for a redesign.
- Verify with `npm run build`.
- For visual changes, use actual browser/screenshot validation when practical.
- Preserve existing requested constraints unless explicitly reversed.
- Do not propose hardware work unless requested.
- When there is ambiguity, ask briefly before making a major architectural change.
