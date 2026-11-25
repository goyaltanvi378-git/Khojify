/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    // Token names kept; values are the KHOJIFY beige / brown / caramel palette
    colors: { forest: '#35251D', deep: '#241812', moss: '#79543B', cream: '#F5EFE5', ivory: '#FFFCF7', sage: '#EFE3D0', beige: '#E5D2B8', gold: '#B58A62', terra: '#C47B59', ink: '#35251D', muted: '#82766B', line: '#E5D9C9' },
    fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'], serif: ['"Playfair Display"', 'Georgia', 'serif'] },
    boxShadow: { soft: '0 12px 32px -14px rgba(53,37,29,.28)' },
    keyframes: { rise: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } }, pop: { '0%': { transform: 'scale(.6)', opacity: 0 }, '70%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: 1 } }, shimmer: { to: { backgroundPosition: '-200% 0' } }, dash: { to: { strokeDashoffset: '-24' } } },
    animation: { rise: 'rise .35s ease-out', pop: 'pop .5s ease-out', shimmer: 'shimmer 1.4s linear infinite', dash: 'dash 1s linear infinite' }
  } },
  plugins: []
}
