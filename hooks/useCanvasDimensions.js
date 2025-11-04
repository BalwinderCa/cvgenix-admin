"use client";
import { useState, useEffect, useCallback } from "react";

export function useCanvasDimensions(options = {}) {
  const {
    maxWidth = 750,
    aspectRatio = 0.8, // 800/1000 = 0.8 (standard resume ratio)
    minWidth = 300,
    minHeight = 375,
  } = options;

  const [dimensions, setDimensions] = useState({
    width: 600,
    height: 750,
    scale: 0.7125, // 0.75 * 0.95 (5% smaller)
  });

  const updateDimensions = useCallback(() => {
    if (typeof window === "undefined") return;

    const availableWidth = Math.min(window.innerWidth - 100, maxWidth);
    const calculatedWidth = Math.max(availableWidth, minWidth);
    const calculatedHeight = Math.max(
      calculatedWidth / aspectRatio,
      minHeight
    );
    const baseScale = calculatedWidth / 800; // Scale relative to base 800px width
    const scale = baseScale * 0.95; // Make canvas 5% smaller by default

    setDimensions({
      width: calculatedWidth,
      height: calculatedHeight,
      scale,
    });
  }, [maxWidth, aspectRatio, minWidth, minHeight]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Initial calculation with proper dimensions
    const availableWidth = Math.min(window.innerWidth - 100, maxWidth);
    const calculatedWidth = Math.max(availableWidth, minWidth);
    const calculatedHeight = Math.max(
      calculatedWidth / aspectRatio,
      minHeight
    );
    const baseScale = calculatedWidth / 800;
    const scale = baseScale * 0.95; // Make canvas 5% smaller by default

    setDimensions({
      width: calculatedWidth,
      height: calculatedHeight,
      scale,
    });

    // Add resize listener
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [maxWidth, aspectRatio, minWidth, minHeight, updateDimensions]);

  // Get base dimensions (for Fabric.js canvas initialization)
  const getBaseDimensions = useCallback(() => {
    return {
      width: 800,
      height: 1000,
    };
  }, []);

  // Get scaled dimensions (for display)
  const getScaledDimensions = useCallback(() => {
    return {
      width: dimensions.width,
      height: dimensions.height,
      scale: dimensions.scale,
    };
  }, [dimensions]);

  return {
    dimensions,
    getBaseDimensions,
    getScaledDimensions,
    updateDimensions,
  };
}

