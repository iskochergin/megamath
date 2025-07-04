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
            boxShadow: {
                card: "0 20px 30px -10px rgb(var(--bg) / 0.5)",
            },
            borderWidth: {1: "1px"},
            keyframes: {
                pop: {
                    "0%": {transform: "scale(0.95)"},
                    "50%": {transform: "scale(1.05)"},
                    "100%": {transform: "scale(1)"}
                },
            },
            animation: {
                pop: "pop 0.3s ease-in-out"
            },
        },
    },
    plugins: [],
};

export default config;
