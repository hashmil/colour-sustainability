"use client"; // Add this to mark as client component

import React, { useState, useEffect, DragEvent } from "react";

type ColorHarmony =
  | "random"
  | "analogous"
  | "monochromatic"
  | "triad"
  | "complementary";

interface PaletteColor {
  color: string;
  width: number;
  locked: boolean;
}

const ColorSustainabilityPicker = () => {
  const [color, setColor] = useState("#000000");
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [sustainability, setSustainability] = useState(100);
  const [paletteSustainability, setPaletteSustainability] = useState(100);
  const [selectedPaletteColor, setSelectedPaletteColor] = useState<
    number | null
  >(null);
  const [colorHarmony, setColorHarmony] = useState<ColorHarmony>("random");
  const [resizing, setResizing] = useState<{
    index: number;
    startX: number;
  } | null>(null);

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

  const calculatePaletteSustainability = (colors: PaletteColor[]): number => {
    if (colors.length === 0) return 0;

    const weightedScores = colors.map(
      (item) => calculateSustainability(item.color) * (item.width / 100)
    );

    return Math.round(weightedScores.reduce((a, b) => a + b, 0));
  };

  const addToPalette = (colorToAdd: string) => {
    if (palette.length >= MAX_PALETTE_COLORS) return;
    if (palette.some((item) => item.color === colorToAdd)) return;

    const equalWidth = 100 / (palette.length + 1);
    const newPalette = palette.map((item) => ({
      ...item,
      width: item.locked ? item.width : equalWidth,
    }));

    // Adjust non-locked widths to accommodate locked ones
    const totalLockedWidth = newPalette.reduce(
      (sum, item) => sum + (item.locked ? item.width : 0),
      0
    );
    const remainingWidth = 100 - totalLockedWidth;
    const nonLockedCount = newPalette.filter((item) => !item.locked).length + 1;

    newPalette.forEach((item) => {
      if (!item.locked) {
        item.width = remainingWidth / nonLockedCount;
      }
    });

    newPalette.push({
      color: colorToAdd,
      width: remainingWidth / nonLockedCount,
      locked: false,
    });
    setPalette(newPalette);
    setPaletteSustainability(calculatePaletteSustainability(newPalette));
  };

  const removeFromPalette = (colorToRemove: string) => {
    // Reset selected color if we're removing the color being edited
    if (
      selectedPaletteColor !== null &&
      palette[selectedPaletteColor].color === colorToRemove
    ) {
      setSelectedPaletteColor(null);
    }

    const newPalette = palette.filter((c) => c.color !== colorToRemove);

    // Redistribute widths among remaining colors
    if (newPalette.length > 0) {
      const equalWidth = 100 / newPalette.length;
      newPalette.forEach((item) => {
        if (!item.locked) {
          item.width = equalWidth;
        }
      });

      // If there are locked colors, adjust other widths accordingly
      const totalLockedWidth = newPalette.reduce(
        (sum, item) => sum + (item.locked ? item.width : 0),
        0
      );
      const remainingWidth = 100 - totalLockedWidth;
      const unlockedCount = newPalette.filter((item) => !item.locked).length;

      if (unlockedCount > 0) {
        const widthPerUnlocked = remainingWidth / unlockedCount;
        newPalette.forEach((item) => {
          if (!item.locked) {
            item.width = widthPerUnlocked;
          }
        });
      }
    }

    setPalette(newPalette);
    setPaletteSustainability(calculatePaletteSustainability(newPalette));
  };

  const handleDragStart = (
    e: DragEvent<HTMLDivElement>,
    paletteItem: PaletteColor
  ) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(paletteItem));
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("opacity-50");
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-gray-700/50");
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("bg-gray-700/50");
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    targetItem: PaletteColor
  ) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-gray-700/50");
    const draggedItem: PaletteColor = JSON.parse(
      e.dataTransfer.getData("text/plain")
    );

    if (draggedItem.color === targetItem.color) return;

    const newPalette = [...palette];
    const draggedIndex = newPalette.findIndex(
      (item) => item.color === draggedItem.color
    );
    const targetIndex = newPalette.findIndex(
      (item) => item.color === targetItem.color
    );

    // Preserve the locked and width properties
    const draggedItemWithProperties = newPalette[draggedIndex];
    const targetItemWithProperties = newPalette[targetIndex];

    // Swap the items while keeping their properties
    newPalette[draggedIndex] = {
      ...targetItemWithProperties,
      color: targetItem.color,
    };
    newPalette[targetIndex] = {
      ...draggedItemWithProperties,
      color: draggedItem.color,
    };

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

  const generateRandomPalette = (): PaletteColor[] => {
    const colors: string[] = [];

    // Generate colors first
    while (colors.length < MAX_PALETTE_COLORS - 2) {
      const newColor = generateRandomColor();
      if (!colors.includes(newColor)) {
        colors.push(newColor);
      }
    }

    // Add light and mid-light colors
    const lightColor = generateLightColor();
    const midLightColor = generateMidLightColor();
    colors.splice(
      Math.floor(Math.random() * (colors.length + 1)),
      0,
      lightColor
    );
    colors.splice(
      Math.floor(Math.random() * (colors.length + 1)),
      0,
      midLightColor
    );

    // Calculate optimal widths based on sustainability scores
    const sustainabilityScores = colors.map((color) =>
      calculateSustainability(color)
    );
    const totalSustainability = sustainabilityScores.reduce((a, b) => a + b, 0);

    // Assign larger widths to more sustainable colors
    let remainingWidth = 100;
    const paletteColors: PaletteColor[] = [];

    // Sort colors by sustainability for width allocation
    const colorData = colors.map((color, index) => ({
      color,
      sustainability: sustainabilityScores[index],
    }));

    // Sort descending by sustainability
    colorData.sort((a, b) => b.sustainability - a.sustainability);

    // Allocate widths based on sustainability
    colorData.forEach((data, index) => {
      let width: number;
      if (index === colorData.length - 1) {
        // Last color gets remaining width
        width = remainingWidth;
      } else if (data.sustainability < 30) {
        // Very light colors get minimum width
        width = 5;
      } else {
        // Calculate proportional width based on sustainability
        width = Math.max(
          5,
          Math.min(
            50,
            Math.round((data.sustainability / totalSustainability) * 100)
          )
        );
        // Ensure we don't exceed remaining width
        width = Math.min(
          width,
          remainingWidth - 5 * (colorData.length - index - 1)
        );
      }

      remainingWidth -= width;
      paletteColors.push({
        color: data.color,
        width,
        locked: false,
      });
    });

    return paletteColors;
  };

  const generateHarmonyColors = (
    baseColor: string,
    harmony: ColorHarmony
  ): PaletteColor[] => {
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

    const sustainabilityScores = colors.map((color) =>
      calculateSustainability(color)
    );
    const totalSustainability = sustainabilityScores.reduce((a, b) => a + b, 0);

    let remainingWidth = 100;
    const paletteColors: PaletteColor[] = [];

    // Sort colors by sustainability
    const colorData = colors.map((color, index) => ({
      color,
      sustainability: sustainabilityScores[index],
    }));

    colorData.sort((a, b) => b.sustainability - a.sustainability);

    // Allocate widths
    colorData.forEach((data, index) => {
      let width: number;
      if (index === colorData.length - 1) {
        width = remainingWidth;
      } else if (data.sustainability < 30) {
        width = 5;
      } else {
        width = Math.max(
          5,
          Math.min(
            50,
            Math.round((data.sustainability / totalSustainability) * 100)
          )
        );
        width = Math.min(
          width,
          remainingWidth - 5 * (colorData.length - index - 1)
        );
      }

      remainingWidth -= width;
      paletteColors.push({
        color: data.color,
        width,
        locked: false,
      });
    });

    return paletteColors;
  };

  const generateSustainablePalette = () => {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const baseColor = generateRandomColor();
      if (calculateSustainability(baseColor) < 60) {
        attempts++;
        continue;
      }

      const newPalette = generateHarmonyColors(baseColor, colorHarmony);
      const newPaletteSustainability =
        calculatePaletteSustainability(newPalette);

      // Only accept palettes with sustainability >= 75%
      if (newPaletteSustainability >= 75) {
        setColor(baseColor);
        setPalette(newPalette);
        setPaletteSustainability(newPaletteSustainability);
        setSelectedPaletteColor(null);
        return;
      }

      attempts++;
    }

    // If we can't generate a good palette, use the fallback
    const fallbackPalette = generateRandomPalette();
    setPalette(fallbackPalette);
    setPaletteSustainability(calculatePaletteSustainability(fallbackPalette));
    setSelectedPaletteColor(null);
  };

  const updatePaletteColor = (newColor: string) => {
    if (selectedPaletteColor === null) return;

    const newPalette = [...palette];
    newPalette[selectedPaletteColor] = {
      color: newColor,
      width: newPalette[selectedPaletteColor].width,
      locked: newPalette[selectedPaletteColor].locked,
    };
    setPalette(newPalette);
    setPaletteSustainability(calculatePaletteSustainability(newPalette));
  };

  const handleResizeStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();

    // Only prevent resizing if the current color is locked
    if (palette[index].locked) return;

    setResizing({ index, startX: e.clientX });
  };

  const toggleLock = (index: number) => {
    const newPalette = [...palette];
    newPalette[index] = {
      ...newPalette[index],
      locked: !newPalette[index].locked,
    };
    setPalette(newPalette);
  };

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!resizing) return;

      const deltaX = e.clientX - resizing.startX;
      const containerWidth =
        document.querySelector(".palette-container")?.clientWidth || 1000;
      const deltaPercentage = (deltaX / containerWidth) * 100;

      setPalette((currentPalette) => {
        const newPalette = [...currentPalette];

        // Get locked colors total width
        const lockedWidth = newPalette.reduce(
          (sum, item) => (item.locked ? sum + item.width : sum),
          0
        );

        // Count unlocked colors
        const unlockedCount = newPalette.filter((item) => !item.locked).length;

        // Calculate minimum possible width for the resizing color
        // Ensure other unlocked colors can maintain 5% minimum
        const maxAllowedWidth = 100 - lockedWidth - (unlockedCount - 1) * 5;

        // Calculate new width with constraints
        const newWidth = Math.max(
          5,
          Math.min(
            maxAllowedWidth,
            newPalette[resizing.index].width + deltaPercentage
          )
        );

        // Calculate remaining width for other unlocked colors
        const remainingWidth = 100 - lockedWidth - newWidth;

        // Get unlocked colors excluding the one being resized
        const otherUnlockedColors = newPalette.filter(
          (_, i) => i !== resizing.index && !newPalette[i].locked
        );

        // If we can't maintain minimum widths, prevent the resize
        if (remainingWidth < otherUnlockedColors.length * 5) {
          return currentPalette;
        }

        // Update widths
        const totalCurrentUnlockedWidth = otherUnlockedColors.reduce(
          (sum, item) => sum + item.width,
          0
        );

        newPalette.forEach((item, i) => {
          if (i === resizing.index) {
            item.width = newWidth;
          } else if (!item.locked) {
            const ratio = item.width / totalCurrentUnlockedWidth;
            item.width = Math.max(5, remainingWidth * ratio);
          }
        });

        // Final validation
        const total = newPalette.reduce((sum, item) => sum + item.width, 0);
        const allAboveMinimum = newPalette.every((item) => item.width >= 5);

        if (Math.abs(total - 100) > 0.1 || !allAboveMinimum) {
          return currentPalette;
        }

        return newPalette;
      });

      setResizing({ ...resizing, startX: e.clientX });
    };

    const handleResizeEnd = () => {
      setResizing(null);
    };

    if (resizing) {
      window.addEventListener("mousemove", handleResize);
      window.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [resizing]);

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

  // Add this helper function to determine text color
  const getContrastText = (hex: string): string => {
    const brightness = calculateSustainability(hex);
    return brightness < 50 ? "text-gray-900" : "text-white";
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 p-4 sm:p-6 text-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Sustainable Colour Palette Generator
          </h1>
          <p className="mt-2 text-gray-400">
            Create beautiful colour combinations with energy efficiency in mind
          </p>
        </div>

        {/* Main Palette Display - Full Width */}
        <div className="h-48 sm:h-64 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden">
          {palette.length > 0 ? (
            <div className="relative h-full flex">
              {palette.map((item, index) => (
                <div
                  key={`${item.color}-${index}`}
                  className={`relative h-full group flex-shrink-0 border-x border-white/10
                             ${
                               selectedPaletteColor === index
                                 ? "ring-2 ring-violet-500"
                                 : ""
                             }
                             transition-all duration-200`}
                  style={{
                    backgroundColor: item.color,
                    width: `${item.width}%`,
                  }}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item)}
                  onClick={() => {
                    setSelectedPaletteColor(index);
                    setColor(item.color);
                  }}>
                  {/* Color Info - Always Visible */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {item.width > 15 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className={`font-mono text-sm uppercase tracking-wider ${getContrastText(
                            item.color
                          )}`}>
                          {item.color.toUpperCase()}
                        </span>
                        <span
                          className={`font-mono text-xs mt-1 ${getContrastText(
                            item.color
                          )}`}>
                          {calculateSustainability(item.color)}% sustainable
                        </span>
                        <span
                          className={`font-mono text-xs mt-1 ${getContrastText(
                            item.color
                          )}`}>
                          {Math.round(item.width)}% usage{" "}
                          {item.locked && "(Locked)"}
                        </span>
                      </div>
                    ) : (
                      <div className="relative group/tooltip w-full h-full">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className={`font-mono text-xs rotate-90 whitespace-nowrap ${getContrastText(
                              item.color
                            )}`}>
                            {Math.round(item.width)}%
                          </span>
                        </div>
                        <div
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                                       opacity-0 group-hover/tooltip:opacity-100 transition-opacity
                                       pointer-events-none z-50">
                          <div
                            className="bg-gray-900 rounded-lg shadow-lg p-2 whitespace-nowrap
                                        border border-gray-700">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-sm"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="font-mono text-xs">
                                  {item.color}
                                </span>
                              </div>
                              <span className="text-xs text-gray-300">
                                {calculateSustainability(item.color)}%
                                sustainable
                              </span>
                              <span className="text-xs text-gray-300">
                                {Math.round(item.width)}% usage{" "}
                                {item.locked && "🔒"}
                              </span>
                            </div>
                            <div
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
                                          transform rotate-45 w-2 h-2 bg-gray-900 border-r border-b
                                          border-gray-700"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Drag Handle - Top Left */}
                  <div
                    className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/10 
                               opacity-0 group-hover:opacity-100 cursor-move z-30"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item)}>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 9h8M8 15h8"
                      />
                    </svg>
                  </div>

                  {/* Resize Handle - Right Edge */}
                  {index < palette.length - 1 && !item.locked && (
                    <div
                      className={`absolute top-0 right-0 w-3 h-full
                             flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-colors duration-200
                             z-30 ${
                               item.locked
                                 ? "bg-gray-500/20 cursor-not-allowed"
                                 : "bg-white/5 hover:bg-white/20 cursor-col-resize"
                             }`}
                      onMouseDown={(e) => handleResizeStart(e, index)}>
                      <div className="flex gap-0.5">
                        <div className="h-8 w-0.5 bg-white/50 rounded-full" />
                        <div className="h-8 w-0.5 bg-white/50 rounded-full" />
                      </div>
                    </div>
                  )}

                  {/* Remove Button - Top Right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromPalette(item.color);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg 
                             bg-red-500/20 hover:bg-red-500/40 transition-colors duration-200
                             opacity-0 group-hover:opacity-100 z-30">
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

                  {/* Lock Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(index);
                    }}
                    className={`absolute bottom-2 left-2 p-1.5 rounded-lg 
                             transition-colors duration-200
                             opacity-0 group-hover:opacity-100 z-30
                             ${
                               item.locked
                                 ? "bg-violet-500/40 hover:bg-violet-500/60"
                                 : "bg-white/10 hover:bg-white/20"
                             }`}>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          item.locked
                            ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        }
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Generate or add colours to create a palette
            </div>
          )}
        </div>

        {/* Controls Grid - Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Color Editor - Left */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 flex flex-col">
            <div className="text-lg font-semibold mb-6">
              {selectedPaletteColor !== null
                ? `Editing Colour ${selectedPaletteColor + 1}`
                : "Colour Editor"}
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
              {/* Interactive Color Preview Box */}
              <label
                htmlFor="colorPicker"
                className="aspect-square rounded-xl transition-colors duration-300 relative cursor-pointer
                          hover:ring-2 hover:ring-gray-600 group border border-white/10">
                <div
                  className="w-full h-full rounded-xl"
                  style={{ backgroundColor: color }}
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gray-900/90 backdrop-blur-sm rounded-b-xl">
                  <div className="space-y-1">
                    <p
                      className={`font-mono text-sm text-center uppercase tracking-wider`}>
                      {color.toUpperCase()}
                    </p>
                    <p className="font-mono text-xs text-center text-gray-400">
                      rgb({getRGBFromHex(color).r}, {getRGBFromHex(color).g},{" "}
                      {getRGBFromHex(color).b})
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-gray-900/80 px-4 py-2 rounded-lg text-sm">
                    Click to change colour
                  </span>
                </div>
                <input
                  type="color"
                  id="colorPicker"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="sr-only"
                />
              </label>

              {/* Action Button */}
              {selectedPaletteColor !== null ? (
                <button
                  onClick={() => setSelectedPaletteColor(null)}
                  className="w-full py-2 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 
                             border border-gray-600 transition-all duration-200
                             flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Done Editing
                </button>
              ) : (
                <div className="relative group">
                  <button
                    onClick={() => addToPalette(color)}
                    disabled={
                      palette.length >= MAX_PALETTE_COLORS ||
                      palette.some((item) => item.color === color)
                    }
                    className="w-full py-2 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 
                             disabled:bg-gray-700 disabled:cursor-not-allowed
                             transition-all duration-200 flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add to Colour Palette
                  </button>

                  {/* Tooltip */}
                  {(palette.length >= MAX_PALETTE_COLORS ||
                    palette.some((item) => item.color === color)) && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                   pointer-events-none z-50">
                      <div
                        className="bg-gray-900 rounded-lg shadow-lg p-2 text-sm whitespace-nowrap
                                    border border-gray-700">
                        {palette.length >= MAX_PALETTE_COLORS
                          ? "Maximum number of colours reached (5)"
                          : "This colour is already in the palette"}
                        <div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
                                      transform rotate-45 w-2 h-2 bg-gray-900 border-r border-b
                                      border-gray-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sustainability Stats - Middle */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 flex flex-col">
            <div className="text-lg font-semibold mb-6">Sustainability</div>

            {/* Center content vertically */}
            <div className="flex-1 flex flex-col justify-center">
              {palette.length > 0 && (
                <div className="space-y-8">
                  {/* Larger Score Circle */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          className="text-gray-700"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="74"
                          cx="80"
                          cy="80"
                        />
                        <circle
                          className={`${
                            paletteSustainability > 75
                              ? "text-green-500"
                              : paletteSustainability > 60
                              ? "text-blue-500"
                              : paletteSustainability > 45
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                          strokeWidth="8"
                          strokeDasharray={464}
                          strokeDashoffset={
                            464 - (paletteSustainability / 100) * 464
                          }
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="74"
                          cx="80"
                          cy="80"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold">
                          {paletteSustainability}%
                        </span>
                        <span className="text-sm text-gray-400 mt-1">
                          Overall Score
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Info */}
                  <div className="space-y-3">
                    <div className="text-center font-medium text-lg">
                      {paletteSustainability > 75
                        ? "Highly Sustainable"
                        : paletteSustainability > 60
                        ? "Moderately Sustainable"
                        : paletteSustainability > 45
                        ? "Limited Sustainability"
                        : "Poor Sustainability"}
                    </div>
                    <div className="text-sm text-gray-400 text-center">
                      Based on colour darkness and usage proportions
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Palette Controls - Right */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <div className="space-y-6">
              <div className="text-lg font-semibold">Palette Controls</div>

              {/* Harmony Options */}
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    "random",
                    "analogous",
                    "monochromatic",
                    "triad",
                    "complementary",
                  ] as ColorHarmony[]
                ).map((harmony) => (
                  <button
                    key={harmony}
                    onClick={() => setColorHarmony(harmony)}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left
                             ${
                               colorHarmony === harmony
                                 ? "bg-violet-600 border-violet-500"
                                 : "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                             }`}>
                    <div className="font-medium capitalize">{harmony}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {harmony === "random" &&
                        "Generate random colour combinations"}
                      {harmony === "analogous" &&
                        "Colours next to each other on the wheel"}
                      {harmony === "monochromatic" &&
                        "Different shades of the same colour"}
                      {harmony === "triad" && "Three evenly spaced colours"}
                      {harmony === "complementary" &&
                        "Opposite colours on the wheel"}
                    </div>
                  </button>
                ))}
              </div>

              {/* Generate Button */}
              <button
                onClick={generateSustainablePalette}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
                         bg-violet-600 hover:bg-violet-500 transition-colors duration-200">
                <svg
                  className="w-5 h-5"
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
          </div>
        </div>

        {/* Color Palette Summary */}
        {palette.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Palette Summary</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Overall Sustainability:
                  </span>
                  <span
                    className={`font-bold ${
                      paletteSustainability > 75
                        ? "text-green-400"
                        : paletteSustainability > 60
                        ? "text-blue-400"
                        : paletteSustainability > 45
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}>
                    {paletteSustainability}%
                  </span>
                </div>
              </div>

              {/* Color Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-2 font-medium text-gray-400">Colour</th>
                      <th className="pb-2 font-medium text-gray-400">Hex</th>
                      <th className="pb-2 font-medium text-gray-400">RGB</th>
                      <th className="pb-2 font-medium text-gray-400">Usage</th>
                      <th className="pb-2 font-medium text-gray-400">
                        Sustainability
                      </th>
                      <th className="pb-2 font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {palette.map((item, index) => (
                      <tr key={index} className="group">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-md border border-gray-700"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>Colour {index + 1}</span>
                            {item.locked && (
                              <svg
                                className="w-4 h-4 text-violet-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="font-mono">
                            {item.color.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="font-mono">
                            rgb({getRGBFromHex(item.color).r},{" "}
                            {getRGBFromHex(item.color).g},{" "}
                            {getRGBFromHex(item.color).b})
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="font-mono">
                            {Math.round(item.width)}%
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  calculateSustainability(item.color) > 75
                                    ? "bg-green-500"
                                    : calculateSustainability(item.color) > 50
                                    ? "bg-blue-500"
                                    : calculateSustainability(item.color) > 25
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${calculateSustainability(
                                    item.color
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="font-mono">
                              {calculateSustainability(item.color)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-sm ${
                              calculateSustainability(item.color) > 75
                                ? "text-green-400"
                                : calculateSustainability(item.color) > 50
                                ? "text-blue-400"
                                : calculateSustainability(item.color) > 25
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}>
                            {calculateSustainability(item.color) > 75
                              ? "Excellent"
                              : calculateSustainability(item.color) > 50
                              ? "Good"
                              : calculateSustainability(item.color) > 25
                              ? "Fair"
                              : "Poor"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorSustainabilityPicker;
