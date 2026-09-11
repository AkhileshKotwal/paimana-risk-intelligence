/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0B192C',
          dark: '#1E293B',
          blue: '#1E3E62',
          accent: '#0066CC',
          light: '#F4F7FB',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B'
        },
        risk: {
          critical: '#DC2626',
          high: '#EA580C',
          medium: '#D97706',
          low: '#16A34A',
          bgCritical: '#FEF2F2',
          bgHigh: '#FFF7ED',
          bgMedium: '#FEFCE8',
          bgLow: '#F0FDF4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
