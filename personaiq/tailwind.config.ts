import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        persona: {
          trailblazer: '#22c55e',
          established: '#3b82f6',
          emerging: '#eab308',
          overwhelmed: '#f97316',
          resistant: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
export default config
