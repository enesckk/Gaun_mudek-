"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api/apiClient";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    // First check localStorage for immediate theme (prevents flash)
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      applyTheme(savedTheme);
      setTheme(savedTheme);
    }

    // Load theme from settings
    const loadTheme = async () => {
      try {
        const response = await apiClient.get("/settings");
        const settings = response.data.data;
        if (settings?.display?.theme) {
          applyTheme(settings.display.theme);
          setTheme(settings.display.theme);
        } else if (!savedTheme) {
          // Use system preference as fallback
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          applyTheme(prefersDark ? "dark" : "light");
        }
      } catch (error) {
        // Use system preference as fallback if no saved theme
        if (!savedTheme) {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          applyTheme(prefersDark ? "dark" : "light");
        }
      }
    };

    loadTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem("theme") || theme;
      if (currentTheme === "auto") {
        applyTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const applyTheme = (themeValue: string) => {
    const root = document.documentElement;
    if (themeValue === "dark") {
      root.classList.add("dark");
    } else if (themeValue === "light") {
      root.classList.remove("dark");
    } else if (themeValue === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  return <>{children}</>;
}

