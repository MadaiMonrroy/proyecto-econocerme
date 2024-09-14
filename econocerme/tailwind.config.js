/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        customPurple: 'rgba(150, 16, 187, 1)',
        customBlue: 'rgba(33, 3, 85, 0.82)',
      },
      backgroundImage: {
        'gradient-custom': 'linear-gradient(to right, rgba(165, 63, 191, 0.97), rgba(33, 3, 85, 1))',
      },
    },
  },
  darkMode: ['selector', '[class="p-dark"]'],
  plugins: [require('tailwindcss-primeui', 'tailwindcss/aspect-ratio')],
  
}

