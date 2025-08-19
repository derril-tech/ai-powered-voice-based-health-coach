/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // Enable dark mode
  darkMode: 'class',
  
  theme: {
    extend: {
      // Custom colors for voice assistant theme
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        
        // Secondary accent colors
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        
        // Success colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        
        // Warning colors
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        
        // Error colors
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        
        // Neutral colors
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        
        // Voice-specific colors
        voice: {
          listening: '#10b981', // Green for listening state
          processing: '#f59e0b', // Yellow for processing
          speaking: '#3b82f6', // Blue for speaking
          error: '#ef4444', // Red for errors
          muted: '#6b7280', // Gray for muted state
        },
        
        // Calendar colors
        calendar: {
          meeting: '#3b82f6',
          appointment: '#10b981',
          reminder: '#f59e0b',
          task: '#8b5cf6',
          birthday: '#ec4899',
          holiday: '#ef4444',
        },
      },
      
      // Custom font families
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
        display: [
          'Poppins',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      
      // Custom font sizes
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Custom border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      // Custom shadows
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.5)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.5)',
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'voice-wave': 'voiceWave 1.5s ease-in-out infinite',
        'voice-pulse': 'voicePulse 2s ease-in-out infinite',
      },
      
      // Custom keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        voiceWave: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        voicePulse: {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)'
          },
        },
      },
      
      // Custom backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      
      // Custom gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-voice': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      },
      
      // Custom screens for responsive design
      screens: {
        'xs': '475px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
      
      // Custom z-index values
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // Custom max widths
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      // Custom min heights
      minHeight: {
        'screen-75': '75vh',
        'screen-50': '50vh',
      },
      
      // Custom aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    },
  },
  
  plugins: [
    // Add custom plugins
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
    
    // Custom plugin for voice assistant specific utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.voice-listening': {
          backgroundColor: theme('colors.voice.listening'),
          animation: 'voicePulse 2s ease-in-out infinite',
        },
        '.voice-processing': {
          backgroundColor: theme('colors.voice.processing'),
          animation: 'voiceWave 1.5s ease-in-out infinite',
        },
        '.voice-speaking': {
          backgroundColor: theme('colors.voice.speaking'),
          animation: 'pulse 1s ease-in-out infinite',
        },
        '.voice-error': {
          backgroundColor: theme('colors.voice.error'),
          animation: 'pulse 0.5s ease-in-out infinite',
        },
        '.voice-muted': {
          backgroundColor: theme('colors.voice.muted'),
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0,0,0,0.12)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': `${theme('colors.gray.300')} ${theme('colors.gray.100')}`,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.gray.100'),
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.gray.300'),
            borderRadius: '3px',
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
