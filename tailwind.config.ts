import type {Config} from "tailwindcss";

const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ["Roboto Mono", "monospace"],
            },
            colors: {
                background: v("--bg"),
                foreground: v("--fg"),
                primary: v("--primary"),
                secondary: v("--secondary"),
                accent: v("--accent"),
            },
            caretColor: {
                primary: v("--primary"),
            },
            boxShadow: {
                card: "0 20px 30px -10px rgb(var(--bg) / 0.5)",
            },
            borderWidth: {1: "1px"},
            keyframes: {
                pop: {
                    "0%": {transform: "scale(0.95)"},
                    "50%": {transform: "scale(1.05)"},
                    "100%": {transform: "scale(1)"},
                },
                shake: {
                    "0%": {transform: "translateX(0)"},
                    "25%": {transform: "translateX(-5px)"},
                    "75%": {transform: "translateX(5px)"},
                    "100%": {transform: "translateX(0)"},
                },
                slideIn: {
                    "0%": {transform: "translateX(100%)"},
                    "100%": {transform: "translateX(0)"},
                },
            },
            animation: {
                pop: "pop 0.3s ease-in-out",
                shake: "shake 0.4s ease-in-out",
                slideIn: "slideIn 0.5s ease-out",
            },
        },
    },
    plugins: [],
};

export default config;
