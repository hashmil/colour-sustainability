export const getRGBFromHex = (
  hex: string
): { r: number; g: number; b: number } => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

export const calculateSustainability = (hex: string): number => {
  const { r, g, b } = getRGBFromHex(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return Math.round(((255 - brightness) / 255) * 100);
};

export const getContrastText = (hex: string): string => {
  const brightness = calculateSustainability(hex);
  return brightness < 50 ? "text-gray-900" : "text-white";
};

// Add other color-related functions here (HSL conversions, etc.)
