// pages/_app.tsx
import '../styles/globals.css';
import type {AppProps} from 'next/app';
import {ThemeProvider} from 'next-themes';

export default function MyApp({Component, pageProps}: AppProps) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system">
            <Component {...pageProps} />
        </ThemeProvider>
    );
}
