export default {
  content: ["./shopify/**/*.liquid", "./src/**/*.{js,css}"],
  safelist: [
    // Mega menu — toggled by JS only, not present in initial HTML
    "opacity-100",
    "pointer-events-auto",
    "rotate-180",
    // Responsive visibility — only in .liquid, not in src/ files
    "md:hidden",
    "md:flex",
    // Design token classes used in Liquid conditionals or dynamic contexts
    "font-display",
    "font-body",
    "text-primary",
    "text-secondary",
    "bg-primary",
    "bg-surface",
    "bg-surface-low",
    "rounded-full",
    "rounded-4xl",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#336f54",
        "primary-dim": "#256348",
        secondary: "#e8833a",
        tertiary: "#4a9d8f",
        surface: "#fffcf5",
        "surface-low": "#fcf9f2",
        "surface-lowest": "#ffffff",
        "surface-high": "#f5f1e8",
        "on-surface": "#383833",
        "on-primary": "#ffffff",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        body: ['"Be Vietnam Pro"', "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        ambient: "0 0 50px -5px rgba(56,56,51,0.05)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #336f54, #256348)",
      },
    },
  },
  plugins: [],
};
