import {useContext} from 'react'
import {LanguageContext} from '@/context/LanguageContext'

export function LanguageSwitcher() {
    const {language, toggleLanguage} = useContext(LanguageContext)
    return (
        <button
            onClick={toggleLanguage}
            aria-label={`Switch language (current: ${language.toUpperCase()})`}
            className="
        flex items-center justify-center
        w-10 h-10 rounded-md
        bg-background/80 dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700
        hover:bg-foreground/10 dark:hover:bg-neutral-700
        transition
      "
        >
            {language.toUpperCase()}
        </button>
    )
}
