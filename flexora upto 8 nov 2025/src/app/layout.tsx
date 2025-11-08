import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FLEXORA - All Your Tools in One Place",
  description: "Process images and videos, edit documents, convert files, and boost productivity with AI-powered tools. Built with Next.js, TypeScript, and Tailwind CSS.",
  keywords: ["FLEXORA", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI tools", "productivity", "image processing", "video editing", "document editor"],
  authors: [{ name: "FLEXORA Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "FLEXORA - All Your Tools in One Place",
    description: "Process images and videos, edit documents, convert files, and boost productivity with AI-powered tools",
    url: "/",
    siteName: "FLEXORA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FLEXORA - All Your Tools in One Place",
    description: "Process images and videos, edit documents, convert files, and boost productivity with AI-powered tools",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}