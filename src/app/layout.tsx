import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Cortex AI — AI-Powered Business Operating System",
    template: "%s | Cortex AI",
  },
  description:
    "The complete AI-powered business operating system for agencies, startups, and SMBs. CRM, Project Management, Invoicing, Knowledge Base, and AI Assistant in one unified workspace.",
  keywords: [
    "business operating system",
    "CRM",
    "project management",
    "AI assistant",
    "invoicing",
    "SaaS",
  ],
  authors: [{ name: "Cortex AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Cortex AI — AI-Powered Business Operating System",
    description:
      "The complete AI-powered business operating system for agencies, startups, and SMBs.",
    siteName: "Cortex AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cortex AI — AI-Powered Business Operating System",
    description:
      "The complete AI-powered business operating system for agencies, startups, and SMBs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
