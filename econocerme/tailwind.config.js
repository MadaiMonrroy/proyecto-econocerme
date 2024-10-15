/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],

  theme: {
    extend: {
      textShadow: {
        '3xl': '4px 4px 6px rgba(0, 0, 0, 0.5)',
        '4xl': '6px 6px 8px rgba(0, 0, 0, 0.5)',
        '5xl': '8px 8px 10px rgba(0, 0, 0, 0.6)',
      },
      colors: {
        'custom-purple': 'rgba(153, 99, 219)',  // Violeta más claro
        'custom-pink': 'rgba(250, 240, 255)',   // Violeta claro
        'dark-purple': 'rgba(50, 25, 120)', // Color para el modo oscuro
        'dark-pink': 'rgba(180, 70, 230)',   // Otro color para el modo oscuro
      },
      backgroundImage: {
        "gradient-custom":
          "linear-gradient(to right, rgba(165, 63, 191), rgba(33, 3, 85))",
      },
    },
  },
  darkMode: ["selector", '[class="p-dark"]'],
  plugins: [function ({ addUtilities }) {
    addUtilities({
      '.text-shadow-3xl': {
        'text-shadow': '2px 2px 4px rgba(0, 0, 0, 0.5)',
      },
      '.text-shadow-4xl': {
        'text-shadow': '6px 6px 8px rgba(0, 0, 0, 0.5)',
      },
      '.text-shadow-5xl': {
        'text-shadow': '8px 8px 10px rgba(0, 0, 0, 0.6)',
      },
    });
  }
    ,require("tailwindcss-primeui", "tailwindcss/aspect-ratio")],
};
