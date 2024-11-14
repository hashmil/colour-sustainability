"use client"; // Add this to mark as client component

import React, { useState, useEffect, DragEvent } from "react";

type ColorHarmony =
  | "random"
  | "analogous"
  | "monochromatic"
  | "triad"
  | "complementary";

const ColorSustainabilityPicker = () => {
  const [color, setColor] = useState("#000000");
  const [palette, setPalette] = useState<string[]>([]);
  const [sustainability, setSustainability] = useState(100);
  const [paletteSustainability, setPaletteSustainability] = useState(100);
  const [selectedPaletteColor, setSelectedPaletteColor] = useState<
    number | null
  >(null);
  const [colorHarmony, setColorHarmony] = useState<ColorHarmony>("random");

  const MAX_PALETTE_COLORS = 5;

  const getRGBFromHex = (hex: string): { r: number; g: number; b: number } => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const calculateSustainability = (hex: string): number => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate brightness (0-255)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Invert brightness to get sustainability (0-100%)
    return Math.round(((255 - brightness) / 255) * 100);
  };

  const calculatePaletteSustainability = (colors: string[]): number => {
    if (colors.length === 0) return 0;

    // Simple average of all color sustainability scores
    const scores = colors.map((color) => calculateSustainability(color));
    const average = scores.reduce((a, b) => a + b, 0) / colors.length;

    return Math.round(average);
  };

  const addToPalette = (colorToAdd: string) => {
    if (palette.length >= MAX_PALETTE_COLORS) return;
    if (palette.includes(colorToAdd)) return;
    const newPalette = [...palette, colorToAdd];
    setPalette(newPalette);
    setPaletteSustainability(calculatePaletteSustainability(newPalette));
  };

  const removeFromPalette = (colorToRemove: string) => {
    const newPalette = palette.filter((c) => c !== colorToRemove);
    setPalette(newPalette);
    setPaletteSustainability(calculatePaletteSustainability(newPalette));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, color: string) => {
    e.dataTransfer.setData("text/plain", color);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetColor: string) => {
    e.preventDefault();
    const draggedColor = e.dataTransfer.getData("text/plain");

    if (draggedColor === targetColor) return;

    const newPalette = [...palette];
    const draggedIndex = newPalette.indexOf(draggedColor);
    const targetIndex = newPalette.indexOf(targetColor);

    newPalette.splice(draggedIndex, 1);
    newPalette.splice(targetIndex, 0, draggedColor);

    setPalette(newPalette);
  };

  const generateRandomColor = (): string => {
    // Generate random RGB values with more variation
    // Higher numbers = lighter colors, but still maintaining good sustainability
    const maxValue = Math.floor(Math.random() * 100) + 50; // Random range between 50-150

    const r = Math.floor(Math.random() * maxValue);
    const g = Math.floor(Math.random() * maxValue);
    const b = Math.floor(Math.random() * maxValue);

    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  };

  const generateLightColor = (): string => {
    // Generate a light color (high RGB values)
    const minValue = 180; // Ensure high base value for lightness
    const maxValue = 255;

    const r = Math.floor(Math.random() * (maxValue - minValue) + minValue);
    const g = Math.floor(Math.random() * (maxValue - minValue) + minValue);
    const b = Math.floor(Math.random() * (maxValue - minValue) + minValue);

    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  };

  const generateMidLightColor = (): string => {
    // Generate a mid-light color (medium-high RGB values)
    const minValue = 140; // Lower than light color but higher than dark
    const maxValue = 200; // Lower than light color's max

    const r = Math.floor(Math.random() * (maxValue - minValue) + minValue);
    const g = Math.floor(Math.random() * (maxValue - minValue) + minValue);
    const b = Math.floor(Math.random() * (maxValue - minValue) + minValue);

    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  };

  const generateRandomPalette = (): string[] => {
    const colors: string[] = [];

    // First generate 3 darker colors
    while (colors.length < MAX_PALETTE_COLORS - 2) {
      const newColor = generateRandomColor();
      if (!colors.includes(newColor)) {
        colors.push(newColor);
      }
    }

    // Generate and insert light color at random position
    const lightColor = generateLightColor();
    const lightPosition = Math.floor(Math.random() * (colors.length + 1));
    colors.splice(lightPosition, 0, lightColor);

    // Generate and insert mid-light color at random position
    const midLightColor = generateMidLightColor();
    const midLightPosition = Math.floor(Math.random() * (colors.length + 1));
    colors.splice(midLightPosition, 0, midLightColor);

    return colors;
  };

  const generateHarmonyColors = (
    baseColor: string,
    harmony: ColorHarmony
  ): string[] => {
    const hslToHex = (h: number, s: number, l: number): string => {
      const rgbArr = HSLToRGB(h, s, l);
      return (
        "#" +
        rgbArr.map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")
      );
    };

    const HSLToRGB = (h: number, s: number, l: number): number[] => {
      s /= 100;
      l /= 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [255 * f(0), 255 * f(8), 255 * f(4)];
    };

    const hexToHSL = (hex: string): [number, number, number] => {
      const rgb = getRGBFromHex(hex);
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0,
        s = 0,
        l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return [h * 360, s * 100, l * 100];
    };

    const [baseH, baseS, baseL] = hexToHSL(baseColor);
    let colors: string[] = [];

    switch (harmony) {
      case "analogous":
        colors = [
          hslToHex((baseH + 30) % 360, baseS, baseL),
          hslToHex((baseH + 60) % 360, baseS, baseL),
          hslToHex((baseH - 30 + 360) % 360, baseS, baseL),
        ];
        // Add light and mid-light analogous colors
        const lightAnalogousH =
          (baseH + (Math.random() < 0.5 ? 30 : -30 + 360)) % 360;
        const midLightAnalogousH =
          (baseH + (Math.random() < 0.5 ? 60 : -60 + 360)) % 360;

        colors.splice(
          Math.floor(Math.random() * 4),
          0,
          hslToHex(lightAnalogousH, Math.max(baseS - 10, 30), 85)
        ); // Light
        colors.splice(
          Math.floor(Math.random() * 5),
          0,
          hslToHex(midLightAnalogousH, Math.max(baseS - 5, 40), 70)
        ); // Mid-light
        break;

      case "monochromatic":
        colors = [
          hslToHex(baseH, baseS, Math.max(baseL - 30, 10)),
          hslToHex(baseH, baseS, baseL),
          hslToHex(baseH, baseS, Math.max(baseL - 45, 5)),
        ];
        // Add light and mid-light versions
        colors.splice(
          Math.floor(Math.random() * 4),
          0,
          hslToHex(baseH, Math.max(baseS - 20, 20), 85)
        ); // Light
        colors.splice(
          Math.floor(Math.random() * 5),
          0,
          hslToHex(baseH, Math.max(baseS - 10, 30), 70)
        ); // Mid-light
        break;

      case "triad":
        colors = [
          hslToHex((baseH + 120) % 360, baseS, baseL),
          hslToHex((baseH + 240) % 360, baseS, baseL),
          hslToHex(baseH, baseS, Math.max(baseL - 20, 20)),
        ];
        // Add light and mid-light triad colors
        const triadAngles = [0, 120, 240];
        const lightTriadH =
          (baseH + triadAngles[Math.floor(Math.random() * 3)]) % 360;
        const midLightTriadH =
          (baseH + triadAngles[Math.floor(Math.random() * 3)]) % 360;

        colors.splice(
          Math.floor(Math.random() * 4),
          0,
          hslToHex(lightTriadH, Math.max(baseS - 15, 25), 85)
        ); // Light
        colors.splice(
          Math.floor(Math.random() * 5),
          0,
          hslToHex(midLightTriadH, Math.max(baseS - 10, 35), 70)
        ); // Mid-light
        break;

      case "complementary":
        colors = [
          hslToHex((baseH + 180) % 360, baseS, baseL),
          hslToHex(baseH, baseS, Math.max(baseL - 20, 20)),
          hslToHex((baseH + 180) % 360, baseS, Math.max(baseL - 20, 20)),
        ];
        // Add light and mid-light complementary colors
        const lightCompH = Math.random() < 0.5 ? baseH : (baseH + 180) % 360;
        const midLightCompH = Math.random() < 0.5 ? baseH : (baseH + 180) % 360;

        colors.splice(
          Math.floor(Math.random() * 4),
          0,
          hslToHex(lightCompH, Math.max(baseS - 15, 25), 85)
        ); // Light
        colors.splice(
          Math.floor(Math.random() * 5),
          0,
          hslToHex(midLightCompH, Math.max(baseS - 10, 35), 70)
        ); // Mid-light
        break;

      default:
        return generateRandomPalette();
    }

    return colors;
  };

  const generateSustainablePalette = () => {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      // Generate base color that's somewhat dark
      const baseColor = generateRandomColor();
      if (calculateSustainability(baseColor) < 60) {
        attempts++;
        continue;
      }

      const newPalette = generateHarmonyColors(baseColor, colorHarmony);
      const newPaletteSustainability =
        calculatePaletteSustainability(newPalette);

      // Set the color to the base color used for generation
      setColor(baseColor);
      setPalette(newPalette);
      setPaletteSustainability(newPaletteSustainability);
      setSelectedPaletteColor(null); // Reset any selected color
      return;
    }

    // Fallback if we couldn't generate a good palette
    const fallbackPalette = generateRandomPalette();
    setPalette(fallbackPalette);
    setPaletteSustainability(calculatePaletteSustainability(fallbackPalette));
    setSelectedPaletteColor(null);
  };

  const updatePaletteColor = (newColor: string) => {
    if (selectedPaletteColor === null) return;

    const newPalette = [...palette];
    newPalette[selectedPaletteColor] = newColor;
    setPalette(newPalette);
    setPaletteSustainability(calculatePaletteSustainability(newPalette));
  };

  useEffect(() => {
    setSustainability(calculateSustainability(color));
    if (selectedPaletteColor !== null) {
      updatePaletteColor(color);
    }
  }, [color]);

  useEffect(() => {
    // Generate initial palette when component mounts
    generateSustainablePalette();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen w-full bg-gray-900 p-4 sm:p-6 text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Sustainable Color Palette Generator
          </h1>
          <p className="mt-2 text-gray-400">
            Create beautiful color combinations with energy efficiency in mind
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[1fr,2fr] gap-6">
          {/* Left Column - Color Controls */}
          <div className="space-y-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            {/* Color Preview */}
            <div
              className="h-48 rounded-xl transition-colors duration-300 relative overflow-hidden"
              style={{ backgroundColor: color }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
                <span className="font-mono text-sm uppercase tracking-wider">
                  {color}
                </span>
                <span className="font-mono text-xs mt-1">
                  rgb({getRGBFromHex(color).r}, {getRGBFromHex(color).g},{" "}
                  {getRGBFromHex(color).b})
                </span>
              </div>
            </div>

            {/* Color Controls */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  htmlFor="colorPicker"
                  className="block w-full py-3 px-4 rounded-xl bg-gray-700/50 
                           hover:bg-gray-700 border border-gray-600 cursor-pointer
                           transition-all duration-200 text-center">
                  {selectedPaletteColor !== null
                    ? `Editing Color ${selectedPaletteColor + 1}`
                    : "Choose Color"}
                  <input
                    type="color"
                    id="colorPicker"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
              {selectedPaletteColor !== null ? (
                <button
                  onClick={() => setSelectedPaletteColor(null)}
                  className="px-4 rounded-xl bg-gray-700/50 hover:bg-gray-700 
                           border border-gray-600 transition-colors duration-200">
                  Done
                </button>
              ) : (
                <button
                  onClick={() => addToPalette(color)}
                  disabled={
                    palette.length >= MAX_PALETTE_COLORS ||
                    palette.includes(color)
                  }
                  className="px-4 rounded-xl bg-violet-600 hover:bg-violet-500 
                           disabled:bg-gray-700 disabled:cursor-not-allowed
                           transition-colors duration-200">
                  Add
                </button>
              )}
            </div>

            {/* Single Color Sustainability */}
            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      className="text-gray-700"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="32"
                      cy="32"
                    />
                    <circle
                      className="text-blue-500"
                      strokeWidth="4"
                      strokeDasharray={188.5}
                      strokeDashoffset={188.5 - (sustainability / 100) * 188.5}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="32"
                      cy="32"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                    {sustainability}%
                  </span>
                </div>
                <div>
                  <p className="font-medium">Color Sustainability</p>
                  <p className="text-sm text-gray-400">
                    {sustainability > 75
                      ? "Excellent efficiency"
                      : sustainability > 50
                      ? "Good efficiency"
                      : sustainability > 25
                      ? "Fair efficiency"
                      : "Poor efficiency"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Palette */}
          <div className="space-y-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            {/* Palette Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  value={colorHarmony}
                  onChange={(e) =>
                    setColorHarmony(e.target.value as ColorHarmony)
                  }
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 
                           text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="random">Random</option>
                  <option value="analogous">Analogous</option>
                  <option value="monochromatic">Monochromatic</option>
                  <option value="triad">Triad</option>
                  <option value="complementary">Complementary</option>
                </select>
                <button
                  onClick={generateSustainablePalette}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 
                           hover:bg-violet-500 transition-colors duration-200">
                  <svg
                    className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Generate New Palette
                </button>
              </div>
              <span className="text-sm text-gray-400">
                {palette.length}/{MAX_PALETTE_COLORS} colors
              </span>
            </div>

            {/* Palette Display */}
            <div className="grid grid-cols-5 gap-2 h-64">
              {palette.length > 0 ? (
                palette.map((paletteColor, index) => (
                  <div
                    key={`${paletteColor}-${index}`}
                    className={`relative rounded-xl overflow-hidden cursor-move
                             ${
                               selectedPaletteColor === index
                                 ? "ring-2 ring-violet-500"
                                 : ""
                             }`}
                    style={{ backgroundColor: paletteColor }}
                    draggable="true"
                    onClick={() => {
                      setSelectedPaletteColor(index);
                      setColor(paletteColor);
                    }}
                    onDragStart={(e) => handleDragStart(e, paletteColor)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, paletteColor)}>
                    {/* Color Info - Always Visible */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
                      <span className="font-mono text-sm uppercase tracking-wider">
                        {paletteColor}
                      </span>
                      <span className="font-mono text-xs mt-1">
                        {calculateSustainability(paletteColor)}% sustainable
                      </span>
                    </div>

                    {/* Remove Button - Show on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPalette(paletteColor);
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg 
                               bg-red-500/20 hover:bg-red-500/40 transition-colors duration-200
                               opacity-0 group-hover:opacity-100">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div
                  className="col-span-5 border-2 border-dashed border-gray-700 rounded-xl 
                                 flex items-center justify-center text-gray-500">
                  Generate or add colors to create a palette
                </div>
              )}
            </div>

            {/* Palette Sustainability Score */}
            {palette.length > 0 && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800 border border-gray-700">
                <div>
                  <p className="font-medium">Palette Sustainability</p>
                  <p className="text-sm text-gray-400">
                    {paletteSustainability > 75
                      ? "Highly sustainable combination"
                      : paletteSustainability > 60
                      ? "Moderately sustainable"
                      : paletteSustainability > 45
                      ? "Limited sustainability"
                      : "Poor sustainability"}
                  </p>
                </div>
                <div className="text-3xl font-bold">
                  <span
                    className={
                      paletteSustainability > 75
                        ? "text-green-400"
                        : paletteSustainability > 60
                        ? "text-blue-400"
                        : paletteSustainability > 45
                        ? "text-yellow-400"
                        : "text-red-400"
                    }>
                    {paletteSustainability}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSustainabilityPicker;
