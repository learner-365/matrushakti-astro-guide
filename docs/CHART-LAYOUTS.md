# Chart layout conventions

All three SVG renderers receive a single `ChartResult`. They do not calculate planetary positions. `chartGroups()` in `src/lib/chart-layout.ts` maps already calculated D1 positions to cells.

## North Indian

The house geometry is fixed. House 1 occupies the top central diamond region, and houses proceed anticlockwise around the template. Each cell shows its fixed house number and the current Rashi identity for that house. The sign is never substituted for the house label.

## South Indian

The Rashi cells are fixed clockwise around a square perimeter: Mesha through Mithuna across the top; Karka and Simha down the right side; Tula through Makara from right to left along the bottom; Kumbha and Meena up the left side. Each cell shows its Rashi and the Whole Sign house number derived from the Ascendant. The center carries the chart title and name.

## East Indian / Bengali

The selected template is a fixed-Rashi square/cross with 12 compartments and a central label area. Aries is at the top, Cancer on the left, Libra at the bottom, and Capricorn on the right. Divided corners hold Taurus/Gemini (north-west), Pisces/Aquarius (north-east), Leo/Virgo (south-west), and Scorpio/Sagittarius (south-east). Every cell shows Rashi identity and the calculated house; the Ascendant marker appears in its Rashi cell.

Regional chart conventions vary. To change this template, update the cell mapping and its layout tests together. Do not change the underlying `ChartResult` to make a regional drawing look right.

