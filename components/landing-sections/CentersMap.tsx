"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

/** Brand green (matches #2D7A3A / primary usage) */
const BRAND_GREEN = "#2D7A3A";
const WORLD_ATLAS_COUNTRIES =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const cities = [
  {
    name: "Hyderabad",
    // count: 14,
    coordinates: [78.4867, 17.385] as [number, number],
  },
  {
    name: "Vijayawada",
    // count: 10,
    coordinates: [80.648, 16.5062] as [number, number],
  },
  {
    name: "Bangalore",
    // count: 16,
    coordinates: [77.5946, 12.9716] as [number, number],
  },
  {
    name: "Hubbali",
    // count: 8,
    coordinates: [75.124, 15.3647] as [number, number],
  },
];

function isIndiaGeo(geo: {
  id?: string | number;
  properties?: { name?: string };
}) {
  const id = geo.id != null ? String(geo.id) : "";
  return id === "356" || geo.properties?.name === "India";
}

function IndiaMapSvg({
  width,
  height,
  hoveredCity,
  setHoveredCity,
  landFill,
  landStroke,
}: {
  width: number;
  height: number;
  hoveredCity: string | null;
  setHoveredCity: (name: string | null) => void;
  landFill: string;
  landStroke: string;
}) {
  const scale = Math.max(520, Math.min(2200, width * 1.72));
  const { theme } = useTheme();

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{
        center: [78, 17.5],
        scale,
      }}
      width={width}
      height={height}
      className="w-full h-auto max-w-full [&_svg]:outline-none"
    >
      <Geographies geography={WORLD_ATLAS_COUNTRIES}>
        {({ geographies }) =>
          geographies.filter(isIndiaGeo).map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={landFill}
              stroke={landStroke}
              strokeWidth={0.65}
              style={{
                default: { outline: "none" },
                // hover: { outline: "none", fill: "#d1fae5" },
                pressed: { outline: "none" },
              }}
            />
          ))
        }
      </Geographies>

      {cities.map((city) => (
        <Marker key={city.name} coordinates={city.coordinates}>
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredCity(city.name)}
            onMouseLeave={() => setHoveredCity(null)}
          >
            <title>{city.name}</title>
            <circle
              r={14}
              fill="transparent"
              className="pointer-events-auto"
            />
            {/* <circle
              cx={0}
              cy={0}
              r={8}
              fill={BRAND_GREEN}
              className="animate-pulse opacity-75 pointer-events-none"
            /> */}
            <circle
              cx={0}
              cy={0}
              r={5}
              fill={theme === "dark" ? "white" : BRAND_GREEN}
              strokeWidth={1.5}
              className="pointer-events-none stroke-background animate-pulse"
            />
            {hoveredCity === city.name && (
              <g transform="translate(0,-20)" className="pointer-events-none">
                <rect
                  x={-58}
                  y={-24}
                  width={116}
                  height={28}
                  rx={8}
                  className="fill-foreground"
                />
                <text
                  x={0}
                  y={-5}
                  textAnchor="middle"
                  className="fill-background"
                  fontSize={12}
                  fontWeight={600}
                  fontFamily="system-ui, sans-serif"
                >
                  {city.name}
                </text>
              </g>
            )}
          </g>
        </Marker>
      ))}
    </ComposableMap>
  );
}

export function CentersMap() {
  const { resolvedTheme } = useTheme();
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 450 });

  const isDark = resolvedTheme === "dark";
  const landFill = isDark ? "#134e2a" : "#ecfdf5";
  const landStroke = isDark ? "#4ade80" : BRAND_GREEN;

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = Math.floor(rect.width);
    if (w < 32) return;
    const aspect = window.matchMedia("(min-width: 640px)").matches
      ? 16 / 9
      : 4 / 3;
    setSize({ width: w, height: Math.max(200, Math.round(w / aspect)) });
  }, []);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <section id="centers" className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            Our Centers Across <span className="text-primary">India</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Find an Instructis center near you and start your journey towards
            success.
          </p>
        </div>

        {/* Map Container */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/40 dark:to-slate-900/80 aspect-[4/3] sm:aspect-[16/9] max-w-4xl mx-auto shadow-inner border border-border mb-12 min-h-[220px]">
          <div className="absolute inset-4 sm:inset-12 bg-background/50 dark:bg-background/20 rounded-[3rem] blur-xl pointer-events-none" />

          <div
            ref={containerRef}
            className="absolute inset-0 z-10 flex items-center justify-center px-2 py-3 sm:px-4 sm:py-6"
          >
            <IndiaMapSvg
              width={size.width}
              height={size.height}
              hoveredCity={hoveredCity}
              setHoveredCity={setHoveredCity}
              landFill={landFill}
              landStroke={landStroke}
            />
          </div>
        </div>

        {/* Chips */}
        <div
          className="flex overflow-x-auto pb-4 gap-3 px-4 -mx-4 sm:mx-0 justify-start md:justify-center"
          style={{ scrollbarWidth: "none" }}
        >
          {cities.map((city) => (
            <button
              key={city.name}
              type="button"
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap bg-card border border-border rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                hoveredCity === city.name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted text-foreground/90"
              )}
            >
              <MapPin className="w-4 h-4" />
              {city.name}
              {/* <span
                className={cn(
                  "ml-1 px-2 py-0.5 rounded-full text-xs font-bold",
                  hoveredCity === city.name ? "bg-white/20" : "bg-gray-100"
                )}
              >
                {city.count}
              </span> */}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
