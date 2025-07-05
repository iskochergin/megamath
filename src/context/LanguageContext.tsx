import {createContext, useState, ReactNode, FC} from "react";

export type Language = "en" | "ru";
export const LanguageContext = createContext<{
    language: Language;
    toggleLanguage: () => void;
}>({
    language: "en",
    toggleLanguage: () => {
    },
});

export const LanguageProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [language, setLanguage] = useState<Language>("en");
    const toggleLanguage = () =>
        setLanguage((prev) => (prev === "en" ? "ru" : "en"));

    return (
        <LanguageContext.Provider value={{language, toggleLanguage}}>
            {children}
        </LanguageContext.Provider>
    );
};
