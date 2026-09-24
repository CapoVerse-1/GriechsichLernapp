/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        greek: ['"Gentium Plus"', '"GFS Didot"', 'serif'],
        serif: ['"GFS Didot"', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#182724',
          soft: '#40514d',
          faint: '#687a74',
        },
        parchment: {
          DEFAULT: '#f8f7f2',
          deep: '#eeeee6',
        },
        olive: {
          50: '#f4f7ee',
          100: '#e6eed6',
          200: '#cfdfb1',
          300: '#b0c982',
          400: '#92b05c',
          500: '#74953f',
          600: '#59772f',
          700: '#445b27',
          800: '#384a24',
          900: '#303f21',
        },
        teal: {
          50: '#edf5f1',
          100: '#dcebe4',
          200: '#b9d8cb',
          300: '#8fbfac',
          400: '#64a48c',
          500: '#3d876e',
          600: '#286e58',
          700: '#205845',
          800: '#1b493b',
          900: '#173c32',
        },
        sun: {
          400: '#d6ab57',
          500: '#ab7620',
          600: '#855a17',
        },
        coral: {
          400: '#d48470',
          500: '#b65941',
          600: '#99412e',
        },
      },
      boxShadow: {
        card: '0 3px 12px -8px rgba(21,32,30,0.18)',
        float: '0 10px 24px -18px rgba(21,32,30,0.38)',
        glow: '0 0 0 4px rgba(61,135,110,0.16)',
      },
      borderRadius: {
        '2xl': '0.95rem',
        '3xl': '1.3rem',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        pop: 'pop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
