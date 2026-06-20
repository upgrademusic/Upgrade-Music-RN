/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Dark purple background gradient stops
        bg: {
          deep: '#0D0B1A',
          base: '#1A1035',
          surface: '#221845',
          card: '#2A1F55',
          elevated: '#332660',
        },
        // Purple accent palette
        purple: {
          DEFAULT: '#9B7BFF',
          light: '#B794FF',
          muted: '#6B4FCC',
          dim: '#4A3580',
        },
        // Text
        text: {
          primary: '#FFFFFF',
          secondary: '#B0A8D0',
          muted: '#6B6285',
        },
        // Status
        success: '#4ADE80',
        warning: '#FACC15',
        error: '#F87171',
        // Spotify green
        spotify: '#1DB954',
      },
      fontFamily: {
        sans: ['System'],
        display: ['System'],
      },
    },
  },
  plugins: [],
};
