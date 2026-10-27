import { ChartResult, Planet, RASHIS } from "@/lib/astro";
import { ChartStyle, chartGroups, EAST_RASHI_CELLS, NORTH_HOUSES, SOUTH_RASHI_CELLS } from "@/lib/chart-layout";

export type { ChartStyle } from "@/lib/chart-layout";

function PlanetLines({ planets, x, y, asc }: { planets: Planet[]; x: number; y: number; asc?: boolean }) {
  const labels = planets.map((planet) => planet.symbol).join(" · ");
  return (
    <g textAnchor="middle">
      {asc && <text x={x} y={y - 28} className="chart-asc">Lagna</text>}
      <text x={x} y={y - (asc ? 14 : 11)} className="chart-planets">{labels}</text>
    </g>
  );
}

function NorthChart({ chart }: { chart: ChartResult }) {
  const groups = chartGroups(chart.planets, chart.ascendant.rashiIndex, "north");
  return (
    <>
      <rect x="1" y="1" width="398" height="398" className="chart-boundary" />
      <path d="M0 0L400 400M400 0L0 400M200 0L400 200L200 400L0 200Z" className="chart-lines" />
      {NORTH_HOUSES.map((cell, index) => {
        const group = groups[index];
        const rashi = group.rashiIndex;
        const planets = group.planets;
        return <g key={cell.house}>
          <text x={cell.x} y={cell.y} textAnchor="middle" className="chart-sign">{rashi + 1} · {RASHIS[rashi]}</text>
          <text x={cell.x} y={cell.y + 14} textAnchor="middle" className="chart-house">House {cell.house}{cell.house === 1 ? " · Asc" : ""}</text>
          <PlanetLines planets={planets} x={cell.x} y={cell.y + 37} />
        </g>;
      })}
    </>
  );
}

function SouthChart({ chart }: { chart: ChartResult }) {
  const groups = chartGroups(chart.planets, chart.ascendant.rashiIndex, "south");
  return <>
    <rect x="1" y="1" width="398" height="398" className="chart-boundary" />
    <path d="M100 0V400M300 0V400M0 100H400M0 300H400M200 0V100M200 300V400M0 200H100M300 200H400" className="chart-lines" />
    {SOUTH_RASHI_CELLS.map(({ rashi, x, y }, index) => {
      const { house, planets } = groups[index];
      const asc = rashi === chart.ascendant.rashiIndex;
      return <g key={rashi}>
        <text x={x + 50} y={y + 27} textAnchor="middle" className="chart-sign">{rashi + 1} · {RASHIS[rashi]}</text>
        <text x={x + 50} y={y + 42} textAnchor="middle" className="chart-house">House {house}{asc ? " · Asc" : ""}</text>
        <text x={x + 50} y={y + 66} textAnchor="middle" className="chart-planets">{planets.map((p) => p.symbol).join(" · ")}</text>
      </g>;
    })}
    <g textAnchor="middle">
      <text x="200" y="178" className="chart-center-brand">MATRUSHAKTI</text>
      <text x="200" y="203" className="chart-center-title">JANMA KUNDLI</text>
      <text x="200" y="228" className="chart-center-name">{chart.birth.name.slice(0, 24)}</text>
    </g>
  </>;
}

function EastChart({ chart }: { chart: ChartResult }) {
  const groups = chartGroups(chart.planets, chart.ascendant.rashiIndex, "east");
  return <>
    <rect x="1" y="1" width="398" height="398" className="chart-boundary" />
    <path d="M133.33 0V400M266.67 0V400M0 133.33H400M0 266.67H400M0 0L133.33 133.33M267 133L400 0M0 400L133.33 267M266.67 266.67L400 400" className="chart-lines" />
    {EAST_RASHI_CELLS.map(({ rashi, x, y, points }, index) => {
      const { house, planets } = groups[index];
      const asc = rashi === chart.ascendant.rashiIndex;
      const shortPlanets = planets.map((p) => p.symbol).join(" · ");
      const compact = rashi === 1 || rashi === 2 || rashi === 4 || rashi === 5 || rashi === 7 || rashi === 8 || rashi === 10 || rashi === 11;
      return <g key={rashi}>
        <polygon points={points} fill="transparent" />
        <text x={x} y={y} textAnchor="middle" className="chart-sign">{rashi + 1} · {RASHIS[rashi]}</text>
        <text x={x} y={y + 13} textAnchor="middle" className="chart-house">House {house}{asc ? " · Asc" : ""}</text>
        {shortPlanets && <text x={x} y={y + (compact ? 29 : 36)} textAnchor="middle" className="chart-planets">{shortPlanets}</text>}
      </g>;
    })}
    <g textAnchor="middle">
      <text x="200" y="178" className="chart-center-brand">MATRUSHAKTI</text>
      <text x="200" y="203" className="chart-center-title">JANMA KUNDLI</text>
      <text x="200" y="228" className="chart-center-name">{chart.birth.name.slice(0, 24)}</text>
    </g>
  </>;
}

const styleNames: Record<ChartStyle, string> = {
  north: "North Indian",
  east: "East Indian · Bengali",
  south: "South Indian",
};

export function KundliChart({ chart, style }: { chart: ChartResult; style: ChartStyle }) {
  return <svg
    className="kundli-svg"
    viewBox="0 0 400 400"
    role="img"
    aria-label={`${styleNames[style]} Janma Kundli for ${chart.birth.name}. Ascendant ${chart.ascendant.rashi}.`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{styleNames[style]} Janma Kundli — {chart.birth.name}</title>
    {style === "north" ? <NorthChart chart={chart} /> : style === "east" ? <EastChart chart={chart} /> : <SouthChart chart={chart} />}
  </svg>;
}

export const chartStyleLabels = styleNames;
