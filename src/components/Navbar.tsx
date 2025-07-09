import React, {FC} from 'react'
import {motion} from 'framer-motion'
import {useRouter} from 'next/router'
import {ArrowLeft} from 'lucide-react'
import {ThemeSwitcher} from './ThemeSwitcher'

interface NavbarProps {
    pageTitle?: string
}

const Navbar: FC<NavbarProps> = ({pageTitle}) => {
    const router = useRouter()
    const isMe = pageTitle === 'megamath'

    // shared “slot” styles:
    const slotClasses = `
    flex-shrink-0 flex items-center justify-center
    w-10 h-10 rounded-md
    bg-background/80 dark:bg-neutral-800
    border border-neutral-200 dark:border-neutral-700
    hover:bg-foreground/10 dark:hover:bg-neutral-700
    transition overflow-hidden
  `

    return (
        <motion.header className="fixed top-0 w-full z-50 px-4 pt-4">
            <nav
                className="
          navbar-glass shadow-background dark:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.2)]
          mx-auto flex items-center justify-between
          w-full max-w-[46rem] h-14
          bg-gradient-to-br from-primary/90 to-secondary/90
          backdrop-blur-md rounded-lg border border-accent
          px-2
        "
            >
                {/* Left: avatar (no pointer) or back-arrow */}
                {isMe ? (
                    <div onClick={() => router.push('/')} className={slotClasses}>
                        <img
                            src="/nerd.jpg"
                            alt="me"
                            draggable={false}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <button onClick={() => router.push('/')} className={slotClasses}>
                        <ArrowLeft className="w-6 h-6 text-foreground"/>
                    </button>
                )}

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
    )
}

export default Navbar
