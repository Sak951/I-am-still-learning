import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { ChatProvider } from "@/context/ChatContext";
import CustomCursor from "@/components/ui/custom-cursor";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learn OS - Workspace Agent Console",
  description: "Next-generation agentic dashboard and high-precision workspace composer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
        <ThemeProvider>
          <ChatProvider>
            <CustomCursor />
            {children}
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
