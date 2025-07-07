// src/components/Header.tsx
import React, {FC} from 'react'
import {useRouter} from 'next/router'
import {ArrowLeft} from 'lucide-react'
import {ThemeSwitcher} from './ThemeSwitcher'

interface HeaderProps {
    pageTitle?: string
}

const Header: FC<HeaderProps> = ({pageTitle}) => {
    const router = useRouter()

    return (
        <header className="fixed inset-x-0 top-0 h-16 bg-white z-50">
            <div className="relative h-full flex items-center px-8">
                {/* ← Left: back icon + brand, both clickable */}
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center space-x-2 flex-shrink-0"
                >
                    <ArrowLeft className="w-6 h-6 text-foreground"/>
                    <span className="text-2xl font-bold lowercase text-foreground">
            megamath
          </span>
                </button>

                {/* ← Centered title (absolute centering) */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-xl font-semibold text-foreground">
            {pageTitle}
          </span>
                </div>

                {/* ← Right: theme toggle */}
                <div className="ml-auto flex items-center space-x-4">
                    <ThemeSwitcher/>
                </div>
            </div>
        </header>
    )
}

export default Header
