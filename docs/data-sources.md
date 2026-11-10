# Data sources

Open data the platform loads, with its licence and how to credit it.

| Data | Source | Licence | Loaded by |
| --- | --- | --- | --- |
| State boundaries (36 states and the FCT, ADM1) | [geoBoundaries](https://www.geoboundaries.org) gbOpen NGA ADM1, boundary ID NGA-ADM1-27671186, built 12 December 2023 from GRID3 Nigeria State Boundaries (2022, [source](https://data.grid3.org/datasets/grid3-nigeria-state-boundaries)). File pinned to release commit 9469f09: `geoBoundaries-NGA-ADM1.geojson` | [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) | `pnpm db:load-boundaries` into `admin_boundaries` (level 1) |
| Satellite base map in the designs | NASA Blue Marble (GIBS) | Public domain | Design files only |
| Demo site photos (30) | Wikimedia Commons, credits below | CC BY-SA 4.0, one CC0 | `pnpm db:seed:demo` (demo branch only) |
| Coat of arms of Nigeria (the logo) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_Nigeria.svg), drawn by Lumia1234, `docs/brand/coat-of-arms-nigeria.svg` | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/); an insignia, its use also governed by Nigerian law | Web header and favicon, field app icon, splash and front screens (docs/brand/README.md) |

## Attribution

CC BY 4.0 requires credit wherever the boundaries are shown or derived data is published (the map, exported reports, the public map). Use:

> State boundaries: GRID3 Nigeria (2022) via geoBoundaries (Runfola et al. 2020), CC BY 4.0.

Reference for geoBoundaries: Runfola, D. et al. (2020) geoBoundaries: A global database of political administrative boundaries. PLoS ONE 15(4): e0231866.

## Notes

- The states crossed by a project are computed with `ST_Intersects` between its alignment and these boundaries, so they are only as precise as the GRID3 lines (a corridor running along a state border may list both states).
- Loaded on the dev branch on 2 November 2026: 37 boundaries, all valid geometries after `ST_MakeValid`. Production loads the same pinned file.

## Demo photos

The demo data's 30 site photos (`apps/api/src/database/demo-photos/` in the API repository, used by `pnpm db:seed:demo`; 12 of them are copied into this repository's `apps/web/public/sample-photos/` with their `credits.json`, for the web app's sample data: kk-s1 to kk-s9 and the three handover photos; the web app also has `pm-makurdi.jpg`) are real photos from Wikimedia Commons, under CC BY-SA 4.0 (and one CC0; `pm-makurdi.jpg` is CC BY 3.0). Each was resized to 1280 px on its long side and re-saved without metadata; the resized copies are shared under the same licence. They stand in for site photos: the Nigerian ones show real lines and stations (Kaduna, Abeokuta, Abak, Kafanchan), and the construction ones come mostly from the Padma Bridge Rail Link in Bangladesh, a standard-gauge line built the same way, so they do not show the Kaduna–Kano corridor. Credit them wherever the demo is shown outside the team. Per photo (file, source, author, licence; also in `credits.json` next to them):

