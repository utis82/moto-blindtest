/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark racing background
        ink: {
          950: "#000000",
          900: "#0a0a0f",
          800: "#121218",
          700: "#1a1a24",
          600: "#252533",
        },
        // Racing red (primary)
        racing: {
          900: "#8b0000",
          800: "#b30000",
          700: "#dc0000",
          600: "#ff0000",
          500: "#ff1a1a",
          400: "#ff3333",
          300: "#ff6666",
        },
        // Electric blue (accent)
        electric: {
          900: "#001a3d",
          800: "#002d66",
          700: "#00408f",
          600: "#0066ff",
          500: "#0080ff",
          400: "#3399ff",
          300: "#66b3ff",
        },
        // Neon yellow (highlights)
        neon: {
          900: "#665500",
          800: "#997700",
          700: "#ccaa00",
          600: "#ffdd00",
          500: "#ffee00",
          400: "#fff333",
          300: "#fff866",
        },
        // Chrome silver (metallic)
        chrome: {
          900: "#4a4a4a",
          800: "#5f5f5f",
          700: "#7a7a7a",
          600: "#9a9a9a",
          500: "#c0c0c0",
          400: "#d4d4d4",
          300: "#e8e8e8",
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
