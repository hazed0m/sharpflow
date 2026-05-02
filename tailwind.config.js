export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 80px rgba(14, 165, 233, 0.15)',
      },
      backgroundImage: {
        'flow-gradient': 'radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 40%), radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.12), transparent 30%)',
      },
    },
  },
  plugins: [],
}
