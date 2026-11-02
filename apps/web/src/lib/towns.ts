/*
 * Major towns on or near rail corridors, for the placeholder line drawn at
 * step 1 before the real alignment is uploaded. Approximate coordinates.
 */
export const TOWNS: Record<string, [number, number]> = {
  Abuja: [7.4, 9.06],
  Bauchi: [9.84, 10.31],
  'Benin City': [5.63, 6.34],
  Calabar: [8.33, 4.96],
  Enugu: [7.51, 6.44],
  Gombe: [11.17, 10.29],
  Ibadan: [3.9, 7.38],
  Ilorin: [4.55, 8.5],
  Itakpe: [6.3, 7.62],
  Jos: [8.89, 9.9],
  Kaduna: [7.43, 10.52],
  Kano: [8.52, 12.0],
  Katsina: [7.6, 12.99],
  Lagos: [3.38, 6.45],
  Lokoja: [6.74, 7.8],
  Maiduguri: [13.16, 11.85],
  Makurdi: [8.54, 7.73],
  'Maradi (Niger)': [7.1, 13.5],
  Minna: [6.55, 9.61],
  Onitsha: [6.79, 6.15],
  'Port Harcourt': [7.03, 4.82],
  Sokoto: [5.24, 13.06],
  Warri: [5.75, 5.52],
  Yola: [12.5, 9.2],
  Zaria: [7.71, 11.08],
};
export const TOWN_NAMES = Object.keys(TOWNS).sort();
