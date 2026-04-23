"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../messages/en.json";
import ar from "../messages/ar.json";

type Language = "en" | "ar";
const dictionaries = { en, ar };

interface TranslationContextType {
  lang: Language;
  toggleLanguage: (newLang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  // Load language from local storage on mount
  useEffect(() => {
    // FIX: Force to lowercase to handle old "EN" or "AR" saves
    let savedLang = (localStorage.getItem("lang") || "en").toLowerCase();
    
    // Fallback just in case something weird is in localStorage
    if (savedLang !== "en" && savedLang !== "ar") {
      savedLang = "en";
    }

    setLang(savedLang as Language);
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLang;
  }, []);

  const toggleLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = dictionaries[lang];
    
    // FIX: Safety check to prevent the crash if dictionary is missing
    if (!value) return key;

    for (const k of keys) {
      // FIX: Ensure we don't try to read properties of undefined
      if (value === undefined || value[k] === undefined) return key; 
      value = value[k];
    }
    return value;
  };

  return (
    <TranslationContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Custom hook to use translations anywhere
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useTranslation must be used within a TranslationProvider");
  return context;
};