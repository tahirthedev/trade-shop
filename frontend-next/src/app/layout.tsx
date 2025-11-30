import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Trade Shop - AI-Powered Professional Trades Marketplace",
  description: "Connect with skilled tradespeople for your projects. AI-powered matching, verified professionals, and seamless project management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
