"use client"; // Add this to mark as client component

import React, { useState, useEffect, DragEvent } from "react";

const ColorSustainabilityPicker = () => {
  const [color, setColor] = useState("#000000");
  const [palette, setPalette] = useState<string[]>([]);
  const [sustainability, setSustainability] = useState(100);
  const [paletteSustainability, setPaletteSustainability] = useState(100);

  const MAX_PALETTE_COLORS = 5;

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

    // Calculate weighted scores (still giving more weight to darker colors)
    const weightedScores = colors.map((color) => {
      const score = calculateSustainability(color);
      // Use a gentler weighting formula
      return score * 1.5;
    });

    // Calculate average and ensure it doesn't exceed 100
    const average = weightedScores.reduce((a, b) => a + b, 0) / colors.length;
    return Math.min(Math.round(average), 100);
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

  useEffect(() => {
    setSustainability(calculateSustainability(color));
  }, [color]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6 md:p-8">
          {/* Left Column - Color Picker Section */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Colour Sustainability
              </h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Check how sustainable your colour choice is
              </p>
            </div>

            {/* Color Display and Picker Group */}
            <div className="space-y-4">
              {/* Colour Display */}
              <div
                className="w-full h-32 sm:h-48 rounded-xl shadow-inner transition-colors duration-300 flex items-center justify-center"
                style={{ backgroundColor: color }}>
                <span
                  className="text-lg sm:text-xl font-semibold px-4 py-2 rounded-lg backdrop-blur-sm"
                  style={{
                    color: sustainability > 50 ? "white" : "black",
                    backgroundColor:
                      sustainability > 50
                        ? "rgba(0,0,0,0.2)"
                        : "rgba(255,255,255,0.2)",
                  }}>
                  Preview
                </span>
              </div>

              {/* Color Picker Controls Group */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Colour Picker Section */}
                <div className="relative group flex-1">
                  <label
                    htmlFor="colorPicker"
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 
                             transition-colors duration-200 rounded-lg border-2 border-dashed border-gray-200 
                             text-gray-600 hover:text-gray-800 cursor-pointer group p-4">
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <span className="font-medium text-sm sm:text-base">
                      Choose Colour
                    </span>
                  </label>
                  <input
                    type="color"
                    id="colorPicker"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="opacity-0 absolute h-0 w-0"
                    aria-label="Colour picker"
                  />
                </div>

                {/* Add to Palette Button */}
                <button
                  onClick={() => addToPalette(color)}
                  disabled={
                    palette.length >= MAX_PALETTE_COLORS ||
                    palette.includes(color)
                  }
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white 
                           disabled:bg-gray-300 disabled:cursor-not-allowed
                           hover:bg-gray-700 transition-colors duration-200">
                  {palette.includes(color)
                    ? "Already in palette"
                    : palette.length >= MAX_PALETTE_COLORS
                    ? "Palette full"
                    : "Add to Palette"}
                </button>
              </div>

              {/* Colour Presets */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-2">Quick Select:</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "#000000",
                    "#FF0000",
                    "#00FF00",
                    "#0000FF",
                    "#FFFF00",
                    "#FF00FF",
                    "#00FFFF",
                  ].map((presetColor) => (
                    <button
                      key={presetColor}
                      onClick={() => setColor(presetColor)}
                      className="w-8 h-8 rounded-full shadow-sm hover:scale-110 transition-transform duration-200 
                         ring-2 ring-offset-2 ring-transparent hover:ring-gray-200"
                      style={{ backgroundColor: presetColor }}
                      aria-label={`Select colour ${presetColor}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Single Color Sustainability Score */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <p className="text-gray-600 mb-2 text-sm sm:text-base">
                Sustainability Score
              </p>
              <div className="flex items-center justify-center space-x-4">
                {/* Progress Circle - Fixed the styling here */}
                <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${color} ${sustainability}%, #e5e7eb ${sustainability}%)`,
                    }}
                  />
                  <div
                    className="absolute inset-1 rounded-full bg-gray-50 flex items-center justify-center"
                    style={{ color: sustainability > 50 ? color : "black" }}>
                    <span className="text-xl sm:text-2xl font-bold">
                      {sustainability}%
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {sustainability > 75
                      ? "Excellent"
                      : sustainability > 50
                      ? "Good"
                      : sustainability > 25
                      ? "Fair"
                      : "Poor"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Sustainability Rating
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Palette Section */}
          <div className="space-y-6">
            {/* Palette Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                Color Palette
              </h3>
              <span className="text-sm text-gray-500">
                {palette.length}/{MAX_PALETTE_COLORS} colors
              </span>
            </div>

            {/* Palette Display */}
            <div className="relative h-32 sm:h-48 rounded-xl overflow-hidden flex">
              {palette.length > 0 ? (
                palette.map((paletteColor) => (
                  <div
                    key={paletteColor}
                    className="flex-1 relative group cursor-move"
                    style={{ backgroundColor: paletteColor }}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, paletteColor)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, paletteColor)}>
                    {/* Drag Handle Indicator */}
                    <div
                      className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-200 text-white/80">
                      <svg
                        className="w-6 h-6"
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

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromPalette(paletteColor)}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 
                               group-hover:opacity-100 transition-opacity duration-200
                               bg-black/20 text-white p-1 rounded-full">
                      <svg
                        className="w-5 h-5"
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
                  className="flex-1 border-2 border-dashed border-gray-200 rounded-xl 
                               flex items-center justify-center text-gray-400">
                  Select colors to create a palette
                </div>
              )}
            </div>

            {/* Palette Sustainability Score */}
            {palette.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Palette Sustainability
                  </p>
                  <p className="text-xs text-gray-500">
                    {paletteSustainability > 75
                      ? "Highly sustainable combination"
                      : paletteSustainability > 60
                      ? "Moderately sustainable"
                      : paletteSustainability > 45
                      ? "Limited sustainability"
                      : "Poor sustainability"}
                  </p>
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{
                    color:
                      paletteSustainability > 75
                        ? "#059669" // green for excellent
                        : paletteSustainability > 60
                        ? "#0284C7" // blue for moderate
                        : paletteSustainability > 45
                        ? "#EAB308" // yellow for limited
                        : "#DC2626", // red for poor
                  }}>
                  {paletteSustainability}%
                </div>
              </div>
            )}

            {/* Info Text */}
            <p className="text-sm text-gray-400">
              Darker colours typically have better sustainability scores as they
              require less energy to display on screens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSustainabilityPicker;
