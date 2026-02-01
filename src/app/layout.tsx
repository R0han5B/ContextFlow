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
  title: "Context Flow - AI-Powered Document Intelligence",
  description: "Intelligent document Q&A system with adaptive retrieval. Built with Next.js, TypeScript, and z-ai-web-dev-sdk.",
  keywords: ["Context Flow", "Document Q&A", "AI Retrieval", "Next.js", "TypeScript", "Adaptive Intelligence", "React"],
  authors: [{ name: "Context Flow Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Context Flow",
    description: "Adaptive intelligence for document analysis and Q&A",
    url: "https://chat.z.ai",
    siteName: "Context Flow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Context Flow",
    description: "Adaptive intelligence for document analysis and Q&A",
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
