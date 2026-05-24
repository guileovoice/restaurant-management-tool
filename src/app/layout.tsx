import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Guileo AI for Restaurants",
  description: "Vertical SaaS dashboard for restaurant owners powered by AI voice ordering.",
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1A1A24',
              color: '#F1F1F3',
              border: '1px solid #2E2E3F',
            },
          }} 
        />
      </body>
    </html>
  );
}

