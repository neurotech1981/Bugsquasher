/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{jsx,tsx}",
    "./src/components/**/*.js",
    "./src/pages/**/*.js",
    "./src/*.js",
    "!./node_modules/**/*",
  ],
  theme: {
    extend: {
      // Orange and Navy Color Palette
      colors: {
        // Primary orange color
        primary: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fad5b8',
          300: '#f7bb90',
          400: '#f5a068',
          500: '#F79B72', // Main orange
          600: '#e8895f',
          700: '#d9774c',
          800: '#ca6539',
          900: '#bb5326',
        },
        // Navy blue color
        secondary: {
          50: '#f4f6f8',
          100: '#e9edf1',
          200: '#d3dce5',
          300: '#bdcad8',
          400: '#a7b8cc',
          500: '#91a6bf',
          600: '#7b94b3',
          700: '#6582a6',
          800: '#4f7099',
          900: '#2A4759', // Main navy
        },
        // Light grays
        neutral: {
          100: '#EEEEEE', // Very light gray
          200: '#DDDDDD', // Light gray
          300: '#cccccc',
          400: '#bbbbbb',
          500: '#aaaaaa',
          600: '#999999',
          700: '#888888',
          800: '#777777',
          900: '#666666',
        },
        // Variants with transparency for overlays
        overlay: {
          primary: {
            10: 'rgba(247, 155, 114, 0.1)',
            20: 'rgba(247, 155, 114, 0.2)',
            30: 'rgba(247, 155, 114, 0.3)',
            40: 'rgba(247, 155, 114, 0.4)',
            50: 'rgba(247, 155, 114, 0.5)',
          },
          secondary: {
            10: 'rgba(42, 71, 89, 0.1)',
            20: 'rgba(42, 71, 89, 0.2)',
            30: 'rgba(42, 71, 89, 0.3)',
            40: 'rgba(42, 71, 89, 0.4)',
            50: 'rgba(42, 71, 89, 0.5)',
          },
          neutral: {
            10: 'rgba(221, 221, 221, 0.1)',
            20: 'rgba(221, 221, 221, 0.2)',
            30: 'rgba(221, 221, 221, 0.3)',
            40: 'rgba(221, 221, 221, 0.4)',
            50: 'rgba(221, 221, 221, 0.5)',
          }
        }
      },
      // Clean, minimalist fonts
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      // Subtle rounded corners
      borderRadius: {
        'glass': '20px',
        'card': '16px',
        'button': '12px',
      },
      // Glassmorphic shadows and effects
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 20px 40px 0 rgba(31, 38, 135, 0.2)',
        'glass-xl': '0 25px 50px 0 rgba(31, 38, 135, 0.25)',
        'float': '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
        'float-lg': '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
        'inner-glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
      },
      // Subtle gradients and glass effects
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(228, 100%, 74%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 1) 0px, transparent 50%)',
        'subtle-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      // Smooth, floating animations
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        }
      },
      // Refined spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Custom backdrop blur values
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
        'frost': '20px',
      }
    },
  },
  plugins: [],
}