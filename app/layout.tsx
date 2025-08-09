import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import WalletProviders from "@/components/defi/WalletProviders";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeFi Platform – AMM/DEX on Solana",
  description: "AMM/DEX demo with Token-2022 and hooks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <WalletProviders>
            <Navbar />
            {children}
          </WalletProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
