import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FluxCambio - USDT Converter Venezuela",
  description: "REF to USDT conversion calculator with BCV and Binance P2P rates. Includes arbitrage comparison and CAD conversion.",
  keywords: ["USDT", "Venezuela", "BCV", "Binance", "converter", "bolivares", "CAD", "arbitrage"],
  authors: [{ name: "FluxCambio" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FluxCambio",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <LanguageProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-center" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}
