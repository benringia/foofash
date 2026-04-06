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
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
