import type { Config } from "tailwindcss";

const config: Config = {
  // Tailwind hanya akan memproses file di dalam direktori ini
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // === PALET WARNA TEMA KONSERVASI LAUT ===
      colors: {
        // Warna utama: teal/biru-hijau kelautan
        ocean: {
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#0a2f2c",
        },
        // Warna aksen: emas/amber untuk elemen highlight
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        // Warna netral krem untuk background
        parchment: {
          50:  "#fdfaf5",
          100: "#f9f3e8",
          200: "#f0e4c8",
        },
      },

      // === TIPOGRAFI AKADEMIK ===
      fontFamily: {
        // Font serif untuk judul: Playfair Display (berkesan akademis & elegan)
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        // Font sans-serif untuk body teks
        sans:  ["var(--font-source-sans)", "system-ui", "sans-serif"],
        // Font monospace untuk DOI dan kode
        mono:  ["'Courier New'", "monospace"],
      },

      // === ANIMASI KUSTOM ===
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