| File | Source | Author | Licence |
| --- | --- | --- | --- |
| `kk-l1-2026-02.jpg` | [Abak Etim Abak.jpg](https://commons.wikimedia.org/wiki/File:Abak_Etim_Abak.jpg) | Dearer | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l2-2026-02.jpg` | [Construction of Padma Bridge Rail Link Project 16.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_16.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l2-2026-05.jpg` | [Construction of Padma Bridge Rail Link Project 19.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_19.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l3-2026-02.jpg` | [Construction of Padma Bridge Rail Link Project 11.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_11.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l3-2026-05.jpg` | [Construction of Padma Bridge Rail Link Project 23.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_23.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l3-2026-08.jpg` | [Construction of Padma Bridge Rail Link Project 14.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_14.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l3-2026-10.jpg` | [Construction of Padma Bridge Rail Link Project.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-s1.jpg` | [Construction of Padma Bridge Rail Link Project 15.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_15.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-s2.jpg` | [Construction of Padma Bridge Rail Link Project 24.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_24.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l2-2026-06.jpg` | [Culvert Construction.jpg](https://commons.wikimedia.org/wiki/File:Culvert_Construction.jpg) | Siddique1301107 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-s3.jpg` | [Narrow gauge railway bridge, Kaduna, from British colonial era.jpg](https://commons.wikimedia.org/wiki/File:Narrow_gauge_railway_bridge,_Kaduna,_from_British_colonial_era.jpg) | Kambai Akau | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l2-2026-07.jpg` | [Abeokuta Railway Station (1).jpg](https://commons.wikimedia.org/wiki/File:Abeokuta_Railway_Station_(1).jpg) | Solanke Lukman Oluwaseun | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-s6.jpg` | [WOLE SOYINKA TRAIN TERMINAL, ABEOKUTA.jpg](https://commons.wikimedia.org/wiki/File:WOLE_SOYINKA_TRAIN_TERMINAL,_ABEOKUTA.jpg) | Pacesetter Media | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-s6-2.jpg` | [Abeokuta Railway Station (5).jpg](https://commons.wikimedia.org/wiki/File:Abeokuta_Railway_Station_(5).jpg) | Solanke Lukman Oluwaseun | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l1-2026-03.jpg` | [Construction of Padma Bridge Rail Link Project 12.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_12.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l1-2026-04.jpg` | [Construction of Padma Bridge Rail Link Project 2.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_2.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l1-2026-05.jpg` | [Construction of Padma Bridge Rail Link Project 3.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_3.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l1-2026-06.jpg` | [Construction of Padma Bridge Rail Link Project 13.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_13.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l1-2026-07.jpg` | [Construction of Padma Bridge Rail Link Project 4.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_4.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l1-2026-08.jpg` | [Construction of Padma Bridge Rail Link Project 17.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_17.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l1-2026-09.jpg` | [Construction of Padma Bridge Rail Link Project 7.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_7.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l2-2026-09.jpg` | [Construction of Padma Bridge Rail Link Project 20.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_20.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-l2-2026-10.jpg` | [Construction of Padma Bridge Rail Link Project 9.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_9.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-s9.jpg` | [Construction of Padma Bridge Rail Link Project 6.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_6.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-s5.jpg` | [Construction of Padma Bridge Rail Link Project 5.jpg](https://commons.wikimedia.org/wiki/File:Construction_of_Padma_Bridge_Rail_Link_Project_5.jpg) | Wasiul Bahar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `kk-s7.jpg` | [Axle counter box in Indian Railways.jpg](https://commons.wikimedia.org/wiki/File:Axle_counter_box_in_Indian_Railways.jpg) | Apurba Biswas | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| `kk-s8.jpg` | [Railway line heading to Madakiya.jpg](https://commons.wikimedia.org/wiki/File:Railway_line_heading_to_Madakiya.jpg) | Kambai Akau | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `ak-handover.jpg` | [Railway line, Abeokuta Terminal.jpg](https://commons.wikimedia.org/wiki/File:Railway_line,_Abeokuta_Terminal.jpg) | Pacesetter Media | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `li-handover.jpg` | [Abeokuta Railway Station (4).jpg](https://commons.wikimedia.org/wiki/File:Abeokuta_Railway_Station_(4).jpg) | Solanke Lukman Oluwaseun | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `wi-handover.jpg` | [The Addis Ababa–Djibouti Railway, near Dasbiyo.jpg](https://commons.wikimedia.org/wiki/File:The_Addis_Ababa%E2%80%93Djibouti_Railway,_near_Dasbiyo.jpg) | Skilla1st | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `pm-makurdi.jpg` (web sample data only: Port Harcourt–Maiduguri, the existing line at Makurdi) | [North South Railway at Makurdi, Central Nigeria. - panoramio.jpg](https://commons.wikimedia.org/wiki/File:North_South_Railway_at_Makurdi,_Central_Nigeria._-_panoramio.jpg) | Pastor Sam | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
