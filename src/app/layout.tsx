import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbaar from "@/components/Navbaar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import ReduxProvider from "@/store/ReduxProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TBB Client Portal",
  description: "Private client portal for TBB - Schedule meetings and get support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbaar />
          {children}
            <Toaster />
          <Footer />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
