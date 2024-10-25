"use client"; // Add this to mark as client component

import React, { useState, useEffect } from "react";

const ColorSustainabilityPicker = () => {
  const [color, setColor] = useState("#000000");
  const [sustainability, setSustainability] = useState(100);

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

  useEffect(() => {
    setSustainability(calculateSustainability(color));
  }, [color]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 sm:m-6 md:m-8 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Colour Sustainability
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Check how sustainable your colour choice is
          </p>
        </div>

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

        {/* Colour Picker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="colorPicker"
              className="text-gray-700 font-medium text-sm sm:text-base">
              Select Colour
            </label>
            <span className="font-mono text-gray-500 text-sm sm:text-base">
              {color.toUpperCase()}
            </span>
          </div>

          <div className="relative group">
            <div className="flex gap-3">
              {/* Colour Preview */}
              <div
                className="w-16 h-16 rounded-lg shadow-sm"
                style={{ backgroundColor: color }}
              />

              {/* Colour Picker Button */}
              <button
                onClick={() => document.getElementById("colorPicker")?.click()}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 
                         transition-colors duration-200 rounded-lg border-2 border-dashed border-gray-200 
                         text-gray-600 hover:text-gray-800 cursor-pointer group">
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
              </button>
            </div>

            {/* Hidden Colour Input */}
            <input
              type="color"
              id="colorPicker"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="sr-only"
              aria-label="Colour picker"
            />
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

        {/* Sustainability Score */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 text-center">
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

        {/* Info Text */}
        <p className="text-xs sm:text-sm text-gray-400 text-center">
          Darker colours typically have better sustainability scores as they
          require less energy to display on screens.
        </p>
      </div>
    </div>
  );
};

export default ColorSustainabilityPicker;
