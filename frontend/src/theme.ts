export const colors = {
  bg: "#0A0A0A",
  bgSecondary: "#141414",
  bgTertiary: "#1C1C1C",
  glass: "rgba(255,255,255,0.05)",
  glassStrong: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#FFFFFF",
  textMuted: "#A1A1AA",
  textDim: "#71717A",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.15)",
  blue: "#3B82F6",
  blueSoft: "rgba(59,130,246,0.15)",
  green: "#10B981",
  greenSoft: "rgba(16,185,129,0.15)",
  red: "#EF4444",
  redSoft: "rgba(239,68,68,0.15)",
  purple: "#8B5CF6",
  gray: "#3F3F46",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: "700" as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  small: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.2 },
  label: { fontSize: 12, fontWeight: "500" as const },
};

export function colorForType(type: string, on?: boolean): string {
  if (type === "light") return on ? colors.amber : colors.gray;
  if (type === "outlet") return on ? colors.green : colors.gray;
  if (type === "blind") return colors.blue;
  if (type === "climate") return colors.blue;
  if (type === "sensor") return colors.purple;
  return colors.gray;
}