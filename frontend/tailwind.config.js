/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: 'hsl(42, 100%, 60%)',
          DEFAULT: 'hsl(42, 90%, 52%)',
          dark: 'hsl(38, 75%, 42%)',
        },
        navy: {
          light: 'hsl(220, 40%, 18%)',
          DEFAULT: 'hsl(222, 47%, 7%)',
          dark: 'hsl(224, 60%, 8%)',
          elevated: 'hsl(223, 45%, 11%)',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

