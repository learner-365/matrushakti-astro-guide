import { Planet, houseForRashi } from "@/lib/astro";

export type ChartStyle = "north" | "east" | "south";

export const NORTH_HOUSES = [
  { house: 1, points: "200,0 300,100 200,200 100,100", x: 200, y: 75 },
  { house: 2, points: "0,0 200,0 100,100", x: 100, y: 28 },
  { house: 3, points: "0,0 100,100 0,200", x: 30, y: 100 },
  { house: 4, points: "0,200 100,100 200,200 100,300", x: 78, y: 200 },
  { house: 5, points: "0,200 100,300 0,400", x: 30, y: 300 },
  { house: 6, points: "0,400 100,300 200,400", x: 100, y: 372 },
  { house: 7, points: "100,300 200,200 300,300 200,400", x: 200, y: 328 },
  { house: 8, points: "200,400 300,300 400,400", x: 300, y: 372 },
  { house: 9, points: "400,400 300,300 400,200", x: 370, y: 300 },
  { house: 10, points: "300,100 400,200 300,300 200,200", x: 322, y: 200 },
  { house: 11, points: "400,200 300,100 400,0", x: 370, y: 100 },
  { house: 12, points: "400,0 300,100 200,0", x: 300, y: 28 },
] as const;

export const SOUTH_RASHI_CELLS = [
  { rashi: 0, x: 0, y: 0 }, { rashi: 1, x: 100, y: 0 }, { rashi: 2, x: 200, y: 0 }, { rashi: 3, x: 300, y: 0 },
  { rashi: 4, x: 300, y: 100 }, { rashi: 5, x: 300, y: 200 },
  { rashi: 6, x: 300, y: 300 }, { rashi: 7, x: 200, y: 300 }, { rashi: 8, x: 100, y: 300 }, { rashi: 9, x: 0, y: 300 },
  { rashi: 10, x: 0, y: 200 }, { rashi: 11, x: 0, y: 100 },
] as const;

// Fixed-sign Bengali template based on the documented square/cross convention:
// Aries, Cancer, Libra and Capricorn anchor the side cells; split corner cells
// hold the remaining Rashis around the empty centre.
export const EAST_RASHI_CELLS = [
  { rashi: 0, points: "133,0 267,0 267,133 133,133", x: 200, y: 31 },
  { rashi: 1, points: "0,0 133,0 133,133", x: 96, y: 26 },
  { rashi: 2, points: "0,0 0,133 133,133", x: 30, y: 100 },
  { rashi: 3, points: "0,133 133,133 133,267 0,267", x: 55, y: 200 },
  { rashi: 4, points: "0,267 0,400 133,267", x: 30, y: 300 },
  { rashi: 5, points: "0,400 133,267 133,400", x: 96, y: 374 },
  { rashi: 6, points: "133,267 267,267 267,400 133,400", x: 200, y: 374 },
  { rashi: 7, points: "267,267 400,267 400,400", x: 370, y: 300 },
  { rashi: 8, points: "267,400 400,267 400,400", x: 304, y: 374 },
  { rashi: 9, points: "267,133 400,133 400,267 267,267", x: 344, y: 200 },
  { rashi: 10, points: "400,0 400,133 267,133", x: 370, y: 100 },
  { rashi: 11, points: "267,0 400,0 267,133", x: 304, y: 26 },
] as const;

export function chartGroups(planets: Planet[], ascendantRashi: number, style: ChartStyle) {
  return Array.from({ length: 12 }, (_, index) => {
    const house = style === "north" ? index + 1 : houseForRashi(index, ascendantRashi);
    const rashiIndex = style === "north" ? (ascendantRashi + index) % 12 : index;
    const placements = planets.filter((planet) => style === "north" ? planet.house === house : planet.rashiIndex === rashiIndex);
    return { cellIndex: index, house, rashiIndex, planets: placements };
  });
}

