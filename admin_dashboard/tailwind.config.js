/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./admin.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          light: 'var(--primary-light)',
          'light-hover': 'var(--primary-light-hover)',
          glow: 'var(--primary-glow)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          bg: 'var(--color-danger-bg)',
        },
        manager: {
          DEFAULT: 'var(--color-manager)',
          bg: 'var(--color-manager-bg)',
        },
        user: {
          DEFAULT: 'var(--color-user)',
          bg: 'var(--color-user-bg)',
        },
        admin: {
          DEFAULT: 'var(--color-admin)',
          bg: 'var(--color-admin-bg)',
          glow: 'var(--color-admin-glow)',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Prevents Tailwind from clobbering the existing global CSS styles
  }
}
