/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                white: '#fdfdfc', // Soft warm white (removes pure white glare)
                slate: {
                    50: '#f6f6f2',   // Softer warm gray/cream for page backgrounds
                    100: '#eaeae1',  // Muted color for secondary backgrounds
                    200: '#d9d9cb',  // Soft border color
                    300: '#c5c5b0',  // Visible border color
                    400: '#a3a38a',  // Muted text color
                    500: '#808068',  // Secondary text color
                    600: '#64644f',
                    700: '#4c4c3b',  // Soft charcoal for readable body text
                    // Dark mode tones — pure charcoal, zero blue tint
                    800: '#222220',  // Dark card surface
                    850: '#1c1c1a',  // Slightly darker card
                    900: '#161614',  // Dark sidebar / panel bg
                    950: '#0e0e0c',  // Darkest page background
                },
                gray: {
                    50: '#f6f6f2',
                    100: '#eaeae1',
                    200: '#d9d9cb',
                    300: '#c5c5b0',
                    400: '#a3a38a',
                    500: '#808068',
                    600: '#64644f',
                    700: '#4c4c3b',
                    800: '#222220',
                    850: '#1c1c1a',
                    900: '#161614',
                    950: '#0e0e0c',
                },
                blue: {
                    50: '#f6f6f2',
                    100: '#eaeae1',
                    200: '#d9d9cb',
                    300: '#c5c5b0',
                    400: '#a3a38a',
                    500: '#808068',
                    600: '#64644f',
                    700: '#4c4c3b',
                    800: '#222220',
                    900: '#161614',
                    950: '#0e0e0c',
                },
                indigo: {
                    50: '#f6f6f2',
                    100: '#eaeae1',
                    200: '#d9d9cb',
                    300: '#c5c5b0',
                    400: '#a3a38a',
                    500: '#808068',
                    600: '#64644f',
                    700: '#4c4c3b',
                    800: '#222220',
                    900: '#161614',
                    950: '#0e0e0c',
                },
                sky: {
                    50: '#f6f6f2',
                    100: '#eaeae1',
                    200: '#d9d9cb',
                    300: '#c5c5b0',
                    400: '#a3a38a',
                    500: '#808068',
                    600: '#64644f',
                    700: '#4c4c3b',
                    800: '#222220',
                    900: '#161614',
                    950: '#0e0e0c',
                },
                cyan: {
                    50: '#f6f6f2',
                    100: '#eaeae1',
                    200: '#d9d9cb',
                    300: '#c5c5b0',
                    400: '#a3a38a',
                    500: '#808068',
                    600: '#64644f',
                    700: '#4c4c3b',
                    800: '#222220',
                    900: '#161614',
                    950: '#0e0e0c',
                },
                // Alias for dark mode semantic tokens
                dm: {
                    surface:  '#1e1e1c', // Card surface
                    panel:    '#171715', // Sidebar / panel
                    base:     '#111110', // Page background
                    border:   '#2e2e2b', // Borders
                    muted:    '#3a3a36', // Hover / secondary bg
                    subtle:   '#4a4a45', // Tertiary elements
                },
                // Nuevo Primary: Ambar/Dorado Elegante para combinar con el gradiente
                primary: {
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
                secondary: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                // Cards — light mode
                'card':      '0 2px 8px -1px rgba(0,0,0,0.06), 0 6px 24px -4px rgba(0,0,0,0.08)',
                'card-hover':'0 4px 16px -2px rgba(0,0,0,0.10), 0 12px 40px -6px rgba(0,0,0,0.12)',
                // Cards — dark mode (more opaque black shadows for contrast on dark surface)
                'card-dark':      '0 2px 8px -1px rgba(0,0,0,0.40), 0 6px 28px -4px rgba(0,0,0,0.55)',
                'card-dark-hover':'0 4px 20px -2px rgba(0,0,0,0.55), 0 16px 48px -6px rgba(0,0,0,0.65)',
                // Sidebar / panels
                'panel':     '4px 0 20px rgba(0,0,0,0.06)',
                'panel-dark':'4px 0 28px rgba(0,0,0,0.50)',
            },
            keyframes: {
                'slide-in-top': {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
            animation: {
                'slide-in-top': 'slide-in-top 0.3s ease-out forwards',
                'fade-in': 'fade-in 0.3s ease-out forwards',
            },
        },
    },
    plugins: [],
}