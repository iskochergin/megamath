import React from 'react'
import {useRouter} from 'next/router'
import {LanguageSwitcher} from './LanguageSwitcher'
import {ThemeSwitcher} from './ThemeSwitcher'

interface HeaderProps {
    pageTitle?: string
}

export default function Header({pageTitle}: HeaderProps) {
    const router = useRouter()
    const showBack = router.pathname !== '/'

    return (
        <header
            className="
        fixed top-0 left-0 right-0
        flex items-center justify-between
        px-8 h-16
        bg-transparent
        text-foreground
        z-50
      "
        >
            {/* left: megamath + back */}
            <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold lowercase">megamath</span>
                {showBack && (
                    <button
                        onClick={() => router.push('/')}
                        className="text-primary hover:underline"
                    >
                        ← Back
                    </button>
                )}
            </div>

            {/* center: page-specific title */}
            <div className="text-xl font-semibold">{pageTitle}</div>

            {/* right: language & theme toggles */}
            <div className="flex items-center space-x-4">
                <LanguageSwitcher/>
                <ThemeSwitcher/>
            </div>
        </header>
    )
}
