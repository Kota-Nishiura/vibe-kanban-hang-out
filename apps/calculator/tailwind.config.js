/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        calculator: {
          bg: 'var(--calc-bg)',
          display: 'var(--calc-display-bg)',
          'display-text': 'var(--calc-display-text)',
          'btn-number': 'var(--calc-btn-number)',
          'btn-operator': 'var(--calc-btn-operator)',
          'btn-equals': 'var(--calc-btn-equals)',
          'btn-clear': 'var(--calc-btn-clear)',
          'btn-text': 'var(--calc-btn-text)',
          'btn-hover': 'var(--calc-btn-hover)',
        },
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
      },
      maxWidth: {
        'calculator': '600px',
        'calculator-mobile': '100%',
      },
      spacing: {
        'calculator-padding': '1.5rem',
        'button-gap': '0.5rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

