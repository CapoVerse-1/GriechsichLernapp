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
          DEFAULT: '#15201e',
          soft: '#3a4a47',
          faint: '#6b7a77',
        },
        parchment: {
          DEFAULT: '#fbf7ee',
          deep: '#f3ecdd',
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
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        sun: {
          400: '#f5b945',
          500: '#eca116',
          600: '#d4870a',
        },
        coral: {
          400: '#f7836b',
          500: '#ef5f44',
          600: '#d94426',
        },
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(21,32,30,0.08), 0 8px 28px -8px rgba(21,32,30,0.12)',
        float: '0 8px 30px -6px rgba(21,32,30,0.18)',
        glow: '0 0 0 4px rgba(20,184,166,0.15)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
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
