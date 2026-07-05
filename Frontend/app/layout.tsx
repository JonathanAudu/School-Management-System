import type { Metadata } from "next";
import { Hanken_Grotesk, Literata } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: '--font-sans' });
const literata = Literata({ subsets: ["latin"], variable: '--font-serif' });

export const metadata: Metadata = {
  title: "Lumina Academy",
  description: "Excellence in Education. Nurturing the leaders of tomorrow.",
};

import ClientAuthProvider from "@/components/ClientAuthProvider";
import ClientAuthLinks from "@/components/ClientAuthLinks";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${hanken.variable} ${literata.variable} font-sans min-h-screen flex flex-col bg-background text-on-surface`}>
        <ClientAuthProvider>
          {children}
          <Toaster position="top-right" />
        </ClientAuthProvider>
      </body>
    </html>
  );
}
