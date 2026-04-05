import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.vue',
        './resources/js/**/*.tsx',
        './resources/js/**/*.ts',
    ],

    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '2.5rem',
            },
            screens: {
                '2xl': '1440px',
            },
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                    soft: 'hsl(var(--primary-soft))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    muted: 'hsl(var(--sidebar-muted))',
                    accent: 'hsl(var(--sidebar-accent))',
                    border: 'hsl(var(--sidebar-border))',
                },
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    foreground: 'hsl(var(--success-foreground))',
                    soft: 'hsl(var(--success-soft))',
                },
                warning: {
                    DEFAULT: 'hsl(var(--warning))',
                    foreground: 'hsl(var(--warning-foreground))',
                    soft: 'hsl(var(--warning-soft))',
                },
                danger: {
                    DEFAULT: 'hsl(var(--danger))',
                    foreground: 'hsl(var(--danger-foreground))',
                    soft: 'hsl(var(--danger-soft))',
                },
                info: {
                    DEFAULT: 'hsl(var(--info))',
                    foreground: 'hsl(var(--info-foreground))',
                    soft: 'hsl(var(--info-soft))',
                },
            },
            fontFamily: {
                sans: ['"Segoe UI Variable"', '"Segoe UI"', 'Calibri', ...defaultTheme.fontFamily.sans],
            },
            borderRadius: {
                xl: 'calc(var(--radius) - 4px)',
                '2xl': 'var(--radius)',
                '3xl': 'calc(var(--radius) + 8px)',
            },
            boxShadow: {
                surface: '0 20px 45px -28px rgba(15, 23, 42, 0.22)',
                panel: '0 16px 32px -24px rgba(30, 64, 175, 0.28)',
                focus: '0 0 0 4px rgba(59, 130, 246, 0.15)',
            },
            backgroundImage: {
                'app-grid':
                    'linear-gradient(to right, rgba(148, 163, 184, 0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
                'app-glow':
                    'radial-gradient(circle at top, rgba(59, 130, 246, 0.18), transparent 36%), linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(239,246,255,0.88) 100%)',
            },
            backgroundSize: {
                grid: '32px 32px',
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: 0, transform: 'translateY(14px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 320ms ease-out',
            },
        },
    },

    plugins: [forms],
};
