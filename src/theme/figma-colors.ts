/** Resolved color values extracted from the provided Figma Variables. */
export const figmaColors = {
  brand: {
    1: "#0057ff",
    2: "rgba(0, 87, 255, 0.8)",
    3: "rgba(0, 87, 255, 0.4)",
    4: "#e5eeff",
    5: "rgba(0, 87, 255, 0.05)",
  },
  auxiliary: {
    1: "#0d1839",
    2: "#3d4766",
    3: "#7d8ab2",
  },
  gray: {
    1: "#101114",
    2: "#525766",
    3: "#797b80",
    4: "#b0b3bd",
    5: "#d9d9d9",
    6: "#eaecf2",
    7: "#f1f2f5",
  },
  status: {
    success: "#52c1b4",
    error: "#ea5b41",
    warning: "#ff9900",
    caution: "#ffd600",
    info: "#00a2ff",
    accent: "#903da8",
  },
  common: {
    white: "#ffffff",
    black: "#000000",
    mask: "rgba(0, 0, 0, 0.6)",
  },
} as const;

