import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteNav } from "@/components/shell/SiteNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://rfm.shannon.id"),
  title: { default: "Robot Foundation Models · Shannon Dynamics", template: "%s · Robot Foundation Models" },
  description: "An interactive field handbook to robot foundation models: seven families, how they work, and what remains unsolved.",
};

// Set the saved theme before first paint so dark-mode readers never see a light flash.
const themeBoot = `try{var t=localStorage.getItem("rfm-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <a className="visually-hidden" href="#content">Skip to content</a>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
