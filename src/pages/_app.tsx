import "../styles/globals.css";
import type {AppProps} from "next/app";
import {ThemeProvider} from "next-themes";
import {LanguageProvider} from "@/context/LanguageContext";

export default function MyApp({Component, pageProps}: AppProps) {
    return (
        <LanguageProvider>
            <ThemeProvider attribute="class">
                <Component {...pageProps} />
            </ThemeProvider>
        </LanguageProvider>
    );
}
