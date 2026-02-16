/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['DM Sans', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'DM Sans', 'sans-serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                'glow-sm': '0 0 12px hsl(172 66% 50% / 0.1)',
                'glow-md': '0 0 24px hsl(172 66% 50% / 0.15)',
                'glow-lg': '0 0 40px hsl(172 66% 50% / 0.2)',
                'glow-accent': '0 0 24px hsl(38 92% 50% / 0.15)',
                'elevated': '0 8px 30px hsl(220 20% 5% / 0.12)',
                'elevated-dark': '0 8px 30px hsl(220 20% 2% / 0.5)',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
                "fade-in": {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                },
                "slide-in": {
                    from: { transform: "translateY(10px)", opacity: 0 },
                    to: { transform: "translateY(0)", opacity: 1 },
                },
                "stagger-in": {
                    from: { transform: "translateY(16px)", opacity: 0 },
                    to: { transform: "translateY(0)", opacity: 1 },
                },
                "scale-in": {
                    from: { transform: "scale(0.95)", opacity: 0 },
                    to: { transform: "scale(1)", opacity: 1 },
                },
                "slide-in-right": {
                    from: { transform: "translateX(12px)", opacity: 0 },
                    to: { transform: "translateX(0)", opacity: 1 },
                },
                "glow-pulse": {
                    "0%, 100%": { boxShadow: "0 0 20px hsl(172 66% 50% / 0.1)" },
                    "50%": { boxShadow: "0 0 30px hsl(172 66% 50% / 0.25)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.4s ease-out both",
                "slide-in": "slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
                "stagger-in": "stagger-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
                "scale-in": "scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
                "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
                "glow-pulse": "glow-pulse 3s ease-in-out infinite",
            },
        },
    },
    plugins: [],
}
