import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: { extend: { colors: {
    amber:'#F9AE40', slate2:'#AEACBF', ink:'#22212B', paper:'#FAFAFC', line:'#E4E3EA'
  }, fontFamily: { sans: ['Segoe UI','system-ui','Arial','sans-serif'] } } },
  plugins: []
} satisfies Config;
