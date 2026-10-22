import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Providers } from "@/lib/web3/providers";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrowdWings | Web3 Decentralized Crowdfunding Platform",
  description:
    "Next-generation Web3 crowdfunding protocol powered by Ethereum smart contracts, MetaMask, milestone escrow governance, Better-Auth, and Neon Postgres.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Web3Providers>
            {children}
          </Web3Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
