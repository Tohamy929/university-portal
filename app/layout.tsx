import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { TranslationProvider } from "../src/context/TranslationContext";
import GlobalSettings from "../src/components/GlobalSettings";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HTI Portal | Higher Technological Institute",
  description: "Official portal for HTI students and faculty in 6th of October City.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en" suppressHydrationWarning>
      
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300`}>
        
        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TranslationProvider>
            
            {children}
            
          
            <GlobalSettings />

          </TranslationProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}