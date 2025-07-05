import {useState, useEffect, useRef} from 'react'
import {useTheme} from 'next-themes'
import {Monitor, Sun, Moon} from 'lucide-react'

const OPTIONS = [
    {value: 'system', icon: <Monitor size={16}/>, label: 'System'},
    {value: 'light', icon: <Sun size={16}/>, label: 'Light'},
    {value: 'dark', icon: <Moon size={16}/>, label: 'Dark'},
]

export function ThemeSwitcher() {
    const {theme, setTheme, systemTheme} = useTheme()
    const [mounted, setMounted] = useState(false)
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        window.addEventListener('click', handler)
        return () => window.removeEventListener('click', handler)
    }, [])

    const effectiveTheme = theme === 'system' ? systemTheme : theme
    useEffect(() => {
        if (!mounted || !effectiveTheme) return
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(effectiveTheme)
    }, [effectiveTheme, mounted])

    if (!mounted) return null
    const current = OPTIONS.find(o => o.value === theme)!

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                aria-label={`Switch theme (current: ${current.label})`}
                className="
          flex items-center justify-center
          w-10 h-10 rounded-md
          bg-background/80 dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700
          hover:bg-foreground/10 dark:hover:bg-neutral-700
          transition
        "
            >
                {current.icon}
            </button>
            {open && (
                <ul className="
          absolute left-0 top-full mt-1 w-10
          bg-background/80 dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700
          rounded-md shadow-lg overflow-hidden
        ">
                    {OPTIONS.filter(o => o.value !== theme).map(opt => (
                        <li key={opt.value}>
                            <button
                                onClick={() => {
                                    setTheme(opt.value);
                                    setOpen(false)
                                }}
                                aria-label={opt.label}
                                className="
                  flex items-center justify-center
                  w-10 h-10
                  hover:bg-foreground/10 dark:hover:bg-neutral-700
                  transition
                "
                            >
                                {opt.icon}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
