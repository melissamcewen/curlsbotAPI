import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CurlsBot",
  description: "Analyze your hair product ingredients",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-base-200">
          <header className="navbar bg-primary text-primary-content shadow-lg">
            <div className="navbar-start">
              <a href="/" className="btn btn-ghost normal-case text-xl">CurlsBot</a>
            </div>
            <div className="navbar-end">
              <ThemeToggle />
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            <div className="prose prose-lg mx-auto mb-8">
              <h1 className="text-4xl font-bold text-center text-primary">CurlsBot</h1>
              <p className="text-center text-base-content/80">
                Your intelligent assistant for analyzing hair care ingredients
              </p>
            </div>
            <div className="bg-base-100 rounded-box shadow-lg p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
