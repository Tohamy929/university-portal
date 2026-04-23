"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faMoon, faSun, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "../context/TranslationContext";

export default function GlobalSettings() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { lang, toggleLanguage, t } = useTranslation();

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-900 dark:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faCog} className={isOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-72 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-6 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white animate-in slide-in-from-bottom-5">
          <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest px-2">
            {t("settings.preferences")}
          </p>

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-4"
          >
            <div className="flex items-center gap-3 font-bold text-sm">
              <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="text-blue-600 dark:text-blue-400" />
              {t("settings.darkMode")}
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDark ? 'left-6' : 'left-1'}`}></div>
            </div>
          </button>

          <hr className="border-gray-100 dark:border-gray-800 mb-4" />

          {/* Language Selection */}
          <div className="space-y-2">
            <button 
              onClick={() => toggleLanguage("en")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${lang === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <span className="font-bold text-sm">English</span>
              {lang === 'en' && <FontAwesomeIcon icon={faCheck} />}
            </button>
            <button 
              onClick={() => toggleLanguage("ar")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${lang === 'ar' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <span className="font-bold text-sm">العربية</span>
              {lang === 'ar' && <FontAwesomeIcon icon={faCheck} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}