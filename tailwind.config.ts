import type {Config} from "tailwindcss";

const rgbVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                leaguespartan: ["League Spartan", "sans-serif"],
            },
            colors: {
                text: rgbVar("--foreground"),
                foreground: rgbVar("--foreground"),
                background: rgbVar("--background"),

                primary: rgbVar("--primary"),
                secondary: rgbVar("--secondary"),
                accent: rgbVar("--accent"),
            },
            boxShadow: {
                background: "0 20px 30px -10px rgb(var(--background) / 0.5)",
            },
            borderWidth: {1: "1px"},
            keyframes: {
                wave: {
                    "0%": {transform: "rotate(0deg)"},
                    "25%": {transform: "rotate(-20deg)"},
                    "75%": {transform: "rotate(20deg)"},
                    "100%": {transform: "rotate(0deg)"},
                },
            },
            animation: {wave: "wave 0.8s linear"},
        },
    },
    plugins: [],
};

export default config;
