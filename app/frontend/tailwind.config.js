/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Fond doux et lumineux
        ink: {
          950: "#1a1a2e",
          900: "#16213e",
          800: "#0f3460",
          700: "#1e3a5f",
          600: "#2d4f7c",
        },
        // Orange vibrant (moto racing)
        racing: {
          900: "#ff6b35",
          800: "#ff7b4a",
          700: "#ff8c5f",
          600: "#ff9d74",
          500: "#ffae88",
          400: "#ffbe9d",
          300: "#ffcfb2",
        },
        // Turquoise électrique
        electric: {
          900: "#00d9ff",
          800: "#1adfff",
          700: "#33e5ff",
          600: "#4debff",
          500: "#66f0ff",
          400: "#80f5ff",
          300: "#99faff",
        },
        // Jaune citron fun
        neon: {
          900: "#ffd93d",
          800: "#ffe04d",
          700: "#ffe75c",
          600: "#ffee6c",
          500: "#fff47b",
          400: "#fffb8b",
          300: "#ffff9a",
        },
        // Rose vif pour accents
        chrome: {
          900: "#ff006e",
          800: "#ff1a7f",
          700: "#ff3390",
          600: "#ff4da1",
          500: "#ff66b2",
          400: "#ff80c3",
          300: "#ff99d4",
        },
      },
      backgroundImage: {
        'racing-gradient': 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
        'electric-gradient': 'linear-gradient(135deg, #0066ff 0%, #0040ff 100%)',
        'speed-gradient': 'linear-gradient(90deg, #ff0000 0%, #ff6600 50%, #ffdd00 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0a0a0f 0%, #1a1a24 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 0, 0, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
