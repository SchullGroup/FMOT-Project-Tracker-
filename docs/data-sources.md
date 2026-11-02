# Data sources

Open data the platform loads, with its licence and how to credit it.

| Data | Source | Licence | Loaded by |
| --- | --- | --- | --- |
| State boundaries (36 states and the FCT, ADM1) | [geoBoundaries](https://www.geoboundaries.org) gbOpen NGA ADM1, boundary ID NGA-ADM1-27671186, built 12 December 2023 from GRID3 Nigeria State Boundaries (2022, [source](https://data.grid3.org/datasets/grid3-nigeria-state-boundaries)). File pinned to release commit 9469f09: `geoBoundaries-NGA-ADM1.geojson` | [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) | `pnpm db:load-boundaries` into `admin_boundaries` (level 1) |
| Satellite base map in the designs | NASA Blue Marble (GIBS) | Public domain | Design files only |

## Attribution

CC BY 4.0 requires credit wherever the boundaries are shown or derived data is published (the map, exported reports, the public map). Use:

> State boundaries: GRID3 Nigeria (2022) via geoBoundaries (Runfola et al. 2020), CC BY 4.0.

Reference for geoBoundaries: Runfola, D. et al. (2020) geoBoundaries: A global database of political administrative boundaries. PLoS ONE 15(4): e0231866.

## Notes

- The states crossed by a project are computed with `ST_Intersects` between its alignment and these boundaries, so they are only as precise as the GRID3 lines (a corridor running along a state border may list both states).
- Loaded on the dev branch on 2 November 2026: 37 boundaries, all valid geometries after `ST_MakeValid`. Production loads the same pinned file.
