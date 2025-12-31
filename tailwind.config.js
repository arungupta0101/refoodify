module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
        secondary: '#16a34a',
        warm: '#f59e0b',
        light: '#fef3c7',
        accent: '#f97316',
        neutral: '#64748b',
        success: '#10b981',
        danger: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b',
        dark: '#1f2937',
        lightGreen: '#dcfce7',
        lightOrange: '#fed7aa',
        lightBlue: '#dbeafe',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        'xs': '360px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
      },
      backgroundImage: {
        'hero-pattern': "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
        'food-donation': "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};