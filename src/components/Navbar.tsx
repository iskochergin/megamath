// src/components/Navbar.tsx
import React, {FC} from 'react';
import {motion} from 'framer-motion';
import {useRouter} from 'next/router';
import {ArrowLeft} from 'lucide-react';
import {ThemeSwitcher} from './ThemeSwitcher';

interface NavbarProps {
    pageTitle?: string;
}

const Navbar: FC<NavbarProps> = ({pageTitle}) => {
    const router = useRouter();

    return (
        <motion.header
            className="fixed top-0 w-full z-50 px-4 pt-4"
            initial={{y: -30, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.1, ease: [0.39, 0.21, 0.12, 0.96]}}
        >
            <nav
                className="
          navbar-glass shadow-background dark:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.2)]
          mx-auto flex items-center justify-between
          w-full max-w-[46rem] h-14
          bg-gradient-to-br from-primary/90 to-secondary/90
          backdrop-blur-md rounded-lg border border-accent
          px-4
        "
            >
                {/* Left: back icon + brand */}
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center space-x-2 flex-shrink-0"
                >
                    <ArrowLeft className="w-6 h-6 text-foreground"/>
                </button>

                {/* Centered title */}
                {pageTitle && (
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-xl font-semibold text-foreground">
              {pageTitle}
            </span>
                    </div>
                )}

                {/* Right: theme switcher */}
                <div className="flex-shrink-0 flex items-center">
                    <ThemeSwitcher/>
                </div>
            </nav>
        </motion.header>
    );
};

export default Navbar;
